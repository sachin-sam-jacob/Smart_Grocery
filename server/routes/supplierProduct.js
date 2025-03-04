const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { SupplierProduct } = require('../models/supplierProduct');

// Get all supplier products
router.get('/', async (req, res) => {
    try {
        const products = await SupplierProduct.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get supplier products by supplier ID
router.get('/supplier/:supplierId', async (req, res) => {
    try {
        // Validate supplierId format
        if (!mongoose.Types.ObjectId.isValid(req.params.supplierId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid supplier ID format' 
            });
        }

        const products = await SupplierProduct.find({ 
            supplierId: req.params.supplierId 
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Create new supplier product
router.post('/', async (req, res) => {
    try {
        // Validate supplierId format
        if (!mongoose.Types.ObjectId.isValid(req.body.supplierId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid supplier ID format' 
            });
        }

        // Generate a unique product code (you can customize this logic)
        const productCode = `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        console.log(productCode)
        const product = new SupplierProduct({
            supplierId: req.body.supplierId,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            quantityType: req.body.quantityType,
            category: req.body.category,
            minStockAlert: req.body.minStockAlert,
            productCode: productCode // Assign the generated product code
        });

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Update supplier product
router.put('/:id', async (req, res) => {
    try {
        console.log('Update request for product:', req.params.id);
        console.log('Update data:', req.body);

        const product = await SupplierProduct.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                quantity: req.body.quantity,
                quantityType: req.body.quantityType,
                category: req.body.category,
                minStockAlert: req.body.minStockAlert,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        console.log('Updated product:', product);
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete supplier product
router.delete('/:id', async (req, res) => {
    try {
        const product = await SupplierProduct.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single supplier product
router.get('/:id', async (req, res) => {
    try {
        const product = await SupplierProduct.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error fetching supplier product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add this new route
router.get('/by-name/:name', async (req, res) => {
    try {
        const productName = req.params.name;
        console.log(productName)
        const product = await SupplierProduct.findOne({
            name: productName,
            status: 'active'
        });
        console.log(product)
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        return res.status(200).json({
            success: true,
            price: product.price,
            data: product
        });

    } catch (error) {
        console.error('Error fetching supplier product by name:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get supplier product by supplier ID and product name
router.get('/supplier/:supplierId/product/:productName', async (req, res) => {
    try {
        const { supplierId, productName } = req.params;
        
        const supplierProduct = await SupplierProduct.findOne({
            supplierId: supplierId,
            name: decodeURIComponent(productName)
        });

        if (!supplierProduct) {
            return res.status(404).json({
                error: 'Supplier product not found'
            });
        }

        res.json({
            success: true,
            price: supplierProduct.price,
            productId: supplierProduct._id
        });

    } catch (error) {
        console.error('Error fetching supplier product:', error);
        res.status(500).json({
            error: 'Failed to fetch supplier product',
            details: error.message
        });
    }
});

// Update stock for a supplier product
router.post('/updateStock', async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Deduct the quantity from the supplier product
        const updatedProduct = await SupplierProduct.findByIdAndUpdate(
            productId,
            { $inc: { quantity: -quantity } },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 