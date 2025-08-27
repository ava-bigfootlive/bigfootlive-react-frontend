import { test, expect, Page } from '@playwright/test';

test.describe('Feature Flags Management', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@bigfootlive.io');
    await page.fill('[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to Platform Admin
    await page.goto('/platform-admin');
    await page.waitForSelector('text=Platform Administration');
  });

  test('should access Feature Flags tab in Platform Admin', async () => {
    // Click on Feature Flags tab
    await page.click('text=Feature Flags');
    
    // Verify Feature Flags interface loads
    await expect(page.locator('text=Feature Flag Management')).toBeVisible();
    await expect(page.locator('button:has-text("Create Flag")')).toBeVisible();
  });

  test('should create a new feature flag', async () => {
    await page.click('text=Feature Flags');
    await page.click('button:has-text("Create Flag")');
    
    // Fill in flag details
    await page.fill('[name="key"]', 'test_feature_playwright');
    await page.fill('[name="name"]', 'Test Feature for Playwright');
    await page.fill('[name="description"]', 'Testing feature flag creation via Playwright');
    
    // Select category
    await page.selectOption('[name="category"]', 'beta');
    
    // Set rollout percentage
    await page.fill('[name="rolloutPercentage"]', '50');
    
    // Save the flag
    await page.click('button:has-text("Create Flag")');
    
    // Verify flag appears in list
    await expect(page.locator('text=test_feature_playwright')).toBeVisible();
    await expect(page.locator('text=50% rollout')).toBeVisible();
  });

  test('should toggle feature flag status', async () => {
    await page.click('text=Feature Flags');
    
    // Find a flag and toggle it
    const flagRow = page.locator('tr:has-text("webrtc_multi_presenter")').first();
    const toggleSwitch = flagRow.locator('[role="switch"]');
    
    // Get initial state
    const initialState = await toggleSwitch.getAttribute('aria-checked');
    
    // Toggle the switch
    await toggleSwitch.click();
    
    // Verify state changed
    const newState = await toggleSwitch.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);
    
    // Verify toast notification
    await expect(page.locator('text=Feature flag updated')).toBeVisible();
  });

  test('should set tenant-specific override', async () => {
    await page.click('text=Feature Flags');
    
    // Click on a feature flag to edit
    await page.click('text=webrtc_multi_presenter');
    
    // Go to tenant overrides section
    await page.click('text=Tenant Overrides');
    
    // Add override for specific tenant
    await page.click('button:has-text("Add Override")');
    await page.selectOption('[name="tenantId"]', { index: 1 }); // Select first tenant
    await page.check('[name="enabled"]');
    await page.click('button:has-text("Save Override")');
    
    // Verify override appears
    await expect(page.locator('text=Override saved')).toBeVisible();
  });

  test('should create A/B test experiment', async () => {
    await page.click('text=Feature Flags');
    
    // Select a variant flag
    await page.click('text=streaming_quality_preset');
    
    // Create experiment
    await page.click('button:has-text("Create Experiment")');
    await page.fill('[name="experimentName"]', 'Quality Test A/B');
    await page.fill('[name="variantA"]', 'high');
    await page.fill('[name="variantB"]', 'ultra');
    await page.fill('[name="trafficSplit"]', '50');
    
    // Set duration
    await page.fill('[name="duration"]', '7'); // 7 days
    
    // Start experiment
    await page.click('button:has-text("Start Experiment")');
    
    // Verify experiment status
    await expect(page.locator('text=Experiment running')).toBeVisible();
    await expect(page.locator('text=50/50 split')).toBeVisible();
  });

  test('should view feature flag audit logs', async () => {
    await page.click('text=Feature Flags');
    
    // Click on audit logs
    await page.click('button:has-text("Audit Logs")');
    
    // Verify audit log entries
    await expect(page.locator('text=Flag Changes')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    
    // Check for log entries
    const logEntries = page.locator('tbody tr');
    await expect(logEntries).toHaveCount(await logEntries.count());
    
    // Verify log entry structure
    const firstLog = logEntries.first();
    await expect(firstLog.locator('td').nth(0)).toContainText(/\d{4}-\d{2}-\d{2}/); // Date
    await expect(firstLog.locator('td').nth(1)).toBeVisible(); // Action
    await expect(firstLog.locator('td').nth(2)).toBeVisible(); // User
    await expect(firstLog.locator('td').nth(3)).toBeVisible(); // Flag
  });

  test('should filter feature flags by category', async () => {
    await page.click('text=Feature Flags');
    
    // Apply category filter
    await page.selectOption('[name="categoryFilter"]', 'premium');
    
    // Verify only premium flags are shown
    const flags = page.locator('tbody tr');
    const flagCount = await flags.count();
    
    for (let i = 0; i < flagCount; i++) {
      const categoryBadge = flags.nth(i).locator('.badge:has-text("premium")');
      await expect(categoryBadge).toBeVisible();
    }
  });

  test('should search feature flags', async () => {
    await page.click('text=Feature Flags');
    
    // Search for specific flag
    await page.fill('[placeholder="Search flags..."]', 'webrtc');
    
    // Verify filtered results
    await expect(page.locator('text=webrtc_multi_presenter')).toBeVisible();
    await expect(page.locator('text=live_captions')).not.toBeVisible();
  });

  test('should export feature flags configuration', async () => {
    await page.click('text=Feature Flags');
    
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Configuration")');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('feature-flags');
    expect(download.suggestedFilename()).toContain('.json');
  });

  test('should validate feature flag dependencies', async () => {
    await page.click('text=Feature Flags');
    
    // Try to enable a flag with dependencies
    const flagRow = page.locator('tr:has-text("breakout_rooms")');
    const toggleSwitch = flagRow.locator('[role="switch"]');
    
    // If WebRTC is disabled, it should show warning
    await toggleSwitch.click();
    
    // Check for dependency warning
    const warning = page.locator('text=requires webrtc_multi_presenter');
    if (await warning.isVisible()) {
      await expect(warning).toBeVisible();
      
      // Enable dependency first
      await page.locator('tr:has-text("webrtc_multi_presenter")').locator('[role="switch"]').click();
      
      // Now enable breakout rooms
      await toggleSwitch.click();
      await expect(page.locator('text=Feature flag updated')).toBeVisible();
    }
  });
});