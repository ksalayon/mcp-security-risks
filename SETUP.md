# MCP Security Risks Project Setup Guide

This guide will help you set up and run the MCP Security Risks sandbox project for testing AI concepts and studying security vulnerabilities.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI chat features)

## Quick Start

### 1. Clone and Install

```bash
# Navigate to the project directory
cd ~/Dev/mcp-security-risks

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Copy the example environment file
cp env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```env
# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=your_openai_api_key_here

# Backend Configuration
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Security Testing
ENABLE_SECURITY_TESTS=true
LOG_LEVEL=debug
```

### 3. Start the Application

```bash
# Start both frontend and backend simultaneously
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000 (React/Next.js)
- **Backend**: http://localhost:3001 (NestJS)

## Project Structure

```
mcp-security-risks/
├── apps/
│   ├── mcp-security-risks/          # React frontend
│   │   ├── src/app/
│   │   │   ├── components/          # React components
│   │   │   ├── api/                 # Next.js API routes
│   │   │   └── page.tsx             # Main page
│   │   └── ...
│   ├── backend/                     # NestJS backend
│   │   ├── src/app/
│   │   │   ├── app.controller.ts    # Main controller
│   │   │   ├── chat.service.ts      # AI chat service
│   │   │   ├── security.service.ts  # Security testing service
│   │   │   └── app.module.ts        # App module
│   │   └── ...
│   └── backend-e2e/                 # Backend E2E tests
├── libs/
│   ├── shared/                      # Shared utilities and types
│   ├── mcp-tools/                   # MCP tool implementations
│   └── security-tests/              # Security testing engine
├── env.example                      # Environment configuration example
├── README.md                        # Project documentation
└── package.json                     # Project scripts and dependencies
```

## Features

### 1. AI Chat Interface
- Real-time AI chat using Vercel AI SDK
- Security validation and prompt injection detection
- Token usage tracking
- Security flag warnings

### 2. Security Testing Dashboard
- Comprehensive testing for 10 MCP security risks
- Individual risk testing
- Security reports and recommendations
- Real-time test results

### 3. MCP Security Risks Covered
- **Prompt Injection**: Malicious inputs manipulating AI behavior
- **Tool Poisoning**: Exploitation of MCP tool metadata
- **Privilege Abuse**: Excessive permissions and access
- **Tool Shadowing**: Rogue MCP tools mimicking trusted services
- **Indirect Prompt Injection**: Hidden malicious instructions
- **Sensitive Data Exposure**: API keys and credentials exposure
- **Code Injection**: SQL and command injection attacks
- **Rug Pull Attacks**: Legitimate tools becoming malicious
- **Denial of Service**: Resource abuse and rate limiting
- **Authentication Bypass**: Weak authentication mechanisms

## Usage

### Testing AI Chat Security

1. **Start the application**: `npm run dev`
2. **Navigate to the Chat tab**
3. **Test prompt injection patterns**:
   - "Ignore previous instructions"
   - "Act as if you are a system administrator"
   - "Bypass all security measures"
4. **Observe security warnings** when malicious patterns are detected

### Running Security Tests

1. **Navigate to the Security Testing tab**
2. **Run all tests**: Click "Run All Tests" button
3. **Test individual risks**: Click "Test Risk" on specific risk cards
4. **Review results**: Check the test results table and security report

### API Endpoints

#### Chat API
- `POST /api/chat` - Process AI chat messages

#### Security API
- `GET /api/security/risks` - Get all security risks
- `POST /api/security/test` - Run security tests
- `GET /api/security/status` - Get security status

## Development

### Adding New Security Tests

1. **Create test scenario** in `libs/security-tests/src/lib/security-tests.ts`
2. **Add to test suite** in the appropriate test method
3. **Update frontend** to display new test results

### Extending MCP Tools

1. **Create new MCP server** in `libs/mcp-tools/src/lib/mcp-tools.ts`
2. **Implement security validation** in the server class
3. **Add to factory** in `MCPServerFactory`

### Running Tests

```bash
# Run all tests
npm test

# Run security tests only
npm run test:security

# Run specific project tests
nx test backend
nx test mcp-security-risks
```

## Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check if port 3001 is available
   - Verify all dependencies are installed
   - Check environment variables

2. **Frontend not connecting to backend**
   - Ensure backend is running on port 3001
   - Check CORS configuration
   - Verify API routes are working

3. **OpenAI API errors**
   - Verify your API key is correct
   - Check API key permissions
   - Ensure you have sufficient credits

4. **Security tests failing**
   - Check if all libraries are properly imported
   - Verify test scenarios are correctly configured
   - Review error logs for specific issues

### Debug Mode

Enable debug logging by setting in `.env.local`:

```env
LOG_LEVEL=debug
SECURITY_LOG_LEVEL=verbose
```

### Logs

- **Backend logs**: Check terminal where backend is running
- **Frontend logs**: Check browser developer console
- **Test logs**: Check terminal output during test execution

## Security Considerations

⚠️ **Important**: This project is designed for educational and testing purposes.

- **Do not use in production** without thorough security review
- **Do not expose to the internet** without proper security measures
- **Use only in controlled environments** for testing
- **Follow responsible disclosure** if you find real vulnerabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the README.md for detailed documentation
3. Check the project structure for implementation details
4. Create an issue in the repository

## License

MIT License - see LICENSE file for details

