'use client';

import { useState, useEffect } from 'react';

interface SecurityRisk {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  enabled: boolean;
}

interface TestResult {
  id: string;
  testScenarioId: string;
  riskCategory: string;
  success: boolean;
  detected: boolean;
  response: string;
  executionTime: number;
  timestamp: string;
}

interface SecurityReport {
  id: string;
  timestamp: string;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    detectedRisks: number;
    overallRiskLevel: string;
  };
  details: any[];
  recommendations: string[];
}

export function SecurityDashboard() {
  const [risks, setRisks] = useState<SecurityRisk[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);

  useEffect(() => {
    fetchSecurityRisks();
  }, []);

  const fetchSecurityRisks = async () => {
    try {
      const response = await fetch('/api/security/risks');
      if (!response.ok) throw new Error('Failed to fetch security risks');
      const data = await response.json();
      setRisks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch risks');
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/security/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runAll: true })
      });
      
      if (!response.ok) throw new Error('Failed to run security tests');
      
      const report: SecurityReport = await response.json();
      setSecurityReport(report);
      
      // Extract test results from the report
      const results: TestResult[] = [];
      report.details.forEach(detail => {
        results.push(...detail.testResults);
      });
      setTestResults(results);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run tests');
    } finally {
      setIsLoading(false);
    }
  };

  const runRiskTest = async (riskCategory: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/security/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskCategory })
      });
      
      if (!response.ok) throw new Error('Failed to run risk test');
      
      const results: TestResult[] = await response.json();
      setTestResults(prev => [...prev, ...results]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run risk test');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'bg-green-100 text-green-800';
      case 'low_risk': return 'bg-yellow-100 text-yellow-800';
      case 'medium_risk': return 'bg-orange-100 text-orange-800';
      case 'high_risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Security Testing Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Comprehensive testing for MCP security risks and vulnerabilities
            </p>
          </div>
          <button
            onClick={runAllTests}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Security Report */}
      {securityReport && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{securityReport.summary.totalTests}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{securityReport.summary.passedTests}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{securityReport.summary.failedTests}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{securityReport.summary.detectedRisks}</div>
              <div className="text-sm text-gray-600">Risks Detected</div>
            </div>
            <div className={`rounded-lg p-4 ${getStatusColor(securityReport.summary.overallRiskLevel)}`}>
              <div className="text-2xl font-bold capitalize">{securityReport.summary.overallRiskLevel.replace('_', ' ')}</div>
              <div className="text-sm">Overall Status</div>
            </div>
          </div>

          {securityReport.recommendations.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {securityReport.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Security Risks */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Security Risks</h3>
          <p className="text-sm text-gray-600 mt-1">
            Click on a risk to run specific tests
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {risks.map((risk) => (
              <div
                key={risk.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedRisk === risk.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRisk(risk.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{risk.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(risk.severity)}`}>
                    {risk.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    runRiskTest(risk.category);
                  }}
                  disabled={isLoading}
                  className="w-full px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Test Risk
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
            <p className="text-sm text-gray-600 mt-1">
              Recent security test results and findings
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.testScenarioId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.riskCategory}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        result.detected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {result.detected ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

