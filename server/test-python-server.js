const axios = require('axios');

async function testPythonServer() {
  try {
    console.log('Testing Python server connection...');
    const response = await axios.get('http://localhost:5000/health');
    console.log('Python server is running:', response.data);
    return true;
  } catch (error) {
    console.error('Python server is not running or has an error:', error.message);
    return false;
  }
}

testPythonServer(); 