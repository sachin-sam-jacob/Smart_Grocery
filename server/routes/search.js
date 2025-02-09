const express = require('express');
const router = express.Router();
const { Product } = require('../models/products');

router.get('/', async (req, res) => {
    try {
        const searchQuery = req.query.q || '';
        
        if (!searchQuery) {
            return res.json([]);
        }

        // Create a case-insensitive regex pattern
        const searchRegex = new RegExp(searchQuery, 'i');

        // Search in name, description, brand, and category
        const products = await Product.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex },
                { brand: searchRegex },
                { id: searchRegex }
            ]
        })
        .select('name images price category brand') // Select only needed fields
        .limit(8); // Limit results for dropdown
        console.log(products);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
