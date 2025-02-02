const mongoose = require('mongoose');

const supplierProductSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    quantityType: {
        type: String,
        required: true,
        enum: ['kg', 'piece', 'liter', 'gram', 'dozen', 'box', 'pack'],
        default: 'piece'
    },
    category: {
        type: String,
        required: true
    },
    minStockAlert: {
        type: Number,
        required: true,
        default: 10
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
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

exports.SupplierProduct = mongoose.model('SupplierProduct', supplierProductSchema); 