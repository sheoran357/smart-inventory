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

        if (!product_id) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        if (!supplier_id) {
            return res.status(400).json({
                message: "Supplier ID is required"
            });
        }

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                message: "Purchase quantity must be greater than zero"
            });
        }

        if (cost_price === undefined || cost_price < 0) {
            return res.status(400).json({
                message: "Cost price must be non-negative"
            });
        }

        // 2. Start transaction
        await connection.beginTransaction();

        // 3. Check product exists
        const [products] = await connection.query(
            "SELECT product_id FROM products WHERE product_id = ?",
            [product_id]
        );

        if (products.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Product not found"
            });
        }

        // 4. Check supplier exists
        const [suppliers] = await connection.query(
            "SELECT supplier_id FROM suppliers WHERE supplier_id = ?",
            [supplier_id]
        );

        if (suppliers.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Supplier not found"
            });
        }

        // 5. Create purchase
        const [purchaseResult] = await connection.query(
            `INSERT INTO purchases
            (product_id, supplier_id, quantity, cost_price, user_id)
            VALUES (?, ?, ?, ?, ?)`,
            [
                product_id,
                supplier_id,
                quantity,
                cost_price,
                req.user.user_id
            ]
        );

        // 6. Increase product stock
        await connection.query(
            `UPDATE products
             SET quantity = quantity + ?
             WHERE product_id = ?`,
            [
                quantity,
                product_id
            ]
        );

        // 7. Create inventory transaction
        await connection.query(
            `INSERT INTO inventory_transactions
            (product_id, transaction_type, quantity, user_id)
            VALUES (?, 'PURCHASE', ?, ?)`,
            [
                product_id,
                quantity,
                req.user.user_id
            ]
        );

        // 8. Commit everything
        await connection.commit();

        res.status(201).json({
            message: "Purchase created successfully",
            purchase_id: purchaseResult.insertId
        });

    } catch (error) {

        // Undo everything if something failed
        await connection.rollback();

        console.error(error);

        res.status(500).json({
            message: "Failed to create purchase"
        });

    } finally {

        // Return connection to pool
        connection.release();
    }
};

module.exports = {
    createPurchase
};