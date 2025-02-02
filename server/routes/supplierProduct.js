const express = require('express');
const router = express.Router();
const { SupplierProduct } = require('../models/supplierProduct');
const mongoose = require('mongoose');

// Get all products for a supplier
router.get('/supplier/:supplierId', async (req, res) => {
    try {
        const products = await SupplierProduct.find({ supplierId: req.params.supplierId });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new product
router.post('/', async (req, res) => {
    try {
        const product = new SupplierProduct({
            supplierId: req.body.supplierId,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            category: req.body.category,
            minStockAlert: req.body.minStockAlert
        });
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a product
router.put('/:id', async (req, res) => {
    try {
        const product = await SupplierProduct.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                quantity: req.body.quantity,
                category: req.body.category,
                minStockAlert: req.body.minStockAlert,
                updatedAt: Date.now()
            },
            { new: true }
        );
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a product
router.delete('/:id', async (req, res) => {
    try {
        await SupplierProduct.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 