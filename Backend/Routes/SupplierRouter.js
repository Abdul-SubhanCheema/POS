const express = require("express");
const router = express.Router();

const SupplierController = require("../Controllers/SupplierController");

// Supplier CRUD Routes

// Create a new supplier
router.post("/add", SupplierController.createNewSupplier);

// Get all suppliers
router.get("/", SupplierController.getAllSuppliers);

// Get all active suppliers
router.get("/active", SupplierController.getAllActiveSuppliers);

// Get supplier statistics
router.get("/statistics", SupplierController.getSupplierStatistics);

// Get supplier by ID
router.get("/:id", SupplierController.getSupplierById);

// Update supplier
router.put("/:id", SupplierController.updateSupplier);

// Toggle supplier status (active/inactive)
router.patch("/:id/toggle-status", SupplierController.toggleSupplierStatus);

// Search suppliers
router.get("/search/query", SupplierController.searchSuppliers);

module.exports = router;