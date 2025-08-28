// Simple test to verify routes are working
const axios = require('axios');

const baseUrl = 'http://localhost:5173';
const routes = [
  '/streaming',
  '/streaming-live',
  '/streaming/live',
  '/vod-upload',
  '/events'
];

async function testRoutes() {
  console.log('Testing frontend routes...\n');
  
  for (const route of routes) {
    try {
      const response = await axios.get(baseUrl + route, {
        validateStatus: () => true // Accept any status
      });
      console.log(`✅ ${route} - Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${route} - Error: ${error.message}`);
    }
  }
}

testRoutes();
