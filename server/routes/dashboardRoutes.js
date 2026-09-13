const express = require("express");

const router = express.Router();

const authenticateToken = require("../Middleware/authMiddleware");
const authorizeRoles = require("../Middleware/roleMiddleware");

const {
    getDashboardSummary
} = require("../controller/dashboardController");


router.get(
    "/summary",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    getDashboardSummary
);


module.exports = router;