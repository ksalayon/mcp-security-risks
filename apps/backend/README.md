# Backend Service

This backend service provides chat functionality with security validation and MCP (Model Context Protocol) tool integration.

## Chat Endpoints

### POST /chat/vercel-ai

The `processChatWithVercelAI` method has been refactored to use the Vercel AI SDK's `generateText` method with MCP tools, following the official documentation pattern.

#### Features

- **Security Validation**: Validates and sanitizes user input to prevent security risks
- **MCP Tool Integration**: Supports MCP tools for enhanced functionality
- **Vercel AI SDK**: Uses the official Vercel AI SDK for text generation
- **Tool Call Limiting**: Limits tool calls to prevent abuse (max 5 calls)

#### Request Format

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how can you help me?"
    }
  ],
  "model": "claude-3-5-haiku-latest",
  "temperature": 0.7,
  "maxTokens": 1024,
  "mcp": {
    "type": "filesystem",
    "method": "read_file",
    "params": {
      "path": "~/example.txt"
    }
  }
}
```

#### MCP Tool Types

The service supports the following MCP tool types:

1. **Mock MCP Servers** (implemented):
   - `filesystem`: File system operations
   - `text-document`: Text document operations
   - `network`: Network operations
   - `vulnerable`: Vulnerable operations for testing

2. **Transport Types** (planned):
   - `stdio`: Standard I/O transport
   - `http`: HTTP transport
   - `sse`: Server-Sent Events transport

#### Implementation Details

The refactored method follows the Vercel AI SDK documentation pattern:

1. **Security Validation**: Validates input using the shared security library
2. **Message Preparation**: Converts messages to the format expected by Vercel AI SDK
3. **MCP Tool Execution**: Executes MCP tools before AI generation and adds results as system messages
4. **Text Generation**: Uses `generateText` with Anthropic model
5. **Resource Cleanup**: Ensures MCP clients are properly closed

#### How MCP Tools Work

When MCP tools are configured in the request:

1. **Tool Execution**: The MCP server method is executed before calling the AI
2. **Result Integration**: Tool results are added as system messages to provide context
3. **Error Handling**: Tool errors are also added as system messages for transparency
4. **AI Generation**: The AI receives the tool results as context and can reference them

#### Example Usage

```typescript
// Example request with MCP tool
const request = {
  messages: [
    { role: 'user', content: 'Read the file ~/example.txt' }
  ],
  mcp: {
    type: 'filesystem',
    method: 'read_file',
    params: { path: '~/example.txt' }
  }
};

const response = await chatService.processChatWithVercelAI(request);
```

#### Security Features

- Input sanitization and validation
- Security flag detection and logging
- Tool call limiting to prevent abuse
- Proper error handling and resource cleanup

#### Dependencies

- `ai`: Vercel AI SDK
- `@ai-sdk/anthropic`: Anthropic model integration
- `@modelcontextprotocol/sdk`: MCP SDK (for future transport implementations)
- `@mcp-security-risks/shared`: Shared security utilities
- `@mcp-security-risks/mcp-tools`: MCP tool implementations

#### Current Status

✅ **Build Success**: The project builds successfully without errors  
✅ **Tests Passing**: The chat service tests pass, confirming the refactored method works  
✅ **MCP Integration**: MCP tools are properly executed and integrated  
✅ **Vercel AI SDK**: Successfully uses the Vercel AI SDK for text generation  

#### Future Enhancements

- **Dynamic Tool Creation**: Implement proper Vercel AI SDK tool format for dynamic tool execution
- **Transport Support**: Add support for stdio, http, and sse MCP transports
- **Tool Streaming**: Implement streaming tool execution for better performance
