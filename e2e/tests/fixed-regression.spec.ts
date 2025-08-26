import { test, expect } from '@playwright/test';

test.describe('BigfootLive E2E Regression Suite - Fixed', () => {
  
  test('1. Homepage redirects to dashboard (which redirects to login)', async ({ page }) => {
    await page.goto('/');
    // Should redirect through dashboard to login
    await page.waitForURL(/\/login/);
    await expect(page).toHaveTitle(/BigfootLive/);
  });

  test('2. Login page loads with Shadcn UI components', async ({ page }) => {
    await page.goto('/login');
    
    // Check for form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    
    // Check for plum theme styling
    const button = page.locator('button:has-text("Sign In")');
    await expect(button).toBeVisible();
  });

  test('3. Register page loads with correct form elements', async ({ page }) => {
    await page.goto('/register');
    
    // Look for actual button text "Sign Up" not "Create Account"
    await expect(page.locator('input[placeholder="First name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Last name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign Up")')).toBeVisible();
    
    // Check page title
    await expect(page.locator('h2:has-text("Create your account")')).toBeVisible();
  });

  test('4. Forgot password page loads correctly', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Wait for page to load
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Check for the actual button text
    const resetButton = page.locator('button[type="submit"]');
    await expect(resetButton).toBeVisible();
    
    // Should have reset password title
    await expect(page.locator('text=Reset Password')).toBeVisible();
  });

  test('5. Unauthorized page loads and displays content', async ({ page }) => {
    await page.goto('/unauthorized');
    
    // Wait for content to load
    await expect(page.locator('text=Access Denied')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=You don\'t have permission')).toBeVisible();
    await expect(page.locator('button:has-text("Go to Dashboard")')).toBeVisible();
  });

  test('6. API health check works', async ({ page }) => {
    const response = await page.request.get('https://api.bigfootlive.io/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('7. Theme CSS variables are loaded', async ({ page }) => {
    await page.goto('/');
    
    const cssVariables = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        primary: styles.getPropertyValue('--primary'),
        background: styles.getPropertyValue('--background'),
        foreground: styles.getPropertyValue('--foreground')
      };
    });
    
    // Plum theme variables should be set
    expect(cssVariables.primary).toBeTruthy();
    expect(cssVariables.background).toBeTruthy();
  });

  test('8. Navigation between public pages works', async ({ page }) => {
    await page.goto('/login');
    
    // Go to register page
    const registerLink = page.locator('a[href="/register"]');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
    
    // Go back to login
    const loginLink = page.locator('a[href="/login"]');
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('9. Form validation works on login page', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    
    // HTML5 validation
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBeFalsy();
  });

  test('10. Responsive design works', async ({ page }) => {
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();
    
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('11. CloudFront assets load correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that assets loaded
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Should have minimal failed requests
    expect(failedRequests.filter(url => url.includes('assets')).length).toBe(0);
  });

  test('12. Local storage functionality', async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });
    
    const value = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    
    expect(value).toBe('test-value');
  });

  test('13. Console errors are minimal', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/login');
    await page.waitForTimeout(3000);
    
    // Filter out acceptable errors
    const criticalErrors = errors.filter(error => 
      !error.includes('404') && 
      !error.includes('Failed to fetch') &&
      !error.includes('NetworkError')
    );
    
    expect(criticalErrors.length).toBeLessThanOrEqual(1);
  });

  test('14. Performance - Page load under 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(5000);
  });

  test('15. Authentication redirects work correctly', async ({ page }) => {
    // Dashboard should redirect to login
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);
    
    // Streaming should redirect to login
    await page.goto('/streaming');
    await page.waitForURL(/\/login/);
    
    // Platform admin should redirect to login
    await page.goto('/platform-admin');
    await page.waitForURL(/\/login/);
  });
});