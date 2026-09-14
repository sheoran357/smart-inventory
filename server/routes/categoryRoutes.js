const express = require("express");

const router = express.Router();

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controller/categoryController");

const authenticateToken = require("../Middleware/authMiddleware");
const authorizeRoles = require("../Middleware/roleMiddleware");

router.get(
    "/",
    authenticateToken,
    getCategories
);

router.get(
    "/:id",
    authenticateToken,
    getCategoryById
);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    createCategory
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    updateCategory
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    deleteCategory
);

module.exports = router;