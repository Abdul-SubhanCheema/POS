const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    actualPrice: {
        type: Number,
        required: true,
        min: 0
    },
    profitPerUnit: {
        type: Number,
        default: 0
    },
    totalProfit: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    }
});

const saleSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    items: [saleItemSchema],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed', 'none'],
        default: 'none'
    },
    discountValue: {
        type: Number,
        default: 0,
        min: 0
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    taxRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    grandTotal: {
        type: Number,
        min: 0
    },
    totalProfit: {
        type: Number,
        default: 0
    },
    profitMargin: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    amountPaid: {
        type: Number,
        required: true,
        min: 0
    },
    changeDue: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'cheque', 'mixed'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'partial', 'pending'],
        default: 'paid'
    },
    saleDate: {
        type: Date,
        default: Date.now
    },
    saleNumber: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'cancelled'],
        default: 'completed'
    },
    notes: {
        type: String,
        trim: true
    },
    // Recovery Management Fields
    outstandingAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalRecovered: {
        type: Number,
        default: 0,
        min: 0
    },
    recoveryStatus: {
        type: String,
        enum: ['fully_paid', 'partially_paid', 'unpaid', 'overdue'],
        default: 'unpaid'
    },
    dueDate: {
        type: Date,
        default: function() {
            // Default due date is 30 days from sale date
            const dueDate = new Date(this.saleDate || Date.now());
            dueDate.setDate(dueDate.getDate() + 30);
            return dueDate;
        }
    },
    lastRecoveryDate: {
        type: Date
    },
    recoveryNotes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});



// Virtual for formatted sale date
saleSchema.virtual('formattedSaleDate').get(function() {
    return this.saleDate.toLocaleDateString();
});

// Virtual for total items count
saleSchema.virtual('totalItems').get(function() {
    return this.items && Array.isArray(this.items) 
        ? this.items.reduce((total, item) => total + (item.quantity || 0), 0)
        : 0;
});

// Virtual for total unique products
saleSchema.virtual('totalProducts').get(function() {
    return this.items ? this.items.length : 0;
});

// Virtual for payment status check
saleSchema.virtual('isFullyPaid').get(function() {
    return this.amountPaid >= this.grandTotal;
});

// Virtual for outstanding amount (handles both old and new records)
saleSchema.virtual('effectiveOutstandingAmount').get(function() {
    // If outstandingAmount exists, use it; otherwise calculate it
    if (typeof this.outstandingAmount === 'number') {
        return this.outstandingAmount;
    }
    // For old records, calculate from grandTotal and amountPaid
    const totalPaid = (this.amountPaid || 0) + (this.totalRecovered || 0);
    return Math.max(0, (this.grandTotal || 0) - totalPaid);
});

// Virtual for effective recovery status (handles both old and new records)
saleSchema.virtual('effectiveRecoveryStatus').get(function() {
    // If recoveryStatus exists, use it
    if (this.recoveryStatus) {
        return this.recoveryStatus;
    }
    // For old records, derive from paymentStatus
    if (this.paymentStatus === 'paid') {
        return 'fully_paid';
    } else if (this.paymentStatus === 'partial') {
        return 'partially_paid';
    } else {
        return 'unpaid';
    }
});

// Pre-save middleware to calculate totals ONLY for new sales
saleSchema.pre('save', function(next) {
    // Only run for NEW sales - completely skip for existing sales
    if (!this.isNew) {
        console.log('Skipping pre-save middleware for existing sale ID:', this._id);
        return next();
    }
    
    console.log('Running pre-save middleware for NEW sale');
    
    // Calculate subtotal from items
    if (this.items && Array.isArray(this.items)) {
        this.subtotal = this.items.reduce((total, item) => total + (item.total || 0), 0);
    }
    
    // Calculate discount amount
    if (this.discountType === 'percentage') {
        this.discountAmount = (this.subtotal * this.discountValue) / 100;
    } else if (this.discountType === 'fixed') {
        this.discountAmount = this.discountValue;
    } else {
        this.discountAmount = 0;
    }
    
    // Calculate tax amount
    const afterDiscount = this.subtotal - this.discountAmount;
    this.taxAmount = (afterDiscount * this.taxRate) / 100;
    
    // Calculate grand total
    this.grandTotal = afterDiscount + this.taxAmount;
    
    // Calculate change due
    this.changeDue = Math.max(0, this.amountPaid - this.grandTotal);
    
    // Set initial outstanding amount for new sales
    const totalPaid = this.amountPaid || 0;
    this.outstandingAmount = Math.max(0, this.grandTotal - totalPaid);
    
    // Set initial payment status
    if (this.outstandingAmount === 0 && totalPaid > 0) {
        this.paymentStatus = 'paid';
        this.recoveryStatus = 'fully_paid';
    } else if (this.outstandingAmount > 0 && totalPaid > 0) {
        this.paymentStatus = 'partial';
        this.recoveryStatus = 'partially_paid';
    } else {
        this.paymentStatus = 'pending';
        this.recoveryStatus = 'unpaid';
    }
    
    console.log('New sale created with outstanding amount:', this.outstandingAmount);
    
    next();
});

