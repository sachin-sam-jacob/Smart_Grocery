const mongoose = require('mongoose');

const stockAlertSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    type: {
        type: String,
        enum: ['low_stock', 'high_demand'],
        required: true
    },
    threshold: {
        type: Number,
        required: true
    },
    currentStock: {
        type: Number,
        required: true
    },
    autoOrderEnabled: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
    }
});

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

exports.StockAlert = mongoose.model('StockAlert', stockAlertSchema);
exports.StockOrder = mongoose.model('StockOrder', stockOrderSchema); 