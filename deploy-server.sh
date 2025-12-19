#!/bin/bash

# Deployment script for VibeStudy server
# This script handles conflicts and deploys the latest version

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/vibestudy || exit 1

# Stash any local changes to package-lock.json
echo "📦 Stashing local changes..."
git checkout -- package-lock.json

# Pull latest changes
echo "⬇️ Pulling latest changes from main..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart vibestudy

echo "✅ Deployment completed successfully!"
pm2 status
