const express = require("express");

const router = express.Router();

const authenticateToken = require("../Middleware/authMiddleware");
const authorizeRoles = require("../Middleware/roleMiddleware");

const {
    getSalesReport,getSalesSummary,getSalesByProduct,getSalesByDate,getInventoryReport
} = require("../controller/reportController");


router.get(
    "/sales",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    getSalesReport
);

router.get(
    "/sales/summary",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    getSalesSummary
);

router.get(
    "/sales/by-product",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    getSalesByProduct
);

router.get(
    "/sales/by-date",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    getSalesByDate
);

router.get(
    "/inventory",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    getInventoryReport
);

module.exports = router;