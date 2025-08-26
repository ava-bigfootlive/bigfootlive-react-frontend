#!/bin/bash

# BigFootLive React Frontend Deployment Script
# Deploys to S3 and invalidates CloudFront

set -e

# Configuration
S3_BUCKET="bigfootlive-web"
CLOUDFRONT_DISTRIBUTION_ID="E3JG7Y8Z7Y9Z9Z"
AWS_REGION="us-west-1"
BUILD_DIR="dist"

echo "🚀 Starting BigFootLive React Frontend Deployment..."

# Step 1: Build the application
echo "📦 Building application..."
npm run build

# Step 2: Sync to S3
echo "☁️ Uploading to S3..."
aws s3 sync $BUILD_DIR s3://$S3_BUCKET \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --exclude "*.json" \
  --region $AWS_REGION

# Upload HTML and JSON files with no cache
aws s3 sync $BUILD_DIR s3://$S3_BUCKET \
  --cache-control "no-cache, no-store, must-revalidate" \
  --include "index.html" \
  --include "*.json" \
  --exclude "*" \
  --region $AWS_REGION

# Step 3: Invalidate CloudFront
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*"

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://bigfootlive.io"