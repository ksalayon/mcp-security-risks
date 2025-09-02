// Enhanced debug test script for mcp-tools
const { 
  VulnerableMCPServer, 
  FilesystemMCPServer, 
  TextDocumentMCPServer,
  NetworkMCPServer,
  MCPServerFactory,
  MCPToolRegistry 
} = require('./dist/index.js');

async function testAllServers() {
  console.log('=== Enhanced MCP Tools Debug Test ===');
  
  // Test 1: VulnerableMCPServer
  console.log('\n1. Testing VulnerableMCPServer...');
  const vulnerableServer = new VulnerableMCPServer();
  
  // Set breakpoint on the next line to test debugging
  const vulnerableResult = await vulnerableServer.handleRequest({
    id: 'test-vulnerable-1',
    method: 'get_description',
    params: { userInput: 'test input for vulnerable server' }
  });
  
  console.log('VulnerableMCPServer result:', vulnerableResult);
  
  // Test 2: FilesystemMCPServer
  console.log('\n2. Testing FilesystemMCPServer...');
  const filesystemServer = new FilesystemMCPServer();
  
  // Set breakpoint here to test filesystem operations
  const filesystemResult = await filesystemServer.handleRequest({
    id: 'test-filesystem-1',
    method: 'write_file',
    params: { path: 'test.txt', content: 'Hello World' }
  });
  
  console.log('FilesystemMCPServer result:', filesystemResult);
  
  // Test 3: TextDocumentMCPServer
  console.log('\n3. Testing TextDocumentMCPServer...');
  const textServer = new TextDocumentMCPServer();
  
  // Set breakpoint here to test text operations
  const textResult = await textServer.handleRequest({
    id: 'test-text-1',
    method: 'set_text',
    params: { documentId: 'doc1', text: 'Sample document content' }
  });
  
  console.log('TextDocumentMCPServer result:', textResult);
  
  // Test 4: NetworkMCPServer
  console.log('\n4. Testing NetworkMCPServer...');
  const networkServer = new NetworkMCPServer();
  
  // Set breakpoint here to test network operations
  const networkResult = await networkServer.handleRequest({
    id: 'test-network-1',
    method: 'ping',
    params: { clientId: 'test-client' }
  });
  
  console.log('NetworkMCPServer result:', networkResult);
  
  // Test 5: MCPServerFactory
  console.log('\n5. Testing MCPServerFactory...');
  const factoryMethods = MCPServerFactory.listAllMethods();
  console.log('Factory methods:', factoryMethods);
  
  // Test 6: MCPToolRegistry
  console.log('\n6. Testing MCPToolRegistry...');
  const registry = new MCPToolRegistry();
  const allTools = registry.getAllTools();
  console.log('All tools:', allTools.length);
  
  // Test security validation
  console.log('\n7. Testing Security Validation...');
  const securityFlags = vulnerableServer.getSecurityFlags();
  console.log('Security flags detected:', securityFlags.length);
  
  console.log('\n=== Enhanced Test Complete ===');
}

// Test specific line for debugging (line 360 in mcp-tools.ts)
async function testSpecificLine() {
  console.log('\n=== Testing Specific Line (360) ===');
  
  const server = new VulnerableMCPServer();
  
  // This will trigger the code around line 360
  const result = await server.handleRequest({
    id: 'test-line-360',
    method: 'get_config',
    params: { configParam: 'test config parameter' }
  });
  
  console.log('Line 360 test result:', result);
}

async function runAllTests() {
  try {
    await testAllServers();
    await testSpecificLine();
  } catch (error) {
    console.error('Test error:', error);
  }
}

runAllTests();



