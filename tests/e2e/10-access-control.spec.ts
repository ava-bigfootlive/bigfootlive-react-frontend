import { test, expect } from '@playwright/test';

test.describe('Access Control and Permissions', () => {
  test('Tenant admin cannot access platform admin area', async ({ page }) => {
    // Login as tenant admin
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'admin@acme.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/acme/dashboard');
    
    // Try to access platform admin
    await page.goto('/platform-admin');
    
    // Should be redirected to unauthorized page
    await page.waitForURL('**/unauthorized');
    await expect(page.locator('h1')).toContainText('Access Denied');
  });

  test('Cannot access other tenant dashboard', async ({ page }) => {
    // Login as ACME admin
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'admin@acme.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/acme/dashboard');
    
    // Try to access another tenant's dashboard
    await page.goto('/competitor/dashboard');
    
    // Should be redirected to unauthorized
    await page.waitForURL('**/unauthorized');
    await expect(page.locator('text=do not have access to this tenant')).toBeVisible();
  });

  test('Viewer cannot access admin functions', async ({ page }) => {
    // Login as viewer
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'viewer@acme.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');
    
    // Should not see admin controls
    await expect(page.locator('[data-testid="create-stream-button"]')).not.toBeVisible();
    await expect(page.locator('nav >> text=Settings')).not.toBeVisible();
    
    // Try to access admin URL directly
    await page.goto('/acme/settings');
    await page.waitForURL('**/unauthorized');
  });

  test('Unauthenticated users cannot access protected routes', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/acme/dashboard');
    
    // Should redirect to login
    await page.waitForURL('**/auth/login?redirect=%2Facme%2Fdashboard');
    
    // Try platform admin
    await page.goto('/platform-admin');
    await page.waitForURL('**/auth/login?redirect=%2Fplatform-admin');
  });

  test('Role-based UI elements are properly hidden', async ({ page }) => {
    // Login as tenant user (not admin)
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'user@acme.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/acme/dashboard');
    
    // Admin functions should be hidden
    await expect(page.locator('[data-testid="user-management"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="billing-section"]')).not.toBeVisible();
    
    // User functions should be visible
    await expect(page.locator('[data-testid="view-streams"]')).toBeVisible();
    await expect(page.locator('[data-testid="view-analytics"]')).toBeVisible();
  });

  test('Session persistence maintains tenant context', async ({ context, page }) => {
    // Login to ACME tenant
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'admin@acme.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/acme/dashboard');
    
    // Open new tab
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    // Should maintain authentication and tenant context
    await newPage.goto('/dashboard');
    await newPage.waitForURL('**/acme/dashboard');
    await expect(newPage.locator('[data-testid="tenant-name"]')).toContainText('ACME Corporation');
  });
});