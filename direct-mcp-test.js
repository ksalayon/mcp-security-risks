// Direct test of MCP tools to verify source maps
const { VulnerableMCPServer } = require('./libs/mcp-tools/dist/index.js');

async function testDirectMCP() {
  console.log('Direct MCP test - this should hit breakpoints');

  // Set breakpoint on the next line
  const server = new VulnerableMCPServer();

  // Set breakpoint on the next line - this should hit line 367 in mcp-tools.ts
  const result = await server.handleRequest({
    id: 'direct-test',
    method: 'get_description',
    params: {
      userInput: 'direct test input'
    }
  });

  console.log('Result:', result);
}

testDirectMCP().catch(console.error);
