// Test script to verify source maps are working
const { VulnerableMCPServer } = require('./libs/mcp-tools/dist/index.js');

console.log('Testing source maps...');

// This should trigger the code in mcp-tools.ts
const server = new VulnerableMCPServer();

// Set a breakpoint on the next line to test
const result = server.handleRequest({
  id: 'test-1',
  method: 'get_description',
  params: { userInput: 'test input' }
});

console.log('Result:', result);

