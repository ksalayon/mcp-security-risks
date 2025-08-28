import { Injectable, Logger } from '@nestjs/common';
import { SecurityTestEngine } from '@mcp-security-risks/security-tests';
import { SecurityRisk, SecurityRiskCategory, TestResult, SecurityReport, SecurityRiskSeverity } from '@mcp-security-risks/shared';
import { ConfigService } from './config.service';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly testEngine: SecurityTestEngine;

  constructor(private readonly configService: ConfigService) {
    this.testEngine = new SecurityTestEngine();
  }

  async getSecurityRisks(): Promise<SecurityRisk[]> {
    try {
      const risks = this.testEngine.getSecurityRisks();
      this.logger.log(`Retrieved ${risks.length} security risks`);
      return risks;
    } catch (error) {
      this.logger.error(`Error retrieving security risks: ${error.message}`, error.stack);
      throw new Error(`Failed to retrieve security risks: ${error.message}`);
    }
  }

  async runAllTests(): Promise<SecurityReport> {
    try {
      if (!this.configService.isFeatureEnabled('enableSecurityTests')) {
        this.logger.warn('Security tests are disabled via feature flag');
        return {
          id: 'disabled',
          summary: {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            detectedRisks: 0,
            overallRiskLevel: SecurityRiskSeverity.LOW
          },
          details: [],
          recommendations: ['Enable security tests via ENABLE_SECURITY_TESTS feature flag'],
          timestamp: new Date()
        };
      }

      this.logger.log('Starting comprehensive security test suite');
      const report = await this.testEngine.runAllTests();
      this.logger.log(`Security test completed. Detected risks: ${report.summary.detectedRisks}`);
      return report;
    } catch (error) {
      this.logger.error(`Error running security tests: ${error.message}`, error.stack);
      throw new Error(`Failed to run security tests: ${error.message}`);
    }
  }

  async runRiskTests(riskCategory: string): Promise<TestResult[]> {
    try {
      // Check if security tests are enabled
      if (!this.configService.isFeatureEnabled('enableSecurityTests')) {
        this.logger.warn('Security tests are disabled via feature flag');
        return [];
      }

      // Check if specific risk category is enabled
      const featureFlag = this.getFeatureFlagForRisk(riskCategory);
      if (featureFlag && !this.configService.isFeatureEnabled(featureFlag)) {
        this.logger.warn(`Risk category ${riskCategory} is disabled via feature flag`);
        return [];
      }

      this.logger.log(`Running security tests for category: ${riskCategory}`);
      
      // Map string to enum
      const category = this.mapStringToRiskCategory(riskCategory);
      const results = await this.testEngine.runRiskTests(category);
      
      this.logger.log(`Completed ${results.length} tests for ${riskCategory}`);
      return results;
    } catch (error) {
      this.logger.error(`Error running risk tests: ${error.message}`, error.stack);
      throw new Error(`Failed to run risk tests: ${error.message}`);
    }
  }

  async getSecurityStatus(): Promise<any> {
    try {
      const risks = this.testEngine.getSecurityRisks();
      const results = this.testEngine.getTestResults();
      
      const status = {
        timestamp: new Date().toISOString(),
        totalRisks: risks.length,
        enabledRisks: risks.filter(r => r.enabled).length,
        totalTests: results.length,
        passedTests: results.filter(r => r.success).length,
        failedTests: results.filter(r => !r.success).length,
        detectedRisks: results.filter(r => r.detected).length,
        overallStatus: this.calculateOverallStatus(results)
      };

      this.logger.log(`Security status retrieved: ${status.overallStatus}`);
      return status;
    } catch (error) {
      this.logger.error(`Error getting security status: ${error.message}`, error.stack);
      throw new Error(`Failed to get security status: ${error.message}`);
    }
  }

  async getTestResults(): Promise<TestResult[]> {
    try {
      const results = this.testEngine.getTestResults();
      this.logger.log(`Retrieved ${results.length} test results`);
      return results;
    } catch (error) {
      this.logger.error(`Error retrieving test results: ${error.message}`, error.stack);
      throw new Error(`Failed to retrieve test results: ${error.message}`);
    }
  }

  async clearTestResults(): Promise<void> {
    try {
      this.testEngine.clearResults();
      this.logger.log('Test results cleared');
    } catch (error) {
      this.logger.error(`Error clearing test results: ${error.message}`, error.stack);
      throw new Error(`Failed to clear test results: ${error.message}`);
    }
  }

  private mapStringToRiskCategory(category: string): SecurityRiskCategory {
    const categoryMap: Record<string, SecurityRiskCategory> = {
      'prompt_injection': SecurityRiskCategory.PROMPT_INJECTION,
      'tool_poisoning': SecurityRiskCategory.TOOL_POISONING,
      'privilege_abuse': SecurityRiskCategory.PRIVILEGE_ABUSE,
      'tool_shadowing': SecurityRiskCategory.TOOL_SHADOWING,
      'indirect_injection': SecurityRiskCategory.INDIRECT_INJECTION,
      'data_exposure': SecurityRiskCategory.DATA_EXPOSURE,
      'code_injection': SecurityRiskCategory.CODE_INJECTION,
      'rug_pull': SecurityRiskCategory.RUG_PULL,
      'denial_of_service': SecurityRiskCategory.DENIAL_OF_SERVICE,
      'auth_bypass': SecurityRiskCategory.AUTH_BYPASS
    };

    const mappedCategory = categoryMap[category.toLowerCase()];
    if (!mappedCategory) {
      throw new Error(`Unknown security risk category: ${category}`);
    }

    return mappedCategory;
  }

  private calculateOverallStatus(results: TestResult[]): string {
    if (results.length === 0) {
      return 'unknown';
    }

    const detectedRisks = results.filter(r => r.detected).length;
    const totalTests = results.length;

    if (detectedRisks === 0) {
      return 'secure';
    } else if (detectedRisks < totalTests * 0.3) {
      return 'low_risk';
    } else if (detectedRisks < totalTests * 0.7) {
      return 'medium_risk';
    } else {
      return 'high_risk';
    }
  }

  private getFeatureFlagForRisk(riskCategory: string): keyof import('./config.service').FeatureFlags | null {
    const riskToFlagMap: Record<string, keyof import('./config.service').FeatureFlags> = {
      'prompt_injection': 'enablePromptInjectionTests',
      'tool_poisoning': 'enableToolPoisoningTests',
      'privilege_abuse': 'enablePrivilegeAbuseTests',
      'tool_shadowing': 'enableToolShadowingTests',
      'indirect_injection': 'enableIndirectInjectionTests',
      'data_exposure': 'enableDataExposureTests',
      'code_injection': 'enableCodeInjectionTests',
      'rug_pull': 'enableRugPullTests',
      'denial_of_service': 'enableDenialOfServiceTests',
      'auth_bypass': 'enableAuthBypassTests'
    };

    return riskToFlagMap[riskCategory.toLowerCase()] || null;
  }

  async getRiskDetails(riskId: string): Promise<SecurityRisk | null> {
    try {
      const risks = this.testEngine.getSecurityRisks();
      const risk = risks.find(r => r.id === riskId);
      
      if (risk) {
        this.logger.log(`Retrieved details for risk: ${riskId}`);
        return risk;
      } else {
        this.logger.warn(`Risk not found: ${riskId}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error retrieving risk details: ${error.message}`, error.stack);
      throw new Error(`Failed to retrieve risk details: ${error.message}`);
    }
  }

  async enableRisk(riskId: string): Promise<void> {
    try {
      // In a real implementation, this would update the risk configuration
      this.logger.log(`Risk enabled: ${riskId}`);
    } catch (error) {
      this.logger.error(`Error enabling risk: ${error.message}`, error.stack);
      throw new Error(`Failed to enable risk: ${error.message}`);
    }
  }

  async disableRisk(riskId: string): Promise<void> {
    try {
      // In a real implementation, this would update the risk configuration
      this.logger.log(`Risk disabled: ${riskId}`);
    } catch (error) {
      this.logger.error(`Error disabling risk: ${error.message}`, error.stack);
      throw new Error(`Failed to disable risk: ${error.message}`);
    }
  }

  async getFeatureFlags() {
    return this.configService.getFeatureFlags();
  }
}

