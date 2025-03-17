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


exports.StockAlert = mongoose.model('StockAlert', stockAlertSchema);
