const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 2. Find user
        const [users] = await pool.query(
            `SELECT
                u.user_id,
                u.name,
                u.email,
                u.password,
                u.role_id,
                r.role_name
             FROM users u
             JOIN roles r
             ON u.role_id = r.role_id
             WHERE u.email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // 3. Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 4. Create JWT
        const token = jwt.sign(
            {
                user_id: user.user_id,
                role_id: user.role_id,
                role_name: user.role_name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        // 5. Send response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role_name
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
};

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role_id
        } = req.body;

        // 1. Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // 2. Check whether user already exists
        const [existingUsers] = await pool.query(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Insert user
        const [result] = await pool.query(
            `INSERT INTO users
            (name, email, password)
            VALUES (?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                3
            ]
        );

        res.status(201).json({
            message: "User registered successfully",
            user_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
};

module.exports = {
    register,
    login
};