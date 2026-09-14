const pool = require("../config/db");

// GET ALL INVENTORY TRANSACTIONS
const getTransactions = async (req, res) => {
    try {
        const [transactions] = await pool.query(`
            SELECT
                it.transaction_id,
                it.product_id,
                p.product_name,
                it.transaction_type,
                it.quantity,
                it.reason,
                it.created_at,
                u.user_id,
                u.name AS user_name
            FROM inventory_transactions it
            JOIN products p
                ON it.product_id = p.product_id
            JOIN users u
                ON it.user_id = u.user_id
            ORDER BY it.created_at DESC
        `);

        res.status(200).json(transactions);

    } catch (error) {
        console.error("Get transactions error:", error);

        res.status(500).json({
            message: "Failed to fetch inventory transactions"
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


module.exports = {
    getTransactions,
    getProductTransactions
};