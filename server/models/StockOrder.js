const mongoose = require('mongoose');

// Check if the model already exists before defining it
if (mongoose.models.StockOrder) {
    module.exports = mongoose.model('StockOrder');
} else {
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
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        orderDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        paymentMethod: {
            type: String,
            enum: ['razorpay'],
            default: 'razorpay'
        },
        paymentId: {
            type: String,
            default: null
        },
        razorpayOrderId: {
            type: String,
            default: null
        },
        paymentDate: {
            type: Date,
            default: null
        },
        invoiceNumber: {
            type: String,
            unique: true,
            sparse: true
        },
        deliveryDate: {
            type: Date,
            default: null
        },
        notes: {
            type: String,
            default: ''
        }
    });

    stockOrderSchema.virtual('id').get(function () {
        return this._id.toHexString();
    });

    stockOrderSchema.set('toJSON', {
        virtuals: true
    });

    module.exports = mongoose.model('StockOrder', stockOrderSchema);
}