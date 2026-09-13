const pool = require("../config/db");

const createSale = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            product_id,
            quantity,
            selling_price
        } = req.body;

        if (!product_id) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                message: "Sale quantity must be greater than zero"
            });
        }

        if (selling_price === undefined || selling_price < 0) {
            return res.status(400).json({
                message: "Selling price must be non-negative"
            });
        }

        // 2. Start transaction
        await connection.beginTransaction();

        // 3. Get product and current stock
        const [products] = await connection.query(
            `SELECT product_id, product_name, quantity
             FROM products
             WHERE product_id = ?
             FOR UPDATE`,
            [product_id]
        );

        if (products.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Product not found"
            });
        }

        const product = products[0];

        // 4. Check stock
        if (product.quantity < quantity) {
            await connection.rollback();

            return res.status(400).json({
                message: "Insufficient stock",
                available_stock: product.quantity
            });
        }

        // 5. Create sale
        const [saleResult] = await connection.query(
            `INSERT INTO sales
            (product_id, quantity, selling_price, user_id)
            VALUES (?, ?, ?, ?)`,
            [
                product_id,
                quantity,
                selling_price,
                req.user.user_id
            ]
        );

        // 6. Decrease stock
        await connection.query(
            `UPDATE products
             SET quantity = quantity - ?
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
            VALUES (?, 'SALE', ?, ?)`,
            [
                product_id,
                quantity,
                req.user.user_id
            ]
        );

        // 8. Commit
        await connection.commit();

        res.status(201).json({
            message: "Sale created successfully",
            sale_id: saleResult.insertId,
            product: product.product_name,
            quantity_sold: quantity,
            total_amount: quantity * selling_price
        });

    } catch (error) {

        await connection.rollback();

        console.error(error);

        res.status(500).json({
            message: "Failed to create sale"
        });

    } finally {

        connection.release();
    }
};

module.exports = {
    createSale
};