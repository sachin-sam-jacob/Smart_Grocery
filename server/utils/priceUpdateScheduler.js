const cron = require('node-cron');
const axios = require('axios');

const schedulePriceUpdates = () => {
    console.log('Price update scheduler initialized');
    
    const PORT = process.env.PORT || 8000;
    const BASE_URL = `http://localhost:${PORT}`;
    
    // Run price updates once per day at midnight in production
    cron.schedule('0 0 * * *', async () => {
        console.log('Starting scheduled price update:', new Date().toISOString());
        try {
            const response = await axios.post(`${BASE_URL}/api/dynamic-pricing/update-prices`);
            console.log('Price update response:', response.data);
            console.log('Scheduled price update completed successfully');
        } catch (error) {
            console.error('Price update failed:', error.message);
            console.error('Error details:', error.response?.data || 'No response data');
        }
    });
    
    // Add a test schedule that runs every 2 minutes in development
    if (process.env.NODE_ENV !== 'production') {
        cron.schedule('*/2 * * * *', async () => {
            console.log('Running test price update:', new Date().toISOString());
            try {
                const response = await axios.post(`${BASE_URL}/api/dynamic-pricing/update-prices`);
                console.log('Test price update completed:', response.data);
            } catch (error) {
                console.error('Test price update failed:', error.message);
                console.error('Error details:', error.response?.data || 'No response data');
            }
        });
    }
};

module.exports = schedulePriceUpdates; 