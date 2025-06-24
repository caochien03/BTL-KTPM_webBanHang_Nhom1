#!/bin/bash

echo "🚀 Starting Bookstore Backend Server..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    if command -v brew &> /dev/null; then
        echo "📱 Starting MongoDB with Homebrew..."
        brew services start mongodb-community || {
            echo "❌ Failed to start MongoDB with brew. Please start it manually:"
            echo "   brew services start mongodb-community"
            echo "   or mongod --config /usr/local/etc/mongod.conf"
            exit 1
        }
    else
        echo "❌ Please start MongoDB manually:"
        echo "   On macOS: brew services start mongodb-community"
        echo "   On Linux: sudo systemctl start mongod"
        echo "   Manual: mongod --dbpath /path/to/db"
        exit 1
    fi
fi

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 3

# Check if build exists
if [ ! -d "dist" ]; then
    echo "🔨 Building TypeScript..."
    npm run build
fi

# Start the server
echo "🌟 Starting server on port 3001..."
echo "📚 API Documentation: http://localhost:3001/api/v1/health"
echo "🎯 Admin Panel: Initialize at http://localhost:3001/api/v1/admin/init"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

npm run dev
