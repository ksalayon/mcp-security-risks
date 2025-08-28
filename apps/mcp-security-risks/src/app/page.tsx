'use client';

import { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { SecurityDashboard } from './components/SecurityDashboard';
import { Navigation } from './components/Navigation';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'security'>('chat');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
            MCP Security Risks Sandbox
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Test AI concepts and study MCP security risks in a safe, controlled environment
          </p>
          <div className="flex items-center justify-center mt-6 space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure Testing Environment</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Real-time Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Comprehensive Reports</span>
            </div>
          </div>
        </header>

        {/* Enhanced Navigation */}
        <div className="mb-8">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Main Content */}
        <main className="relative">
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === 'chat' && <ChatInterface />}
            {activeTab === 'security' && <SecurityDashboard />}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p>Built for educational and research purposes • MCP Security Testing Platform</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
