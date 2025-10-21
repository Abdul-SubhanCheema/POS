const Sale = require('../Models/SaleSchema');
const CustomerPriceHistory = require('../Models/CustomerPriceHistorySchema');
const Product = require('../Models/ProductSchema');

// Create a new sale
const createSale = async (req, res) => {
    try {
        const { 
            customer, 
            supplier, 
            items, 
            subtotal,
            totalProfit = 0,
            profitMargin = 0,
            discountType = 'none',
            discountValue = 0,
            taxRate = 0,
            amountPaid,
            paymentMethod = 'cash',
            notes 
        } = req.body;

        // Validate required fields
        if (!customer || !supplier || !items || !subtotal || amountPaid === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Customer, supplier, items, subtotal, and amount paid are required'
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one item is required'
            });
        }

        // Generate sale number
        const saleCount = await Sale.countDocuments();
        const saleNumber = `SALE-${String(saleCount + 1).padStart(6, '0')}`;

        // Create the sale
        const sale = new Sale({
            customer,
            supplier,
            items,
            subtotal,
            totalProfit,
            profitMargin,
            discountType,
            discountValue,
            taxRate,
            amountPaid,
            paymentMethod,
            notes,
            saleNumber
        });

        const savedSale = await sale.save();

        // Create customer price history records
        try {
            const historyRecords = items.map(item => ({
                customer,
                product: item.product,
                price: item.unitPrice,
                quantity: item.quantity,
                totalAmount: item.total,
                sale: savedSale._id,
                saleDate: savedSale.saleDate
            }));

            await CustomerPriceHistory.insertMany(historyRecords);
            console.log(`Created ${historyRecords.length} price history records for sale ${savedSale.saleNumber}`);
        } catch (historyError) {
            console.error('Error creating price history records:', historyError);
            // Don't fail the sale if price history creation fails
            // This ensures the sale still goes through even if there's a price history issue
        }

        // Populate the saved sale for response
        const populatedSale = await Sale.findById(savedSale._id)
            .populate('customer', 'name email phone')
            .populate('supplier', 'name email phone')
            .populate('items.product', 'name category');

        res.status(201).json({
            success: true,
            message: 'Sale created successfully',
            data: populatedSale
        });

    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create sale',
            error: error.message
        });
    }
};

// Get all sales with pagination and filtering
const getAllSales = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            customer,
            supplier,
            startDate,
            endDate,
            status,
            minAmount,
            maxAmount
        } = req.query;

        // Build filter object
        const filter = {};
        
        if (customer) filter.customer = customer;
        if (supplier) filter.supplier = supplier;
        if (status) filter.status = status;
        
        if (startDate || endDate) {
            filter.saleDate = {};
            if (startDate) filter.saleDate.$gte = new Date(startDate);
            if (endDate) filter.saleDate.$lte = new Date(endDate);
        }
        
        if (minAmount || maxAmount) {
            filter.grandTotal = {};
            if (minAmount) filter.grandTotal.$gte = parseFloat(minAmount);
            if (maxAmount) filter.grandTotal.$lte = parseFloat(maxAmount);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const sales = await Sale.find(filter)
            .populate('customer', 'name email phone')
            .populate('supplier', 'name email phone')
            .populate('items.product', 'name category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalSales = await Sale.countDocuments(filter);
        const totalPages = Math.ceil(totalSales / parseInt(limit));

        res.status(200).json({
            success: true,
            message: 'Sales retrieved successfully',
            data: sales,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalSales,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sales',
            error: error.message
        });
    }
};

// Get sale by ID
const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;

        const sale = await Sale.findById(id)
            .populate('customer', 'name email phone address')
            .populate('supplier', 'name email phone address')
            .populate('items.product', 'name category description');

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Sale retrieved successfully',
            data: sale
        });

    } catch (error) {
        console.error('Error fetching sale:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sale',
            error: error.message
        });
    }
};

// Get customer price history for a product
const getCustomerPriceHistory = async (req, res) => {
    try {
        const { customerId, productId } = req.params;
        const { limit = 10 } = req.query;

        const history = await CustomerPriceHistory.getCustomerProductHistory(
            customerId, 
            productId, 
            parseInt(limit)
        );

        res.status(200).json({
            success: true,
            message: 'Price history retrieved successfully',
            data: history
        });

    } catch (error) {
        console.error('Error fetching price history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch price history',
            error: error.message
        });
    }
};

