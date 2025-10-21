const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Supplier name is required'],
        trim: true
    },
    
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                // Only validate if email is provided (since it's optional)
                return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
    
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Supplier', supplierSchema);