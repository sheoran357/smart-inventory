const express = require("express");
const router = express.Router();

const {
    getTransactions,
    getProductTransactions,
    returnStock
} = require("../controller/transactionController");

const authenticateToken = require("../Middleware/authMiddleware");


// GET ALL TRANSACTIONS
router.get(
    "/",
    authenticateToken,
    getTransactions
);


// GET TRANSACTIONS FOR ONE PRODUCT
router.get(
    "/product/:id",
    authenticateToken,
    getProductTransactions
);


router.post(
    "/product/:id/return",
    authenticateToken,
    returnStock
);

module.exports = router;