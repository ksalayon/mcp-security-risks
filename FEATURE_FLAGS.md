# Feature Flags Guide

This guide explains how to use and test feature flags in the MCP Security Risks project.

## Overview

Feature flags allow you to control which security tests and features are enabled at runtime without changing code. This is useful for:

- **Testing**: Enable/disable specific security risk tests
- **Deployment**: Control features in different environments
- **Rollouts**: Gradually enable new features
- **Debugging**: Isolate specific functionality

## Available Feature Flags

### Security Testing Flags

| Flag | Description | Default |
|------|-------------|---------|
| `ENABLE_SECURITY_TESTS` | Master switch for all security tests | `true` |
| `ENABLE_PROMPT_INJECTION_TESTS` | Prompt injection vulnerability tests | `true` |
| `ENABLE_TOOL_POISONING_TESTS` | Tool poisoning vulnerability tests | `true` |
| `ENABLE_PRIVILEGE_ABUSE_TESTS` | Privilege abuse vulnerability tests | `true` |
| `ENABLE_TOOL_SHADOWING_TESTS` | Tool shadowing vulnerability tests | `true` |
| `ENABLE_INDIRECT_INJECTION_TESTS` | Indirect prompt injection tests | `true` |
| `ENABLE_DATA_EXPOSURE_TESTS` | Data exposure vulnerability tests | `true` |
| `ENABLE_CODE_INJECTION_TESTS` | Code injection vulnerability tests | `true` |
| `ENABLE_RUG_PULL_TESTS` | Rug pull attack tests | `true` |
| `ENABLE_DENIAL_OF_SERVICE_TESTS` | DoS vulnerability tests | `true` |
| `ENABLE_AUTH_BYPASS_TESTS` | Authentication bypass tests | `true` |

### General Feature Flags

| Flag | Description | Default |
|------|-------------|---------|
| `ENABLE_MCP_TOOLS` | Enable MCP tool functionality | `true` |
| `ENABLE_MONITORING` | Enable monitoring and logging | `true` |

## Configuration

### 1. Environment Variables

Set feature flags using environment variables in your `.env.local` file:

```bash
# Copy the example file
cp env.example .env.local

# Edit .env.local and set your desired flags
ENABLE_SECURITY_TESTS=true
ENABLE_PROMPT_INJECTION_TESTS=false
ENABLE_TOOL_POISONING_TESTS=true
# ... etc
```

### 2. Runtime Configuration

Feature flags are read when the application starts. To change flags:

1. Update your `.env.local` file
2. Restart the backend service
3. The new configuration will take effect immediately

## Usage Examples

### Enable Only Critical Tests

```bash
# .env.local
ENABLE_SECURITY_TESTS=true
ENABLE_PROMPT_INJECTION_TESTS=true      # Critical
ENABLE_TOOL_POISONING_TESTS=true        # Critical
ENABLE_PRIVILEGE_ABUSE_TESTS=false      # Medium risk
ENABLE_TOOL_SHADOWING_TESTS=true        # Critical
ENABLE_INDIRECT_INJECTION_TESTS=false   # Medium risk
ENABLE_DATA_EXPOSURE_TESTS=true         # Critical
ENABLE_CODE_INJECTION_TESTS=true        # Critical
ENABLE_RUG_PULL_TESTS=false             # Medium risk
ENABLE_DENIAL_OF_SERVICE_TESTS=false    # Low risk
ENABLE_AUTH_BYPASS_TESTS=true           # Critical
```

### Disable All Security Tests

```bash
# .env.local
ENABLE_SECURITY_TESTS=false
# All individual flags will be ignored when master flag is false
```

### Enable Only Specific Risk Categories

```bash
# .env.local
ENABLE_SECURITY_TESTS=true
ENABLE_PROMPT_INJECTION_TESTS=true
ENABLE_TOOL_POISONING_TESTS=false
ENABLE_PRIVILEGE_ABUSE_TESTS=false
ENABLE_TOOL_SHADOWING_TESTS=true
ENABLE_INDIRECT_INJECTION_TESTS=false
ENABLE_DATA_EXPOSURE_TESTS=false
ENABLE_CODE_INJECTION_TESTS=true
ENABLE_RUG_PULL_TESTS=false
ENABLE_DENIAL_OF_SERVICE_TESTS=false
ENABLE_AUTH_BYPASS_TESTS=false
```

