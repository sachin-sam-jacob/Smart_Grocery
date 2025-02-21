const express = require('express');
const router = express.Router();
const { FaceData } = require('../models/faceData');
const { User } = require('../models/user');
const jwt = require('jsonwebtoken');

// Register face data
router.post('/register', async (req, res) => {
  try {
    const { userId, faceDescriptor } = req.body;

    let faceData = await FaceData.findOne({ userId });
    
    if (faceData) {
      faceData.faceDescriptor = faceDescriptor;
      faceData.lastUpdated = Date.now();
      await faceData.save();
    } else {
      faceData = new FaceData({
        userId,
        faceDescriptor
      });
      await faceData.save();
    }

    res.status(200).json({
      success: true,
      message: 'Face ID registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering Face ID',
      error: error.message
    });
  }
});

// Login with face
router.post('/login', async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    
    // Get all face data
    const allFaceData = await FaceData.find().populate('userId');
    
    let matchedUser = null;
    let minDistance = 0.6; // Threshold for face matching

    // Compare face descriptors
    for (const data of allFaceData) {
      const distance = euclideanDistance(faceDescriptor, data.faceDescriptor);
      if (distance < minDistance) {
        matchedUser = data.userId;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({
        success: false,
        message: 'Face not recognized'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: matchedUser._id },
      process.env.JSON_WEB_TOKEN_SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: matchedUser._id,
        name: matchedUser.name,
        email: matchedUser.email,
        isAdmin: matchedUser.isAdmin,
        isStockManager: matchedUser.isStockManager
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during face login',
      error: error.message
    });
  }
});

// Helper function to calculate Euclidean distance
function euclideanDistance(descriptor1, descriptor2) {
  return Math.sqrt(
    descriptor1.reduce((sum, val, i) => sum + Math.pow(val - descriptor2[i], 2), 0)
  );
}

module.exports = router; 