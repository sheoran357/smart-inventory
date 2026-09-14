const pool = require("../config/db");

const createPurchase = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            product_id,
            supplier_id,
            quantity,
            cost_price
        } = req.body;

        // -------------------------
        // VALIDATION
        // -------------------------

        if (!product_id || !supplier_id) {
            return res.status(400).json({
                message: "Product and supplier are required"
            });
        }

        if (!quantity || Number(quantity) <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }

        if (cost_price === undefined || Number(cost_price) < 0) {
            return res.status(400).json({
                message: "Cost price must be 0 or greater"
            });
        }

        await connection.beginTransaction();

        // -------------------------
        // CHECK PRODUCT
        // -------------------------

        const [products] = await connection.query(
            `
            SELECT product_id, product_name, quantity
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

        // -------------------------
        // CHECK SUPPLIER
        // -------------------------

        const [suppliers] = await connection.query(
            `
            SELECT supplier_id, supplier_name
            FROM suppliers
            WHERE supplier_id = ?
            `,
            [supplier_id]
        );

        if (suppliers.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Supplier not found"
            });
        }

        // -------------------------
        // CREATE PURCHASE
        // -------------------------

        const [purchaseResult] = await connection.query(
            `
            INSERT INTO purchases
            (
                product_id,
                supplier_id,
                quantity,
                cost_price,
                user_id
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                product_id,
                supplier_id,
                quantity,
                cost_price,
                req.user.user_id
            ]
        );

        // -------------------------
        // INCREASE STOCK
        // -------------------------

        await connection.query(
            `
            UPDATE products
            SET quantity = quantity + ?
            WHERE product_id = ?
            `,
            [quantity, product_id]
        );

        // -------------------------
        // INVENTORY TRANSACTION
        // -------------------------

        await connection.query(
            `
            INSERT INTO inventory_transactions
            (
                product_id,
                transaction_type,
                quantity,
                user_id
            )
            VALUES (?, 'PURCHASE', ?, ?)
            `,
            [
                product_id,
                quantity,
                req.user.user_id
            ]
        );

        // -------------------------
        // COMMIT
        // -------------------------

        await connection.commit();

        res.status(201).json({
            message: "Purchase created successfully",
            purchase_id: purchaseResult.insertId,
            product_id: Number(product_id),
            supplier_id: Number(supplier_id),
            quantity: Number(quantity),
            cost_price: Number(cost_price)
        });

    } catch (error) {

        await connection.rollback();

        console.error("Create purchase error:", error);

        res.status(500).json({
            message: "Failed to create purchase"
        });

    } finally {
        connection.release();
    }
};

const getPurchases = async (req, res) => {
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
            whereClause += " AND p.purchase_date >= ?";
            params.push(startDate);
        }

        if (endDate) {
            whereClause += `
                AND p.purchase_date < DATE_ADD(?, INTERVAL 1 DAY)
            `;
            params.push(endDate);
        }

        const [purchases] = await pool.query(
            `
            SELECT
                p.purchase_id,
                p.product_id,
                pr.product_name,
                p.supplier_id,
                s.supplier_name,
                p.quantity,
                p.cost_price,
                p.purchase_date,
                p.user_id,
                u.name AS purchased_by
            FROM purchases p
            JOIN products pr
                ON p.product_id = pr.product_id
            JOIN suppliers s
                ON p.supplier_id = s.supplier_id
            JOIN users u
                ON p.user_id = u.user_id
            ${whereClause}
            ORDER BY p.purchase_id DESC
            LIMIT ? OFFSET ?
            `,
            [...params, limitNumber, offset]
        );

        const [countResult] = await pool.query(
            `
            SELECT COUNT(*) AS totalPurchases
            FROM purchases p
            ${whereClause}
            `,
            params
        );

        const totalPurchases = countResult[0].totalPurchases;
        const totalPages = Math.ceil(
            totalPurchases / limitNumber
        );

        res.status(200).json({
            page: pageNumber,
            limit: limitNumber,
            totalPurchases,
            totalPages,
            hasNextPage: pageNumber < totalPages,
            hasPreviousPage: pageNumber > 1,
            purchases
        });

    } catch (error) {
        console.error("Get purchases error:", error);

        res.status(500).json({
            message: "Failed to fetch purchases"
        });
    }
};

module.exports = {
    createPurchase,
    getPurchases
};

