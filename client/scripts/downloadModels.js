const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);

const MODELS_DIR = path.join(__dirname, '../public/models');
const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const MODELS = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadModels() {
  try {
    // Create models directory if it doesn't exist
    await mkdir(MODELS_DIR, { recursive: true });

    // Download each model file
    for (const model of MODELS) {
      const url = `${BASE_URL}/${model}`;
      const dest = path.join(MODELS_DIR, model);
      
      console.log(`Downloading ${model}...`);
      try {
        await downloadFile(url, dest);
        console.log(`Successfully downloaded ${model}`);
      } catch (error) {
        console.error(`Failed to download ${model}:`, error);
        throw error;
      }
    }

    console.log('All models downloaded successfully!');
  } catch (error) {
    console.error('Error downloading models:', error);
    process.exit(1);
  }
}

downloadModels(); 