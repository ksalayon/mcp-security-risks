#!/bin/bash

# Development startup script with automatic port conflict resolution

echo "🚀 Starting MCP Security Risks Development Environment"

# Function to kill process on a port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "⚠️  Port $port is in use by PID $pid. Killing process..."
        kill -9 $pid
        sleep 2
        echo "✅ Process killed"
    fi
}

# Check and kill processes on required ports
echo "🔍 Checking for port conflicts..."
kill_port 3001  # Backend port
kill_port 3000  # Frontend port

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from example..."
    cp env.example .env.local
    echo "⚠️  Please edit .env.local and add your OpenAI API key"
fi

# Start the development environment
echo "🎯 Starting development servers..."
npm run dev

echo "✅ Development environment started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"

