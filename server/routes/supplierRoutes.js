const express = require("express");
const router = express.Router();

const {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
} = require("../controller/supplierController");

const authenticateToken = require("../Middleware/authMiddleware");
const authorizeRoles = require("../Middleware/roleMiddleware");


// GET ALL SUPPLIERS
router.get(
    "/",
    authenticateToken,
    getSuppliers
);


// GET SUPPLIER BY ID
router.get(
    "/:id",
    authenticateToken,
    getSupplierById
);


// CREATE SUPPLIER
router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    createSupplier
);


// UPDATE SUPPLIER
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    updateSupplier
);


// DELETE SUPPLIER
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    deleteSupplier
);


module.exports = router;