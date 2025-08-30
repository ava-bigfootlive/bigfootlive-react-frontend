#!/bin/bash
set -e

echo "Building application..."
npm run build

echo "Syncing to S3..."
# Upload everything except index.html first
aws s3 sync dist/ s3://frontend-static.bigfootlive.io --exclude "index.html" --delete

# Upload index.html with no-cache headers
aws s3 cp dist/index.html s3://frontend-static.bigfootlive.io/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id E32A45QZSND4OL \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text

echo "Deployment complete!"
