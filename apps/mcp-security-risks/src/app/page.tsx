'use client';

import { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { SecurityDashboard } from './components/SecurityDashboard';
import { Navigation } from './components/Navigation';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'security'>('chat');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            MCP Security Risks Sandbox
          </h1>
          <p className="text-lg text-gray-600">
            Test AI concepts and study MCP security risks in a safe environment
          </p>
        </header>

        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="mt-8">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'security' && <SecurityDashboard />}
        </main>
      </div>
    </div>
  );
}
