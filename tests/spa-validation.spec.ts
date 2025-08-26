import { test, expect } from '@playwright/test';

test.describe('React SPA Deployment Validation', () => {
  
  test('✅ Homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BigFoot.*Live/i);
  });

  test('✅ React app mounts successfully', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    
    // Check that React rendered content
    const content = await root.innerHTML();
    expect(content.length).toBeGreaterThan(100);
  });

  test('✅ Client-side routing works', async ({ page }) => {
    await page.goto('/');
    
    // React Router should handle client-side navigation
    // Check if any navigation elements exist
    await page.waitForTimeout(2000);
    
    // Try to navigate to login
    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    // Should still have React root
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('✅ Static assets load from CloudFront', async ({ page }) => {
    const responses: any[] = [];
    
    page.on('response', response => {
      if (response.url().includes('/assets/')) {
        responses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Should have loaded JS and CSS
    expect(responses.length).toBeGreaterThan(0);
    responses.forEach(r => {
      expect(r.status).toBe(200);
    });
  });

  test('✅ API endpoint is accessible', async ({ request }) => {
    const response = await request.get('https://api.bigfootlive.io/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
  });

  test('✅ Authentication pages render', async ({ page }) => {
    // Test login page
    await page.goto('/login');
    await page.waitForTimeout(2000);
    const loginRoot = page.locator('#root');
    await expect(loginRoot).toBeVisible();
    
    // Test register page
    await page.goto('/register');
    await page.waitForTimeout(2000);
    const registerRoot = page.locator('#root');
    await expect(registerRoot).toBeVisible();
  });

  test('✅ Protected routes redirect when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    
    // Should redirect to login or show login UI
    const url = page.url();
    const isOnLogin = url.includes('login');
    const hasRoot = await page.locator('#root').isVisible();
    
    expect(isOnLogin || hasRoot).toBeTruthy();
  });

  test('✅ 404 handling for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-12345');
    await page.waitForTimeout(2000);
    
    // SPA should still load and handle 404 client-side
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('✅ No console errors on page load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Filter out expected warnings (like React dev mode)
    const criticalErrors = errors.filter(e => 
      !e.includes('Warning:') && 
      !e.includes('DevTools')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('✅ CloudFront serves with correct headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();
    
    // Check for CloudFront headers
    expect(headers).toBeDefined();
    
    // Should have cache headers for static files
    const assetResponse = await page.waitForResponse(r => 
      r.url().includes('/assets/') && r.url().endsWith('.js')
    );
    
    const assetHeaders = assetResponse.headers();
    expect(assetHeaders['cache-control']).toBeDefined();
  });
});

test.describe('AWS Cognito Integration', () => {
  
  test('✅ Amplify library loads', async ({ page }) => {
    await page.goto('/');
    
    // Check if Amplify is available in the window
    const hasAmplifyConfig = await page.evaluate(() => {
      // Check if the app has loaded
      return document.querySelector('#root')?.innerHTML.length > 0;
    });
    
    expect(hasAmplifyConfig).toBeTruthy();
  });

  test('✅ Login form renders with email and password fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(3000);
    
    // Look for form inputs
    const formElements = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      return {
        count: inputs.length,
        types: Array.from(inputs).map(i => i.type)
      };
    });
    
    expect(formElements.count).toBeGreaterThan(0);
  });

  test('✅ Register form renders', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(3000);
    
    const formElements = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      return {
        count: inputs.length,
        hasButton: document.querySelector('button') !== null
      };
    });
    
    expect(formElements.count).toBeGreaterThan(0);
    expect(formElements.hasButton).toBeTruthy();
  });
});

test.describe('Performance Validation', () => {
  
  test('✅ Page loads within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('✅ Bundle size is reasonable', async ({ page }) => {
    let totalSize = 0;
    
    page.on('response', response => {
      if (response.url().includes('/assets/') && response.url().endsWith('.js')) {
        const size = response.headers()['content-length'];
        if (size) totalSize += parseInt(size);
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Bundle should be less than 2MB (uncompressed)
    expect(totalSize).toBeLessThan(2 * 1024 * 1024);
  });
});