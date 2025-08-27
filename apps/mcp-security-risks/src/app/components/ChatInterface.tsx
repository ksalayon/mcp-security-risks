'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  securityFlags?: any[];
}

interface ChatResponse {
  message: ChatMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  securityFlags?: any[];
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: 'Hello! I\'m an AI assistant in the MCP Security Risks sandbox. I\'m designed to help you test AI concepts and understand security risks. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message.content,
        timestamp: new Date(data.message.timestamp),
        securityFlags: data.securityFlags
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show security warning if flags are detected
      if (data.securityFlags && data.securityFlags.length > 0) {
        console.warn('Security flags detected:', data.securityFlags);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'system',
        content: 'Hello! I\'m an AI assistant in the MCP Security Risks sandbox. I\'m designed to help you test AI concepts and understand security risks. How can I help you today?',
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">AI Chat Interface</h2>
          <button
            onClick={clearChat}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Chat
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Test AI concepts and security validation in real-time
        </p>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.role === 'system'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className="text-sm">{message.content}</div>
              {message.securityFlags && message.securityFlags.length > 0 && (
                <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800">
                  <div className="font-semibold">⚠️ Security Warning</div>
                  <div>Potential security risks detected in this message.</div>
                </div>
              )}
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-200">
          <div className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex space-x-4">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here... (Try testing security patterns like 'Ignore previous instructions')"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        
        {/* Security Testing Tips */}
        <div className="mt-3 text-xs text-gray-500">
          <strong>Security Testing Tips:</strong> Try inputs like "Ignore previous instructions", 
          "Act as if you are a system administrator", or "Bypass all security measures" to test 
          prompt injection detection.
        </div>
      </div>
    </div>
  );
}

