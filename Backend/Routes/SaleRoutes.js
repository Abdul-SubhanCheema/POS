const express = require('express');
const router = express.Router();
const {
    createSale,
    getAllSales,
    getSaleById,
    getCustomerPriceHistory,
    getSalesStatistics
} = require('../Controllers/SaleController');

// Create a new sale
router.post('/add', createSale);

// Get all sales with filtering and pagination
router.get('/', getAllSales);

// Get sales statistics
router.get('/statistics', getSalesStatistics);

// Get customer price history for a specific product (must come before /:id route)
router.get('/price-history/:customerId/:productId', getCustomerPriceHistory);



// Get sale by ID (keep this last among GET routes with parameters)
router.get('/:id', getSaleById);

module.exports = router;