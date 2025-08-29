#!/bin/bash

# BigFootLive React Frontend Deployment Script
# This script ensures production builds are deployed correctly

set -e  # Exit on error

echo "🚀 Starting BigFootLive production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
S3_BUCKET="frontend-static.bigfootlive.io"
CLOUDFRONT_DISTRIBUTION_ID="E32A45QZSND4OL"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}Warning: You're not on the main branch (current: $CURRENT_BRANCH)${NC}"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 1
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    git status --short
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 1
    fi
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build for production
echo "🔨 Building for production..."
npm run build:prod

# Verify the build used production config
if grep -q "localhost:8000" dist/assets/index-*.js 2>/dev/null; then
    echo -e "${RED}ERROR: Build contains localhost URLs! Build failed.${NC}"
    echo "Make sure you're using 'npm run build:prod' or 'npm run build'"
    exit 1
fi

# Check if API URL is correct
if ! grep -q "api.bigfootlive.io" dist/assets/index-*.js 2>/dev/null; then
    echo -e "${YELLOW}Warning: Build doesn't contain production API URL${NC}"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 1
    fi
fi

# Deploy to S3
echo "📦 Deploying to S3..."
aws s3 sync dist/ s3://${S3_BUCKET}/ \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://${S3_BUCKET}/ \
    --cache-control "no-cache"

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo "CloudFront Invalidation ID: ${INVALIDATION_ID}"
echo "URL: https://d2dbuyze4zqbdy.cloudfront.net"
echo ""
echo "Note: CloudFront invalidation may take a few minutes to complete."