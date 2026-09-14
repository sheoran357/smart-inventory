const express = require("express");

const authenticateToken = require("../Middleware/authMiddleware");
const authorizeRoles = require("../Middleware/roleMiddleware");

const {
    updateUserRole,
    getUsers
} = require("../controller/userController");

const router = express.Router();

router.patch(
    "/:id/role",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateUserRole
);

router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    getUsers
);

module.exports = router;