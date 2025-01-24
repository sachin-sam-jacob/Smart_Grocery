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
router.get('/status', checkDistrictManager, async (req, res) => {
    try {
        const location = req.query.location;
        console.log('Fetching products for location:', location);

        if (!location) {
            return res.status(400).json({ error: 'Location parameter is required' });
        }

        // Find products specifically for this location
        const products = await Product.find({ location: location });
        console.log(`Found ${products.length} products for location ${location}`);

        if (!products || products.length === 0) {
            return res.json([]);
        }

        const stockData = await Promise.all(products.map(async (product) => {
            const alerts = await StockAlert.find({ 
                productId: product._id,
                status: 'active'
            });
            
            const autoOrder = await StockOrder.findOne({
                productId: product._id,
                autoOrdered: true,
                status: 'pending'
            });

            const demandLevel = await calculateDemandLevel(product._id);

            return {
                id: product._id,
                name: product.name,
                currentStock: product.countInStock,
                threshold: Math.ceil(product.countInStock * 0.3), // 30% of max stock
                demandLevel,
                autoOrderEnabled: !!autoOrder,
                location: product.location,
                alerts: alerts.map(alert => ({
                    type: alert.type,
                    message: alert.type === 'low_stock' 
                        ? 'Stock running low'
                        : 'High demand detected'
                }))
            };
        }));

        console.log(`Returning ${stockData.length} products for location ${location}`);
        res.json(stockData);
    } catch (error) {
        console.error('Error in stock status route:', error);
        res.status(500).json({ error: 'Failed to fetch stock status', details: error.message });
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
router.get('/suppliers/location/:location', async (req, res) => {
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

// Create manual order
router.post('/order/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { supplierId, location } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const supplier = await User.findById(supplierId);
        if (!supplier || !supplier.isSupplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        const order = new StockOrder({
            productId,
            supplierId,
            quantity: Math.ceil(product.maxStock * 0.5), // Order 50% of max stock
            location,
            autoOrdered: false
        });

        await order.save();
        res.json({ message: 'Order created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
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