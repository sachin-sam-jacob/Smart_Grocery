const express = require('express');
const router = express.Router();
const { StockAlert } = require('../models/stockManagement');
const { StockOrder } = require('../models/StockOrder');
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

// Get suppliers for a location
router.get('/suppliers-by-location/:location', async (req, res) => {
    try {
        const location = req.params.location;
        
        // Find suppliers that serve this location
        const suppliers = await User.find({
            isSupplier: true,
            location: location // or use your location matching logic
        }).select('id name email location'); // Select only needed fields

        console.log(`Found ${suppliers.length} suppliers for location ${location}`);
        
        res.json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ 
            error: 'Failed to fetch suppliers',
            details: error.message 
        });
    }
});

// Create stock order
router.post('/create-order', async (req, res) => {
    console.log('Received order request body:', req.body);
    try {
        const { productId, supplierId, quantity, location, status } = req.body;

        // Log all received data
        console.log('Received order data:', {
            productId,
            supplierId,
            quantity,
            location,
            status
        });

        // Validate required fields
        if (!productId || !supplierId || !quantity || !location ) {
            console.log('Missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields',
                received: { productId, supplierId, quantity, location }
            });
        }

        // Create new stock order
        const stockOrder = new StockOrder({
            productId,
            supplierId,
            quantity: parseInt(quantity),
            location,
            status: status || 'pending',
            orderDate: new Date()
        });

        console.log('Created stock order object:', stockOrder);

        // Save the order
        const savedOrder = await stockOrder.save();
        console.log('Saved order to database:', savedOrder);
        
        // Populate the saved order with related data
        const populatedOrder = await StockOrder.findById(savedOrder._id)
            .populate('productId', 'name')
            .populate('supplierId', 'name');

        console.log('Populated order data:', populatedOrder);

        res.status(201).json(populatedOrder);

    } catch (error) {
        console.error('Error creating stock order:', error);
        res.status(500).json({ 
            error: 'Failed to create stock order',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

// Get orders for a supplier
router.get('/supplier-orders/:supplierId', async (req, res) => {
    try {
        const orders = await StockOrder.find({ 
            supplierId: req.params.supplierId 
        })
        .populate('productId', 'name')
        .populate('requestedBy', 'name')
        .sort({ orderDate: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching supplier stock orders:', error);
        res.status(500).json({ error: 'Failed to fetch stock orders' });
    }
});

// Get orders for a district manager
router.get('/manager-orders/:location', async (req, res) => {
    try {
        const orders = await StockOrder.find({ 
            location: req.params.location 
        })
        .populate('productId', 'name')
        .populate('supplierId', 'name')
        .sort({ orderDate: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching manager stock orders:', error);
        res.status(500).json({ error: 'Failed to fetch stock orders' });
    }
});

// Update order status
router.put('/update-order-status/:orderId', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await StockOrder.findByIdAndUpdate(
            req.params.orderId,
            { status },
            { new: true }
        )
        .populate('productId', 'name')
        .populate('supplierId', 'name')
        .populate('requestedBy', 'name');

        if (!order) {
            return res.status(404).json({ error: 'Stock order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error updating stock order status:', error);
        res.status(500).json({ error: 'Failed to update stock order status' });
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