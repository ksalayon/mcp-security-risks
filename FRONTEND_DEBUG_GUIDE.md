# Frontend-to-Backend Debugging Guide

This guide will help you debug the mcp-tools library when triggered from the frontend.

## Current Setup Status

✅ **Backend is running with debugging enabled** (port 9229)  
✅ **Frontend can make API calls to backend**  
✅ **Debugger can attach to backend process**  

## Step-by-Step Debugging Process

### 1. Attach Debugger to Backend

1. **Open Debug Panel**: Ctrl+Shift+D / Cmd+Shift+D
2. **Select Configuration**: "Attach to Backend"
3. **Press F5**: This attaches the debugger to the running backend

### 2. Set Breakpoints in Key Files

#### **Primary Breakpoint Locations:**

**A. In `libs/mcp-tools/src/lib/mcp-tools.ts`:**
- **Line 367**: `const userInput = request.params.userInput || '';` - Parameter extraction
- **Line 360**: `let result: any;` - Request handling entry
- **Line 357**: `async handleRequest(request: MCPRequest): Promise<MCPResponse> {` - Method entry

**B. In `apps/backend/src/app/chat.service.ts`:**
- **Line 49**: `const server = MCPServerFactory.createServer(request.mcp.type);` - Server creation
- **Line 50-60**: The `handleRequest` call and response handling

**C. In `apps/backend/src/app/app.controller.ts`:**
- **Line 104**: `return MCPServerFactory.listAllMethods();` - MCP methods endpoint

### 3. Trigger the Debugging

1. **Go to your frontend** (usually http://localhost:3000)
2. **Make a chat request** that includes MCP tool usage
3. **The debugger should stop** at your breakpoints

## Example Chat Request to Trigger Debugging

When making a chat request from the frontend, include MCP tool data:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Test message"
    }
  ],
  "toolUse": true,
  "mcp": {
    "type": "vulnerable",
    "method": "get_description",
    "params": {
      "userInput": "test input"
    }
  }
}
```

## Debug Flow

1. **Frontend** → Makes HTTP POST to `/api/chat`
2. **Backend Controller** → Receives request in `app.controller.ts`
3. **Chat Service** → Processes request in `chat.service.ts`
4. **MCP Tools** → Creates server and handles request in `mcp-tools.ts`
5. **Your Breakpoints** → Should be hit during this flow

## Troubleshooting

### Breakpoints Not Hitting

1. **Check if debugger is attached**:
   - Look for "Attach to Backend" in debug panel
   - Should show "Connected" status

2. **Verify backend is running with debugging**:
   ```bash
   lsof -i :9229
   ```

3. **Check if MCP tools are being used**:
   - Ensure your chat request includes `toolUse: true` and `mcp` data
   - Check backend logs for MCP server creation

### Common Issues

1. **"Attach to Backend" not working**:
   - Restart backend with: `NODE_OPTIONS="--inspect=9229" npx nx serve backend`
   - Then attach debugger

2. **Breakpoints in wrong files**:
   - Set breakpoints in TypeScript source files (`.ts`), not compiled files (`.js`)
   - Ensure breakpoints are in the correct line numbers

3. **Frontend not triggering backend**:
   - Check if frontend is making requests to correct backend URL
   - Verify backend is responding on port 3001

## Success Indicators

When debugging is working correctly:

1. **Debugger attaches** to backend process
2. **Breakpoints turn solid red** (not hollow)
3. **Execution stops** when frontend makes API calls
4. **Variables are inspectable** in debug panel
5. **Call stack shows** the correct flow from frontend → backend → mcp-tools

## Quick Test

1. Set breakpoint on line 367 in `mcp-tools.ts`
2. Attach debugger to backend
3. Make a chat request from frontend with MCP tool data
4. Debugger should stop at your breakpoint

Your debugging should now work when triggered from the frontend!

