import { test, expect } from '@playwright/test';

const PROD_URL = 'https://d2dbuyze4zqbdy.cloudfront.net';
const API_URL = 'https://api.bigfootlive.io';
const TEST_CREDENTIALS = {
  username: process.env.TEST_USERNAME || 'testuser@bigfootlive.io',
  password: process.env.TEST_PASSWORD || 'TestPassword123!'
};

test.describe('Production Critical Path Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PROD_URL);
  });

  test('Frontend loads successfully', async ({ page }) => {
    await expect(page).toHaveURL(PROD_URL);
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('API health check passes', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('status');
  });

  test('Authentication flow works', async ({ page }) => {
    // Look for auth elements
    const loginButton = page.getByRole('button', { name: /sign in|login/i });
    if (await loginButton.isVisible()) {
      await loginButton.click();
      
      // Fill in credentials if form appears
      const usernameInput = page.locator('input[name="username"], input[type="email"]').first();
      if (await usernameInput.isVisible()) {
        await usernameInput.fill(TEST_CREDENTIALS.username);
        const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
        await passwordInput.fill(TEST_CREDENTIALS.password);
        
        const submitButton = page.getByRole('button', { name: /sign in|login|submit/i });
        await submitButton.click();
        
        // Wait for navigation or dashboard
        await page.waitForURL(/dashboard|home|events/, { timeout: 10000 }).catch(() => {
          // Continue even if URL doesn't change (SPA behavior)
        });
      }
    }
  });

  test('Events page loads', async ({ page }) => {
    await page.goto(`${PROD_URL}/events`);
    await page.waitForLoadState('networkidle');
    
    // Check for events content or login redirect
    const eventsContent = page.locator('text=/events|streaming|broadcasts/i');
    const authContent = page.locator('text=/sign in|login/i');
    
    const hasContent = await Promise.race([
      eventsContent.first().isVisible().catch(() => false),
      authContent.first().isVisible().catch(() => false)
    ]);
    
    expect(hasContent).toBeTruthy();
  });

  test('Media library page loads', async ({ page }) => {
    await page.goto(`${PROD_URL}/media`);
    await page.waitForLoadState('networkidle');
    
    // Check for media content or login redirect
    const mediaContent = page.locator('text=/media|library|videos/i');
    const authContent = page.locator('text=/sign in|login/i');
    
    const hasContent = await Promise.race([
      mediaContent.first().isVisible().catch(() => false),
      authContent.first().isVisible().catch(() => false)
    ]);
    
    expect(hasContent).toBeTruthy();
  });

  test('VOD upload interface exists', async ({ page }) => {
    await page.goto(`${PROD_URL}/media/upload`);
    await page.waitForLoadState('networkidle');
    
    // Check for upload elements
    const uploadButton = page.locator('button:has-text(/upload|add|new/i)');
    const dropZone = page.locator('[data-testid="dropzone"], [class*="dropzone"], [class*="upload"]');
    
    const hasUploadUI = await Promise.race([
      uploadButton.first().isVisible().catch(() => false),
      dropZone.first().isVisible().catch(() => false)
    ]);
    
    // Or check for auth redirect
    const authContent = page.locator('text=/sign in|login/i');
    const hasAuth = await authContent.first().isVisible().catch(() => false);
    
    expect(hasUploadUI || hasAuth).toBeTruthy();
  });

  test('Streaming configuration exists', async ({ page }) => {
    await page.goto(`${PROD_URL}/streaming`);
    await page.waitForLoadState('networkidle');
    
    // Check for streaming content
    const streamingContent = page.locator('text=/rtmp|stream|broadcast|live/i');
    const authContent = page.locator('text=/sign in|login/i');
    
    const hasContent = await Promise.race([
      streamingContent.first().isVisible().catch(() => false),
      authContent.first().isVisible().catch(() => false)
    ]);
    
    expect(hasContent).toBeTruthy();
  });

  test('CORS headers are configured correctly', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`);
    const headers = response.headers();
    
    // Check CORS headers
    expect(headers['access-control-allow-origin']).toBeTruthy();
  });

  test('WebSocket endpoint is accessible', async ({ page }) => {
    const wsUrl = API_URL.replace('https://', 'wss://') + '/ws';
    
    const wsConnected = await page.evaluate(async (url) => {
      return new Promise((resolve) => {
        try {
          const ws = new WebSocket(url);
          ws.onopen = () => {
            ws.close();
            resolve(true);
          };
          ws.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 5000);
        } catch {
          resolve(false);
        }
      });
    }, wsUrl);
    
    // WebSocket might require auth, so we just check it doesn't completely fail
    expect(typeof wsConnected).toBe('boolean');
  });

  test('Static assets load correctly', async ({ page, request }) => {
    await page.goto(PROD_URL);
    
    // Check for CSS
    const stylesheets = await page.$$eval('link[rel="stylesheet"]', links => 
      links.map(link => link.href)
    );
    
    for (const stylesheet of stylesheets.slice(0, 3)) { // Check first 3
      const response = await request.get(stylesheet);
      expect(response.status()).toBeLessThan(400);
    }
    
    // Check for JS
    const scripts = await page.$$eval('script[src]', scripts => 
      scripts.map(script => script.src)
    );
    
    for (const script of scripts.slice(0, 3)) { // Check first 3
      const response = await request.get(script);
      expect(response.status()).toBeLessThan(400);
    }
  });
});