// Get sales statistics
const getSalesStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.saleDate = {};
            if (startDate) dateFilter.saleDate.$gte = new Date(startDate);
            if (endDate) dateFilter.saleDate.$lte = new Date(endDate);
        }

        const [
            totalSales,
            totalRevenue,
            avgSaleValue,
            totalProfit,
            avgProfitMargin,
            topCustomers,
            dailySales
        ] = await Promise.all([
            // Total sales count
            Sale.countDocuments(dateFilter),
            
            // Total revenue
            Sale.aggregate([
                { $match: dateFilter },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            
            // Average sale value
            Sale.aggregate([
                { $match: dateFilter },
                { $group: { _id: null, avg: { $avg: '$grandTotal' } } }
            ]),

            // Total profit (calculate from items if totalProfit doesn't exist)
            Sale.aggregate([
                { $match: dateFilter },
                {
                    $addFields: {
                        calculatedProfit: {
                            $cond: {
                                if: { $ne: ['$totalProfit', null] },
                                then: '$totalProfit',
                                else: {
                                    $reduce: {
                                        input: '$items',
                                        initialValue: 0,
                                        in: {
                                            $add: [
                                                '$$value',
                                                { $ifNull: ['$$this.totalProfit', 0] }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                { $group: { _id: null, total: { $sum: '$calculatedProfit' } } }
            ]),

            // Average profit margin
            Sale.aggregate([
                { $match: dateFilter },
                {
                    $addFields: {
                        calculatedMargin: {
                            $cond: {
                                if: { $ne: ['$profitMargin', null] },
                                then: '$profitMargin',
                                else: {
                                    $cond: {
                                        if: { $gt: ['$grandTotal', 0] },
                                        then: {
                                            $multiply: [
                                                {
                                                    $divide: [
                                                        {
                                                            $reduce: {
                                                                input: '$items',
                                                                initialValue: 0,
                                                                in: {
                                                                    $add: [
                                                                        '$$value',
                                                                        { $ifNull: ['$$this.totalProfit', 0] }
                                                                    ]
                                                                }
                                                            }
                                                        },
                                                        '$grandTotal'
                                                    ]
                                                },
                                                100
                                            ]
                                        },
                                        else: 0
                                    }
                                }
                            }
                        }
                    }
                },
                { $group: { _id: null, avg: { $avg: '$calculatedMargin' } } }
            ]),
            
            // Top customers by sales value
            Sale.aggregate([
                { $match: dateFilter },
                { $group: { 
                    _id: '$customer', 
                    totalSpent: { $sum: '$grandTotal' },
                    totalSales: { $sum: 1 }
                }},
                { $sort: { totalSpent: -1 } },
                { $limit: 5 },
                { $lookup: { 
                    from: 'customers', 
                    localField: '_id', 
                    foreignField: '_id', 
                    as: 'customerInfo' 
                }},
                { $unwind: '$customerInfo' }
            ]),
            
            // Daily sales for the last 30 days
            Sale.aggregate([
                { 
                    $match: { 
                        saleDate: { 
                            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
                        } 
                    } 
                },
                {
                    $addFields: {
                        calculatedProfit: {
                            $cond: {
                                if: { $ne: ['$totalProfit', null] },
                                then: '$totalProfit',
                                else: {
                                    $reduce: {
                                        input: '$items',
                                        initialValue: 0,
                                        in: {
                                            $add: [
                                                '$$value',
                                                { $ifNull: ['$$this.totalProfit', 0] }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
                        totalSales: { $sum: 1 },
                        totalRevenue: { $sum: '$grandTotal' },
                        totalProfit: { $sum: '$calculatedProfit' }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        res.status(200).json({
            success: true,
            message: 'Sales statistics retrieved successfully',
            data: {
                totalSales,
                totalRevenue: totalRevenue[0]?.total || 0,
                avgSaleValue: avgSaleValue[0]?.avg || 0,
                totalProfit: totalProfit[0]?.total || 0,
                avgProfitMargin: avgProfitMargin[0]?.avg || 0,
                topCustomers,
                dailySales
            }
        });

    } catch (error) {
        console.error('Error fetching sales statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sales statistics',
            error: error.message
        });
    }
};

module.exports = {
    createSale,
    getAllSales,
    getSaleById,
    getCustomerPriceHistory,
    getSalesStatistics
};