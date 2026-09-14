const pool = require("../config/db");

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_name } = req.body;

        if (!role_name) {
            return res.status(400).json({
                message: "Role name is required"
            });
        }

        const allowedRoles = ["ADMIN", "MANAGER", "STAFF"];

        if (!allowedRoles.includes(role_name)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        // Find the requested role
        const [roles] = await pool.query(
            `SELECT role_id, role_name
             FROM roles
             WHERE role_name = ?`,
            [role_name]
        );

        if (roles.length === 0) {
            return res.status(404).json({
                message: "Role not found"
            });
        }

        // Check whether user exists
        const [users] = await pool.query(
            `SELECT user_id, name, email
             FROM users
             WHERE user_id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Update role
        await pool.query(
            `UPDATE users
             SET role_id = ?
             WHERE user_id = ?`,
            [roles[0].role_id, id]
        );

        res.status(200).json({
            message: "User role updated successfully",
            user_id: Number(id),
            role_name
        });

    } catch (error) {
        console.error("Update user role error:", error);

        res.status(500).json({
            message: "Failed to update user role"
        });
    }
};

module.exports = {
    updateUserRole
};

const getUsers = async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT
                u.user_id,
                u.name,
                u.email,
                r.role_name
            FROM users u
            JOIN roles r
                ON u.role_id = r.role_id
            ORDER BY u.user_id DESC
        `);

        res.status(200).json(users);

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};

module.exports = {
    updateUserRole,
    getUsers
};