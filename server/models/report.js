const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['sales', 'inventory', 'supplier', 'custom']
    },
    period: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom']
    },
    dateRange: {
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        }
    },
    location: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Format currency helper
reportSchema.methods.formatCurrency = function(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

// Calculate date range helper
reportSchema.statics.getDateRange = function(period, customStart, customEnd) {
    const end = new Date();
    let start = new Date();

    switch (period) {
        case 'daily':
            start.setHours(0, 0, 0, 0);
            break;
        case 'weekly':
            start.setDate(start.getDate() - 7);
            break;
        case 'monthly':
            start.setMonth(start.getMonth() - 1);
            break;
        case 'yearly':
            start.setFullYear(start.getFullYear() - 1);
            break;
        case 'custom':
            start = new Date(customStart);
            end = new Date(customEnd);
            break;
    }

    return { start, end };
};

module.exports = mongoose.model('Report', reportSchema); 