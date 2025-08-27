// Common types and interfaces for the MCP Security Risks project

export interface SecurityRisk {
  id: string;
  name: string;
  description: string;
  category: SecurityRiskCategory;
  severity: SecurityRiskSeverity;
  mitigation: string;
  testScenarios: TestScenario[];
  enabled: boolean;
}

export enum SecurityRiskCategory {
  PROMPT_INJECTION = 'prompt_injection',
  TOOL_POISONING = 'tool_poisoning',
  PRIVILEGE_ABUSE = 'privilege_abuse',
  TOOL_SHADOWING = 'tool_shadowing',
  INDIRECT_INJECTION = 'indirect_injection',
  DATA_EXPOSURE = 'data_exposure',
  CODE_INJECTION = 'code_injection',
  RUG_PULL = 'rug_pull',
  DENIAL_OF_SERVICE = 'denial_of_service',
  AUTH_BYPASS = 'auth_bypass'
}

export enum SecurityRiskSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  payload: string;
  expectedBehavior: string;
  riskLevel: SecurityRiskSeverity;
  enabled: boolean;
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  version: string;
  metadata: MCPToolMetadata;
  securityLevel: SecurityLevel;
  enabled: boolean;
}

export interface MCPToolMetadata {
  author: string;
  repository?: string;
  license?: string;
  permissions: string[];
  capabilities: string[];
  validationRules: ValidationRule[];
}

export enum SecurityLevel {
  TRUSTED = 'trusted',
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  SUSPICIOUS = 'suspicious',
  MALICIOUS = 'malicious'
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  severity: SecurityRiskSeverity;
  enabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  securityFlags?: SecurityFlag[];
}

export interface SecurityFlag {
  type: SecurityRiskCategory;
  severity: SecurityRiskSeverity;
  description: string;
  detectedAt: Date;
  mitigated: boolean;
}

export interface TestResult {
  id: string;
  testScenarioId: string;
  riskCategory: SecurityRiskCategory;
  success: boolean;
  detected: boolean;
  response: string;
  executionTime: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SecurityReport {
  id: string;
  timestamp: Date;
  summary: SecuritySummary;
  details: SecurityDetail[];
  recommendations: string[];
}

export interface SecuritySummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  detectedRisks: number;
  overallRiskLevel: SecurityRiskSeverity;
}

export interface SecurityDetail {
  riskCategory: SecurityRiskCategory;
  testResults: TestResult[];
  riskLevel: SecurityRiskSeverity;
  mitigationStatus: 'implemented' | 'partial' | 'not_implemented';
}

// Utility functions
export function sanitizeInput(input: string): string {
  // Basic input sanitization
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function validatePrompt(prompt: string): { isValid: boolean; flags: SecurityFlag[] } {
  const flags: SecurityFlag[] = [];
  let isValid = true;

  // Check for potential prompt injection patterns
  const injectionPatterns = [
    /ignore previous instructions/i,
    /forget everything/i,
    /system prompt/i,
    /roleplay as/i,
    /act as if/i,
    /pretend to be/i,
    /bypass/i,
    /override/i
  ];

  injectionPatterns.forEach((pattern, index) => {
    if (pattern.test(prompt)) {
      flags.push({
        type: SecurityRiskCategory.PROMPT_INJECTION,
        severity: SecurityRiskSeverity.HIGH,
        description: `Potential prompt injection detected: ${pattern.source}`,
        detectedAt: new Date(),
        mitigated: false
      });
      isValid = false;
    }
  });

  return { isValid, flags };
}

export function validateMCPTool(tool: MCPTool): { isValid: boolean; flags: SecurityFlag[] } {
  const flags: SecurityFlag[] = [];
  let isValid = true;

  // Check for suspicious permissions
  const suspiciousPermissions = [
    'file_system_write',
    'network_access',
    'system_command',
    'database_access',
    'environment_variables'
  ];

  suspiciousPermissions.forEach(permission => {
    if (tool.metadata.permissions.includes(permission)) {
      flags.push({
        type: SecurityRiskCategory.PRIVILEGE_ABUSE,
        severity: SecurityRiskSeverity.MEDIUM,
        description: `Suspicious permission detected: ${permission}`,
        detectedAt: new Date(),
        mitigated: false
      });
    }
  });

  // Check for unverified tools
  if (tool.securityLevel === SecurityLevel.UNVERIFIED || tool.securityLevel === SecurityLevel.SUSPICIOUS) {
    flags.push({
      type: SecurityRiskCategory.TOOL_SHADOWING,
      severity: SecurityRiskSeverity.HIGH,
      description: `Unverified or suspicious tool: ${tool.name}`,
      detectedAt: new Date(),
      mitigated: false
    });
    isValid = false;
  }

  return { isValid, flags };
}

export function generateSecurityReport(testResults: TestResult[]): SecurityReport {
  const riskCategories = Object.values(SecurityRiskCategory);
  const details: SecurityDetail[] = [];
  let totalTests = testResults.length;
  let passedTests = 0;
  let failedTests = 0;
  let detectedRisks = 0;

  riskCategories.forEach(category => {
    const categoryResults = testResults.filter(result => result.riskCategory === category);
    if (categoryResults.length > 0) {
      const passed = categoryResults.filter(result => result.success).length;
      const failed = categoryResults.filter(result => !result.success).length;
      const detected = categoryResults.filter(result => result.detected).length;

      passedTests += passed;
      failedTests += failed;
      detectedRisks += detected;

      details.push({
        riskCategory: category,
        testResults: categoryResults,
        riskLevel: detected > 0 ? SecurityRiskSeverity.HIGH : SecurityRiskSeverity.LOW,
        mitigationStatus: detected > 0 ? 'not_implemented' : 'implemented'
      });
    }
  });

  const overallRiskLevel = detectedRisks > 0 ? SecurityRiskSeverity.HIGH : SecurityRiskSeverity.LOW;

  const recommendations = [];
  if (detectedRisks > 0) {
    recommendations.push('Implement additional security measures for detected risks');
    recommendations.push('Review and update mitigation strategies');
    recommendations.push('Consider implementing additional monitoring');
  } else {
    recommendations.push('Continue monitoring for new security threats');
    recommendations.push('Regularly update security measures');
  }

  return {
    id: `report_${Date.now()}`,
    timestamp: new Date(),
    summary: {
      totalTests,
      passedTests,
      failedTests,
      detectedRisks,
      overallRiskLevel
    },
    details,
    recommendations
  };
}

export function createTestScenario(
  id: string,
  name: string,
  description: string,
  payload: string,
  expectedBehavior: string,
  riskLevel: SecurityRiskSeverity,
  enabled: boolean = true
): TestScenario {
  return {
    id,
    name,
    description,
    payload,
    expectedBehavior,
    riskLevel,
    enabled
  };
}

export function createSecurityRisk(
  id: string,
  name: string,
  description: string,
  category: SecurityRiskCategory,
  severity: SecurityRiskSeverity,
  mitigation: string,
  testScenarios: TestScenario[] = [],
  enabled: boolean = true
): SecurityRisk {
  return {
    id,
    name,
    description,
    category,
    severity,
    mitigation,
    testScenarios,
    enabled
  };
}
