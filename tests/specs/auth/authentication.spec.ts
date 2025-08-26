import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { DashboardPage } from '../../pages/dashboard-page';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    // Skip localStorage.clear() if cross-origin restrictions apply
    try {
      await page.evaluate(() => {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
      });
    } catch (error) {
      // Ignore localStorage errors in cross-origin contexts
      console.log('Note: localStorage not accessible in current context');
    }
  });

  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.verifyLoginForm();
    
    // Use test credentials
    await loginPage.login('test-viewer@bigfootlive.io', 'TestPass123!');
    
    // Verify successful login
    await expect(page).toHaveURL(/.*\/dashboard/);
    await dashboardPage.verifyDashboard();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid');
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should handle forgot password flow', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.clickForgotPassword();
    
    await expect(page).toHaveURL(/.*\/forgot-password/);
    
    // Fill email for password reset
    await page.fill('[data-testid="reset-email-input"]', 'test@example.com');
    await page.click('[data-testid="send-reset-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="reset-sent-message"]')).toBeVisible();
  });

  test('should navigate to signup from login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.clickSignup();
    
    await expect(page).toHaveURL(/.*\/(signup|register)/);
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);
      
      await loginPage.goto();
      await loginPage.login('test@example.com', 'TestPass123!');
      
      await dashboardPage.goto();
      await dashboardPage.verifyDashboard();
      
      // Refresh page
      await page.reload();
      
      // Should still be authenticated
      await dashboardPage.verifyDashboard();
    });

    test('should handle expired session gracefully', async ({ page }) => {
      const loginPage = new LoginPage(page);
      
      await loginPage.goto();
      await loginPage.login('test@example.com', 'TestPass123!');
      
      // Simulate expired token by clearing auth cookies
      await page.context().clearCookies();
      
      // Try to access protected route
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*\/login/);
    });
  });
});