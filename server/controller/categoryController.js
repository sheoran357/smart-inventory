const pool = require("../config/db");

const createCategory = async (req, res) => {
    try {
        const { category_name } = req.body;

        if (!category_name || category_name.trim() === "") {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const [existing] = await pool.query(
            `
            SELECT category_id
            FROM categories
            WHERE category_name = ?
            `,
            [category_name.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Category already exists"
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO categories (category_name)
            VALUES (?)
            `,
            [category_name.trim()]
        );

        res.status(201).json({
            message: "Category created successfully",
            category_id: result.insertId,
            category_name: category_name.trim()
        });

    } catch (error) {
        console.error("Create category error:", error);

        res.status(500).json({
            message: "Failed to create category"
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query(
            `
            SELECT
                category_id,
                category_name
            FROM categories
            ORDER BY category_name ASC
            `
        );

        res.status(200).json(categories);

    } catch (error) {
        console.error("Get categories error:", error);

        res.status(500).json({
            message: "Failed to fetch categories"
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const [categories] = await pool.query(
            `
            SELECT
                category_id,
                category_name
            FROM categories
            WHERE category_id = ?
            `,
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(200).json(categories[0]);

    } catch (error) {
        console.error("Get category error:", error);

        res.status(500).json({
            message: "Failed to fetch category"
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        if (!category_name || category_name.trim() === "") {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const [existing] = await pool.query(
            `
            SELECT category_id
            FROM categories
            WHERE category_id = ?
            `,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const [duplicate] = await pool.query(
            `
            SELECT category_id
            FROM categories
            WHERE category_name = ?
            AND category_id != ?
            `,
            [category_name.trim(), id]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                message: "Category already exists"
            });
        }

        await pool.query(
            `
            UPDATE categories
            SET category_name = ?
            WHERE category_id = ?
            `,
            [category_name.trim(), id]
        );

        res.status(200).json({
            message: "Category updated successfully"
        });

    } catch (error) {
        console.error("Update category error:", error);

        res.status(500).json({
            message: "Failed to update category"
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const [category] = await pool.query(
            `
            SELECT category_id
            FROM categories
            WHERE category_id = ?
            `,
            [id]
        );

        if (category.length === 0) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const [products] = await pool.query(
            `
            SELECT product_id
            FROM products
            WHERE category_id = ?
            LIMIT 1
            `,
            [id]
        );

        if (products.length > 0) {
            return res.status(409).json({
                message: "Cannot delete category because products are using it"
            });
        }

        await pool.query(
            `
            DELETE FROM categories
            WHERE category_id = ?
            `,
            [id]
        );

        res.status(200).json({
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error("Delete category error:", error);

        res.status(500).json({
            message: "Failed to delete category"
        });
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};