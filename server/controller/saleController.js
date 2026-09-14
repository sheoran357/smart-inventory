const pool = require("../config/db");

const createSale = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            product_id,
            quantity,
            selling_price
        } = req.body;

        // Validate product
        if (!product_id) {
            return res.status(400).json({
                message: "Product is required"
            });
        }

        // Validate quantity
        if (!quantity || Number(quantity) <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }

        // Validate selling price
        if (
            selling_price === undefined ||
            Number(selling_price) < 0
        ) {
            return res.status(400).json({
                message: "Selling price must be 0 or greater"
            });
        }

        await connection.beginTransaction();

        // Lock product row
        const [products] = await connection.query(
            `
            SELECT
                product_id,
                product_name,
                quantity
            FROM products
            WHERE product_id = ?
            FOR UPDATE
            `,
            [product_id]
        );

        if (products.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Product not found"
            });
        }

        const product = products[0];

        // Check stock
        if (product.quantity < Number(quantity)) {
            await connection.rollback();

            return res.status(400).json({
                message: "Insufficient stock",
                available_stock: product.quantity,
                requested_quantity: Number(quantity)
            });
        }

        // Create sale
        const [saleResult] = await connection.query(
            `
            INSERT INTO sales
            (
                product_id,
                quantity,
                selling_price,
                user_id
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                product_id,
                quantity,
                selling_price,
                req.user.user_id
            ]
        );

        // Decrease stock
        await connection.query(
            `
            UPDATE products
            SET quantity = quantity - ?
            WHERE product_id = ?
            `,
            [quantity, product_id]
        );

        // Record inventory transaction
        await connection.query(
            `
            INSERT INTO inventory_transactions
            (
                product_id,
                transaction_type,
                quantity,
                user_id
            )
            VALUES (?, 'SALE', ?, ?)
            `,
            [
                product_id,
                quantity,
                req.user.user_id
            ]
        );

        await connection.commit();

        res.status(201).json({
            message: "Sale created successfully",
            sale_id: saleResult.insertId,
            product_id: Number(product_id),
            quantity: Number(quantity),
            selling_price: Number(selling_price),
            remaining_stock: product.quantity - Number(quantity)
        });

    } catch (error) {

        await connection.rollback();

        console.error("Create sale error:", error);

        res.status(500).json({
            message: "Failed to create sale"
        });

    } finally {
        connection.release();
    }
};

const getSales = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            startDate,
            endDate
        } = req.query;

        let pageNumber = Number(page);
        let limitNumber = Number(limit);

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            pageNumber = 1;
        }

        if (!Number.isInteger(limitNumber) || limitNumber < 1) {
            limitNumber = 10;
        }

        if (limitNumber > 100) {
            limitNumber = 100;
        }

        const offset = (pageNumber - 1) * limitNumber;

        let whereClause = "WHERE 1 = 1";
        const params = [];

        if (startDate) {
            whereClause += " AND s.sale_date >= ?";
            params.push(startDate);
        }

        if (endDate) {
            whereClause += `
                AND s.sale_date < DATE_ADD(?, INTERVAL 1 DAY)
            `;
            params.push(endDate);
        }

        const [sales] = await pool.query(
            `
            SELECT
                s.sale_id,
                s.product_id,
                p.product_name,
                s.quantity,
                s.selling_price,
                s.sale_date,
                s.user_id,
                u.name AS sold_by
            FROM sales s
            JOIN products p
                ON s.product_id = p.product_id
            JOIN users u
                ON s.user_id = u.user_id
            ${whereClause}
            ORDER BY s.sale_id DESC
            LIMIT ? OFFSET ?
            `,
            [...params, limitNumber, offset]
        );

        const [countResult] = await pool.query(
            `
            SELECT COUNT(*) AS totalSales
            FROM sales s
            ${whereClause}
            `,
            params
        );

        const totalSales = countResult[0].totalSales;
        const totalPages = Math.ceil(totalSales / limitNumber);

        res.status(200).json({
            page: pageNumber,
            limit: limitNumber,
            totalSales,
            totalPages,
            hasNextPage: pageNumber < totalPages,
            hasPreviousPage: pageNumber > 1,
            sales
        });

    } catch (error) {
        console.error("Get sales error:", error);

        res.status(500).json({
            message: "Failed to fetch sales"
        });
    }
};

module.exports = {
    createSale,getSales
};