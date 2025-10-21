const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    quantity: {
        type: Number,
        required: [true, 'Product quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        validate: {
            validator: Number.isInteger,
            message: 'Quantity must be a whole number'
        }
    },
    
    category: {
        type: String,
        required: [true, 'Product category is required'],
        trim: true,
        maxlength: [50, 'Category name cannot exceed 50 characters'],
        validate: {
            validator: function(v) {
                return v && v.length >= 2;
            },
            message: 'Category must be at least 2 characters long'
        }
    },
    
    batchName: {
        type: String,
        required: [true, 'Batch name is required'],
        trim: true,
        maxlength: [50, 'Batch name cannot exceed 50 characters']
    },
    
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
        validate: {
            validator: function(v) {
                return /^\d+(\.\d{1,2})?$/.test(v.toString());
            },
            message: 'Price must be a valid number with up to 2 decimal places'
        }
    },
    
    discount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%'],
        default: 0
    },
    
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: [true, 'Supplier is required']
    },
    
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive', 'discontinued', 'out-of-stock'],
            message: 'Please select a valid status'
        },
        default: 'active'
    },
    
    expiryDate: {
        type: Date,
        validate: {
            validator: function(v) {
                return !v || v > new Date();
            },
            message: 'Expiry date must be in the future'
        }
    }
    
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for final price after discount
productSchema.virtual('finalPrice').get(function() {
    if (this.price && this.discount) {
        return (this.price - (this.price * this.discount / 100)).toFixed(2);
    }
    return this.price;
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);