const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/generate-description', async (req, res) => {
    try {
        const { productName } = req.body;
        
        // Prompt engineering for better results
        const prompt = `Generate a detailed product description for "${productName}" in the following format:
        1. Brief Description (2-3 sentences)
        2. Key Features/Benefits
        3. Nutritional Information (if it's a food item)
        4. Storage Instructions (if applicable)
        5. Usage Suggestions
        
        Please make it engaging and informative for an e-commerce grocery store.`;

        // Generate content using Gemini AI
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const description = response.text();

        res.status(200).json({
            success: true,
            data: description
        });
    } catch (error) {
        console.error('AI Description Generation Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate description'
        });
    }
});

module.exports = router; 