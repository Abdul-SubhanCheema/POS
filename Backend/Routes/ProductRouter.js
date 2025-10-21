const express = require("express");
const router = express.Router();

const ProductController = require("../Controllers/ProductController");

// Product CRUD Routes

// Create a new product
router.post("/add", ProductController.createNewProduct);

// Get all products with filtering and pagination
router.get("/", ProductController.getAllProducts);

// Get product statistics
router.get("/statistics", ProductController.getProductStatistics);

// Get product categories
router.get("/categories", ProductController.getProductCategories);

// Get out of stock products
router.get("/out-of-stock", ProductController.getOutOfStockProducts);

// Search products
router.get("/search/query", ProductController.searchProducts);

// Get product by ID
router.get("/:id", ProductController.getProductById);

// Update product
router.put("/:id", ProductController.updateProduct);

// Update product stock
router.patch("/:id/stock", ProductController.updateProductStock);

// Delete product (soft delete)
router.delete("/:id", ProductController.deleteProduct);

module.exports = router;