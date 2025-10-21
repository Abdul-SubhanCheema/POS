const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
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


const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
