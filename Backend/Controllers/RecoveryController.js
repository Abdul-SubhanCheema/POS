const Recovery = require('../Models/RecoverySchema');
const Sale = require('../Models/SaleSchema');
const Customer = require('../Models/CustomerSchema');

// Add a new recovery payment
const addRecovery = async (req, res) => {
    try {
        const {
            customerId,
            saleId,
            recoveryAmount,
            paymentMethod,
            paymentReference,
            notes,
            receivedBy
        } = req.body;

        // Validate required fields
        if (!customerId || !saleId || !recoveryAmount || !receivedBy) {
            return res.status(400).json({
                success: false,
                message: 'Customer, Sale, Recovery Amount, and Received By are required'
            });
        }

        // Get the sale to validate and update
        const sale = await Sale.findById(saleId).populate('customer');
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            });
        }

        // Check if recovery amount is valid
        if (recoveryAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Recovery amount must be greater than 0'
            });
        }

        if (recoveryAmount > sale.outstandingAmount) {
            return res.status(400).json({
                success: false,
                message: `Recovery amount ($${recoveryAmount}) cannot exceed outstanding amount ($${sale.outstandingAmount})`
            });
        }

        // Create the recovery record
        const recovery = new Recovery({
            customer: customerId,
            sale: saleId,
            saleNumber: sale.saleNumber,
            recoveryAmount,
            paymentMethod: paymentMethod || 'cash',
            paymentReference: paymentReference || '',
            notes: notes || '',
            receivedBy,
            status: 'confirmed'
        });

        await recovery.save();

        // Debug logging before update
        console.log('=== Recovery Controller Debug - Before Update ===');
        console.log('Sale ID:', saleId);
        console.log('Recovery Amount:', recoveryAmount);
        console.log('Current Outstanding Amount:', sale.outstandingAmount);
        
        // SIMPLE APPROACH: Just deduct the recovery amount from current outstanding amount
        const currentOutstanding = sale.outstandingAmount || 0;
        const newOutstandingAmount = Math.max(0, currentOutstanding - recoveryAmount);
        const newTotalRecovered = (sale.totalRecovered || 0) + recoveryAmount;
        
        // Set status based on new outstanding amount
        let newPaymentStatus, newRecoveryStatus;
        if (newOutstandingAmount === 0) {
            newPaymentStatus = 'paid';
            newRecoveryStatus = 'fully_paid';
        } else if (newOutstandingAmount > 0 && newTotalRecovered > 0) {
            newPaymentStatus = 'partial';
            newRecoveryStatus = 'partially_paid';
        } else {
            newPaymentStatus = 'pending';
            newRecoveryStatus = 'unpaid';
        }
        
        console.log('Current Outstanding:', currentOutstanding);
        console.log('Recovery Amount:', recoveryAmount);
        console.log('NEW Outstanding (after deduction):', newOutstandingAmount);
        console.log('NEW Total Recovered:', newTotalRecovered);
        console.log('NEW Status:', newRecoveryStatus);
        
        // Update sale directly - just deduct from outstanding amount
        const updateQuery = {
            $inc: { totalRecovered: recoveryAmount }, // Increment total recovered
            $set: { 
                outstandingAmount: newOutstandingAmount, // Set new outstanding amount
                paymentStatus: newPaymentStatus,
                recoveryStatus: newRecoveryStatus,
                lastRecoveryDate: new Date()
            }
        };

        // Add recovery notes if provided
        if (notes) {
            updateQuery.$set.recoveryNotes = sale.recoveryNotes 
                ? `${sale.recoveryNotes}\n[${new Date().toLocaleDateString()}] ${notes}`
                : `[${new Date().toLocaleDateString()}] ${notes}`;
        }

        const updatedSale = await Sale.findByIdAndUpdate(saleId, updateQuery, { new: true });

        console.log('Database updated successfully');
        console.log('Updated sale status:', updatedSale.recoveryStatus);
        console.log('Updated outstanding amount:', updatedSale.outstandingAmount);
        console.log('===============================================');

        // Populate the recovery with customer and sale details
        const populatedRecovery = await Recovery.findById(recovery._id)
            .populate('customer', 'name email phone')
            .populate('sale', 'saleNumber grandTotal saleDate');

        res.status(201).json({
            success: true,
            message: 'Recovery payment recorded successfully',
            data: populatedRecovery
        });

    } catch (error) {
        console.error('Error adding recovery:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all outstanding sales
const getOutstandingSales = async (req, res) => {
    try {
        const { customerId, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        const outstandingSales = await Sale.getOutstandingSales(customerId)
            .limit(parseInt(limit))
            .skip(skip);

        const countQuery = {
            $or: [
                // New records with recoveryStatus
                { 
                    recoveryStatus: { $in: ['unpaid', 'partially_paid', 'overdue'] },
                    outstandingAmount: { $gt: 0 }
                },
                // Old records without recoveryStatus but with outstanding amounts
                {
                    recoveryStatus: { $exists: false },
                    $expr: { $gt: [{ $subtract: ['$grandTotal', '$amountPaid'] }, 0] }
                },
                // Old records with partial payment status
                {
                    recoveryStatus: { $exists: false },
                    paymentStatus: { $in: ['partial', 'pending'] }
                }
            ]
        };
        
        if (customerId) {
            countQuery.customer = customerId;
        }
        
        const totalCount = await Sale.countDocuments(countQuery);

        res.json({
            success: true,
            data: outstandingSales,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasMore: skip + outstandingSales.length < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching outstanding sales:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get overdue sales
const getOverdueSales = async (req, res) => {
    try {
        const overdueSales = await Sale.getOverdueSales();

        res.json({
            success: true,
            data: overdueSales
        });

    } catch (error) {
        console.error('Error fetching overdue sales:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get fully paid sales
const getFullyPaidSales = async (req, res) => {
    try {
        const { customerId, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        const fullyPaidSales = await Sale.getFullyPaidSales(customerId)
            .limit(parseInt(limit))
            .skip(skip);

        const countQuery = {
            $or: [
                // New records with recoveryStatus
                { 
                    recoveryStatus: 'fully_paid',
                    outstandingAmount: 0
                },
                // Old records with paid status
                {
                    recoveryStatus: { $exists: false },
                    paymentStatus: 'paid'
                },
                // Records where total paid equals grand total
                {
                    $expr: { 
                        $eq: [
                            { $add: [{ $ifNull: ['$amountPaid', 0] }, { $ifNull: ['$totalRecovered', 0] }] },
                            '$grandTotal'
                        ]
                    }
                }
            ]
        };

        if (customerId) {
            countQuery.customer = customerId;
        }
        
        const totalCount = await Sale.countDocuments(countQuery);

        res.json({
            success: true,
            data: fullyPaidSales,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasMore: skip + fullyPaidSales.length < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching fully paid sales:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get recovery history for a specific sale
const getSaleRecoveryHistory = async (req, res) => {
    try {
        const { saleId } = req.params;

        const recoveries = await Recovery.getSaleRecoveryHistory(saleId);

        res.json({
            success: true,
            data: recoveries
        });

    } catch (error) {
        console.error('Error fetching sale recovery history:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get customer recovery summary
const getCustomerRecoverySummary = async (req, res) => {
    try {
        const { customerId } = req.params;

        // Get recovery summary from Recovery model
        const recoverySummary = await Recovery.getCustomerRecoverySummary(customerId);
        
        // Get outstanding sales for this customer
        const outstandingSales = await Sale.getOutstandingSales(customerId);
        
        // Get customer details
        const customer = await Customer.findById(customerId);

        const summary = {
            customer: customer,
            recoveryStats: recoverySummary[0] || {
                totalRecovered: 0,
                totalRecoveries: 0,
                lastRecoveryDate: null,
                recoveries: []
            },
            outstandingSales: outstandingSales,
            totalOutstanding: outstandingSales.reduce((sum, sale) => sum + sale.outstandingAmount, 0)
        };

        res.json({
            success: true,
            data: summary
        });

    } catch (error) {
        console.error('Error fetching customer recovery summary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all recoveries with details
const getAllRecoveries = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        const recoveries = await Recovery.getAllRecoveriesWithDetails(parseInt(limit), skip);
        
        const totalCount = await Recovery.countDocuments({ status: 'confirmed' });

        res.json({
            success: true,
            data: recoveries,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                hasMore: skip + recoveries.length < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching recoveries:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get recovery dashboard summary
const getRecoveryDashboardSummary = async (req, res) => {
    try {
        // Get overall recovery summary from Sales
        const recoverySummary = await Sale.getRecoverySummary();
        
        // Get recent recoveries
        const recentRecoveries = await Recovery.getAllRecoveriesWithDetails(10, 0);
        
        // Get overdue sales
        const overdueSales = await Sale.getOverdueSales();
        
        const summary = {
            stats: recoverySummary[0] || {
                totalOutstanding: 0,
                totalSales: 0,
                unpaidSales: 0,
                partiallyPaidSales: 0,
                overdueSales: 0,
                fullyPaidSales: 0
            },
            recentRecoveries: recentRecoveries,
            overdueSales: overdueSales.slice(0, 5), // Top 5 overdue
            totalOverdue: overdueSales.reduce((sum, sale) => sum + sale.outstandingAmount, 0)
        };

        res.json({
            success: true,
            data: summary
        });

    } catch (error) {
        console.error('Error fetching recovery dashboard summary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update recovery status (cancel, pending, etc.)
const updateRecoveryStatus = async (req, res) => {
    try {
        const { recoveryId } = req.params;
        const { status, notes } = req.body;

        if (!['confirmed', 'pending', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: confirmed, pending, or cancelled'
            });
        }

        const recovery = await Recovery.findById(recoveryId);
        if (!recovery) {
            return res.status(404).json({
                success: false,
                message: 'Recovery record not found'
            });
        }

        const oldStatus = recovery.status;
        recovery.status = status;
        if (notes) {
            recovery.notes = notes;
        }

        await recovery.save();

        // If status changed from confirmed to cancelled, need to update sale
        if (oldStatus === 'confirmed' && status === 'cancelled') {
            const sale = await Sale.findById(recovery.sale);
            if (sale) {
                sale.totalRecovered = Math.max(0, (sale.totalRecovered || 0) - recovery.recoveryAmount);
                await sale.save();
            }
        }
        // If status changed from cancelled to confirmed, add back to sale
        else if (oldStatus === 'cancelled' && status === 'confirmed') {
            const sale = await Sale.findById(recovery.sale);
            if (sale) {
                sale.totalRecovered = (sale.totalRecovered || 0) + recovery.recoveryAmount;
                await sale.save();
            }
        }

        const updatedRecovery = await Recovery.findById(recoveryId)
            .populate('customer', 'name email phone')
            .populate('sale', 'saleNumber grandTotal saleDate');

        res.json({
            success: true,
            message: 'Recovery status updated successfully',
            data: updatedRecovery
        });

    } catch (error) {
        console.error('Error updating recovery status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Migration function to update existing sales with recovery fields
const migrateExistingSales = async (req, res) => {
    try {
        // Find all sales without recoveryStatus
        const salesWithoutRecoveryStatus = await Sale.find({ recoveryStatus: { $exists: false } });
        
        let updatedCount = 0;
        
        for (const sale of salesWithoutRecoveryStatus) {
            const totalPaid = (sale.amountPaid || 0) + (sale.totalRecovered || 0);
            sale.outstandingAmount = Math.max(0, (sale.grandTotal || 0) - totalPaid);
            
            // Set recovery status based on payment status
            if (sale.paymentStatus === 'paid' || sale.outstandingAmount === 0) {
                sale.recoveryStatus = 'fully_paid';
            } else if (sale.paymentStatus === 'partial' || (sale.amountPaid > 0 && sale.outstandingAmount > 0)) {
                sale.recoveryStatus = 'partially_paid';
            } else {
                sale.recoveryStatus = 'unpaid';
            }
            
            // Set due date if not exists (30 days from sale date)
            if (!sale.dueDate) {
                const dueDate = new Date(sale.saleDate || sale.createdAt);
                dueDate.setDate(dueDate.getDate() + 30);
                sale.dueDate = dueDate;
            }
            
            // Check if overdue
            if (sale.outstandingAmount > 0 && sale.dueDate && new Date() > sale.dueDate) {
                sale.recoveryStatus = 'overdue';
            }
            
            await sale.save();
            updatedCount++;
        }
        
        res.json({
            success: true,
            message: `Successfully migrated ${updatedCount} sales with recovery fields`,
            data: {
                totalProcessed: salesWithoutRecoveryStatus.length,
                updated: updatedCount
            }
        });
        
    } catch (error) {
        console.error('Error migrating existing sales:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during migration',
            error: error.message
        });
    }
};

module.exports = {
    addRecovery,
    getOutstandingSales,
    getOverdueSales,
    getFullyPaidSales,
    getSaleRecoveryHistory,
    getCustomerRecoverySummary,
    getAllRecoveries,
    getRecoveryDashboardSummary,
    updateRecoveryStatus,
    migrateExistingSales
};