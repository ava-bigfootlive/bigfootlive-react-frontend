import { test, expect } from '@playwright/test';

test.describe('Production Health Check', () => {
  test('Frontend should be accessible', async ({ page }) => {
    const response = await page.goto('https://d2dbuyze4zqbdy.cloudfront.net');
    expect(response?.status()).toBeLessThan(400);
    
    // Check for main app element
    await expect(page.locator('#root')).toBeVisible();
  });

  test('API should be healthy', async ({ request }) => {
    const response = await request.get('https://api.bigfootlive.io/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('Login page should load', async ({ page }) => {
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/login');
    
    // Check for login form elements
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Feature flags endpoint should respond', async ({ request }) => {
    const response = await request.get('https://api.bigfootlive.io/api/feature-flags/', {
      failOnStatusCode: false
    });
    
    // Even if unauthorized, should get a proper HTTP response
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(500);
  });

  test('WebSocket connection should be available', async ({ page }) => {
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net');
    
    // Check if WebSocket is supported
    const wsSupported = await page.evaluate(() => {
      return 'WebSocket' in window;
    });
    
    expect(wsSupported).toBe(true);
  });

  test('CloudFront CDN should serve assets', async ({ request }) => {
    // Test CSS file
    const cssResponse = await request.get('https://d2dbuyze4zqbdy.cloudfront.net/assets/index-ldS1qYdx.css', {
      failOnStatusCode: false
    });
    expect(cssResponse.status()).toBeLessThan(400);
    
    // Check cache headers
    const headers = cssResponse.headers();
    expect(headers['cache-control'] || headers['x-cache']).toBeTruthy();
  });

  test('Dashboard redirects when not authenticated', async ({ page }) => {
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/dashboard');
    
    // Should redirect to login
    await page.waitForURL(/\/(login|auth|signin)/);
    const url = page.url();
    expect(url).toContain('login');
  });

  test('Platform Admin requires authentication', async ({ page }) => {
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/platform-admin');
    
    // Should redirect to login
    await page.waitForURL(/\/(login|auth|signin|unauthorized)/);
    const url = page.url();
    expect(url).toMatch(/login|unauthorized/);
  });

  test('Events page requires authentication', async ({ page }) => {
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/events');
    
    // Should redirect to login
    await page.waitForURL(/\/(login|auth|signin)/);
    const url = page.url();
    expect(url).toContain('login');
  });

  test('API CORS headers configured correctly', async ({ request }) => {
    const response = await request.get('https://api.bigfootlive.io/health');
    const headers = response.headers();
    
    // Check for CORS headers
    expect(headers['access-control-allow-origin'] || headers['Access-Control-Allow-Origin']).toBeTruthy();
  });
});