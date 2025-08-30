// Debug test script for mcp-tools
const { VulnerableMCPServer } = require('./dist/index.js');

async function testDebug() {
  console.log('Starting debug test...');
  
  const mcpServer = new VulnerableMCPServer();
  
  // Set a breakpoint on the next line to test debugging
  const result = await mcpServer.handleRequest({
    id: 'test-1',
    method: 'get_description',
    params: { userInput: 'test input' }
  });
  
  console.log('Result:', result);
  
  // Set another breakpoint here
  const configResult = await mcpServer.handleRequest({
    id: 'test-2',
    method: 'get_config',
    params: { configParam: 'test config' }
  });
  
  console.log('Config result:', configResult);
}

testDebug().catch(console.error);
