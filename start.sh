#!/bin/bash
set -e

echo "🚀 Starting Bitcoin Live Pro..."

######################################
# 1) BACKEND
######################################
echo "📦 Installing backend dependencies..."
cd backend
npm install --force

echo "▶️ Starting backend..."
npm start &
BACKEND_PID=$!
echo "✅ Backend running on PID $BACKEND_PID"

######################################
# 2) FRONTEND
######################################
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install --force

echo "🏗 Building frontend..."
npm run build

echo "🌐 Starting frontend server..."
# Railway does NOT have "serve" installed globally → use local version
npx serve -s dist -l 4173

