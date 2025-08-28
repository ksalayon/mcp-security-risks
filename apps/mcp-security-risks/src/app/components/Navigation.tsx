interface NavigationProps {
  activeTab: 'chat' | 'security';
  onTabChange: (tab: 'chat' | 'security') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-2 border border-white/20">
      <div className="flex space-x-2">
        <button
          onClick={() => onTabChange('chat')}
          className={`flex-1 px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
          }`}
        >
          <div className="flex items-center justify-center space-x-3">
            <div className={`p-2 rounded-lg transition-colors ${
              activeTab === 'chat' ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-medium">AI Chat</div>
              <div className={`text-xs ${activeTab === 'chat' ? 'text-blue-100' : 'text-gray-400'}`}>
                Test AI interactions
              </div>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => onTabChange('security')}
          className={`flex-1 px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
          }`}
        >
          <div className="flex items-center justify-center space-x-3">
            <div className={`p-2 rounded-lg transition-colors ${
              activeTab === 'security' ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-medium">Security Testing</div>
              <div className={`text-xs ${activeTab === 'security' ? 'text-red-100' : 'text-gray-400'}`}>
                Vulnerability analysis
              </div>
            </div>
          </div>
        </button>
      </div>
    </nav>
  );
}

