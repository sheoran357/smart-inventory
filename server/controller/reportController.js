const pool = require("../config/db");

const getInventoryReport = async (req, res) => {
    try {

        const [inventory] = await pool.query(`
            SELECT
                p.product_id,
                p.product_name,
                c.category_name,
                p.quantity,
                p.reorder_level,
                p.price,
                (p.quantity * p.price) AS inventory_value,

                CASE
                    WHEN p.quantity = 0 THEN 'OUT_OF_STOCK'
                    WHEN p.quantity <= p.reorder_level THEN 'LOW_STOCK'
                    ELSE 'IN_STOCK'
                END AS stock_status

            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.category_id

            ORDER BY p.quantity ASC
        `);

        res.status(200).json(inventory);

    } catch (error) {

        console.error("Inventory report error:", error);

        res.status(500).json({
            message: "Failed to fetch inventory report"
        });
    }
};

const getSalesByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = `
            SELECT
                DATE(sale_date) AS sale_date,
                SUM(quantity) AS units_sold,
                SUM(quantity * selling_price) AS revenue
            FROM sales
        `;

        const values = [];

        if (startDate && endDate) {
            query += `
                WHERE DATE(sale_date)
                BETWEEN ? AND ?
            `;

            values.push(startDate, endDate);
        }

        query += `
            GROUP BY DATE(sale_date)
            ORDER BY sale_date ASC
        `;

        const [results] = await pool.query(query, values);

        res.status(200).json(results);

    } catch (error) {

        console.error("Sales by date error:", error);

        res.status(500).json({
            message: "Failed to fetch sales by date"
        });
    }
};

const getSalesByProduct = async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT
                p.product_id,
                p.product_name,
                SUM(s.quantity) AS units_sold,
                SUM(s.quantity * s.selling_price) AS revenue
            FROM sales s
            JOIN products p
                ON s.product_id = p.product_id
            GROUP BY
                p.product_id,
                p.product_name
            ORDER BY
                units_sold DESC
        `);

        res.status(200).json(results);

    } catch (error) {

        console.error("Sales by product error:", error);

        res.status(500).json({
            message: "Failed to fetch sales by product"
        });
    }
};

const getSalesSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = `
            SELECT
                COUNT(*) AS total_sales,
                COALESCE(SUM(quantity), 0) AS units_sold,
                COALESCE(SUM(quantity * selling_price), 0) AS total_revenue,
                COALESCE(AVG(quantity * selling_price), 0) AS average_sale
            FROM sales
        `;

        const values = [];

        if (startDate && endDate) {
            query += `
                WHERE DATE(sale_date)
                BETWEEN ? AND ?
            `;

            values.push(startDate, endDate);
        }

        const [[summary]] = await pool.query(query, values);

        res.status(200).json(summary);

    } catch (error) {

        console.error("Sales summary error:", error);

        res.status(500).json({
            message: "Failed to fetch sales summary"
        });
    }
};

const getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = `
            SELECT
                s.sale_id,
                p.product_name,
                s.quantity,
                s.selling_price,
                (s.quantity * s.selling_price) AS total_amount,
                s.sale_date,
                u.name AS sold_by
            FROM sales s
            JOIN products p
                ON s.product_id = p.product_id
            JOIN users u
                ON s.user_id = u.user_id
        `;

        const values = [];

        // Optional date filter
        if (startDate && endDate) {
            query += `
                WHERE DATE(s.sale_date)
                BETWEEN ? AND ?
            `;

            values.push(startDate, endDate);
        }

        query += `
            ORDER BY s.sale_date DESC
        `;

        const [sales] = await pool.query(query, values);

        res.status(200).json({
            count: sales.length,
            sales
        });

    } catch (error) {

        console.error("Sales report error:", error);

        res.status(500).json({
            message: "Failed to fetch sales report"
        });
    }
};

module.exports = {
    getSalesReport,
    getSalesSummary,
    getSalesByProduct,
    getSalesByDate,
    getInventoryReport
};