## Testing Feature Flags

### 1. Check Current Configuration

```bash
# Check feature flags via API
curl http://localhost:3001/api/config/feature-flags
```

### 2. Test Security Tests

```bash
# Test if security tests respect feature flags
curl -X POST http://localhost:3001/api/security/test \
  -H "Content-Type: application/json" \
  -d '{"runAll": true}'
```

### 3. Use the Test Script

We provide a test script to verify feature flag functionality:

```bash
# Test all configurations
node test-feature-flags.js

# Test specific configuration
node test-feature-flags.js --config critical

# Get help
node test-feature-flags.js --help
```

## API Endpoints

### Get Feature Flags

```
GET /api/config/feature-flags
```

Returns the current feature flag configuration:

```json
{
  "enablePromptInjectionTests": true,
  "enableToolPoisoningTests": true,
  "enablePrivilegeAbuseTests": false,
  "enableToolShadowingTests": true,
  "enableIndirectInjectionTests": false,
  "enableDataExposureTests": true,
  "enableCodeInjectionTests": true,
  "enableRugPullTests": false,
  "enableDenialOfServiceTests": false,
  "enableAuthBypassTests": true,
  "enableSecurityTests": true,
  "enableMCPTools": true,
  "enableMonitoring": true
}
```

### Security Test Endpoints

The security test endpoints automatically respect feature flags:

- `POST /api/security/test` with `{"runAll": true}` - Runs all enabled tests
- `POST /api/security/test` with `{"riskCategory": "prompt_injection"}` - Runs specific risk tests if enabled

## Behavior

### When Flags Are Disabled

- **Individual risk tests**: Return empty results with warning logs
- **Master security flag**: Returns empty report with explanation
- **API responses**: Include information about why tests were skipped

### When Flags Are Enabled

- **Tests run normally**: Full security test execution
- **Results returned**: Complete test results and security reports
- **Logging**: Normal operation logs

## Best Practices

### 1. Use Master Flag

Always set `ENABLE_SECURITY_TESTS` as your primary control:

```bash
# Good
ENABLE_SECURITY_TESTS=false

# Avoid (individual flags still matter but master flag takes precedence)
ENABLE_SECURITY_TESTS=true
ENABLE_PROMPT_INJECTION_TESTS=false
```

### 2. Environment-Specific Configs

Use different configurations for different environments:

```bash
# Development
ENABLE_SECURITY_TESTS=true
ENABLE_MONITORING=true

# Production
ENABLE_SECURITY_TESTS=true
ENABLE_MONITORING=false

# Testing
ENABLE_SECURITY_TESTS=false
ENABLE_MCP_TOOLS=false
```

### 3. Monitor Flag Usage

Check your logs to see which flags are active:

```bash
# Backend logs will show:
# "Security tests are disabled via feature flag"
# "Risk category prompt_injection is disabled via feature flag"
```

## Troubleshooting

### Common Issues

1. **Flags not taking effect**
   - Restart the backend service after changing `.env.local`
   - Check that the file is in the correct location

2. **Tests still running when disabled**
   - Verify the master flag `ENABLE_SECURITY_TESTS` is set to `false`
   - Check that individual risk flags are also set to `false`

3. **API errors**
   - Ensure the backend is running
   - Check that the ConfigService is properly injected

### Debug Mode

Enable debug logging to see feature flag decisions:

```bash
# .env.local
LOG_LEVEL=debug
```

## Security Considerations

⚠️ **Important**: Feature flags are for operational control, not security control.

- **Do not rely on feature flags for security**: They can be bypassed
- **Use for operational control**: Enabling/disabling functionality
- **Monitor flag changes**: Log when flags are modified
- **Test disabled states**: Ensure disabled features are truly inactive

## Future Enhancements

Planned improvements to the feature flag system:

- [ ] Dynamic flag updates without restart
- [ ] Flag change audit logging
- [ ] Flag dependency management
- [ ] A/B testing support
- [ ] Flag rollback capabilities
- [ ] Web UI for flag management
