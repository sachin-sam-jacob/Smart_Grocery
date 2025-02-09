const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testVisualSearch() {
  try {
    // 1. Test Python server
    console.log('1. Testing Python server...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('Python server health:', healthResponse.data);

    // 2. Test Node.js server connection to Python
    console.log('\n2. Testing Node.js to Python connection...');
    const nodeTestResponse = await axios.get('http://localhost:8000/api/visual-search/test-python');
    console.log('Node.js test response:', nodeTestResponse.data);

    // 3. Test image upload
    console.log('\n3. Testing image upload...');
    const testImagePath = path.join(__dirname, 'test-images', 'test-product.jpg');
    
    if (!fs.existsSync(testImagePath)) {
      console.error('Test image not found:', testImagePath);
      console.error('Please add a test image at:', testImagePath);
      return;
    }

    console.log('Using test image:', testImagePath);

    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));

    const uploadResponse = await axios.post(
      'http://localhost:8000/api/visual-search/analyze', 
      formData, 
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log('Upload response:', JSON.stringify(uploadResponse.data, null, 2));

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error details:', error.response.data.error);
    }
  }
}

testVisualSearch(); 