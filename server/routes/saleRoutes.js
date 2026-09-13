const express = require("express");

const router = express.Router();

const {
    createSale
} = require("../controller/saleController");

const authenticateToken = require("../Middleware/authMiddleware");

const authorizeRoles = require("../Middleware/roleMiddleware");

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER", "STAFF"),
    createSale
);

module.exports = router;