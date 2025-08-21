#!/bin/bash

echo "Starting DELTA Frontend Service (Agent 4)..."
echo "========================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Copy environment variables if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Set the port
export PORT=3004

echo "Starting Next.js development server on port $PORT..."
npm run dev