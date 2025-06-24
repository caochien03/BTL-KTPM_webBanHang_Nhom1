#!/bin/bash

echo "🚀 Setting up Bookstore Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   On macOS: brew services start mongodb-community"
    echo "   On Linux: sudo systemctl start mongod"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Create public directories
echo "📁 Creating public directories..."
mkdir -p public/images/avatar
mkdir -p public/images/book
mkdir -p public/images/others

# Copy sample images if they exist
if [ -d "../backend/public/images" ]; then
    echo "📸 Copying sample images..."
    cp -r ../backend/public/images/* public/images/
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Start the server: npm run dev"
echo "   2. Initialize admin user: POST http://localhost:3001/api/v1/admin/init"
echo "   3. Seed sample data: POST http://localhost:3001/api/v1/admin/seed"
echo ""
echo "🌟 API will be available at: http://localhost:3001"
echo "📚 API Documentation:"
echo "   Health check: GET /api/v1/health"
echo "   Admin init: POST /api/v1/admin/init"
echo "   Login: POST /api/v1/auth/login"
