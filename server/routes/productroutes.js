const express = require("express");

const router = express.Router();

const authenticateToken = require("../Middleware/authMiddleware");

const authorizeRoles = require("../Middleware/roleMiddleware");


const { getProducts, getProductById, createProduct, updateProduct, 
    deleteProduct, getProductTransactions,getStockAlerts,
    adjustStock} = require("../controller/productcontroller");

router.get("/", getProducts);

router.get(
    "/:id/transactions",
    authenticateToken,
    getProductTransactions
); 

router.get(
    "/alerts",
    authenticateToken,
    getStockAlerts
);


router.get("/:id", getProductById);


router.post(
    "/",
    authenticateToken,
    createProduct
);

router.put(
    "/:id",
    authenticateToken,
    updateProduct
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    (req, res, next) => {
        console.log("DELETE AUTH PASSED:", req.user);
        next();
    },
    deleteProduct
);

router.patch(
    "/:id/adjust-stock",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    adjustStock
);


module.exports = router;

