import { test, expect } from '@playwright/test';
import testUsers from '../fixtures/test-users.json';

test.describe('Real Authentication Tests', () => {
  test('should login with real Cognito user', async ({ page }) => {
    // Navigate to login page
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Fill in real credentials
    await page.fill('input[type="email"]', testUsers.testViewer.email);
    await page.fill('input[type="password"]', testUsers.testViewer.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForTimeout(5000);
    
    // Should be redirected to dashboard
    const url = page.url();
    expect(url).toContain('/dashboard');
    
    // Verify user is logged in
    const localStorage = await page.evaluate(() => {
      return window.localStorage.getItem('currentUser');
    });
    expect(localStorage).toBeTruthy();
    
    // Should be able to access dashboard
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/dashboard');
    await expect(page).not.toHaveURL(/.*login/);
  });
  
  test('should access protected routes after login', async ({ page }) => {
    // Login first
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/auth/login');
    await page.fill('input[type="email"]', testUsers.testViewer.email);
    await page.fill('input[type="password"]', testUsers.testViewer.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    // Test accessing streaming page
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/streaming');
    await expect(page).not.toHaveURL(/.*login/);
    
    // Test accessing dashboard
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/dashboard');
    await expect(page).not.toHaveURL(/.*login/);
  });
  
  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/auth/login');
    
    // Enter invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=/invalid|error|incorrect/i')).toBeVisible({ timeout: 10000 });
    
    // Should still be on login page
    await expect(page).toHaveURL(/.*login/);
  });
  
  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/auth/login');
    await page.fill('input[type="email"]', testUsers.testViewer.email);
    await page.fill('input[type="password"]', testUsers.testViewer.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    // Should be logged in
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Find and click logout (if available)
    const logoutButton = page.locator('text=/logout|sign out/i');
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForTimeout(2000);
      
      // Should redirect to login or home
      const url = page.url();
      expect(url).toMatch(/login|^https:\/\/d2dbuyze4zqbdy\.cloudfront\.net\/$/);
    }
  });
  
  test('dashboard shows correct user information', async ({ page }) => {
    // Login
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/auth/login');
    await page.fill('input[type="email"]', testUsers.testViewer.email);
    await page.fill('input[type="password"]', testUsers.testViewer.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    // Go to dashboard
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/dashboard');
    
    // Check for user greeting
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('Welcome');
    
    // Check for dashboard elements
    await expect(page.locator('text=/mission control|dashboard/i')).toBeVisible();
    await expect(page.locator('text=/create.*stream|new.*stream/i')).toBeVisible();
  });
});