const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
    // console.log("Recipe generation request received");
    try {
        const { products } = req.body;
        
        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ 
                error: true, 
                msg: 'Invalid products data' 
            });
        }
        
        // console.log('Received products:', products);
        
        const productList = products.map(p => 
            `${p.quantity} ${p.weight || 'units'} of ${p.name}`
        ).join(', ');

        // console.log('Formatted product list:', productList);

        // Get the Gemini Pro model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro-latest",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_NONE",
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_NONE",
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_NONE",
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_NONE",
                },
            ],
        });

        const prompt = `Create 3 unique recipes using these ingredients: ${productList}.
Your response must be a valid JSON array containing exactly 4 recipe objects.
Each recipe object must have this structure:
{
    "name": "Recipe Name",
    "ingredients": ["ingredient 1", "ingredient 2", ...],
    "instructions": ["step 1", "step 2", ...]
}

You can add additional common ingredients that aren't in the provided list.
Format your entire response as a single JSON array containing these 4 recipe objects.
Do not include any additional text, explanations, or formatting - only the JSON array.`;

        // console.log('Sending request to Gemini API...');

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }]}],
        });

        const response = await result.response;
        const text = response.text();
        
        // console.log('Raw API Response:', text);

        let recipes;
        try {
            recipes = JSON.parse(text);

            if (!Array.isArray(recipes) || !recipes.every(recipe => 
                recipe.name && 
                Array.isArray(recipe.ingredients) && 
                Array.isArray(recipe.instructions)
            )) {
                throw new Error('Invalid recipe format');
            }

        } catch (parseError) {
            console.error('Parsing error:', parseError);
            return res.status(500).json({ 
                error: true, 
                msg: 'Failed to parse recipe data',
                rawResponse: text 
            });
        }

        res.json(recipes);

    } catch (error) {
        console.error('Recipe generation error:', error);
        res.status(500).json({ 
            error: true, 
            msg: 'Failed to generate recipes. Please try again later.',
            details: error.message
        });
    }
});

module.exports = router; 