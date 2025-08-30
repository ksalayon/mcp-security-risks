# Vercel AI Integration Feature

## Overview

This feature adds Vercel AI SDK integration to the MCP Security Risks testing platform, allowing you to test MCP vulnerabilities using Vercel's AI SDK with Anthropic Haiku model.

## Features

- **Vercel AI SDK Integration**: Uses Vercel's AI SDK for enhanced tool integration
- **Anthropic Haiku Model**: Continues to use your preferred Anthropic Haiku model
- **MCP Tool Integration**: Full support for MCP tools with Vercel AI
- **Security Testing**: Maintains all existing security validation features
- **Toggle Control**: Easy on/off toggle in the UI

## How to Use

### 1. Enable the Feature

Set the environment variable to enable Vercel AI:

```bash
export ENABLE_VERCEL_AI=true
```

### 2. Use the UI Toggle

1. Open the chat interface
2. Look for the "Vercel AI" toggle in the header
3. Click to enable/disable Vercel AI mode
4. The toggle will show purple when enabled

### 3. API Usage

The feature adds a new endpoint:

```bash
POST /chat/vercel-ai
```

Request body:
```json
{
  "messages": [
    {"role": "user", "content": "Your message here"}
  ],
  "model": "claude-3-5-haiku-latest",
  "temperature": 0.7,
  "toolUse": true,
  "mcp": {
    "type": "filesystem",
    "method": "read_file",
    "params": {"path": "/tmp/test.txt"}
  }
}
```

### 4. Frontend Integration

The frontend automatically routes to the correct endpoint based on the `useVercelAI` flag:

```javascript
const requestBody = {
  messages: [...],
  useVercelAI: true, // Enable Vercel AI
  toolUse: true,
  mcp: {...}
};
```

## Benefits

1. **Enhanced Tool Integration**: Vercel AI SDK provides better tool handling
2. **Consistent API**: Same interface as existing chat functionality
3. **Security Testing**: Full support for MCP vulnerability testing
4. **Performance**: Optimized for Vercel's infrastructure
5. **Flexibility**: Easy to switch between direct Anthropic and Vercel AI

## Testing MCP Vulnerabilities

With Vercel AI enabled, you can test:

- **Tool Poisoning**: Attempt to manipulate MCP tool responses
- **Privilege Abuse**: Test unauthorized access to system resources
- **Data Exposure**: Attempt to access sensitive information
- **Code Injection**: Try to inject malicious code through tools

## Configuration

The feature respects all existing configuration:

- `ANTHROPIC_API_KEY`: Still used for authentication
- `ANTHROPIC_MODEL`: Model selection
- Security validation settings
- MCP tool configurations

## Debug Information

When Vercel AI is enabled, the debug panel shows:
- AI Engine: "VERCEL AI" (purple indicator)
- All existing debug information
- Tool usage and responses

## Troubleshooting

1. **Feature Not Available**: Ensure `ENABLE_VERCEL_AI=true` is set
2. **API Errors**: Check that Vercel AI SDK is properly installed
3. **Tool Integration Issues**: Verify MCP server configurations
4. **Performance Issues**: Monitor token usage and response times

## Security Considerations

- Vercel AI maintains all existing security validations
- Raw attack mode still works with Vercel AI
- MCP tool security is preserved
- No additional security risks introduced
