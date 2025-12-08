#!/bin/bash
set -e

echo "🚀 Starting Bitcoin Live Pro..."

# Install backend dependencies
cd backend
npm install
npm run start &
echo "✅ Backend running"

# Install frontend dependencies
cd ../frontend
npm install
npm run build
npx serve dist -l 4173
echo "🌐 Frontend running"
