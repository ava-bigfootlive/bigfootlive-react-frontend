import { test, expect } from '@playwright/test';

test.describe('Tenant Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user with multiple tenants
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'multi@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');
  });

  test('Can switch between tenants using switcher', async ({ page }) => {
    // Navigate to first tenant
    await page.click('[data-testid="tenant-card"] >> text=ACME Corporation');
    await page.waitForURL('**/acme/dashboard');
    
    // Open tenant switcher
    await page.click('[data-testid="tenant-switcher"]');
    
    // Should show available tenants
    await expect(page.locator('[data-testid="tenant-option"]')).toHaveCount(2);
    
    // Switch to second tenant
    await page.click('[data-testid="tenant-option"] >> text=Test Organization');
    await page.waitForURL('**/test/dashboard');
    
    // Verify switched to new tenant
    await expect(page.locator('[data-testid="tenant-name"]')).toContainText('Test Organization');
  });

  test('Tenant switcher shows current tenant', async ({ page }) => {
    // Select first tenant
    await page.click('[data-testid="tenant-card"] >> text=ACME Corporation');
    await page.waitForURL('**/acme/dashboard');
    
    // Verify current tenant is indicated
    await expect(page.locator('[data-testid="current-tenant"]')).toContainText('ACME Corporation');
    
    // Switch tenant
    await page.click('[data-testid="tenant-switcher"]');
    await page.click('[data-testid="tenant-option"] >> text=Test Organization');
    await page.waitForURL('**/test/dashboard');
    
    // Verify new current tenant
    await expect(page.locator('[data-testid="current-tenant"]')).toContainText('Test Organization');
  });

  test('Platform admin can switch to view any tenant', async ({ page }) => {
    // Login as platform admin
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'admin@bigfootlive.io');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/platform-admin');
    
    // Click view tenant from list
    await page.click('[data-testid="view-tenant-button"]');
    
    // Should navigate to tenant context
    await page.waitForURL(/.*\/acme\/dashboard/);
    
    // Should show platform admin indicator
    await expect(page.locator('[data-testid="platform-admin-mode"]')).toBeVisible();
    
    // Can return to platform admin
    await page.click('[data-testid="return-to-platform"]');
    await page.waitForURL('**/platform-admin');
  });

  test('Tenant data is isolated when switching', async ({ page }) => {
    // Navigate to ACME tenant
    await page.click('[data-testid="tenant-card"] >> text=ACME Corporation');
    await page.waitForURL('**/acme/dashboard');
    
    // Note some data specific to ACME
    const acmeStreams = await page.locator('[data-testid="stream-count"]').textContent();
    
    // Switch to Test Organization
    await page.click('[data-testid="tenant-switcher"]');
    await page.click('[data-testid="tenant-option"] >> text=Test Organization');
    await page.waitForURL('**/test/dashboard');
    
    // Verify different data
    const testStreams = await page.locator('[data-testid="stream-count"]').textContent();
    expect(acmeStreams).not.toBe(testStreams);
  });
});