const mongoose = require('mongoose');

const customerPriceHistorySchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    saleDate: {
        type: Date,
        default: Date.now
    },
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sale',
        required: true
    }
    
}, {
    timestamps: true
});

// Index for fast queries
customerPriceHistorySchema.index({ customer: 1, product: 1, saleDate: -1 });

// Static method to get customer's price history for a product
customerPriceHistorySchema.statics.getCustomerProductHistory = function(customerId, productId, limit = 10) {
    return this.find({ 
        customer: customerId, 
        product: productId 
    })
    .sort({ saleDate: -1 })
    .limit(limit)
    .populate('sale', 'saleNumber saleDate')
    .exec();
};

// Static method to get customer's recent purchases
customerPriceHistorySchema.statics.getCustomerRecentPurchases = function(customerId, limit = 20) {
    return this.find({ customer: customerId })
        .sort({ saleDate: -1 })
        .limit(limit)
        .populate('product', 'name category')
        .populate('sale', 'saleNumber saleDate')
        .exec();
};

module.exports = mongoose.model('CustomerPriceHistory', customerPriceHistorySchema);