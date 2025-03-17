const express = require('express');
const router = express.Router();
const StockOrder = require('../models/StockOrder');
const { SupplierProduct } = require('../models/supplierProduct');

// Get dashboard metrics
router.get('/dashboard', async (req, res) => {
    try {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Get total supplier products count
        const totalProducts = await SupplierProduct.countDocuments({ status: 'active' });

        // Get pending stock orders count
        const pendingOrders = await StockOrder.countDocuments({ status: 'pending' });

        // Get low stock items count (items with quantity less than minStockAlert)
        const lowStockItems = await SupplierProduct.countDocuments({
            $expr: {
                $lte: ['$quantity', '$minStockAlert']
            }
        });

        // Calculate monthly revenue from stock orders
        const monthlyOrders = await StockOrder.find({
            orderDate: {
                $gte: firstDayOfMonth,
                $lte: lastDayOfMonth
            },
            status: { $ne: 'cancelled' }
        });

        const monthlyRevenue = monthlyOrders.reduce((total, order) => {
            return total + (order.totalAmount || 0);
        }, 0);

        // Get sales data for the last 6 months
        const salesData = await getSalesData();

        res.json({
            success: true,
            data: {
                totalProducts,
                pendingOrders,
                lowStockItems,
                monthlyRevenue,
                salesData
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
});

// Helper function to get sales data for the last 6 months
async function getSalesData() {
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
        
        const orders = await StockOrder.find({
            orderDate: {
                $gte: month,
                $lte: monthEnd
            },
            status: { $ne: 'cancelled' }
        });

        const totalSales = orders.reduce((total, order) => total + (order.totalAmount || 0), 0);
        const monthName = month.toLocaleString('default', { month: 'short' });
        
        months.push([monthName, totalSales, orders.length]);
    }

    return months;
}

module.exports = router; 