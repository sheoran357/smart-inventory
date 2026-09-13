const pool = require("../config/db");

const getDashboardSummary = async (req, res) => {
    try {

        // 1. Product statistics
        const [[productStats]] = await pool.query(`
            SELECT
                COUNT(*) AS total_products,
                COALESCE(SUM(quantity), 0) AS total_units,
                COALESCE(SUM(quantity * price), 0) AS inventory_value
            FROM products
        `);


        // 2. Sales statistics
        const [[salesStats]] = await pool.query(`
            SELECT
                COUNT(*) AS total_sales,
                COALESCE(SUM(quantity), 0) AS units_sold,
                COALESCE(SUM(quantity * selling_price), 0) AS total_revenue
            FROM sales
        `);


        // 3. Purchase statistics
        const [[purchaseStats]] = await pool.query(`
            SELECT
                COUNT(*) AS total_purchases,
                COALESCE(SUM(quantity), 0) AS units_purchased,
                COALESCE(SUM(quantity * cost_price), 0) AS total_purchase_cost
            FROM purchases
        `);


        // 4. Today's sales
        const [[todaySales]] = await pool.query(`
            SELECT
                COUNT(*) AS sales_today,
                COALESCE(SUM(quantity * selling_price), 0) AS revenue_today
            FROM sales
            WHERE DATE(sale_date) = CURDATE()
        `);


        // 5. Low-stock products
        const [lowStockProducts] = await pool.query(`
            SELECT
                product_id,
                product_name,
                quantity,
                reorder_level
            FROM products
            WHERE quantity <= reorder_level
            ORDER BY quantity ASC
        `);


        // 6. Top-selling products
        const [topSellingProducts] = await pool.query(`
            SELECT
                p.product_id,
                p.product_name,
                SUM(s.quantity) AS units_sold,
                SUM(s.quantity * s.selling_price) AS revenue
            FROM sales s
            JOIN products p
                ON s.product_id = p.product_id
            GROUP BY p.product_id, p.product_name
            ORDER BY units_sold DESC
            LIMIT 5
        `);


        res.status(200).json({
            productStats,
            salesStats,
            purchaseStats,
            todaySales,
            lowStockProducts,
            topSellingProducts
        });

    } catch (error) {

        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Failed to fetch dashboard data"
        });
    }
};

module.exports = {
    getDashboardSummary
};