#!/usr/bin/env node

/**
 * Simple feature flags test script
 * This script tests the feature flag logic without requiring the backend to be running
 */

// Simulate the ConfigService logic
class MockConfigService {
  constructor(envVars = {}) {
    this.featureFlags = {
      enablePromptInjectionTests: this.getEnvBool('ENABLE_PROMPT_INJECTION_TESTS', true, envVars),
      enableToolPoisoningTests: this.getEnvBool('ENABLE_TOOL_POISONING_TESTS', true, envVars),
      enablePrivilegeAbuseTests: this.getEnvBool('ENABLE_PRIVILEGE_ABUSE_TESTS', true, envVars),
      enableToolShadowingTests: this.getEnvBool('ENABLE_TOOL_SHADOWING_TESTS', true, envVars),
      enableIndirectInjectionTests: this.getEnvBool('ENABLE_INDIRECT_INJECTION_TESTS', true, envVars),
      enableDataExposureTests: this.getEnvBool('ENABLE_DATA_EXPOSURE_TESTS', true, envVars),
      enableCodeInjectionTests: this.getEnvBool('ENABLE_CODE_INJECTION_TESTS', true, envVars),
      enableRugPullTests: this.getEnvBool('ENABLE_RUG_PULL_TESTS', true, envVars),
      enableDenialOfServiceTests: this.getEnvBool('ENABLE_DENIAL_OF_SERVICE_TESTS', true, envVars),
      enableAuthBypassTests: this.getEnvBool('ENABLE_AUTH_BYPASS_TESTS', true, envVars),
      enableSecurityTests: this.getEnvBool('ENABLE_SECURITY_TESTS', true, envVars),
      enableMCPTools: this.getEnvBool('ENABLE_MCP_TOOLS', true, envVars),
      enableMonitoring: this.getEnvBool('ENABLE_MONITORING', true, envVars),
    };
  }

  getFeatureFlags() {
    return { ...this.featureFlags };
  }

  isFeatureEnabled(feature) {
    return this.featureFlags[feature];
  }

  getEnvBool(key, defaultValue, envVars) {
    const value = envVars[key];
    if (value === undefined) {
      return defaultValue;
    }
    return value.toLowerCase() === 'true';
  }
}

// Test configurations
const testConfigs = [
  {
    name: 'All tests enabled',
    env: {
      ENABLE_SECURITY_TESTS: 'true',
      ENABLE_PROMPT_INJECTION_TESTS: 'true',
      ENABLE_TOOL_POISONING_TESTS: 'true',
      ENABLE_PRIVILEGE_ABUSE_TESTS: 'true',
      ENABLE_TOOL_SHADOWING_TESTS: 'true',
      ENABLE_INDIRECT_INJECTION_TESTS: 'true',
      ENABLE_DATA_EXPOSURE_TESTS: 'true',
      ENABLE_CODE_INJECTION_TESTS: 'true',
      ENABLE_RUG_PULL_TESTS: 'true',
      ENABLE_DENIAL_OF_SERVICE_TESTS: 'true',
      ENABLE_AUTH_BYPASS_TESTS: 'true'
    }
  },
  {
    name: 'Only critical tests enabled',
    env: {
      ENABLE_SECURITY_TESTS: 'true',
      ENABLE_PROMPT_INJECTION_TESTS: 'true',
      ENABLE_TOOL_POISONING_TESTS: 'true',
      ENABLE_PRIVILEGE_ABUSE_TESTS: 'false',
      ENABLE_TOOL_SHADOWING_TESTS: 'true',
      ENABLE_INDIRECT_INJECTION_TESTS: 'false',
      ENABLE_DATA_EXPOSURE_TESTS: 'true',
      ENABLE_CODE_INJECTION_TESTS: 'true',
      ENABLE_RUG_PULL_TESTS: 'false',
      ENABLE_DENIAL_OF_SERVICE_TESTS: 'false',
      ENABLE_AUTH_BYPASS_TESTS: 'true'
    }
  },
  {
    name: 'All tests disabled',
    env: {
      ENABLE_SECURITY_TESTS: 'false',
      ENABLE_PROMPT_INJECTION_TESTS: 'false',
      ENABLE_TOOL_POISONING_TESTS: 'false',
      ENABLE_PRIVILEGE_ABUSE_TESTS: 'false',
      ENABLE_TOOL_SHADOWING_TESTS: 'false',
      ENABLE_INDIRECT_INJECTION_TESTS: 'false',
      ENABLE_DATA_EXPOSURE_TESTS: 'false',
      ENABLE_CODE_INJECTION_TESTS: 'false',
      ENABLE_RUG_PULL_TESTS: 'false',
      ENABLE_DENIAL_OF_SERVICE_TESTS: 'false',
      ENABLE_AUTH_BYPASS_TESTS: 'false'
    }
  },
  {
    name: 'Mixed configuration',
    env: {
      ENABLE_SECURITY_TESTS: 'true',
      ENABLE_PROMPT_INJECTION_TESTS: 'true',
      ENABLE_TOOL_POISONING_TESTS: 'false',
      ENABLE_PRIVILEGE_ABUSE_TESTS: 'true',
      ENABLE_TOOL_SHADOWING_TESTS: 'false',
      ENABLE_INDIRECT_INJECTION_TESTS: 'true',
      ENABLE_DATA_EXPOSURE_TESTS: 'false',
      ENABLE_CODE_INJECTION_TESTS: 'true',
      ENABLE_RUG_PULL_TESTS: 'false',
      ENABLE_DENIAL_OF_SERVICE_TESTS: 'true',
      ENABLE_AUTH_BYPASS_TESTS: 'false'
    }
  }
];

