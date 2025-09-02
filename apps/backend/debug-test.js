// Debug test script for backend
const axios = require('axios');

async function testBackendDebug() {
  console.log('Testing backend debugging...');
  
  try {
    // Test the health check endpoint
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('Health check response:', healthResponse.data);
    
    // Test the hello endpoint
    const helloResponse = await axios.get('http://localhost:3001/api/');
    console.log('Hello response:', helloResponse.data);
    
    // Test the MCP methods endpoint
    const mcpResponse = await axios.get('http://localhost:3001/api/mcp/methods');
    console.log('MCP methods response:', mcpResponse.data);
    
    console.log('Backend is running and responding correctly!');
  } catch (error) {
    console.error('Error testing backend:', error.message);
  }
}

testBackendDebug();



