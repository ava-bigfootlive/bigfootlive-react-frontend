import { test, expect } from '@playwright/test';

test.describe('Multi-Tenant Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('Platform admin login redirects to platform dashboard', async ({ page }) => {
    // Login as platform admin
    await page.fill('[data-testid="email-input"]', 'admin@bigfootlive.io');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');

    // Should redirect to platform admin dashboard
    await page.waitForURL('**/platform-admin', { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/platform-admin/);
    
    // Verify platform admin UI elements
    await expect(page.locator('h1')).toContainText('Platform Dashboard');
    await expect(page.locator('[data-testid="total-tenants"]')).toBeVisible();
  });

  test('Tenant admin login redirects to tenant dashboard', async ({ page }) => {
    // Login as tenant admin
    await page.fill('[data-testid="email-input"]', 'admin@acme.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');

    // Should redirect to tenant dashboard
    await page.waitForURL('**/acme/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/acme\/dashboard/);
    
    // Verify tenant admin UI elements
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('[data-testid="create-stream-button"]')).toBeVisible();
  });

  test('User with multiple tenants sees tenant selection', async ({ page }) => {
    // Login as multi-tenant user
    await page.fill('[data-testid="email-input"]', 'multi@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');

    // Should show tenant selection page
    await page.waitForURL('**/select-tenant', { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/select-tenant/);
    
    // Verify tenant options are displayed
    await expect(page.locator('[data-testid="tenant-card"]')).toHaveCount(2);
  });

  test('Viewer role has limited access', async ({ page }) => {
    // Login as viewer
    await page.fill('[data-testid="email-input"]', 'viewer@acme.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');

    // Should redirect to tenant events page (read-only)
    await page.waitForURL('**/acme/events', { timeout: 10000 });
    
    // Verify no admin controls are visible
    await expect(page.locator('[data-testid="create-stream-button"]')).not.toBeVisible();
  });
});