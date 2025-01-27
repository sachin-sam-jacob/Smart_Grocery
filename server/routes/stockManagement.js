const express = require('express');
const router = express.Router();
const { StockAlert, StockOrder } = require('../models/stockManagement');
const { Product } = require('../models/products');
const { User } = require('../models/user');

// Add this middleware before your route handler
const checkDistrictManager = async (req, res, next) => {
    try {
        const user = req.user; // Assuming you have user info from JWT
        if (!user.location || user.role !== 'district_manager') {
            return res.status(403).json({ error: 'Access denied. District managers only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authorization check failed' });
    }
};

// Get stock status for all products in a location
router.get('/status', async (req, res) => {
    try {
        const location = req.query.location;
        console.log('Fetching products for location:', location);

        if (!location) {
            return res.status(400).json({ error: 'Location parameter is required' });
        }

        // Find products for this location or products marked as "All"
        const products = await Product.find({
            $or: [
                { location: location },
                { location: "All" }
            ]
        });

        console.log(`Found ${products.length} products for location ${location}`);

        if (!products || products.length === 0) {
            return res.json([]);
        }

        // Get all stock alerts for these products
        const stockAlerts = await StockAlert.find({
            productId: { $in: products.map(p => p._id) },
            status: 'active'
        });

        // Get all stock orders for these products
        const stockOrders = await StockOrder.find({
            productId: { $in: products.map(p => p._id) },
            status: { $in: ['pending', 'approved'] }
        });

        // Transform products into stock data
        const stockData = await Promise.all(products.map(async (product) => {
            const productAlerts = stockAlerts.filter(alert => 
                alert.productId.toString() === product._id.toString()
            );
            
            const productOrders = stockOrders.filter(order => 
                order.productId.toString() === product._id.toString()
            );

            const demandLevel = await calculateDemandLevel(product._id);

            return {
                id: product._id,
                name: product.name,
                currentStock: product.countInStock,
                threshold: Math.ceil(product.countInStock * 0.3), // 30% of max stock
                demandLevel,
                location: product.location,
                description: product.description,
                price: product.price,
                category: product.catName,
                alerts: productAlerts,
                pendingOrders: productOrders.length,
                autoOrderEnabled: productAlerts.some(alert => alert.autoOrderEnabled)
            };
        }));

        res.json(stockData);

    } catch (error) {
        console.error('Error in stock status route:', error);
        res.status(500).json({ 
            error: 'Failed to fetch stock status',
            details: error.message 
        });
    }
});

// Get all active alerts
router.get('/alerts', async (req, res) => {
    try {
        const location = req.query.location || 'All';
        const alerts = await StockAlert.find({
            status: 'active',
            ...(location !== 'All' && { location })
        })
        .populate('productId', 'name countInStock')
        .sort('-createdAt');

        const formattedAlerts = alerts.map(alert => ({
            id: alert._id,
            title: `${alert.type === 'low_stock' ? 'Low Stock Alert' : 'High Demand Alert'}: ${alert.productId.name}`,
            description: `Current stock: ${alert.currentStock} units. ${
                alert.type === 'low_stock' 
                    ? `Below threshold of ${alert.threshold} units.`
                    : 'Unusual high demand detected.'
            }`,
            type: alert.type,
            location: alert.location,
            createdAt: alert.createdAt
        }));

        res.json(formattedAlerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// Get suppliers by location
router.get('/suppliers-by-location/:location', async (req, res) => {
    try {
        const { location } = req.params;
        const suppliers = await User.find({ 
            isSupplier: true,
            location: location === 'All' ? { $exists: true } : location
        });
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
});

// Create stock order
router.post('/create-order', async (req, res) => {
    try {
        console.log('Received order request:', req.body);
        const { productId, supplierId, quantity, location, requestedBy } = req.body;

        // Validate required fields
        if (!productId || !supplierId || !quantity || !location) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'productId, supplierId, quantity, and location are required'
            });
        }

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Validate supplier exists
        const supplier = await User.findById(supplierId);
        if (!supplier || !supplier.isSupplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        // Create new stock order
        const stockOrder = new StockOrder({
            productId,
            supplierId,
            quantity,
            location,
            requestedBy: requestedBy || 'system', // Use provided requestedBy or default to 'system'
            status: 'pending'
        });

        await stockOrder.save();
        console.log('Stock order created:', stockOrder);

        // Populate the order details for response
        const populatedOrder = await StockOrder.findById(stockOrder._id)
            .populate('productId', 'name')
            .populate('supplierId', 'name');

        res.status(201).json({
            message: 'Stock order created successfully',
            order: populatedOrder
        });

    } catch (error) {
        console.error('Error creating stock order:', error);
        res.status(500).json({ 
            error: 'Failed to create stock order',
            details: error.message 
        });
    }
});

// Enable auto-order
router.post('/auto-order/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { location } = req.body;

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Find the most reliable supplier in the location
        const supplier = await User.findOne({
            isSupplier: true,
            location: location === 'All' ? { $exists: true } : location
        }).sort({ reliability: -1 }); // Assuming we track supplier reliability

        if (!supplier) {
            return res.status(404).json({ error: 'No suitable supplier found' });
        }

        // Create stock alert
        const alert = new StockAlert({
            productId,
            type: 'low_stock',
            threshold: Math.ceil(product.maxStock * 0.3), // Alert at 30% of max stock
            currentStock: product.countInStock,
            autoOrderEnabled: true,
            location,
            supplierId: supplier._id
        });

        await alert.save();
        res.json({ message: 'Auto-order enabled successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to enable auto-order' });
    }
});

// Get supplier orders
router.get('/supplier-orders/:supplierId', async (req, res) => {
    try {
        const { supplierId } = req.params;
        const orders = await StockOrder.find({ supplierId })
            .populate('productId')
            .sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Update order status
router.put('/update-order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await StockOrder.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (status === 'delivered') {
            const product = await Product.findById(order.productId);
            product.countInStock += order.quantity;
            await product.save();
        }

        res.json({ message: 'Order updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// Helper function to calculate demand level
async function calculateDemandLevel(productId) {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const orders = await StockOrder.find({
            productId,
            orderDate: { $gte: thirtyDaysAgo }
        });

        const orderFrequency = orders.length;

        if (orderFrequency >= 5) return 'High';
        if (orderFrequency >= 3) return 'Medium';
        return 'Low';
    } catch (error) {
        console.error('Error calculating demand level:', error);
        return 'Unknown';
    }
}

module.exports = router; 