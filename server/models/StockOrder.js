const mongoose = require('mongoose');

const stockOrderSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'delivered'],
        default: 'pending'
    },
    autoOrdered: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'upi', 'cash'],
        default: null
    },
    paymentDate: {
        type: Date
    },
    invoiceNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    totalAmount: {
        type: Number,
        required: true
    }
});

// Export the model only if it hasn't been registered yet
module.exports = mongoose.models.StockOrder || mongoose.model('StockOrder', stockOrderSchema); 