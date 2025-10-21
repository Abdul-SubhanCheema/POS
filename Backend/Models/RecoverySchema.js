const mongoose = require('mongoose');

const recoverySchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sale',
        required: true
    },
    saleNumber: {
        type: String,
        required: true
    },
    recoveryAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'cheque', 'mixed'],
        required: true,
        default: 'cash'
    },
    paymentReference: {
        type: String, // For cheque numbers, transaction IDs, etc.
        default: ''
    },
    recoveryDate: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    receivedBy: {
        type: String, // Staff member who received the payment
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'pending', 'cancelled'],
        default: 'confirmed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
recoverySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
recoverySchema.index({ customer: 1, sale: 1 });
recoverySchema.index({ recoveryDate: -1 });
recoverySchema.index({ status: 1 });

// Static method to get customer recovery summary
recoverySchema.statics.getCustomerRecoverySummary = function(customerId) {
    return this.aggregate([
        { $match: { customer: mongoose.Types.ObjectId(customerId), status: 'confirmed' } },
        {
            $group: {
                _id: '$customer',
                totalRecovered: { $sum: '$recoveryAmount' },
                totalRecoveries: { $sum: 1 },
                lastRecoveryDate: { $max: '$recoveryDate' },
                recoveries: {
                    $push: {
                        amount: '$recoveryAmount',
                        date: '$recoveryDate',
                        saleNumber: '$saleNumber',
                        paymentMethod: '$paymentMethod'
                    }
                }
            }
        }
    ]);
};

// Static method to get recovery history for a specific sale
recoverySchema.statics.getSaleRecoveryHistory = function(saleId) {
    return this.find({ sale: saleId, status: 'confirmed' })
        .populate('customer', 'name email phone')
        .sort({ recoveryDate: -1 });
};

// Static method to get all recoveries with customer and sale details
recoverySchema.statics.getAllRecoveriesWithDetails = function(limit = 50, skip = 0) {
    return this.find({ status: 'confirmed' })
        .populate('customer', 'name email phone')
        .populate('sale', 'saleNumber grandTotal saleDate')
        .sort({ recoveryDate: -1 })
        .limit(limit)
        .skip(skip);
};

// Virtual to calculate recovery age (days since recovery)
recoverySchema.virtual('recoveryAge').get(function() {
    return Math.floor((Date.now() - this.recoveryDate) / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
recoverySchema.set('toJSON', { virtuals: true });
recoverySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Recovery', recoverySchema);