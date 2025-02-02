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

        console.log('Received data:', req.body);
        const product = new SupplierProduct({
            supplierId: req.body.supplierId,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            quantityType: req.body.quantityType,
            category: req.body.category,
            minStockAlert: req.body.minStockAlert
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
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 