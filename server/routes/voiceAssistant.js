const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { Product } = require('../models/products');

// Verify the Product model is properly imported
console.log('Product model imported:', !!Product);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Add this command patterns object at the top
const COMMAND_PATTERNS = {
    SEARCH: {
        patterns: ['search for', 'find', 'look for', 'show me', 'search'],
        responseTemplate: (term, count) => 
            `Found ${count} products matching "${term}"`
    },
    CART: {
        VIEW: {
            patterns: ['view cart', 'show cart', 'open cart', 'go to cart', 'check cart'],
            response: 'Opening your shopping cart'
        },
        ADD: {
            patterns: ['add to cart', 'put in cart', 'buy'],
            responseTemplate: (product) => 
                `Adding ${product.name} to cart`
        },
        REMOVE: {
            patterns: ['remove from cart', 'delete from cart', 'take out'],
            responseTemplate: (product) => 
                `Removing ${product.name} from cart`
        }
    },
    PROFILE: {
        patterns: ['my profile', 'my account', 'show profile', 'open profile', 'view profile'],
        response: 'Opening your profile'
    },
    ORDERS: {
        patterns: ['my orders', 'show orders', 'view orders', 'order history'],
        response: 'Opening your orders'
    },
    HELP: {
        patterns: ['help', 'what can you do', 'commands'],
        response: `I can help you with:
            - Searching products (e.g., "search for milk")
            - Managing cart (e.g., "add milk to cart", "show cart")
            - Viewing profile ("open profile")
            - Checking orders ("show my orders")
            Try any of these commands!`
    }
};

// Add a function to match commands
const matchCommand = (input, patterns) => {
    return patterns.some(pattern => input.includes(pattern));
};

// Enhance the search function
const searchProducts = async (searchTerm) => {
    try {
        const cleanSearchTerm = searchTerm.trim().toLowerCase();
        console.log("Searching for term:", cleanSearchTerm);
        
        // Create search criteria
        const searchCriteria = {
            $or: [
                { name: { $regex: cleanSearchTerm, $options: 'i' } },
                { description: { $regex: cleanSearchTerm, $options: 'i' } },
                { category: { $regex: cleanSearchTerm, $options: 'i' } }
            ]
        };

        console.log("Search criteria:", JSON.stringify(searchCriteria));

        // First try exact match
        let products = await Product.find({
            name: new RegExp(`\\b${cleanSearchTerm}\\b`, 'i')
        })
        .select('name description price images category countInStock')
        .limit(20);

        console.log(`Found ${products.length} exact matches`);

        // If no exact matches, try partial matches
        if (products.length === 0) {
            products = await Product.find(searchCriteria)
                .select('name description price images category countInStock')
                .limit(20);
            
            console.log(`Found ${products.length} partial matches`);
        }

        return products;
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
};

// Update the process route
router.post('/process', async (req, res) => {
    try {
        const { command } = req.body;
        console.log('Received command:', command);
        
        if (!command) {
            return res.status(400).json({
                success: false,
                message: 'Command is required'
            });
        }
        
        const commandLower = command.toLowerCase();

        // Help command
        if (matchCommand(commandLower, COMMAND_PATTERNS.HELP.patterns)) {
            return res.json({
                intent: 'help',
                message: COMMAND_PATTERNS.HELP.response
            });
        }

        // Profile command
        if (matchCommand(commandLower, COMMAND_PATTERNS.PROFILE.patterns)) {
            return res.json({
                intent: 'openProfile',
                message: COMMAND_PATTERNS.PROFILE.response
            });
        }

        // Orders command
        if (matchCommand(commandLower, COMMAND_PATTERNS.ORDERS.patterns)) {
            return res.json({
                intent: 'viewOrders',
                message: COMMAND_PATTERNS.ORDERS.response
            });
        }

        // Search commands
        if (COMMAND_PATTERNS.SEARCH.patterns.some(pattern => commandLower.includes(pattern))) {
            // Extract search term using regex to handle different command formats
            const searchPattern = new RegExp(COMMAND_PATTERNS.SEARCH.patterns.join('|'), 'i');
            const searchTerm = commandLower.replace(searchPattern, '').trim();
            
            if (!searchTerm) {
                return res.json({
                    intent: 'search',
                    message: 'Please specify what you want to search for.',
                    products: []
                });
            }

            console.log('Searching for:', searchTerm);

            try {
                const products = await searchProducts(searchTerm);
                console.log(`Found ${products.length} products for "${searchTerm}"`);

                return res.json({
                    intent: 'search',
                    searchTerm,
                    message: products.length > 0 
                        ? `Found ${products.length} products matching "${searchTerm}"`
                        : `No products found for "${searchTerm}". Try a different search term.`,
                    products: products
                });
            } catch (searchError) {
                console.error('Search error:', searchError);
                return res.status(500).json({
                    intent: 'search',
                    message: 'Error searching for products',
                    error: searchError.message
                });
            }
        }

        // Cart commands
        if (commandLower.includes('cart')) {
            // View cart
            if (matchCommand(commandLower, COMMAND_PATTERNS.CART.VIEW.patterns)) {
                return res.json({
                    intent: 'viewCart',
                    message: COMMAND_PATTERNS.CART.VIEW.response
                });
            }
            
            // Add to cart
            if (matchCommand(commandLower, COMMAND_PATTERNS.CART.ADD.patterns)) {
                const productName = commandLower
                    .replace(new RegExp(COMMAND_PATTERNS.CART.ADD.patterns.join('|'), 'i'), '')
                    .replace('to cart', '')
                    .trim();
                
                const products = await searchProducts(productName);

                if (products.length === 0) {
                    return res.json({
                        intent: 'addToCart',
                        message: `Sorry, I couldn't find "${productName}" in our store.`
                    });
                }

                const product = products[0];
                return res.json({
                    intent: 'addToCart',
                    product,
                    message: COMMAND_PATTERNS.CART.ADD.responseTemplate(product)
                });
            }
        }

        // If no direct match, use OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a shopping assistant. Parse user commands and identify shopping intents.
                    Available commands: ${Object.values(COMMAND_PATTERNS)
                        .flatMap(cmd => cmd.patterns || Object.values(cmd)
                        .map(subcmd => subcmd.patterns))
                        .flat()
                        .join(', ')}`
                },
                {
                    role: "user",
                    content: command
                }
            ]
        });

        return res.json({
            intent: 'unknown',
            message: completion.choices[0].message.content
        });

    } catch (error) {
        console.error('Voice processing error:', error);
        res.status(500).json({ 
            error: 'Error processing voice command',
            message: 'Sorry, I couldn\'t process that command.'
        });
    }
});

function parseIntent(command) {
    if (command.includes('search for') || command.includes('find')) {
        const searchTerm = command.replace(/(search for|find)/i, '').trim();
        return { type: 'search', searchTerm };
    }
    
    if (command.includes('add') && command.includes('to cart')) {
        const productName = command.replace(/(add|to cart)/gi, '').trim();
        return { type: 'addToCart', productName };
    }
    
    if (command.includes('view cart') || command.includes('show cart') || command.includes('open cart')) {
        return { type: 'viewCart' };
    }
    
    return { type: 'unknown' };
}

module.exports = router; 