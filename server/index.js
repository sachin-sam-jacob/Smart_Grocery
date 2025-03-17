const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const schedulePriceUpdates = require('./utils/priceUpdateScheduler');
const faceRecognitionRoutes = require('./routes/faceRecognition');
const reportsRoutes = require('./routes/reports');
const supplierRoutes = require('./routes/supplier');


app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(express.json());


//Routes
const userRoutes = require('./routes/user.js');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const imageUploadRoutes = require('./helper/imageUpload.js');
const productWeightRoutes = require('./routes/productWeight.js');
const productRAMSRoutes = require('./routes/productRAMS.js');
const productSIZESRoutes = require('./routes/productSize.js');
const productReviews = require('./routes/productReviews.js');
const cartSchema = require('./routes/cart.js');
const myListSchema = require('./routes/myList.js');
const ordersSchema = require('./routes/orders.js');
const homeBannerSchema = require('./routes/homeBanner.js');
const searchRoutes = require('./routes/search.js');
const forgotpass = require('./routes/Forgotpassword.js');
const resetPassword = require('./routes/reset.js');
const verifycode = require('./routes/verifycode.js');
const listusers = require('./routes/listuser.js');
const blockedUsers = require('./routes/blocked.js');
const orders1 = require('./routes/order1.js');
const StockManager=require('./routes/stockManager.js');
const Pincode=require('./routes/pincode.js');
const Productsstock=require('./routes/productstock.js');
const OrderStock=require('./routes/orderstock.js');
const recipeRoutes=require('./routes/recipes.js');
const stockManagementRoutes = require('./routes/stockManagement');
const supplierProductRoutes = require('./routes/supplierProduct');
const aiDescriptionRoutes = require('./routes/aiDescription');
const chatbotRoutes = require('./routes/chatbot');
const voiceAssistantRoutes = require('./routes/voiceAssistant');
const visualSearchRoutes = require('./routes/visualSearch');
const dynamicPricingRoutes = require('./routes/dynamicPricing');

app.use("/api/verifycode",verifycode);
app.use("/api/resetpassword", resetPassword);
app.use("/api/user",userRoutes);
app.use("/uploads",express.static("uploads"));
app.use(`/api/category`, categoryRoutes);
app.use(`/api/products`, productRoutes);
app.use(`/api/imageUpload`, imageUploadRoutes);
app.use(`/api/productWeight`, productWeightRoutes);
app.use(`/api/productRAMS`, productRAMSRoutes);
app.use(`/api/productSIZE`, productSIZESRoutes);
app.use(`/api/productReviews`, productReviews);
app.use(`/api/cart`, cartSchema);
app.use(`/api/my-list`, myListSchema);
app.use(`/api/orders`, ordersSchema);
app.use(`/api/homeBanner`, homeBannerSchema);
app.use(`/api/search`, searchRoutes);
app.use('/api/forgotpassword', forgotpass);
app.use(`/api/listusers`,listusers);
app.use(`/api/blocked`, blockedUsers);
app.use(`/api/orders1`, orders1);
app.use(`/api/stockManagers`,StockManager);
app.use(`/api/pincodes`,Pincode);
app.use(`/api/product`,Productsstock);
app.use(`/api/order`,OrderStock);
app.use('/api/recipes',recipeRoutes);
app.use('/api/stock', stockManagementRoutes);
app.use('/api/supplier-products', supplierProductRoutes);
app.use('/api/ai-description', aiDescriptionRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/voice-assistant', voiceAssistantRoutes);
app.use('/api/visual-search', visualSearchRoutes);
app.use('/api/dynamic-pricing', dynamicPricingRoutes);
app.use('/api/face', faceRecognitionRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/supplier', supplierRoutes);


// Add this before your routes
async function checkPythonServer() {
  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('Python server status:', response.data);
    return true;
  } catch (error) {
    console.error('Python server not running:', error.message);
    return false;
  }
}

// Add this after your routes
const startServer = async () => {
  const pythonServerRunning = await checkPythonServer();
  if (!pythonServerRunning) {
    console.error('WARNING: Python server is not running. Visual search will not work.');
  }
  
  mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Database Connection is ready...');
    app.listen(process.env.PORT, () => {
      console.log(`server is running http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
};

// Start the price update scheduler
schedulePriceUpdates();

startServer();
    
    
    
    