const express = require('express');
const router = express.Router();
const { DynamicPricing } = require('../models/dynamicPricing');
const { Product } = require('../models/products');

// Update these constants at the top of the file
const MAX_PRICE_DECREASE = 0.25; // 25% max decrease from original price
const MIN_UPDATE_INTERVAL = 1 * 60 * 60 *1000; // 1 hour in milliseconds (changed from 24 hours)

// Calculate new price based on stock and demand
const calculateOptimalPrice = (basePrice, stockLevel, demandScore, lastUpdated) => {
    // Check if enough time has passed since last update
    if (lastUpdated && (Date.now() - new Date(lastUpdated).getTime()) < MIN_UPDATE_INTERVAL) {
        return null; // Skip update if too recent
    }

    let priceMultiplier = 1;
    
    // Adjust price based on stock level - more aggressive discounts
    if (stockLevel > 100) {
        priceMultiplier *= 0.85; // 15% discount for high stock
    } else if (stockLevel > 50) {
        priceMultiplier *= 0.90; // 10% discount for medium-high stock
    } else if (stockLevel > 20) {
        priceMultiplier *= 0.95; // 5% discount for medium stock
    }
    
    // Adjust based on demand - only decrease prices
    if (demandScore < 0.3) {
        priceMultiplier *= 0.90; // 10% additional discount for low demand
    } else if (demandScore < 0.6) {
        priceMultiplier *= 0.95; // 5% additional discount for medium demand
    }
    
    // Calculate new price
    let newPrice = Math.round(basePrice * priceMultiplier);
    
    // Enforce price limits
    const maxPrice = basePrice; // Never exceed base price
    const minPrice = basePrice * (1 - MAX_PRICE_DECREASE); // Maximum 25% decrease
    
    newPrice = Math.min(maxPrice, Math.max(minPrice, newPrice));
    
    // Don't update if change is less than 1%
    if (Math.abs(newPrice - basePrice) / basePrice < 0.01) {
        return null;
    }
    
    // Don't update if trying to increase beyond original price
    if (newPrice > basePrice) {
        return basePrice;
    }
    
    return newPrice;
};

