const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { Product } = require('../models/products');
const mongoose = require('mongoose');
const stream = require('stream');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  }
}).single('image');


const bufferToStream = (buffer) => {
  const readable = new stream.Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// Helper function to normalize text
const normalizeText = (text) => {
    return (text || "").toString().toLowerCase().trim();
};

// Helper function to check if strings are similar
const isSimilar = (str1, str2) => {
    str1 = normalizeText(str1);
    str2 = normalizeText(str2);
    return str1.includes(str2) || str2.includes(str1);
};

router.post('/analyze', (req, res) => {
  upload(req, res, async function(err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      console.log('Received request for visual search');
      
      if (!req.file) {
        console.log('No file received');
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      // Create form data
      const formData = new FormData();
      const fileStream = bufferToStream(req.file.buffer);
      formData.append('image', fileStream, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
      console.log("Sending to Python server",process.env.PYTHON_SERVER_URL);
      // Send to Python server
      const pythonResponse = await axios.post(`${process.env.PYTHON_SERVER_URL}/analyze`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Accept': 'application/json'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000
      });

      console.log('Python server response:', pythonResponse.data);

      if (!pythonResponse.data.success) {
        throw new Error(pythonResponse.data.message || 'Failed to analyze image');
      }

      // Process predictions
      const predictions = pythonResponse.data.predictions || [];
      const searchTerms = predictions
        .filter(p => p.probability > 0.2) // Only use high confidence predictions
        .map(p => ({
          term: p.label,
          confidence: p.probability,
          level: p.confidence_level
        }));

      console.log('Predictions:', predictions.map(p => ({
        label: p.label,
        confidence: p.probability,
        level: p.confidence_level
      })));

      if (searchTerms.length === 0) {
        return res.json({
          success: true,
          products: [],
          predictions: predictions,
          message: 'No relevant objects detected'
        });
      }

      // Build search query with confidence weighting
      const searchQuery = {
        $or: predictions
          .filter(p => p.probability > 0.2)
          .map(pred => ({
            $or: [
              { name: { $regex: pred.label, $options: 'i' } },
              { category: { $regex: pred.label, $options: 'i' } },
              { description: { $regex: pred.label, $options: 'i' } },
              ...pred.variations.map(v => ({
                $or: [
                  { name: { $regex: v, $options: 'i' } },
                  { category: { $regex: v, $options: 'i' } },
                  { description: { $regex: v, $options: 'i' } }
                ]
              }))
            ]
          }))
      };

      // Find products
      const products = await Product.find(searchQuery)
        .select('name description category price images')
        .limit(10)
        .lean();

      console.log(`Found ${products.length} matching products`);

      // Format products and calculate match scores
      const formattedProducts = products.map(product => {
        // Ensure all fields are strings or have default values
        const productObj = {
          _id: product._id.toString(),
          name: String(product.name || ''),
          description: String(product.description || ''),
          category: String(product.category || ''),
          price: Number(product.price || 0),
          images: Array.isArray(product.images) ? product.images : []
        };

        // Find best matching prediction
        const bestMatch = predictions.reduce((best, pred) => {
          const score = calculateMatchScore(productObj, pred);
          return score > best.score ? { prediction: pred, score: score } : best;
        }, { prediction: null, score: 0 });

        return {
          ...productObj,
          matchScore: bestMatch.score,
          matchLabel: bestMatch.prediction ? bestMatch.prediction.label : null
        };
      });

      // Sort by match score and filter out low scores
      const results = formattedProducts
        .filter(product => product.matchScore > 0.1)
        .sort((a, b) => b.matchScore - a.matchScore);

      return res.json({
        success: true,
        products: results,
        predictions: predictions,
        searchTerms: searchTerms,
        totalFound: results.length
      });

    } catch (error) {
      console.error('Visual search error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing visual search',
        details: error.message
      });
    }
  });
});

// Helper function to calculate match score
function calculateMatchScore(product, prediction) {
  try {
    const productName = String(product.name || '').toLowerCase();
    const productDesc = String(product.description || '').toLowerCase();
    const productCat = String(product.category || '').toLowerCase();
    const searchTerm = prediction.label.toLowerCase();
    
    let score = 0;
    
    // Check exact matches first
    if (productName.includes(searchTerm)) score += 0.6;
    if (productCat.includes(searchTerm)) score += 0.3;
    if (productDesc.includes(searchTerm)) score += 0.1;
    
    // Check variations
    if (prediction.variations) {
      prediction.variations.forEach(variation => {
        const term = variation.toLowerCase();
        if (productName.includes(term)) score += 0.3;
        if (productCat.includes(term)) score += 0.15;
        if (productDesc.includes(term)) score += 0.05;
      });
    }
    
    // Factor in the prediction probability
    score *= prediction.probability;
    
    return score;
  } catch (error) {
    console.error('Error calculating match score:', error);
    return 0;
  }
}

// Add this route to test Python server connection
router.get('/test-python', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_SERVER_URL}/health`);
    res.json({
      success: true,
      pythonServer: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Python server not responding',
      error: error.message
    });
  }
});

// Add this route to test product search
router.get('/test-search', async (req, res) => {
  try {
    const testTerm = 'banana';
    const products = await Product.find({
      $or: [
        { name: { $regex: testTerm, $options: 'i' } },
        { description: { $regex: testTerm, $options: 'i' } },
        { category: { $regex: testTerm, $options: 'i' } }
      ]
    })
    .select('name description category')
    .limit(1)
    .lean();

    res.json({
      success: true,
      testTerm,
      productsFound: products.length,
      sample: products[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing search',
      error: error.message
    });
  }
});

router.post('/search', async (req, res) => {
    try {
        const imageFile = req.files?.image;
        if (!imageFile) {
            return res.status(400).json({ success: false, message: 'No image provided' });
        }

        // Call Python server for image analysis
        const formData = new FormData();
        formData.append('image', imageFile.data, imageFile.name);

        const pythonResponse = await axios.post('http://localhost:5000/analyze', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        }).catch(err => {
            console.error('Python server error:', err);
            throw new Error('Failed to analyze image');
        });

        if (!pythonResponse.data.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to analyze image'
            });
        }

        // Get predictions and search terms
        const predictions = pythonResponse.data.predictions;
        const searchTerms = pythonResponse.data.search_terms;

        // Find matching products
        let products = await Product.find({});
        
        // Map products to include match information
        const matchedProducts = products.map(product => {
            // Convert product to plain object if it's a Mongoose document
            const productObj = product.toObject();
            
            // Find the best matching prediction
            const matchingPrediction = predictions.find(pred => {
                // Check product name
                const nameMatch = pred.variations.some(variation => 
                    isSimilar(productObj.name, variation));
                
                // Check product category
                const categoryMatch = pred.variations.some(variation => 
                    isSimilar(productObj.category, variation));
                
                // Check product description
                const descriptionMatch = pred.variations.some(variation => 
                    isSimilar(productObj.description, variation));
                
                return nameMatch || categoryMatch || descriptionMatch;
            });

            return {
                ...productObj,
                matchScore: matchingPrediction ? matchingPrediction.probability : 0,
                matchLabel: matchingPrediction ? matchingPrediction.label : null
            };
        });

        // Filter out non-matches and sort by match score
        const results = matchedProducts
            .filter(product => product.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);

        return res.json({
            success: true,
            predictions: predictions,
            searchTerms: searchTerms,
            matches: results
        });

    } catch (error) {
        console.error('Visual search error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to process visual search'
        });
    }
});

module.exports = router; 