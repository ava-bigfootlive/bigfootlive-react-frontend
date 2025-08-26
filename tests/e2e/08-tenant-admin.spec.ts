import { test, expect } from '@playwright/test';

test.describe('Tenant Admin Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login as tenant admin
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'admin@acme.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/acme/dashboard');
  });

  test('Tenant dashboard shows organization metrics', async ({ page }) => {
    // Verify tenant-specific metrics
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('[data-testid="active-streams"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-viewers"]')).toBeVisible();
    
    // Should show tenant name in context
    await expect(page.locator('[data-testid="tenant-name"]')).toContainText('ACME Corporation');
  });

  test('Can create a new stream', async ({ page }) => {
    // Click create stream button
    await page.click('[data-testid="create-stream-button"]');
    await page.waitForURL('**/acme/streams/new');
    
    // Fill stream details
    await page.fill('[data-testid="stream-title"]', 'Test Stream');
    await page.fill('[data-testid="stream-description"]', 'Test stream description');
    await page.click('[data-testid="create-button"]');
    
    // Should redirect to stream details
    await expect(page).toHaveURL(/.*\/acme\/streams\/.*/);
  });

  test('Can manage organization users', async ({ page }) => {
    // Navigate to users section
    await page.click('text=Users');
    await page.waitForURL('**/acme/users');
    
    // Verify user management UI
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(page.locator('[data-testid="invite-user-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-list"]')).toBeVisible();
  });

  test('Can view organization analytics', async ({ page }) => {
    // Navigate to analytics
    await page.click('text=Analytics');
    await page.waitForURL('**/acme/analytics');
    
    // Verify analytics dashboard
    await expect(page.locator('h1')).toContainText('Analytics');
    await expect(page.locator('[data-testid="analytics-chart"]')).toBeVisible();
  });

  test('Tenant context is maintained across navigation', async ({ page }) => {
    // Navigate to different sections
    await page.click('text=Streams');
    await expect(page).toHaveURL(/.*\/acme\/streams/);
    await expect(page.locator('[data-testid="tenant-name"]')).toContainText('ACME Corporation');
    
    await page.click('text=Analytics');
    await expect(page).toHaveURL(/.*\/acme\/analytics/);
    await expect(page.locator('[data-testid="tenant-name"]')).toContainText('ACME Corporation');
  });
});