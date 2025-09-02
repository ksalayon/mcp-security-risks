# MCP Tools Debugging Guide for Cursor

This guide will help you successfully debug the `libs/mcp-tools/src/lib/mcp-tools.ts` file in Cursor.

## Quick Start

1. **Open the file**: Navigate to `libs/mcp-tools/src/lib/mcp-tools.ts`
2. **Set breakpoints**: Click in the gutter next to line numbers to set breakpoints
3. **Start debugging**: Use one of the debug configurations below

## Debug Configurations Available

### 1. Debug MCP Tools Enhanced Test (Recommended)
- **Best for**: Comprehensive testing of all MCP server classes
- **How to use**:
  1. Open Debug panel (Ctrl+Shift+D / Cmd+Shift+D)
  2. Select "Debug MCP Tools Enhanced Test"
  3. Press F5
  4. Set breakpoints in `mcp-tools.ts` before running

### 2. Debug MCP Tools Test
- **Best for**: Simple testing of VulnerableMCPServer
- **How to use**:
  1. Select "Debug MCP Tools Test"
  2. Press F5

### 3. Debug MCP Tools Library (Direct)
- **Best for**: Direct TypeScript execution
- **How to use**:
  1. Select "Debug MCP Tools Library (Direct)"
  2. Press F5

## Setting Breakpoints

### Key Lines to Set Breakpoints On

1. **Line 360**: `let result: any;` - Entry point for request handling
2. **Line 367**: `const userInput = request.params.userInput || '';` - Parameter extraction
3. **Line 375**: `/you can access/i` - Security pattern matching
4. **Line 357**: `async handleRequest(request: MCPRequest): Promise<MCPResponse> {` - Method entry

### How to Set Breakpoints in Cursor

1. **Click in the gutter** (left margin) next to the line number
2. **Red dot appears** indicating breakpoint is set
3. **Breakpoint is active** when the dot is filled
4. **Hover over breakpoint** to see details

## Testing Different Scenarios

### Test 1: VulnerableMCPServer (Lines 343-459)
Set breakpoints on:
- Line 357: Method entry
- Line 360: Result initialization
- Line 367: User input extraction
- Line 375: Security pattern matching

### Test 2: FilesystemMCPServer (Lines 113-221)
Set breakpoints on:
- Line 113: Class definition
- Line 130: Request handling
- Line 150: File operations

### Test 3: TextDocumentMCPServer (Lines 222-342)
Set breakpoints on:
- Line 222: Class definition
- Line 240: Request handling
- Line 280: Text operations

## Debug Console Commands

When paused at a breakpoint, you can use these commands in the Debug Console:

```javascript
// Inspect variables
request
result
error

// Check security flags
this.securityFlags

// Inspect request parameters
request.params

// Check method being called
request.method
```

## Troubleshooting

### Breakpoints Not Hitting

1. **Check source maps**:
   ```bash
   ls -la libs/mcp-tools/dist/lib/mcp-tools.js.map
   ```

2. **Rebuild the project**:
   ```bash
   npx nx build mcp-tools
   ```

3. **Verify file paths**: Ensure breakpoints are in `.ts` files, not `.js` files

4. **Check debug configuration**: Make sure "Debug MCP Tools Enhanced Test" is selected

### Source Maps Not Working

1. **Check TypeScript config**: Ensure `sourceMap: true` in `tsconfig.lib.json`
2. **Check build output**: Verify `.js.map` files exist in `dist/` directory
3. **Restart Cursor**: Sometimes needed to pick up new configurations

### Debug Console Not Showing

1. **Check debug panel**: Ensure "Debug Console" tab is open
2. **Check configuration**: Verify `"internalConsoleOptions": "neverOpen"` is set
3. **Use integrated terminal**: Check if output appears in terminal instead

## Advanced Debugging

### Conditional Breakpoints

1. **Right-click** on breakpoint
2. **Select "Edit Breakpoint"**
3. **Add condition**: `request.method === 'get_description'`

### Logpoints

1. **Right-click** on breakpoint
2. **Select "Add Logpoint"**
3. **Add message**: `Request: ${request.method} with params: ${JSON.stringify(request.params)}`

### Watch Expressions

Add these to the Watch panel:
- `request.method`
- `request.params`
- `this.securityFlags.length`
- `result`

## File Structure for Debugging

```
libs/mcp-tools/
├── src/
│   ├── lib/
│   │   └── mcp-tools.ts          # Main file to debug
│   └── index.ts                  # Exports
├── dist/
│   ├── lib/
│   │   ├── mcp-tools.js          # Compiled JavaScript
│   │   └── mcp-tools.js.map      # Source maps
│   └── index.js
├── debug-test.js                 # Simple test
└── debug-test-enhanced.js        # Comprehensive test
```

## Success Indicators

When debugging is working correctly, you should see:

1. **Breakpoints hit** when running debug configurations
2. **Variables inspectable** in Debug panel
3. **Source maps working** - stepping through TypeScript code
4. **Console output** showing test results
5. **Call stack** showing correct file paths

## Next Steps

Once basic debugging is working:

1. **Add more breakpoints** in different server classes
2. **Test security validation** by using injection patterns
3. **Debug error handling** by passing invalid parameters
4. **Test different methods** for each server type

Your debugging setup should now work perfectly for the mcp-tools library!