// Static methods for recovery management
saleSchema.statics.getOutstandingSales = function(customerId = null) {
    const query = {
        $and: [
            // Ensure not fully paid
            { recoveryStatus: { $ne: 'fully_paid' } },
            { outstandingAmount: { $gt: 0 } },
            {
                $or: [
                    // New records with recoveryStatus
                    { 
                        recoveryStatus: { $in: ['unpaid', 'partially_paid', 'overdue'] }
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
            }
        ]
    };
    
    if (customerId) {
        query.customer = customerId;
    }
    
    return this.find(query)
        .populate('customer', 'name email phone')
        .populate('supplier', 'name')
        .sort({ saleDate: -1 });
};

saleSchema.statics.getOverdueSales = function() {
    return this.find({
        recoveryStatus: 'overdue',
        outstandingAmount: { $gt: 0 }
    })
    .populate('customer', 'name email phone')
    .sort({ dueDate: 1 });
};

saleSchema.statics.getFullyPaidSales = function(customerId = null) {
    const query = {
        $and: [
            // Must have zero outstanding amount
            { outstandingAmount: { $lte: 0 } },
            {
                $or: [
                    // New records with recoveryStatus
                    { 
                        recoveryStatus: 'fully_paid'
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
            }
        ]
    };
    
    if (customerId) {
        query.customer = customerId;
    }
    
    return this.find(query)
        .populate('customer', 'name email phone')
        .populate('supplier', 'name')
        .sort({ saleDate: -1 });
};

saleSchema.statics.getRecoverySummary = function() {
    return this.aggregate([
        {
            $addFields: {
                // Calculate effective recovery status for both old and new records
                effectiveRecoveryStatus: {
                    $cond: {
                        if: { $ifNull: ['$recoveryStatus', false] },
                        then: '$recoveryStatus',
                        else: {
                            $cond: {
                                if: { $eq: ['$paymentStatus', 'paid'] },
                                then: 'fully_paid',
                                else: {
                                    $cond: {
                                        if: { $eq: ['$paymentStatus', 'partial'] },
                                        then: 'partially_paid',
                                        else: 'unpaid'
                                    }
                                }
                            }
                        }
                    }
                },
                // Calculate effective outstanding amount
                effectiveOutstanding: {
                    $cond: {
                        if: { $ifNull: ['$outstandingAmount', false] },
                        then: '$outstandingAmount',
                        else: { $max: [{ $subtract: ['$grandTotal', '$amountPaid'] }, 0] }
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                totalOutstanding: { $sum: '$effectiveOutstanding' },
                totalSales: { $sum: 1 },
                unpaidSales: {
                    $sum: { $cond: [{ $eq: ['$effectiveRecoveryStatus', 'unpaid'] }, 1, 0] }
                },
                partiallyPaidSales: {
                    $sum: { $cond: [{ $eq: ['$effectiveRecoveryStatus', 'partially_paid'] }, 1, 0] }
                },
                overdueSales: {
                    $sum: { $cond: [{ $eq: ['$effectiveRecoveryStatus', 'overdue'] }, 1, 0] }
                },
                fullyPaidSales: {
                    $sum: { $cond: [{ $eq: ['$effectiveRecoveryStatus', 'fully_paid'] }, 1, 0] }
                }
            }
        }
    ]);
};

// Ensure virtual fields are serialized
saleSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Sale', saleSchema);