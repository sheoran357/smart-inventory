const pool = require("../config/db");

// GET ALL INVENTORY TRANSACTIONS
const getTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            product_id,
            transaction_type
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

        // Filter by product
        if (product_id !== undefined) {
            whereClause += " AND t.product_id = ?";
            params.push(product_id);
        }

        // Filter by transaction type
        if (transaction_type !== undefined) {
            const allowedTypes = [
                "PURCHASE",
                "SALE",
                "ADJUSTMENT",
                "RETURN"
            ];

            if (!allowedTypes.includes(transaction_type)) {
                return res.status(400).json({
                    message: "Invalid transaction type"
                });
            }

            whereClause += " AND t.transaction_type = ?";
            params.push(transaction_type);
        }

        const [transactions] = await pool.query(
            `
            SELECT
                t.transaction_id,
                t.product_id,
                p.product_name,
                t.transaction_type,
                t.quantity,
                t.user_id,
                u.name AS user_name,
                t.reason,
                t.created_at
            FROM inventory_transactions t
            JOIN products p
                ON t.product_id = p.product_id
            JOIN users u
                ON t.user_id = u.user_id
            ${whereClause}
            ORDER BY t.transaction_id DESC
            LIMIT ? OFFSET ?
            `,
            [...params, limitNumber, offset]
        );

        const [countResult] = await pool.query(
            `
            SELECT COUNT(*) AS totalTransactions
            FROM inventory_transactions t
            ${whereClause}
            `,
            params
        );

        const totalTransactions =
            countResult[0].totalTransactions;

        const totalPages = Math.ceil(
            totalTransactions / limitNumber
        );

        res.status(200).json({
            page: pageNumber,
            limit: limitNumber,
            totalTransactions,
            totalPages,
            hasNextPage: pageNumber < totalPages,
            hasPreviousPage: pageNumber > 1,
            transactions
        });

    } catch (error) {
        console.error(
            "Get transactions error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch transactions"
        });
    }
};

// GET TRANSACTIONS FOR ONE PRODUCT
const getProductTransactions = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const [transactions] = await pool.query(
            `
            SELECT
                it.transaction_id,
                it.product_id,
                p.product_name,
                it.transaction_type,
                it.quantity,
                it.reason,
                it.created_at,
                u.name AS user_name
            FROM inventory_transactions it
            JOIN products p
                ON it.product_id = p.product_id
            JOIN users u
                ON it.user_id = u.user_id
            WHERE it.product_id = ?
            ORDER BY it.created_at DESC
            `,
            [id]
        );

        res.status(200).json(transactions);

    } catch (error) {
        console.error("Product transactions error:", error);

        res.status(500).json({
            message: "Failed to fetch product transactions"
        });
    }
};


const returnStock = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { id } = req.params;
        const { quantity, reason } = req.body;

        if (!quantity || Number(quantity) <= 0) {
            return res.status(400).json({
                message: "Return quantity must be greater than 0"
            });
        }

        if (!reason || reason.trim() === "") {
            return res.status(400).json({
                message: "Return reason is required"
            });
        }

        await connection.beginTransaction();

        const [products] = await connection.query(
            `SELECT product_id, product_name, quantity
             FROM products
             WHERE product_id = ?
             AND is_active = TRUE
             FOR UPDATE`,
            [id]
        );

        if (products.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Product not found"
            });
        }

        const product = products[0];

        const returnQuantity = Number(quantity);

        const newQuantity =
            product.quantity + returnQuantity;

        await connection.query(
            `UPDATE products
             SET quantity = ?
             WHERE product_id = ?`,
            [newQuantity, id]
        );

        await connection.query(
            `INSERT INTO inventory_transactions
             (
                product_id,
                transaction_type,
                quantity,
                user_id,
                reason
             )
             VALUES (?, 'RETURN', ?, ?, ?)`,
            [
                id,
                returnQuantity,
                req.user.user_id,
                reason.trim()
            ]
        );

        await connection.commit();

        res.status(201).json({
            message: "Stock returned successfully",
            product_id: Number(id),
            old_quantity: product.quantity,
            returned_quantity: returnQuantity,
            new_quantity: newQuantity,
            reason: reason.trim()
        });

    } catch (error) {
        await connection.rollback();

        console.error(
            "Return stock error:",
            error
        );

        res.status(500).json({
            message: "Failed to return stock"
        });

    } finally {
        connection.release();
    }
};

module.exports = {
    getTransactions,
    getProductTransactions,
    returnStock
};