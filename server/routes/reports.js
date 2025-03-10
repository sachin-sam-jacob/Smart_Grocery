const express = require('express');
const router = express.Router();
const Report = require('../models/report');
const { Orders } = require('../models/orders');
const { Product } = require('../models/products');
const District = require('../models/pincode');

// Helper function to get date range
const getDateRange = (period, customStart, customEnd) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (period) {
        case 'daily':
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'weekly':
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'monthly':
            start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'yearly':
            start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'custom':
            start = new Date(customStart);
            end = new Date(customEnd);
            end.setDate(end.getDate() + 1);
            break;
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

// Generate Sales Report
router.post('/sales', async (req, res) => {
    try {
        const { period, customStart, customEnd, location } = req.body;
        const { start, end } = getDateRange(period, customStart, customEnd);

        console.log('Date range:', {
            start: start.toISOString(),
            end: end.toISOString()
        });

        // First get the pincodes for the location
        let pincodes = [];
        if (location && location !== 'All') {
            const district = await District.findOne({ name: { $regex: new RegExp('^' + location + '$', 'i') } });
            console.log('Found district:', district ? district.name : 'None');
            if (district) {
                pincodes = district.pincodes.map(p => p.code);
                console.log('Pincodes for location:', pincodes);
            }
        }

        // Basic query to check for orders
        const query = {
            date: {
                $gte: start,
                $lte: end
            }
        };

        if (location && location !== 'All') {
            query.pincode = { $in: pincodes };
        }

        // Log the query parameters
        console.log('Query parameters:', {
            startDate: start,
            endDate: end,
            location: location,
            pincodes: pincodes,
            query: query
        });
        
        // Get all orders for debugging
        const allOrders = await Orders.find({});
        console.log('Total orders in database:', allOrders.length);
        console.log('Sample order details:', allOrders.slice(0, 3).map(o => ({
            date: o.date,
            pincode: o.pincode,
            amount: o.amount
        })));

        // First check for orders with this query
        const orders = await Orders.find(query).lean();
        console.log(`Found ${orders.length} orders matching criteria`);
        if (orders.length > 0) {
            console.log('Sample matching orders:', orders.slice(0, 2).map(o => ({
                date: o.date,
                amount: o.amount,
                pincode: o.pincode,
                products: o.products.length
            })));
        }

        // If no orders found, return empty report
        if (orders.length === 0) {
            return res.json({
                success: true,
                data: {
                    summary: {
                        totalOrders: 0,
                        totalRevenue: 0,
                        totalProducts: 0,
                        averageOrderValue: 0,
                        dailySales: {},
                        topProducts: []
                    },
                    dateRange: {
                        start: start.toISOString(),
                        end: end.toISOString()
                    },
                    period,
                    location,
                    pincodes
                }
            });
        }

        // Process orders directly instead of using aggregation
        const summary = {
            totalOrders: orders.length,
            totalRevenue: 0,
            totalProducts: 0,
            averageOrderValue: 0,
            dailySales: {},
            topProducts: {}
        };

        // Process each order
        orders.forEach(order => {
            // Add to total revenue - ensure numeric conversion
            const amount = Number(order.amount) || 0;
            summary.totalRevenue += amount;

            // Add to daily sales
            const dateKey = new Date(order.date).toISOString().split('T')[0];
            summary.dailySales[dateKey] = (summary.dailySales[dateKey] || 0) + amount;

            // Process products
            if (Array.isArray(order.products)) {
                order.products.forEach(product => {
                    const quantity = Number(product.quantity) || 0;
                    summary.totalProducts += quantity;

                    const productId = product.productId.toString();
                    if (!summary.topProducts[productId]) {
                        summary.topProducts[productId] = {
                            name: product.productTitle || 'Unknown Product',
                            quantity: 0,
                            revenue: 0
                        };
                    }

                    summary.topProducts[productId].quantity += quantity;
                    const productRevenue = quantity * (Number(product.price) || 0);
                    summary.topProducts[productId].revenue += productRevenue;
                });
            }
        });

        // Calculate average order value
        summary.averageOrderValue = summary.totalRevenue / summary.totalOrders;

        // Convert top products to array and sort
        const topProductsArray = Object.entries(summary.topProducts)
            .map(([id, data]) => ({
                id,
                ...data
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const response = {
            success: true,
            data: {
                summary: {
                    ...summary,
                    topProducts: topProductsArray
                },
                dateRange: {
                    start: start.toISOString(),
                    end: end.toISOString()
                },
                period,
                location,
                pincodes
            }
        };

        console.log('Final summary:', {
            totalOrders: summary.totalOrders,
            totalRevenue: summary.totalRevenue,
            totalProducts: summary.totalProducts,
            numDailySales: Object.keys(summary.dailySales).length,
            numTopProducts: topProductsArray.length,
            sampleDailySales: Object.entries(summary.dailySales).slice(0, 2)
        });

        res.json(response);

    } catch (error) {
        console.error('Error generating sales report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating sales report',
            error: error.message
        });
    }
});

// Generate Inventory Report
router.post('/inventory', async (req, res) => {
    try {
        const { location } = req.body;

        const products = await Product.find(
            location && location !== 'All' ? { location } : {}
        );

        const summary = {
            totalProducts: products.length,
            lowStock: products.filter(p => p.countInStock <= 10).length,
            outOfStock: products.filter(p => p.countInStock === 0).length,
            totalValue: products.reduce((sum, p) => sum + (p.price * p.countInStock), 0),
            categoryBreakdown: {}
        };

        // Category breakdown
        products.forEach(product => {
            if (!summary.categoryBreakdown[product.category]) {
                summary.categoryBreakdown[product.category] = {
                    count: 0,
                    value: 0
                };
            }
            summary.categoryBreakdown[product.category].count++;
            summary.categoryBreakdown[product.category].value += product.price * product.countInStock;
        });

        res.json({
            success: true,
            data: {
                summary,
                products: products.map(p => ({
                    id: p._id,
                    name: p.name,
                    stock: p.countInStock,
                    value: p.price * p.countInStock
                }))
            }
        });

    } catch (error) {
        console.error('Error generating inventory report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating inventory report'
        });
    }
});

// Generate Supplier Report
router.post('/supplier', async (req, res) => {
    try {
        const { location } = req.body;

        // Get pincodes for location if specified
        let pincodes = [];
        if (location && location !== 'All') {
            const district = await District.findOne({ name: { $regex: new RegExp('^' + location + '$', 'i') } });
            if (district) {
                pincodes = district.pincodes.map(p => p.code);
            }
        }

        // Get all orders with products
        const query = {};
        if (pincodes.length > 0) {
            query.pincode = { $in: pincodes };
        }
        console.log("query",query);
        const orders = await Orders.find(query).lean();
        console.log(`Found ${orders.length} orders for supplier report`);

        // Process suppliers from orders
        const supplierStats = {};
        let totalOrderValue = 0;

        orders.forEach(order => {
            if (Array.isArray(order.products)) {
                order.products.forEach(product => {
                    const supplierId = product.supplierId || 'unknown';
                    const supplierName = product.supplierName || 'Unknown Supplier';
                    const quantity = Number(product.quantity) || 0;
                    const price = Number(product.price) || 0;
                    const revenue = quantity * price;

                    if (!supplierStats[supplierId]) {
                        supplierStats[supplierId] = {
                            name: supplierName,
                            totalOrders: 0,
                            totalProducts: 0,
                            totalRevenue: 0,
                            averageOrderValue: 0,
                            lastOrderDate: null
                        };
                    }

                    supplierStats[supplierId].totalOrders++;
                    supplierStats[supplierId].totalProducts += quantity;
                    supplierStats[supplierId].totalRevenue += revenue;
                    
                    // Update last order date
                    const orderDate = new Date(order.date);
                    if (!supplierStats[supplierId].lastOrderDate || 
                        orderDate > supplierStats[supplierId].lastOrderDate) {
                        supplierStats[supplierId].lastOrderDate = orderDate;
                    }

                    totalOrderValue += revenue;
                });
            }
        });

        // Calculate performance metrics
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const suppliers = Object.values(supplierStats);
        suppliers.forEach(supplier => {
            supplier.averageOrderValue = supplier.totalRevenue / supplier.totalOrders;
            supplier.isActive = supplier.lastOrderDate > thirtyDaysAgo;
        });

        // Sort suppliers by revenue for top suppliers
        const topSuppliers = suppliers
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5)
            .map(supplier => ({
                name: supplier.name,
                totalRevenue: supplier.totalRevenue,
                totalOrders: supplier.totalOrders,
                totalProducts: supplier.totalProducts
            }));

        // Calculate performance metrics
        const performance = suppliers.map(supplier => ({
            name: supplier.name,
            revenue: supplier.totalRevenue,
            orderCount: supplier.totalOrders,
            averageOrderValue: supplier.averageOrderValue,
            isActive: supplier.isActive
        }));

        const summary = {
            totalSuppliers: suppliers.length,
            activeSuppliers: suppliers.filter(s => s.isActive).length,
            totalOrders: suppliers.reduce((sum, s) => sum + s.totalOrders, 0),
            totalValue: totalOrderValue,
            performance: performance,
            topSuppliers: topSuppliers
        };

        console.log("Supplier report summary:", {
            totalSuppliers: summary.totalSuppliers,
            activeSuppliers: summary.activeSuppliers,
            totalOrders: summary.totalOrders,
            totalValue: summary.totalValue,
            topSuppliersCount: summary.topSuppliers.length
        });

        res.json({
            success: true,
            data: {
                summary,
                location: location || 'All',
                pincodes: pincodes.length > 0 ? pincodes : 'All'
            }
        });

    } catch (error) {
        console.error('Error generating supplier report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating supplier report',
            error: error.message
        });
    }
});

// Generate Custom Report
router.post('/custom', async (req, res) => {
    try {
        const { reportType, startDate, endDate, location } = req.body;

        const headers = ['Name', 'Value', 'Change'];
        const rows = [
            ['Sample Data 1', 100, '+10%'],
            ['Sample Data 2', 200, '-5%'],
            ['Sample Data 3', 300, '+15%']
        ];

        res.json({
            success: true,
            data: {
                headers,
                rows
            }
        });

    } catch (error) {
        console.error('Error generating custom report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating custom report'
        });
    }
});

// Get Report History
router.get('/history', async (req, res) => {
    try {
        const { type, period, location } = req.query;
        const query = {};

        if (type) query.type = type;
        if (period) query.period = period;
        if (location) query.location = location;

        const reports = await Report.find(query)
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            reports
        });

    } catch (error) {
        console.error('Error fetching report history:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching report history'
        });
    }
});

// Get Single Report
router.get('/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }

        res.json({
            success: true,
            report
        });

    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching report'
        });
    }
});

module.exports = router; 