// Test script to make an MCP-enabled request to the backend
const axios = require('axios');

async function testMCPRequest() {
  console.log('Testing MCP-enabled request...');
  
  try {
    // This request should trigger MCP tools and hit your breakpoints
    const response = await axios.post('http://localhost:3001/api/chat', {
      messages: [
        {
          role: 'user',
          content: 'Test message with MCP tools'
        }
      ],
      toolUse: true,  // This is required!
      mcp: {
        type: 'vulnerable',
        method: 'get_description',
        params: {
          userInput: 'test input that should trigger breakpoint on line 367'
        }
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testMCPRequest();

