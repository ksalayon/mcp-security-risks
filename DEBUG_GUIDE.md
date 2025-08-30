# Debug Configuration Guide

## Issues Fixed

Your debug breakpoints weren't working due to several configuration issues:

1. **Missing Source Maps**: The TypeScript configuration had `emitDeclarationOnly: true` which prevented source map generation
2. **Incorrect Debug Configuration**: The launch.json wasn't properly configured for the mcp-tools library
3. **Build Process**: The SWC build process needed proper source map configuration

## What Was Changed

### 1. Updated TypeScript Configuration (`libs/mcp-tools/tsconfig.lib.json`)
- Removed `emitDeclarationOnly: true`
- Added `sourceMap: true`

### 2. Enhanced Debug Configuration (`.vscode/launch.json`)
- Added specific debug configurations for mcp-tools library
- Configured proper source map resolution
- Added build task integration

### 3. Created Build Task (`.vscode/tasks.json`)
- Added automatic build task for mcp-tools before debugging

### 4. Created Test Script (`libs/mcp-tools/debug-test.js`)
- Simple test script to verify debugging works

## How to Use the Debug Configuration

### Option 1: Debug MCP Tools Test (Recommended)
1. Open the debug panel in VS Code (Ctrl+Shift+D / Cmd+Shift+D)
2. Select "Debug MCP Tools Test" from the dropdown
3. Set breakpoints in your TypeScript files (e.g., `libs/mcp-tools/src/lib/mcp-tools.ts`)
4. Press F5 or click the green play button
5. The debugger will automatically build the project and run the test script

### Option 2: Attach to Backend (Fixed!)
1. Start your backend with debugging enabled:
   ```bash
   NODE_OPTIONS="--inspect=9229" npx nx serve backend
   ```
2. Select "Attach to Backend" from the debug dropdown
3. Set breakpoints in your backend TypeScript files (e.g., `apps/backend/src/app/app.controller.ts`)
4. Press F5 to attach the debugger
5. Make API requests to trigger your breakpoints

### Option 3: Debug Backend with Nx
1. Select "Debug backend with Nx" from the debug dropdown
2. Set breakpoints in your backend code
3. Press F5 to start debugging

### Option 4: Test Backend API
1. Ensure the backend is running (see Option 2)
2. Select "Test Backend API" from the debug dropdown
3. Press F5 to run the test script
4. This will make API calls to test the backend endpoints

## Setting Breakpoints

You can now set breakpoints in:
- `libs/mcp-tools/src/lib/mcp-tools.ts` (your current file)
- Any other TypeScript files in the mcp-tools library
- The source maps will correctly map back to your original TypeScript code

## Testing Your Debug Setup

1. Open `libs/mcp-tools/src/lib/mcp-tools.ts`
2. Set a breakpoint on line 367 (the line you had open) or line 375 (in the injection patterns)
3. Run the "Debug MCP Tools Test" configuration
4. The debugger should stop at your breakpoint when the `VulnerableMCPServer` processes the request

## Troubleshooting

If breakpoints still don't work:

1. **Check Source Maps**: Ensure source maps exist:
   - `libs/mcp-tools/dist/lib/mcp-tools.js.map` for MCP tools
   - `apps/backend/dist/main.js.map` for backend
2. **Rebuild**: Run `npx nx build mcp-tools` or `npx nx build backend` to regenerate source maps
3. **Check File Paths**: Make sure your breakpoints are in the source TypeScript files, not the compiled JavaScript
4. **Restart VS Code**: Sometimes VS Code needs a restart to pick up new debug configurations
5. **Check Port**: Ensure the backend is running on port 9229 for debugging
6. **Verify Process**: Use `lsof -i :9229` to check if the debug port is active

## Key Files Modified

- `.vscode/launch.json` - Debug configurations
- `.vscode/tasks.json` - Build tasks
- `libs/mcp-tools/tsconfig.lib.json` - TypeScript configuration
- `libs/mcp-tools/debug-test.js` - Test script (new)

Your debugging should now work properly! Try setting a breakpoint on line 367 in your mcp-tools.ts file and running the debug test.
