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
                name: user.name,
                email: user.email,
                role_name: user.role_name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
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
        const { name, email, password } = req.body;


        // -------------------------
        // VALIDATION
        // -------------------------

        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                message: "Name must contain at least 2 characters"
            });
        }

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }


        // -------------------------
        // NORMALIZE EMAIL
        // -------------------------

        const normalizedEmail = email.trim().toLowerCase();


        // -------------------------
        // CHECK EXISTING USER
        // -------------------------

        const [existingUsers] = await pool.query(
            `SELECT user_id
             FROM users
             WHERE email = ?`,
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }


        // -------------------------
        // HASH PASSWORD
        // -------------------------

        const hashedPassword = await bcrypt.hash(password, 10);


        // -------------------------
        // DEFAULT STAFF ROLE
        // -------------------------

        const staffRoleId = 3;


        // -------------------------
        // CREATE USER
        // -------------------------

        const [result] = await pool.query(
            `INSERT INTO users
             (name, email, password, role_id)
             VALUES (?, ?, ?, ?)`,
            [
                name.trim(),
                normalizedEmail,
                hashedPassword,
                staffRoleId
            ]
        );


        // -------------------------
        // SUCCESS RESPONSE
        // -------------------------

        res.status(201).json({
            message: "User registered successfully",
            user_id: result.insertId,
            name: name.trim(),
            email: normalizedEmail,
            role: "STAFF"
        });

    } catch (error) {

        console.error("Register user error:", error);

        res.status(500).json({
            message: "Failed to register user"
        });
    }
};

module.exports = {
    register,
    login
};