import { Injectable } from '@nestjs/common';

export interface FeatureFlags {
  enablePromptInjectionTests: boolean;
  enableToolPoisoningTests: boolean;
  enablePrivilegeAbuseTests: boolean;
  enableToolShadowingTests: boolean;
  enableIndirectInjectionTests: boolean;
  enableDataExposureTests: boolean;
  enableCodeInjectionTests: boolean;
  enableRugPullTests: boolean;
  enableDenialOfServiceTests: boolean;
  enableAuthBypassTests: boolean;
  enableSecurityTests: boolean;
  enableMCPTools: boolean;
  enableMonitoring: boolean;
  bypassSecurityValidation: boolean;
  enableVercelAI: boolean;
}

@Injectable()
export class ConfigService {
  private readonly featureFlags: FeatureFlags;

  constructor() {
    this.featureFlags = {
      enablePromptInjectionTests: this.getEnvBool('ENABLE_PROMPT_INJECTION_TESTS', true),
      enableToolPoisoningTests: this.getEnvBool('ENABLE_TOOL_POISONING_TESTS', true),
      enablePrivilegeAbuseTests: this.getEnvBool('ENABLE_PRIVILEGE_ABUSE_TESTS', true),
      enableToolShadowingTests: this.getEnvBool('ENABLE_TOOL_SHADOWING_TESTS', true),
      enableIndirectInjectionTests: this.getEnvBool('ENABLE_INDIRECT_INJECTION_TESTS', true),
      enableDataExposureTests: this.getEnvBool('ENABLE_DATA_EXPOSURE_TESTS', true),
      enableCodeInjectionTests: this.getEnvBool('ENABLE_CODE_INJECTION_TESTS', true),
      enableRugPullTests: this.getEnvBool('ENABLE_RUG_PULL_TESTS', true),
      enableDenialOfServiceTests: this.getEnvBool('ENABLE_DENIAL_OF_SERVICE_TESTS', true),
      enableAuthBypassTests: this.getEnvBool('ENABLE_AUTH_BYPASS_TESTS', true),
      enableSecurityTests: this.getEnvBool('ENABLE_SECURITY_TESTS', true),
      enableMCPTools: this.getEnvBool('ENABLE_MCP_TOOLS', true),
      enableMonitoring: this.getEnvBool('ENABLE_MONITORING', true),
      bypassSecurityValidation: this.getEnvBool('BYPASS_SECURITY_VALIDATION', false),
      enableVercelAI: this.getEnvBool('ENABLE_VERCEL_AI', false),
    };
  }

  getFeatureFlags(): FeatureFlags {
    return { ...this.featureFlags };
  }

  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.featureFlags[feature];
  }

  private getEnvBool(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }
    return value.toLowerCase() === 'true';
  }

  getBackendPort(): number {
    return parseInt(process.env.BACKEND_PORT || '3001', 10);
  }

  getFrontendPort(): number {
    return parseInt(process.env.FRONTEND_PORT || '3000', 10);
  }

  getOpenAIModel(): string {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  getAnthropicModel(): string {
    return process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';
  }

  getLogLevel(): string {
    return process.env.LOG_LEVEL || 'info';
  }
}
