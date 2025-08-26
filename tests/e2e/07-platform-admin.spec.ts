import { test, expect } from '@playwright/test';

test.describe('Platform Admin Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login as platform admin
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'admin@bigfootlive.io');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/platform-admin');
  });

  test('Platform dashboard shows system metrics', async ({ page }) => {
    // Verify key metrics are displayed
    await expect(page.locator('[data-testid="total-tenants"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-streams"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-viewers"]')).toBeVisible();
    await expect(page.locator('[data-testid="system-health"]')).toBeVisible();
    
    // Check for tenant list
    await expect(page.locator('[data-testid="tenant-list"]')).toBeVisible();
  });

  test('Can navigate to tenant management', async ({ page }) => {
    // Click on tenants navigation
    await page.click('text=Tenants');
    await page.waitForURL('**/platform-admin/tenants');
    
    // Verify tenant management UI
    await expect(page.locator('h1')).toContainText('Tenant Management');
    await expect(page.locator('[data-testid="create-tenant-button"]')).toBeVisible();
  });

  test('Can view specific tenant details', async ({ page }) => {
    // Click on a tenant from the list
    await page.click('[data-testid="tenant-list"] >> text=ACME Corporation');
    
    // Should navigate to tenant details
    await page.waitForURL('**/platform-admin/tenants/acme-corp');
    
    // Verify tenant details are shown
    await expect(page.locator('h1')).toContainText('ACME Corporation');
    await expect(page.locator('[data-testid="tenant-status"]')).toBeVisible();
  });

  test('Can access system health monitoring', async ({ page }) => {
    // Navigate to system health
    await page.click('text=System Health');
    await page.waitForURL('**/platform-admin/system');
    
    // Verify health monitoring UI
    await expect(page.locator('h1')).toContainText('System Health');
    await expect(page.locator('[data-testid="service-status-list"]')).toBeVisible();
  });

  test('Platform admin navigation is distinct from tenant navigation', async ({ page }) => {
    // Verify platform-specific navigation items
    await expect(page.locator('nav >> text=Tenants')).toBeVisible();
    await expect(page.locator('nav >> text=Billing')).toBeVisible();
    await expect(page.locator('nav >> text=System Health')).toBeVisible();
    
    // Verify no tenant-specific items
    await expect(page.locator('nav >> text=Create Stream')).not.toBeVisible();
  });
});