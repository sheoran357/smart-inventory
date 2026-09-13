const express = require("express");

const router = express.Router();

const {
    createPurchase
} = require("../controller/purchaseController");

const authenticateToken = require("../Middleware/authMiddleware");

const authorizeRoles = require("../Middleware/roleMiddleware");

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    createPurchase
);

module.exports = router;    