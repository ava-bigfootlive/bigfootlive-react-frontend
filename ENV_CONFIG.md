# Environment Configuration Guide

## Overview
This project uses different environment configurations for development and production. 
**IMPORTANT**: Always ensure you're building with the correct environment to avoid deploying development configurations to production.

## Environment Files
- `.env` - Base configuration (shared across all environments)
- `.env.development` - Development-specific config (localhost URLs)
- `.env.production` - Production-specific config (production URLs)
- `.env.local` - Local overrides (not committed to git)

## Build Commands

### Development
```bash
npm run dev              # Start dev server (uses .env.development)
npm run build:dev        # Build for development (rarely needed)
```

### Production
```bash
npm run build            # Build for production (ALWAYS use for deployments)
npm run build:prod       # Alias for production build
```

## Deployment

### Automated Deployment (Recommended)
```bash
./scripts/deploy.sh      # Builds and deploys to production
```

This script:
- Ensures production build mode
- Verifies no localhost URLs in build
- Deploys to S3
- Invalidates CloudFront cache

### Manual Deployment
```bash
# 1. Clean build directory
rm -rf dist

# 2. Build for production
npm run build

# 3. Verify build (no localhost URLs)
grep -q "localhost" dist/assets/index-*.js && echo "ERROR: Contains localhost!" || echo "OK"

# 4. Deploy to S3
aws s3 sync dist/ s3://frontend-static.bigfootlive.io/ --delete \
  --cache-control "public, max-age=31536000" --exclude "index.html"

aws s3 cp dist/index.html s3://frontend-static.bigfootlive.io/ \
  --cache-control "no-cache"

# 5. Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id E32A45QZSND4OL --paths "/*"
```

## API URLs by Environment

### Development (.env.development)
- API: `http://localhost:8000`
- WebSocket: `ws://localhost:8000`
- RTMP: `rtmp://localhost:1935/live`
- HLS: `http://localhost:8080/hls`

### Production (.env.production)
- API: `https://api.bigfootlive.io`
- WebSocket: `wss://api.bigfootlive.io`
- RTMP: `rtmp://54.193.184.188:1935/live`
- HLS: `http://54.193.184.188:8080/hls`
- CloudFront: `https://d2dbuyze4zqbdy.cloudfront.net`

## Common Issues

### Wrong API URL in Production
**Symptom**: Console shows `localhost:8000` errors in production
**Cause**: Built with development mode
**Fix**: 
```bash
npm run build        # Always use this for production
./scripts/deploy.sh  # Or use the deployment script
```

### Changes Not Appearing
**Symptom**: Deployed but changes not visible
**Cause**: CloudFront cache or browser cache
**Fix**:
```bash
# Force CloudFront invalidation
aws cloudfront create-invalidation --distribution-id E32A45QZSND4OL --paths "/*"

# In browser: Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
```

## Best Practices

1. **Always use `npm run build` for production deployments**
2. **Use the deployment script `./scripts/deploy.sh` to avoid mistakes**
3. **Never commit `.env.local` to git**
4. **Test locally with `npm run dev` before deploying**
5. **Verify API URLs after building but before deploying**

## Branch Strategy

Currently working directly on `main`. For safer deployments:

1. Create feature branches for development
2. Test on feature branch
3. Merge to main only when ready for production
4. Deploy from main branch only

## Emergency Rollback

If a bad deployment occurs:
```bash
# 1. Checkout last known good commit
git log --oneline -10  # Find good commit
git checkout <commit-hash>

# 2. Rebuild and deploy
./scripts/deploy.sh

# 3. Fix the issue on a branch
git checkout main
git checkout -b fix/deployment-issue
# ... make fixes ...
git commit -am "Fix deployment issue"
git checkout main
git merge fix/deployment-issue
```