// Update prices automatically
router.post('/update-prices', async (req, res) => {
    try {
        const products = await Product.find();
        
        if (!products || products.length === 0) {
            return res.status(404).json({ 
                message: 'No products found to update prices' 
            });
        }

        const updates = [];
        
        for (const product of products) {
            try {
                // Skip products without basePrice
                if (!product.basePrice) {
                    updates.push({
                        productId: product._id,
                        message: 'Skipped - No base price set'
                    });
                    continue;
                }

                const existingPricing = await DynamicPricing.findOne({ 
                    productId: product._id 
                });
                
                const stockLevel = product.countInStock || 0;
                const demandScore = Math.random(); // Replace with actual demand calculation
                
                const newPrice = calculateOptimalPrice(
                    product.basePrice,
                    stockLevel,
                    demandScore,
                    existingPricing?.lastUpdated
                );
                
                if (newPrice === null) {
                    updates.push({
                        productId: product._id,
                        message: 'Price update skipped - too soon or change too small'
                    });
                    continue;
                }

                // Ensure newPrice is a valid number
                if (isNaN(newPrice)) {
                    updates.push({
                        productId: product._id,
                        message: 'Price update skipped - invalid calculation'
                    });
                    continue;
                }
                
                // Calculate discount percentage based on original price and new price
                const originalPrice = product.basePrice;
                const currentPrice = newPrice;
                const priceReduction = originalPrice - currentPrice;
                const discountPercentage = Math.round((priceReduction / originalPrice) * 100);

                // Update product price and discount
                product.price = currentPrice;
                product.oldPrice = originalPrice; // Store original price for reference
                product.discount = Math.max(0, discountPercentage); // Ensure discount is never negative
                await product.save();

                // Update dynamic pricing record
                const pricingUpdate = await DynamicPricing.findOneAndUpdate(
                    { productId: product._id },
                    {
                        $set: {
                            productId: product._id,
                            originalPrice: originalPrice,
                            currentPrice: currentPrice,
                            stockLevel,
                            demandScore,
                            lastUpdated: new Date()
                        },
                        $push: {
                            priceHistory: {
                                price: currentPrice,
                                originalPrice: originalPrice,
                                discount: Math.max(0, discountPercentage),
                                reason: `Automatic adjustment based on stock(${stockLevel}) and demand(${demandScore})`
                            }
                        }
                    },
                    { upsert: true, new: true }
                );

                updates.push({
                    productId: product._id,
                    name: product.name,
                    originalPrice,
                    currentPrice,
                    discount: Math.max(0, discountPercentage),
                    stockLevel,
                    demandScore,
                    message: 'Price updated successfully'
                });
            } catch (error) {
                console.error(`Error updating price for product ${product._id}:`, error);
                updates.push({
                    productId: product._id,
                    error: error.message
                });
            }
        }
        
        res.status(200).json({ 
            message: 'Prices updated successfully',
            updates
        });
    } catch (error) {
        console.error('Price update error:', error);
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get bulk discount recommendations
router.get('/bulk-discounts/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        const stockLevel = product.countInStock;
        
        let bulkDiscounts = [];
        
        if (stockLevel > 50) {
            bulkDiscounts = [
                { minQuantity: 5, discountPercentage: 5 },
                { minQuantity: 10, discountPercentage: 10 },
                { minQuantity: 20, discountPercentage: 15 }
            ];
        } else if (stockLevel > 20) {
            bulkDiscounts = [
                { minQuantity: 5, discountPercentage: 3 },
                { minQuantity: 10, discountPercentage: 7 }
            ];
        }
        
        res.status(200).json(bulkDiscounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get price history
router.get('/price-history/:productId', async (req, res) => {
    try {
        const priceHistory = await DynamicPricing.findOne(
            { productId: req.params.productId },
            { priceHistory: 1 }
        );
        res.status(200).json(priceHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add these routes to test the pricing logic

// Test price calculation
router.post('/test-price-calculation', async (req, res) => {
    try {
        const { originalPrice, stockLevel, demandScore } = req.body;
        
        const newPrice = calculateOptimalPrice(
            originalPrice,
            stockLevel,
            demandScore
        );
        
        res.status(200).json({
            originalPrice,
            newPrice,
            stockLevel,
            demandScore,
            priceChange: newPrice - originalPrice,
            percentageChange: ((newPrice - originalPrice) / originalPrice * 100).toFixed(2) + '%'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current pricing status
router.get('/status', async (req, res) => {
    try {
        const dynamicPrices = await DynamicPricing.find()
            .populate('productId', 'name price countInStock');
            
        const summary = {
            totalProducts: dynamicPrices.length,
            priceIncreases: 0,
            priceDecreases: 0,
            noChange: 0,
            averageChange: 0
        };
        
        let totalChangePercentage = 0;
        
        dynamicPrices.forEach(price => {
            const change = price.currentPrice - price.originalPrice;
            if (change > 0) summary.priceIncreases++;
            else if (change < 0) summary.priceDecreases++;
            else summary.noChange++;
            
            totalChangePercentage += (change / price.originalPrice * 100);
        });
        
        summary.averageChange = (totalChangePercentage / dynamicPrices.length).toFixed(2) + '%';
        
        res.status(200).json({
            summary,
            details: dynamicPrices
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this near the top of your routes
router.get('/test', (req, res) => {
    res.status(200).json({ 
        message: 'Dynamic pricing API is working',
        timestamp: new Date().toISOString()
    });
});

// Add this new route to initialize/reset prices
router.post('/initialize', async (req, res) => {
    try {
        const products = await Product.find();
        
        if (!products || products.length === 0) {
            return res.status(404).json({ 
                message: 'No products found to initialize' 
            });
        }

        const updates = [];
        
        for (const product of products) {
            try {
                // For new initialization, set basePrice to oldPrice if it exists
                if (!product.basePrice && product.oldPrice) {
                    product.basePrice = product.oldPrice;
                } else if (!product.basePrice) {
                    product.basePrice = product.price;
                }
                
                // Set oldPrice to basePrice if it doesn't exist
                if (!product.oldPrice) {
                    product.oldPrice = product.basePrice;
                }

                // Calculate initial discount based on original and current price
                const originalPrice = product.oldPrice;
                const currentPrice = product.price;
                const priceReduction = originalPrice - currentPrice;
                const initialDiscount = Math.round((priceReduction / originalPrice) * 100);

                // Update product
                product.discount = Math.max(0, initialDiscount);
                await product.save();

                // Initialize dynamic pricing record
                await DynamicPricing.findOneAndUpdate(
                    { productId: product._id },
                    {
                        $set: {
                            productId: product._id,
                            originalPrice: originalPrice,
                            currentPrice: currentPrice,
                            stockLevel: product.countInStock || 0,
                            demandScore: 0.5,
                            lastUpdated: new Date()
                        },
                        $push: {
                            priceHistory: {
                                price: currentPrice,
                                originalPrice: originalPrice,
                                discount: Math.max(0, initialDiscount),
                                reason: 'Price initialized'
                            }
                        }
                    },
                    { upsert: true, new: true }
                );

                updates.push({
                    productId: product._id,
                    name: product.name,
                    originalPrice,
                    currentPrice,
                    discount: Math.max(0, initialDiscount),
                    message: 'Price initialized successfully'
                });

            } catch (error) {
                console.error(`Error initializing price for product ${product._id}:`, error);
                updates.push({
                    productId: product._id,
                    error: error.message
                });
            }
        }
        
        res.status(200).json({ 
            message: 'Prices initialized successfully',
            updates
        });
    } catch (error) {
        console.error('Price initialization error:', error);
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Add this utility route to set base prices
router.post('/set-base-prices', async (req, res) => {
    try {
        const products = await Product.find();
        const updates = [];

        for (const product of products) {
            if (!product.basePrice) {
                product.basePrice = product.price;
                await product.save();
                updates.push({
                    productId: product._id,
                    name: product.name,
                    basePrice: product.basePrice
                });
            }
        }

        res.status(200).json({
            message: 'Base prices set successfully',
            updates
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 