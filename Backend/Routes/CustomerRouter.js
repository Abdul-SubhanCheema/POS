const express = require("express");
const router = express.Router();

const CustomerController = require("../Controllers/CustomerController");

// Customer CRUD Routes

// Create a new customer
router.post("/add", CustomerController.createnewcustomer);

// Get all customers
router.get("/", CustomerController.getAllCustomers);

// Get all active customers
router.get("/active", CustomerController.getAllActiveCustomers);

// Get customer statistics
router.get("/statistics", CustomerController.getCustomerStatistics);

// Get customer by ID
router.get("/:id", CustomerController.getCustomerById);

// Update customer
router.put("/:id", CustomerController.updateCustomer);

// Toggle customer status (active/inactive)
router.patch("/:id/toggle-status", CustomerController.toggleCustomerStatus);

// Search customers
router.get("/search/query", CustomerController.searchCustomers);

module.exports = router;