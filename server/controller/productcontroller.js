const pool = require("../config/db");
const { isValidId } = require("../utils/validation");

const adjustStock = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;
        const { quantity, reason } = req.body;

        if (!quantity || quantity === 0) {
            return res.status(400).json({
                message: "Adjustment quantity cannot be zero"
            });
        }

        if (!reason) {
            return res.status(400).json({
                message: "Adjustment reason is required"
            });
        }

        await connection.beginTransaction();

        // Get current stock
        const [products] = await connection.query(
            `
            SELECT product_id, product_name, quantity
            FROM products
            WHERE product_id = ?
            FOR UPDATE
            `,
            [id]
        );

        if (products.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Product not found"
            });
        }

        const product = products[0];

        const newQuantity = product.quantity + Number(quantity);

        // Stock cannot become negative
        if (newQuantity < 0) {
            await connection.rollback();

            return res.status(400).json({
                message: "Stock cannot become negative"
            });
        }

        // Update product stock
        await connection.query(
            `
            UPDATE products
            SET quantity = ?
            WHERE product_id = ?
            `,
            [newQuantity, id]
        );

        // Record transaction
        await connection.query(
            `
    INSERT INTO inventory_transactions
    (
        product_id,
        transaction_type,
        quantity,
        user_id,
        reason
    )
    VALUES (?, 'ADJUSTMENT', ?, ?, ?)
    `,
            [
                id,
                quantity,
                req.user.user_id,
                reason
            ]
        );

        await connection.commit();

        res.status(200).json({
            message: "Stock adjusted successfully",
            product_id: Number(id),
            old_quantity: product.quantity,
            adjustment: Number(quantity),
            new_quantity: newQuantity,
            reason
        });

    } catch (error) {

        await connection.rollback();

        console.error("Stock adjustment error:", error);

        res.status(500).json({
            message: "Failed to adjust stock"
        });

    } finally {
        connection.release();
    }
};

const getStockAlerts = async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT
                p.product_id,
                p.product_name,
                p.quantity,
                p.reorder_level,

                CASE
                    WHEN p.quantity = 0
                        THEN 'OUT_OF_STOCK'

                    WHEN p.quantity <= p.reorder_level
                        THEN 'LOW_STOCK'

                    ELSE 'HEALTHY'
                END AS stock_status

            FROM products p

            ORDER BY
                p.quantity ASC
        `);

        res.status(200).json(products);

    } catch (error) {

        console.error("Stock alerts error:", error);

        res.status(500).json({
            message: "Failed to fetch stock alerts"
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            minPrice,
            maxPrice,
            sortBy = "product_id",
            order = "DESC"
        } = req.query;


        // Validate pagination values
        let pageNumber = Number(page) || 1;
        let limitNumber = Number(limit) || 10;

        if (pageNumber < 1) {
            pageNumber = 1;
        }

        if (limitNumber < 1) {
            limitNumber = 10;
        }

        if (limitNumber > 100) {
            limitNumber = 100;
        }

        const offset = (pageNumber - 1) * limitNumber;

        let whereClause = "WHERE 1 = 1";
        const values = [];

        // Search
        if (search) {
            whereClause += `
                AND p.product_name LIKE ?
            `;

            values.push(`%${search}%`);
        }

        // Category
        if (category) {
            whereClause += `
                AND c.category_name = ?
            `;

            values.push(category);
        }

        // Minimum price
        if (minPrice) {
            whereClause += `
                AND p.price >= ?
            `;

            values.push(minPrice);
        }

        // Maximum price
        if (maxPrice) {
            whereClause += `
                AND p.price <= ?
            `;

            values.push(maxPrice);
        }


        // Allowed sorting columns
        const allowedSortColumns = [
            "product_id",
            "product_name",
            "price",
            "quantity"
        ];

        const safeSortBy = allowedSortColumns.includes(sortBy)
            ? sortBy
            : "product_id";

        const safeOrder = order.toUpperCase() === "ASC"
            ? "ASC"
            : "DESC";


        // Get total number of products
        const [countResult] = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            ${whereClause}
            `,
            values
        );

        const totalProducts = countResult[0].total;


        // Get products
        const [products] = await pool.query(
            `
            SELECT
                p.product_id,
                p.product_name,
                p.description,
                p.price,
                p.quantity,
                p.reorder_level,
                c.category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            ${whereClause}
            ORDER BY p.${safeSortBy} ${safeOrder}
            LIMIT ? OFFSET ?
            `,
            [...values, limitNumber, offset]
        );


        const totalPages = Math.ceil(
            totalProducts / limitNumber
        );


        res.status(200).json({
            page: pageNumber,
            limit: limitNumber,
            totalProducts,
            totalPages,
            hasNextPage: pageNumber < totalPages,
            hasPreviousPage: pageNumber > 1,
            products
        });

    } catch (error) {

        console.error("Get products error:", error);

        res.status(500).json({
            message: "Failed to fetch products"
        });
    }
};
const getProductTransactions = async (req, res) => {
    try {
        const { id } = req.params;

        const [transactions] = await pool.query(
            `SELECT
                it.transaction_id,
                it.product_id,
                p.product_name,
                it.transaction_type,
                it.quantity,
                u.name AS performed_by,
                it.created_at
             FROM inventory_transactions it
             JOIN products p
                ON it.product_id = p.product_id
             JOIN users u
                ON it.user_id = u.user_id
             WHERE it.product_id = ?
             ORDER BY it.created_at DESC`,
            [id]
        );

        res.status(200).json(transactions);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch inventory history"
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            "DELETE FROM products WHERE product_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);

        res.status(500).json({
            message: "Failed to delete product"
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            product_name,
            description,
            category_id,
            price,
            quantity,
            reorder_level
        } = req.body;

        const [result] = await pool.query(
            `UPDATE products
             SET product_name = ?,
                 description = ?,
                 category_id = ?,
                 price = ?,
                 quantity = ?,
                 reorder_level = ?
             WHERE product_id = ?`,
            [
                product_name,
                description,
                category_id,
                price,
                quantity,
                reorder_level,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update product"
        });
    }
};

const createProduct = async (req, res) => {
    try {
        const {
            product_name,
            description,
            category_id,
            price,
            quantity,
            reorder_level
        } = req.body;

        // Validation
        if (!product_name || product_name.trim() === "") {
            return res.status(400).json({
                message: "Product name is required"
            });
        }

        if (price === undefined || price < 0) {
            return res.status(400).json({
                message: "Price must be a non-negative number"
            });
        }

        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({
                message: "Quantity cannot be negative"
            });
        }

        if (reorder_level === undefined || reorder_level < 0) {
            return res.status(400).json({
                message: "Reorder level cannot be negative"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO products
            (product_name, description, category_id, price, quantity, reorder_level)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                product_name,
                description ?? null,
                category_id,
                price,
                quantity ?? 0,
                reorder_level ?? 5
            ]
        );

        res.status(201).json({
            message: "Products created successfully",
            product_id: result.insertId
        });

    } catch (error) {
        console.error("Create product error:",error);

        res.status(500).json({
            message: "Failed to create Product",
        });

    };


}



const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const [product] = await pool.query("SELECT * FROM products WHERE product_id = ?", [id]);

        if (product.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product[0]);
    }
    catch (error) {
        console.error("DATABASE ERROR:", error);

        res.status(500).json({ message: "Error retrieving product" });
    }
};



module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductTransactions,
    getStockAlerts,
    adjustStock
};

