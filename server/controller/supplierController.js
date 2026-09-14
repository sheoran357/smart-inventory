const pool = require("../config/db");

// CREATE SUPPLIER
const createSupplier = async (req, res) => {
    try {
        const { supplier_name, email, phone, address } = req.body;

        if (!supplier_name || supplier_name.trim() === "") {
            return res.status(400).json({
                message: "Supplier name is required"
            });
        }

        const [existing] = await pool.query(
            `SELECT supplier_id
             FROM suppliers
             WHERE supplier_name = ?`,
            [supplier_name.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Supplier already exists"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO suppliers
             (supplier_name, email, phone, address)
             VALUES (?, ?, ?, ?)`,
            [
                supplier_name.trim(),
                email || null,
                phone || null,
                address || null
            ]
        );

        res.status(201).json({
            message: "Supplier created successfully",
            supplier_id: result.insertId
        });

    } catch (error) {
        console.error("Create supplier error:", error);

        res.status(500).json({
            message: "Failed to create supplier"
        });
    }
};


// GET ALL SUPPLIERS
const getSuppliers = async (req, res) => {
    try {
        const [suppliers] = await pool.query(
            `SELECT
                supplier_id,
                supplier_name,
                email,
                phone,
                address,
                created_at
             FROM suppliers
             ORDER BY supplier_name ASC`
        );

        res.status(200).json(suppliers);

    } catch (error) {
        console.error("Get suppliers error:", error);

        res.status(500).json({
            message: "Failed to fetch suppliers"
        });
    }
};


// GET SUPPLIER BY ID
const getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid supplier ID"
            });
        }

        const [suppliers] = await pool.query(
            `SELECT
                supplier_id,
                supplier_name,
                email,
                phone,
                address,
                created_at
             FROM suppliers
             WHERE supplier_id = ?`,
            [id]
        );

        if (suppliers.length === 0) {
            return res.status(404).json({
                message: "Supplier not found"
            });
        }

        res.status(200).json(suppliers[0]);

    } catch (error) {
        console.error("Get supplier error:", error);

        res.status(500).json({
            message: "Failed to fetch supplier"
        });
    }
};


// UPDATE SUPPLIER
const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { supplier_name, email, phone, address } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid supplier ID"
            });
        }

        if (!supplier_name || supplier_name.trim() === "") {
            return res.status(400).json({
                message: "Supplier name is required"
            });
        }

        const [existing] = await pool.query(
            `SELECT supplier_id
             FROM suppliers
             WHERE supplier_id = ?`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: "Supplier not found"
            });
        }

        const [duplicate] = await pool.query(
            `SELECT supplier_id
             FROM suppliers
             WHERE supplier_name = ?
             AND supplier_id != ?`,
            [supplier_name.trim(), id]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                message: "Supplier already exists"
            });
        }

        await pool.query(
            `UPDATE suppliers
             SET supplier_name = ?,
                 email = ?,
                 phone = ?,
                 address = ?
             WHERE supplier_id = ?`,
            [
                supplier_name.trim(),
                email || null,
                phone || null,
                address || null,
                id
            ]
        );

        res.status(200).json({
            message: "Supplier updated successfully"
        });

    } catch (error) {
        console.error("Update supplier error:", error);

        res.status(500).json({
            message: "Failed to update supplier"
        });
    }
};


// DELETE SUPPLIER
const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid supplier ID"
            });
        }

        const [supplier] = await pool.query(
            `SELECT supplier_id
             FROM suppliers
             WHERE supplier_id = ?`,
            [id]
        );

        if (supplier.length === 0) {
            return res.status(404).json({
                message: "Supplier not found"
            });
        }

        // Check whether this supplier has purchase records
        const [purchases] = await pool.query(
            `SELECT purchase_id
             FROM purchases
             WHERE supplier_id = ?
             LIMIT 1`,
            [id]
        );

        if (purchases.length > 0) {
            return res.status(409).json({
                message: "Cannot delete supplier because purchase records exist"
            });
        }

        await pool.query(
            `DELETE FROM suppliers
             WHERE supplier_id = ?`,
            [id]
        );

        res.status(200).json({
            message: "Supplier deleted successfully"
        });

    } catch (error) {
        console.error("Delete supplier error:", error);

        res.status(500).json({
            message: "Failed to delete supplier"
        });
    }
};


module.exports = {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
};