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
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'bg-green-100 text-green-800 border-green-200';
      case 'low_risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium_risk': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high_risk': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Security Testing Dashboard
              </h2>
              <p className="text-gray-600 mt-2 text-lg">
                Comprehensive testing for MCP security risks and vulnerabilities
              </p>
            </div>
          </div>
          <button
            onClick={runAllTests}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <div className="flex items-center space-x-3">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              <span>{isLoading ? 'Running Tests...' : 'Run All Tests'}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center space-x-4 text-red-800">
            <div className="p-3 bg-red-100 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-lg">Error</div>
              <div className="text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Security Report */}
      {securityReport && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Security Report</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="text-3xl font-bold text-gray-900 mb-2">{securityReport.summary.totalTests}</div>
              <div className="text-sm text-gray-600 font-medium">Total Tests</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">{securityReport.summary.passedTests}</div>
              <div className="text-sm text-gray-600 font-medium">Passed</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
              <div className="text-3xl font-bold text-red-600 mb-2">{securityReport.summary.failedTests}</div>
              <div className="text-sm text-gray-600 font-medium">Failed</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">{securityReport.summary.detectedRisks}</div>
              <div className="text-sm text-gray-600 font-medium">Risks Detected</div>
            </div>
            <div className={`rounded-2xl p-6 border ${getStatusColor(securityReport.summary.overallRiskLevel)}`}>
              <div className="text-3xl font-bold capitalize mb-2">{securityReport.summary.overallRiskLevel.replace('_', ' ')}</div>
              <div className="text-sm font-medium">Overall Status</div>
            </div>
          </div>

          {securityReport.recommendations.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Recommendations</h4>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <ul className="space-y-3 text-gray-700">
                  {securityReport.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Security Risks */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-200 rounded-xl">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Security Risks</h3>
              <p className="text-gray-600">
                Click on a risk to run specific tests
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {risks.map((risk) => (
              <div
                key={risk.id}
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedRisk === risk.id ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg'
                }`}
                onClick={() => setSelectedRisk(risk.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-bold text-gray-900 text-lg">{risk.name}</h4>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getSeverityColor(risk.severity)}`}>
                    {risk.severity}
                  </span>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">{risk.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    runRiskTest(risk.category);
                  }}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:from-gray-200 hover:to-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Test Risk</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-200 rounded-xl">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Test Results</h3>
                <p className="text-gray-600">
                  Recent security test results and findings
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Test
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Detected
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.testScenarioId}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.riskCategory}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        result.success ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {result.success ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        result.detected ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200'
                      }`}>
                        {result.detected ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
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

