# MCP Security Risks Sandbox Project

A comprehensive sandbox environment for testing AI concepts and studying Model Context Protocol (MCP) security risks. This project provides a safe environment to explore and understand various AI security vulnerabilities and their mitigation strategies.

## 🎯 Purpose

This project is designed to help developers, security researchers, and AI practitioners:

- **Test AI Concepts**: Experiment with AI chat features, MCP tools, and the Vercel AI library
- **Study Security Risks**: Understand and test the 10 major MCP security risks
- **Learn Mitigation Strategies**: Implement and test security best practices
- **Safe Experimentation**: Conduct security research in a controlled environment

## 🏗️ Architecture

- **Frontend**: React.js with Next.js (App Router)
- **Backend**: NestJS with WebSocket support
- **AI Integration**: Vercel AI SDK with OpenAI
- **MCP Tools**: Custom MCP server implementations for testing
- **Security Testing**: Dedicated modules for each security risk

## 🔒 MCP Security Risks Covered

### 1. Prompt Injection
- **Risk**: Malicious inputs manipulating AI behavior
- **Testing**: Input validation and prompt monitoring
- **Mitigation**: Input sanitization and comprehensive monitoring

### 2. Tool Poisoning
- **Risk**: Exploitation of MCP tool metadata
- **Testing**: Tool metadata validation
- **Mitigation**: Regular review and validation of tool metadata

### 3. Privilege Abuse
- **Risk**: Excessive permissions and access
- **Testing**: Permission auditing and least privilege principle
- **Mitigation**: Regular privilege audits and access controls

### 4. Tool Shadowing & Shadow MCP
- **Risk**: Rogue MCP tools mimicking trusted services
- **Testing**: Tool registry validation and detection
- **Mitigation**: Verified registry and continuous scanning

### 5. Indirect Prompt Injection
- **Risk**: Hidden malicious instructions in external data
- **Testing**: External content monitoring
- **Mitigation**: Vigilant handling and continuous monitoring

### 6. Sensitive Data Exposure & Token Theft
- **Risk**: Exposure of API keys and credentials
- **Testing**: Credential management and encryption
- **Mitigation**: Secure storage and regular audits

### 7. Command/SQL Injection & Malicious Code Execution
- **Risk**: Unvalidated inputs leading to code execution
- **Testing**: Input validation and parameterized queries
- **Mitigation**: Strict validation and security patches

### 8. Rug Pull Attacks
- **Risk**: Legitimate tools becoming malicious
- **Testing**: Behavior monitoring and sandboxing
- **Mitigation**: Continuous monitoring and sandboxing

### 9. Denial of Wallet/Service
- **Risk**: Resource abuse and API cost exploitation
- **Testing**: Resource monitoring and rate limiting
- **Mitigation**: Usage monitoring and network segmentation

### 10. Authentication Bypass
- **Risk**: Weak authentication mechanisms
- **Testing**: Authentication strength and multi-factor auth
- **Mitigation**: Rigorous authentication and regular audits

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI features)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mcp-security-risks

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your OpenAI API key
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Backend Configuration
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Security Testing
ENABLE_SECURITY_TESTS=true
LOG_LEVEL=debug
```

### Running the Application

```bash
# Start the backend
npm run backend:serve

# Start the frontend (in a new terminal)
npm run mcp-security-risks:serve

# Run both simultaneously
npm run dev
```

## 🧪 Testing Security Risks

### Running Security Tests

```bash
# Run all security tests
npm run test:security

# Run specific risk tests
npm run test:prompt-injection
npm run test:tool-poisoning
npm run test:privilege-abuse
```

### Interactive Testing

1. **Start the application**
2. **Navigate to the Security Testing Dashboard**
3. **Select a specific risk to test**
4. **Follow the guided testing scenarios**
5. **Review results and mitigation strategies**

## 📁 Project Structure

```
mcp-security-risks/
├── apps/
│   ├── mcp-security-risks/          # React frontend
│   ├── backend/                     # NestJS backend
│   └── backend-e2e/                 # Backend E2E tests
├── libs/
│   ├── shared/                      # Shared utilities
│   ├── mcp-tools/                   # MCP tool implementations
│   └── security-tests/              # Security testing modules
├── tools/
│   ├── mcp-server-filesystem/       # Filesystem MCP server
│   ├── mcp-server-text-document/    # Text document MCP server
│   └── security-scenarios/          # Security testing scenarios
└── docs/
    ├── security-risks/              # Detailed risk documentation
    └── mitigation-strategies/       # Mitigation guides
```

## 🔧 Development

### Adding New Security Tests

1. Create a new test module in `libs/security-tests/`
2. Implement the test scenario
3. Add to the test suite
4. Document the risk and mitigation

### Extending MCP Tools

1. Create a new MCP server in `tools/`
2. Implement the required MCP protocol
3. Add security validation
4. Test with the security scenarios

### Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## 🛡️ Security Considerations

⚠️ **Important**: This project is designed for educational and testing purposes. 

- **Do not use in production** without thorough security review
- **Do not expose to the internet** without proper security measures
- **Use only in controlled environments** for testing
- **Follow responsible disclosure** if you find real vulnerabilities

## 📚 Resources

- [Model Context Protocol (MCP) Documentation](https://modelcontextprotocol.io/)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/)
- [NestJS Documentation](https://nestjs.com/)
- [Next.js Documentation](https://nextjs.org/)
- [AI Security Best Practices](https://owasp.org/www-project-ai-security-and-privacy-guide/)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

## ⚠️ Disclaimer

This project is for educational purposes only. The authors are not responsible for any misuse of this software. Always follow ethical guidelines when testing security vulnerabilities.
