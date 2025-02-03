const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Predefined responses for common questions
const predefinedResponses = {
    "What are today's deals?": `Here are today's top deals:
1. 20% off on fresh fruits
2. Buy 1 Get 1 on dairy products
3. 30% off on household items
4. Special discount on organic products`,

    "Track my order": `To track your order:
1. Go to My Orders section
2. Click on the order number
3. View real-time tracking details
Or provide your order number and I can help you track it.`,

    "Return policy": `Our Return Policy:
• 7-day return window for most items
• Items must be unused and in original packaging
• Free returns for damaged/incorrect items
• Instant refund on return approval
Need more specific details?`,

    "Product recommendations": `I can help you find the perfect products! 
What are you looking for?
• Groceries
• Household items
• Personal care
• Health foods
Let me know your preferences!`,

    "Delivery options": `Available delivery options:
1. Standard delivery (2-3 days)
2. Express delivery (Next day)
3. Same-day delivery (Order before 2 PM)
4. Pick up from store
Which option would you like to know more about?`
};

let conversationHistory = [];

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Check for predefined responses first
        if (predefinedResponses[message]) {
            const response = predefinedResponses[message];
            conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: response }
            );
            
            return res.json({
                success: true,
                response,
                history: conversationHistory
            });
        }

        // If no predefined response, use AI
        conversationHistory.push({ role: 'user', content: message });

        const prompt = `You are a helpful shopping assistant for a grocery store. 
        Previous conversation: ${JSON.stringify(conversationHistory)}
        User message: ${message}
        Please provide a helpful, friendly response related to grocery shopping, products, or nutrition. Keep responses concise and practical.`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        conversationHistory.push({ role: 'assistant', content: response });

        // Keep history limited to last 10 messages
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
        }

        res.json({
            success: true,
            response,
            history: conversationHistory
        });
    } catch (error) {
        console.error('Chatbot Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate response'
        });
    }
});

module.exports = router; 