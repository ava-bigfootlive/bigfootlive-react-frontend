import { test, expect, Page } from '@playwright/test';

test.describe('Events DataTable CRUD Operations', () => {
  let page: Page;
  let testEventId: string;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@bigfootlive.io');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to Events
    await page.goto('/events');
    await page.waitForSelector('text=Event Management');
  });

  test('should display events in DataTable format', async () => {
    // Verify DataTable elements
    await expect(page.locator('table.data-table')).toBeVisible();
    await expect(page.locator('thead tr th')).toContainText(['Title', 'Date', 'Status', 'Type', 'Attendees', 'Actions']);
    
    // Verify pagination controls
    await expect(page.locator('[aria-label="Pagination"]')).toBeVisible();
    await expect(page.locator('text=Rows per page')).toBeVisible();
    
    // Verify search/filter bar
    await expect(page.locator('[placeholder="Search events..."]')).toBeVisible();
  });

  test('should create a new event with full configuration', async () => {
    // Click Create Event button
    await page.click('button:has-text("Create Event")');
    
    // Fill basic information
    await page.fill('[name="title"]', 'Playwright Test Event');
    await page.fill('[name="description"]', 'Comprehensive test of event creation');
    await page.selectOption('[name="type"]', 'webinar');
    
    // Set date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('[name="startDate"]', tomorrow.toISOString().split('T')[0]);
    await page.fill('[name="startTime"]', '14:00');
    await page.fill('[name="duration"]', '90');
    
    // Configure access settings
    await page.click('text=Access Configuration');
    await page.selectOption('[name="privacy"]', 'password');
    await page.fill('[name="password"]', 'SecurePass123');
    await page.check('[name="registration"]');
    await page.check('[name="waitingRoom"]');
    
    // Configure interactives
    await page.click('text=Event Interactives');
    await page.check('[name="enableChat"]');
    await page.check('[name="enablePolls"]');
    await page.check('[name="enableQA"]');
    await page.check('[name="enableReactions"]');
    
    // Configure branding
    await page.click('text=Branding & Customization');
    await page.fill('[name="primaryColor"]', '#FF5733');
    await page.fill('[name="logoUrl"]', 'https://example.com/logo.png');
    await page.check('[name="enableWatermark"]');
    await page.selectOption('[name="watermarkPosition"]', 'bottom-right');
    
    // Configure streaming settings
    await page.click('text=Streaming Configuration');
    await page.selectOption('[name="streamingQuality"]', '1080p');
    await page.check('[name="enableRecording"]');
    await page.check('[name="enableLiveCaptions"]');
    
    // Save event
    await page.click('button:has-text("Create Event")');
    
    // Verify success and capture event ID
    await expect(page.locator('text=Event created successfully')).toBeVisible();
    
    // Verify event appears in DataTable
    await expect(page.locator('text=Playwright Test Event')).toBeVisible();
    
    // Store event ID for cleanup
    const eventRow = page.locator('tr:has-text("Playwright Test Event")').first();
    testEventId = await eventRow.getAttribute('data-event-id') || '';
  });

  test('should edit an existing event', async () => {
    // Find an event in the table
    const eventRow = page.locator('tr:has-text("Playwright Test Event")').first();
    
    // Click edit action
    await eventRow.locator('button[aria-label="Edit"]').click();
    
    // Modify event details
    await page.fill('[name="title"]', 'Updated Playwright Event');
    await page.fill('[name="description"]', 'Updated description with more details');
    
    // Change streaming settings
    await page.click('text=Streaming Configuration');
    await page.selectOption('[name="streamingQuality"]', '4K');
    await page.check('[name="enableLowerThirds"]');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify update success
    await expect(page.locator('text=Event updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated Playwright Event')).toBeVisible();
  });

  test('should duplicate an event', async () => {
    // Find event in table
    const eventRow = page.locator('tr:has-text("Updated Playwright Event")').first();
    
    // Click duplicate action
    await eventRow.locator('button[aria-label="Duplicate"]').click();
    
    // Confirm duplication dialog
    await page.click('button:has-text("Duplicate Event")');
    
    // Verify duplication
    await expect(page.locator('text=Event duplicated successfully')).toBeVisible();
    await expect(page.locator('text=Copy of Updated Playwright Event')).toBeVisible();
  });

  test('should filter events by status', async () => {
    // Apply status filter
    await page.selectOption('[name="statusFilter"]', 'upcoming');
    
    // Verify filtered results
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const statusCell = rows.nth(i).locator('td:nth-child(3)');
      await expect(statusCell).toContainText(/Upcoming|Scheduled/);
    }
    
    // Change filter to past events
    await page.selectOption('[name="statusFilter"]', 'past');
    
    // Verify past events only
    const pastRows = page.locator('tbody tr');
    const pastCount = await pastRows.count();
    
    if (pastCount > 0) {
      for (let i = 0; i < pastCount; i++) {
        const statusCell = pastRows.nth(i).locator('td:nth-child(3)');
        await expect(statusCell).toContainText(/Completed|Ended/);
      }
    }
  });

  test('should sort events by different columns', async () => {
    // Sort by date ascending
    await page.click('th:has-text("Date")');
    
    // Get first and last date
    const dates = await page.locator('td:nth-child(2)').allTextContents();
    const firstDate = new Date(dates[0]);
    const lastDate = new Date(dates[dates.length - 1]);
    expect(firstDate.getTime()).toBeLessThanOrEqual(lastDate.getTime());
    
    // Sort by date descending
    await page.click('th:has-text("Date")');
    
    // Verify reverse order
    const reverseDates = await page.locator('td:nth-child(2)').allTextContents();
    const firstReverseDate = new Date(reverseDates[0]);
    const lastReverseDate = new Date(reverseDates[reverseDates.length - 1]);
    expect(firstReverseDate.getTime()).toBeGreaterThanOrEqual(lastReverseDate.getTime());
  });

  test('should manage event attendees', async () => {
    // Find event and click attendees action
    const eventRow = page.locator('tr:has-text("Updated Playwright Event")').first();
    await eventRow.locator('button[aria-label="Manage Attendees"]').click();
    
    // Verify attendee management dialog
    await expect(page.locator('text=Manage Attendees')).toBeVisible();
    
    // Add attendee
    await page.click('button:has-text("Add Attendee")');
    await page.fill('[name="attendeeEmail"]', 'test@example.com');
    await page.selectOption('[name="attendeeRole"]', 'viewer');
    await page.click('button:has-text("Add")');
    
    // Verify attendee added
    await expect(page.locator('text=test@example.com')).toBeVisible();
    
    // Change attendee role
    const attendeeRow = page.locator('tr:has-text("test@example.com")');
    await attendeeRow.locator('select').selectOption('moderator');
    
    // Remove attendee
    await attendeeRow.locator('button[aria-label="Remove"]').click();
    await page.click('button:has-text("Confirm")');
    
    // Close dialog
    await page.click('button:has-text("Close")');
  });

  test('should export events to CSV', async () => {
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export to CSV")');
    
    // Select export options
    await page.check('[name="includeAttendees"]');
    await page.check('[name="includeAnalytics"]');
    await page.click('button:has-text("Export")');
    
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toContain('events');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should bulk select and delete events', async () => {
    // Select multiple events
    await page.check('tr:has-text("Copy of Updated Playwright Event") input[type="checkbox"]');
    
    // Verify bulk actions appear
    await expect(page.locator('text=1 selected')).toBeVisible();
    await expect(page.locator('button:has-text("Delete Selected")')).toBeVisible();
    
    // Click bulk delete
    await page.click('button:has-text("Delete Selected")');
    
    // Confirm deletion
    await page.click('button:has-text("Delete Events")');
    
    // Verify deletion
    await expect(page.locator('text=Events deleted successfully')).toBeVisible();
    await expect(page.locator('text=Copy of Updated Playwright Event')).not.toBeVisible();
  });

  test('should preview event before going live', async () => {
    // Find upcoming event
    const eventRow = page.locator('tr:has-text("Updated Playwright Event")').first();
    
    // Click preview button
    await eventRow.locator('button[aria-label="Preview"]').click();
    
    // Verify preview modal
    await expect(page.locator('text=Event Preview')).toBeVisible();
    
    // Check preview elements
    await expect(page.locator('text=Updated Playwright Event')).toBeVisible();
    await expect(page.locator('text=Stream Preview')).toBeVisible();
    await expect(page.locator('text=Chat Preview')).toBeVisible();
    
    // Test preview features
    await page.fill('[placeholder="Test chat message..."]', 'Test message');
    await page.click('button:has-text("Send Test")');
    
    // Close preview
    await page.click('button:has-text("Close Preview")');
  });

  test('should start live streaming for an event', async () => {
    // Find event and click Go Live
    const eventRow = page.locator('tr:has-text("Updated Playwright Event")').first();
    await eventRow.locator('button:has-text("Go Live")').click();
    
    // Verify pre-flight checklist
    await expect(page.locator('text=Pre-flight Checklist')).toBeVisible();
    
    // Check all items
    await page.check('[name="streamKey"]');
    await page.check('[name="audioCheck"]');
    await page.check('[name="videoCheck"]');
    await page.check('[name="recordingEnabled"]');
    
    // Start stream
    await page.click('button:has-text("Start Streaming")');
    
    // Verify streaming status
    await expect(page.locator('text=Live')).toBeVisible();
    await expect(eventRow.locator('.status-badge.live')).toBeVisible();
  });

  test.afterAll(async () => {
    // Cleanup: Delete test events
    if (testEventId) {
      // Delete via API or UI cleanup
    }
  });
});