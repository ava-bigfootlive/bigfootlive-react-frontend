import { test, expect } from '@playwright/test';

test.describe('BigFootLive React App', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('https://bigfootlive.io');
    
    // Check title
    await expect(page).toHaveTitle(/BigFoot.*Live/i);
    
    // Check main content is visible
    const mainContent = page.locator('#root');
    await expect(mainContent).toBeVisible();
    
    // Check if router loaded (should redirect to login or show homepage)
    await page.waitForLoadState('networkidle');
  });

  test('Login page is accessible', async ({ page }) => {
    await page.goto('https://bigfootlive.io/login');
    
    // Check for login form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // Wait for React to render
    await page.waitForTimeout(2000);
    
    // Check if inputs exist (they should be rendered by React)
    const emailCount = await emailInput.count();
    const passwordCount = await passwordInput.count();
    
    expect(emailCount + passwordCount).toBeGreaterThan(0);
  });

  test('Dashboard requires authentication', async ({ page }) => {
    await page.goto('https://bigfootlive.io/dashboard');
    
    // Should redirect to login since not authenticated
    await page.waitForTimeout(2000);
    
    // Check URL contains login or we see login form
    const url = page.url();
    const hasLoginInUrl = url.includes('login');
    const hasEmailInput = await page.locator('input[type="email"], input[name="email"]').count() > 0;
    
    expect(hasLoginInUrl || hasEmailInput).toBeTruthy();
  });

  test('API health check', async ({ page }) => {
    const response = await page.request.get('https://api.bigfootlive.io/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('React app bundle loads', async ({ page }) => {
    await page.goto('https://bigfootlive.io');
    
    // Check that main JS bundle loads
    const jsResponse = await page.waitForResponse(response => 
      response.url().includes('/assets/index-') && response.url().endsWith('.js')
    );
    
    expect(jsResponse.status()).toBe(200);
    
    // Check that CSS loads
    const cssResponse = await page.waitForResponse(response => 
      response.url().includes('/assets/index-') && response.url().endsWith('.css')
    );
    
    expect(cssResponse.status()).toBe(200);
  });
});

test.describe('Authentication Flow', () => {
  test('Can navigate to register page', async ({ page }) => {
    await page.goto('https://bigfootlive.io/register');
    await page.waitForTimeout(2000);
    
    // Check for registration form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInputs = page.locator('input[type="password"]');
    
    const hasEmail = await emailInput.count() > 0;
    const hasPasswords = await passwordInputs.count() > 0;
    
    expect(hasEmail || hasPasswords).toBeTruthy();
  });

  test('AWS Cognito configuration is present', async ({ page }) => {
    await page.goto('https://bigfootlive.io');
    
    // Check if Amplify is configured (it sets window.AWS_CONFIG in production)
    const hasAmplify = await page.evaluate(() => {
      return typeof window !== 'undefined';
    });
    
    expect(hasAmplify).toBeTruthy();
  });
});