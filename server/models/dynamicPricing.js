const mongoose = require('mongoose');

const dynamicPricingSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    originalPrice: {
        type: Number,
        required: true
    },
    currentPrice: {
        type: Number,
        required: true
    },
    stockLevel: {
        type: Number,
        required: true
    },
    demandScore: {
        type: Number,
        default: 0
    },
    salesVelocity: {
        type: Number,
        default: 0
    },
    priceHistory: [{
        price: Number,
        date: {
            type: Date,
            default: Date.now
        },
        reason: String
    }],
    bulkDiscounts: [{
        minQuantity: Number,
        discountPercentage: Number
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

exports.DynamicPricing = mongoose.model('DynamicPricing', dynamicPricingSchema); 