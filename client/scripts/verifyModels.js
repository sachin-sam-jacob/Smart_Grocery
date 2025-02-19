const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, '../public/models');

// Define the required model files
const MODELS = [
  'tiny_face_detector_model-shard1',
  'tiny_face_detector_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_recognition_model-weights_manifest.json'
];

const verifyModels = () => {
  try {
    // Check if models directory exists
    if (!fs.existsSync(MODELS_DIR)) {
      console.error('Models directory does not exist:', MODELS_DIR);
      process.exit(1);
    }

    const files = fs.readdirSync(MODELS_DIR);
    const missingFiles = MODELS.filter(model => !files.includes(model));
    
    if (missingFiles.length > 0) {
      console.error('Missing model files:', missingFiles);
      console.error('Please run "npm run download-models" first');
      process.exit(1);
    }
    
    console.log('All model files are present');
    process.exit(0);
  } catch (error) {
    console.error('Error verifying models:', error);
    process.exit(1);
  }
};

verifyModels(); 