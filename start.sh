#!/bin/bash
set -e

echo "🚀 Starting Bitcoin Live Pro..."

# Install backend dependencies
cd backend
npm install --production
npm run start &

echo "✅ Backend running"

# Build frontend
cd ../frontend
npm install
npm run build

# Serve frontend on port 4173
npm install -g serve
serve -s dist -l 4173


