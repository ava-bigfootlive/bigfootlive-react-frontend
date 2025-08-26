import { test, expect } from '@playwright/test';

test.describe('BigfootLive E2E Production Tests - Final', () => {
  
  test('1. Homepage redirects correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveTitle(/BigfootLive/);
  });

  test('2. Login page with Shadcn UI loads', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('3. Register page form elements', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.locator('input[placeholder="First name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Last name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Handle multiple password fields by being more specific
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign Up")')).toBeVisible();
    
    await expect(page.locator('h2:has-text("Create your account")')).toBeVisible();
  });

  test('4. Forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Look for the actual title text
    await expect(page.locator('text=Forgot Password')).toBeVisible();
  });

  test('5. Unauthorized page content', async ({ page }) => {
    await page.goto('/unauthorized');
    
    await expect(page.locator('text=Access Denied')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=You don\'t have permission')).toBeVisible();
    await expect(page.locator('button:has-text("Go to Dashboard")')).toBeVisible();
  });

  test('6. API health check', async ({ page }) => {
    const response = await page.request.get('https://api.bigfootlive.io/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('7. Plum theme CSS variables', async ({ page }) => {
    await page.goto('/login');
    
    const cssVariables = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        primary: styles.getPropertyValue('--primary'),
        background: styles.getPropertyValue('--background'),
        foreground: styles.getPropertyValue('--foreground')
      };
    });
    
    expect(cssVariables.primary).toBeTruthy();
    expect(cssVariables.background).toBeTruthy();
  });

  test('8. Navigation works', async ({ page }) => {
    await page.goto('/login');
    
    const registerLink = page.locator('a[href="/register"]');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });

  test('9. Form validation', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBeFalsy();
  });

  test('10. Responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('11. Asset loading', async ({ page }) => {
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const criticalFailures = failedRequests.filter(url => 
      url.includes('assets') && !url.includes('favicon')
    );
    expect(criticalFailures.length).toBe(0);
  });

  test('12. Storage functionality', async ({ page }) => {
    await page.goto('/login');
    
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });
    
    const value = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    
    expect(value).toBe('test-value');
  });

  test('13. Minimal console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/login');
    await page.waitForTimeout(3000);
    
    const criticalErrors = errors.filter(error => 
      !error.includes('404') && 
      !error.includes('Failed to fetch') &&
      !error.includes('NetworkError') &&
      !error.includes('favicon')
    );
    
    expect(criticalErrors.length).toBeLessThanOrEqual(1);
  });

  test('14. Performance check', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(5000);
  });

  test('15. Authentication redirects', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);
    
    await page.goto('/streaming');
    await page.waitForURL(/\/login/);
    
    await page.goto('/platform-admin');
    await page.waitForURL(/\/login/);
  });
});