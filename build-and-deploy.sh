#!/bin/bash

# Build and deploy script with nvm
set -e

echo "🚀 Starting deployment process..."

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node 20
echo "📦 Setting up Node.js 20..."
nvm install 20
nvm use 20
nvm alias default 20

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Navigate to project
cd /home/ava-io/repos/bigfootlive-react-frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the project
echo "🔨 Building production bundle..."
npm run build

# Check if build succeeded
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    ls -la dist/
    
    # Deploy to S3
    echo "☁️ Deploying to AWS S3..."
    
    # Get the correct CloudFront distribution ID
    DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, 'bigfootlive')].Id" --output text --region us-west-1)
    
    if [ -z "$DIST_ID" ]; then
        echo "❌ Could not find CloudFront distribution"
        exit 1
    fi
    
    echo "Found CloudFront distribution: $DIST_ID"
    
    # Sync to S3
    aws s3 sync dist/ s3://bigfootlive-web/ \
        --delete \
        --region us-west-1 \
        --cache-control "public, max-age=31536000" \
        --exclude "index.html" \
        --exclude "*.json"
    
    # Upload HTML with no-cache
    aws s3 cp dist/index.html s3://bigfootlive-web/index.html \
        --region us-west-1 \
        --cache-control "no-cache, no-store, must-revalidate" \
        --content-type "text/html"
    
    # Invalidate CloudFront
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id $DIST_ID \
        --paths "/*" \
        --region us-west-1
    
    echo "✅ Deployment complete!"
    echo "🌐 Your shadcn UI is live at: https://d39hsmqppuzm82.cloudfront.net"
else
    echo "❌ Build failed - dist directory not found"
    exit 1
fi