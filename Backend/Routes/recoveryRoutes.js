const express = require('express');
const router = express.Router();
const recoveryController = require('../Controllers/RecoveryController');

// Recovery management routes
router.post('/add', recoveryController.addRecovery);
router.get('/outstanding', recoveryController.getOutstandingSales);
router.get('/overdue', recoveryController.getOverdueSales);
router.get('/fully-paid', recoveryController.getFullyPaidSales);
router.get('/all', recoveryController.getAllRecoveries);
router.get('/dashboard-summary', recoveryController.getRecoveryDashboardSummary);
router.get('/sale/:saleId/history', recoveryController.getSaleRecoveryHistory);
router.get('/customer/:customerId/summary', recoveryController.getCustomerRecoverySummary);
router.put('/:recoveryId/status', recoveryController.updateRecoveryStatus);
router.post('/migrate-existing-sales', recoveryController.migrateExistingSales);

module.exports = router;