function testFeatureFlags() {
  console.log('🧪 Testing Feature Flags Logic\n');
  
  for (const config of testConfigs) {
    console.log(`\n📋 Testing: ${config.name}`);
    console.log('='.repeat(50));
    
    // Create config service with test environment
    const configService = new MockConfigService(config.env);
    
    // Test master flag
    const masterEnabled = configService.isFeatureEnabled('enableSecurityTests');
    console.log(`🔐 Master security flag: ${masterEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
    
    if (masterEnabled) {
      // Test individual flags
      const individualFlags = [
        'enablePromptInjectionTests',
        'enableToolPoisoningTests',
        'enablePrivilegeAbuseTests',
        'enableToolShadowingTests',
        'enableIndirectInjectionTests',
        'enableDataExposureTests',
        'enableCodeInjectionTests',
        'enableRugPullTests',
        'enableDenialOfServiceTests',
        'enableAuthBypassTests'
      ];
      
      console.log('\n📊 Individual risk test flags:');
      individualFlags.forEach(flag => {
        const enabled = configService.isFeatureEnabled(flag);
        const status = enabled ? '✅' : '❌';
        const flagName = flag.replace('enable', '').replace('Tests', '');
        console.log(`  ${status} ${flagName}: ${enabled ? 'ENABLED' : 'DISABLED'}`);
      });
      
      // Count enabled tests
      const enabledCount = individualFlags.filter(flag => configService.isFeatureEnabled(flag)).length;
      const totalCount = individualFlags.length;
      console.log(`\n📈 Summary: ${enabledCount}/${totalCount} risk tests enabled`);
      
    } else {
      console.log('⚠️  All individual flags ignored when master flag is disabled');
    }
    
    // Show full configuration
    console.log('\n🔧 Full configuration:');
    const flags = configService.getFeatureFlags();
    Object.entries(flags).forEach(([key, value]) => {
      if (key.startsWith('enable')) {
        const status = value ? '✅' : '❌';
        console.log(`  ${status} ${key}: ${value}`);
      }
    });
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Feature Flags Test Script

Usage:
  node test-feature-flags-simple.js [options]

Options:
  --help, -h     Show this help message
  --config <name> Test specific configuration

Examples:
  node test-feature-flags-simple.js                    # Test all configurations
  node test-feature-flags-simple.js --config critical # Test only critical config
    `);
    process.exit(0);
  }
  
  if (args.includes('--config')) {
    const configName = args[args.indexOf('--config') + 1];
    const config = testConfigs.find(c => c.name.toLowerCase().includes(configName));
    if (config) {
      console.log(`🧪 Testing specific configuration: ${config.name}`);
      const configService = new MockConfigService(config.env);
      console.log('Configuration:', configService.getFeatureFlags());
    } else {
      console.error('❌ Configuration not found. Available:', testConfigs.map(c => c.name));
      process.exit(1);
    }
  } else {
    testFeatureFlags();
  }
}

module.exports = { MockConfigService, testFeatureFlags };
