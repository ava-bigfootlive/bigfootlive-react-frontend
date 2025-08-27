import { test, expect, Page } from '@playwright/test';

test.describe('Overlays and Lower Thirds System', () => {
  let page: Page;
  let viewerPage: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Login as streamer
    await page.goto('/login');
    await page.fill('[name="email"]', 'streamer@bigfootlive.io');
    await page.fill('[name="password"]', 'Stream123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Create event with overlays enabled
    await page.goto('/events');
    await page.click('button:has-text("Create Event")');
    await page.fill('[name="title"]', 'Overlay Test Event');
    await page.click('text=Streaming Configuration');
    await page.check('[name="enableOverlays"]');
    await page.check('[name="enableLowerThirds"]');
    await page.click('button:has-text("Create Event")');
    
    // Setup viewer page
    const viewerContext = await browser.newContext();
    viewerPage = await viewerContext.newPage();
  });

  test('should create and manage lower thirds templates', async () => {
    // Go to overlay settings
    await page.click('button:has-text("Overlay Settings")');
    await page.click('tab:has-text("Lower Thirds")');
    
    // Create new lower third template
    await page.click('button:has-text("Create Template")');
    
    // Configure template
    await page.fill('[name="templateName"]', 'Speaker Introduction');
    await page.selectOption('[name="style"]', 'modern');
    await page.selectOption('[name="position"]', 'bottom-left');
    
    // Set animation
    await page.selectOption('[name="animationIn"]', 'slide-left');
    await page.selectOption('[name="animationOut"]', 'fade');
    await page.fill('[name="duration"]', '5');
    
    // Customize colors
    await page.fill('[name="primaryColor"]', '#1E40AF');
    await page.fill('[name="secondaryColor"]', '#FFFFFF');
    await page.fill('[name="textColor"]', '#FFFFFF');
    
    // Add fields
    await page.click('button:has-text("Add Field")');
    await page.fill('[name="field1Name"]', 'name');
    await page.fill('[name="field1Label"]', 'Speaker Name');
    
    await page.click('button:has-text("Add Field")');
    await page.fill('[name="field2Name"]', 'title');
    await page.fill('[name="field2Label"]', 'Title/Role');
    
    // Save template
    await page.click('button:has-text("Save Template")');
    await expect(page.locator('text=Template saved')).toBeVisible();
  });

  test('should display lower thirds during stream', async () => {
    // Start streaming
    await page.click('button:has-text("Go Live")');
    
    // Open overlay controls
    await page.click('[data-testid="overlay-controls"]');
    
    // Select lower third template
    await page.selectOption('[name="lowerThirdTemplate"]', 'Speaker Introduction');
    
    // Fill in content
    await page.fill('[name="name"]', 'John Smith');
    await page.fill('[name="title"]', 'CEO & Founder');
    
    // Show lower third
    await page.click('button:has-text("Show Lower Third")');
    
    // Verify on stream preview
    await expect(page.locator('[data-testid="lower-third-preview"]')).toBeVisible();
    await expect(page.locator('text=John Smith')).toBeVisible();
    await expect(page.locator('text=CEO & Founder')).toBeVisible();
    
    // Verify on viewer page
    await viewerPage.goto('/event/overlay-test-event/live');
    await expect(viewerPage.locator('[data-testid="lower-third"]')).toBeVisible();
    await expect(viewerPage.locator('text=John Smith')).toBeVisible();
    
    // Hide after duration
    await page.waitForTimeout(5000);
    await expect(viewerPage.locator('[data-testid="lower-third"]')).not.toBeVisible();
  });

  test('should manage multiple overlay layers', async () => {
    await page.click('button:has-text("Go Live")');
    await page.click('[data-testid="overlay-controls"]');
    
    // Add logo overlay
    await page.click('tab:has-text("Logo")');
    await page.setInputFiles('[name="logoFile"]', './test-assets/logo.png');
    await page.selectOption('[name="logoPosition"]', 'top-right');
    await page.fill('[name="logoOpacity"]', '0.8');
    await page.fill('[name="logoSize"]', '150');
    await page.click('button:has-text("Apply Logo")');
    
    // Add ticker overlay
    await page.click('tab:has-text("Ticker")');
    await page.fill('[name="tickerText"]', 'Breaking News: Live event in progress | Join us for exciting updates');
    await page.selectOption('[name="tickerPosition"]', 'bottom');
    await page.fill('[name="tickerSpeed"]', '50');
    await page.click('button:has-text("Start Ticker")');
    
    // Add countdown timer
    await page.click('tab:has-text("Timer")');
    await page.selectOption('[name="timerType"]', 'countdown');
    await page.fill('[name="countdownMinutes"]', '30');
    await page.selectOption('[name="timerPosition"]', 'top-left');
    await page.click('button:has-text("Start Timer")');
    
    // Verify all overlays visible
    await expect(page.locator('[data-testid="logo-overlay"]')).toBeVisible();
    await expect(page.locator('[data-testid="ticker-overlay"]')).toBeVisible();
    await expect(page.locator('[data-testid="timer-overlay"]')).toBeVisible();
    
    // Check layer order
    const layers = await page.locator('[data-testid="layer-panel"] .layer-item').allTextContents();
    expect(layers).toContain('Logo');
    expect(layers).toContain('Ticker');
    expect(layers).toContain('Timer');
  });

  test('should create animated transitions', async () => {
    await page.click('button:has-text("Go Live")');
    await page.click('[data-testid="overlay-controls"]');
    
    // Go to transitions tab
    await page.click('tab:has-text("Transitions")');
    
    // Create scene transition
    await page.click('button:has-text("Add Transition")');
    await page.selectOption('[name="transitionType"]', 'stinger');
    await page.setInputFiles('[name="stingerVideo"]', './test-assets/transition.webm');
    await page.fill('[name="transitionDuration"]', '1');
    
    // Test transition
    await page.click('button:has-text("Preview Transition")');
    await expect(page.locator('[data-testid="transition-preview"]')).toBeVisible();
    
    // Apply transition
    await page.click('button:has-text("Scene 2")');
    await expect(page.locator('[data-testid="transition-active"]')).toBeVisible();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Scene 2 Active')).toBeVisible();
  });

  test('should handle dynamic data overlays', async () => {
    await page.click('button:has-text("Go Live")');
    await page.click('[data-testid="overlay-controls"]');
    
    // Add dynamic stats overlay
    await page.click('tab:has-text("Dynamic")');
    await page.click('button:has-text("Add Dynamic Overlay")');
    
    // Configure viewer count
    await page.selectOption('[name="dataSource"]', 'viewer-count');
    await page.selectOption('[name="displayStyle"]', 'badge');
    await page.selectOption('[name="position"]', 'top-right');
    await page.click('button:has-text("Add")');
    
    // Configure donation goal
    await page.click('button:has-text("Add Dynamic Overlay")');
    await page.selectOption('[name="dataSource"]', 'donation-goal');
    await page.fill('[name="goalAmount"]', '5000');
    await page.selectOption('[name="displayStyle"]', 'progress-bar');
    await page.selectOption('[name="position"]', 'top-center');
    await page.click('button:has-text("Add")');
    
    // Verify dynamic updates
    await expect(page.locator('[data-testid="viewer-count-overlay"]')).toBeVisible();
    await expect(page.locator('[data-testid="donation-goal-overlay"]')).toBeVisible();
    
    // Simulate viewer count change
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('viewer-count-update', {
        detail: { count: 1250 }
      }));
    });
    await expect(page.locator('text=1,250 viewers')).toBeVisible();
  });

  test('should create custom HTML/CSS overlays', async () => {
    await page.click('[data-testid="overlay-controls"]');
    await page.click('tab:has-text("Custom")');
    
    // Create custom overlay
    await page.click('button:has-text("Create Custom Overlay")');
    
    // Enter HTML
    await page.fill('[name="customHTML"]', `
      <div class="custom-banner">
        <h2>Special Announcement</h2>
        <p>50% off all products today!</p>
      </div>
    `);
    
    // Enter CSS
    await page.fill('[name="customCSS"]', `
      .custom-banner {
        background: linear-gradient(90deg, #FF6B6B, #4ECDC4);
        color: white;
        padding: 20px;
        border-radius: 10px;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `);
    
    // Preview overlay
    await page.click('button:has-text("Preview")');
    await expect(page.locator('.custom-banner')).toBeVisible();
    await expect(page.locator('text=Special Announcement')).toBeVisible();
    
    // Apply overlay
    await page.click('button:has-text("Apply Overlay")');
    await expect(page.locator('[data-testid="custom-overlay-active"]')).toBeVisible();
  });

  test('should schedule overlay appearances', async () => {
    await page.click('[data-testid="overlay-controls"]');
    await page.click('tab:has-text("Schedule")');
    
    // Schedule lower third
    await page.click('button:has-text("Schedule Overlay")');
    await page.selectOption('[name="overlayType"]', 'lower-third');
    await page.selectOption('[name="template"]', 'Speaker Introduction');
    
    // Set schedule
    await page.fill('[name="showAt"]', '00:05:00');
    await page.fill('[name="duration"]', '5');
    await page.fill('[name="speakerName"]', 'Jane Doe');
    await page.fill('[name="speakerTitle"]', 'Product Manager');
    
    // Add to schedule
    await page.click('button:has-text("Add to Schedule")');
    
    // Schedule another overlay
    await page.click('button:has-text("Schedule Overlay")');
    await page.selectOption('[name="overlayType"]', 'announcement');
    await page.fill('[name="showAt"]', '00:10:00');
    await page.fill('[name="message"]', 'Q&A session starting soon');
    await page.click('button:has-text("Add to Schedule")');
    
    // Verify schedule list
    await expect(page.locator('text=00:05:00 - Lower Third')).toBeVisible();
    await expect(page.locator('text=00:10:00 - Announcement')).toBeVisible();
    
    // Start stream and verify scheduled appearances
    await page.click('button:has-text("Go Live")');
    
    // Fast forward to 5 minutes
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('stream-time-update', {
        detail: { time: 300 } // 5 minutes
      }));
    });
    
    await expect(viewerPage.locator('text=Jane Doe')).toBeVisible();
  });

  test('should export and import overlay presets', async () => {
    // Create overlay configuration
    await page.click('[data-testid="overlay-controls"]');
    
    // Configure multiple overlays
    // ... (setup overlays as in previous tests)
    
    // Export configuration
    await page.click('button:has-text("Export Preset")');
    await page.fill('[name="presetName"]', 'Corporate Event Pack');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Preset")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('corporate-event-pack');
    expect(download.suggestedFilename()).toContain('.json');
    
    // Import preset
    await page.click('button:has-text("Import Preset")');
    await page.setInputFiles('[name="presetFile"]', './downloads/corporate-event-pack.json');
    
    await expect(page.locator('text=Preset imported successfully')).toBeVisible();
    await expect(page.locator('text=Corporate Event Pack')).toBeVisible();
  });

  test('should handle green screen/chroma key', async () => {
    await page.click('button:has-text("Go Live")');
    await page.click('[data-testid="overlay-controls"]');
    await page.click('tab:has-text("Chroma Key")');
    
    // Enable chroma key
    await page.check('[name="enableChromaKey"]');
    
    // Configure key color
    await page.fill('[name="keyColor"]', '#00FF00');
    await page.fill('[name="similarity"]', '0.4');
    await page.fill('[name="smoothness"]', '0.1');
    await page.fill('[name="spill"]', '0.2');
    
    // Upload background
    await page.setInputFiles('[name="backgroundImage"]', './test-assets/virtual-background.jpg');
    
    // Apply chroma key
    await page.click('button:has-text("Apply Chroma Key")');
    
    // Verify preview
    await expect(page.locator('[data-testid="chroma-key-preview"]')).toBeVisible();
    await expect(page.locator('text=Chroma Key Active')).toBeVisible();
    
    // Fine-tune settings
    await page.click('button:has-text("Auto-Adjust")');
    await expect(page.locator('text=Settings optimized')).toBeVisible();
  });

  test('should create picture-in-picture overlays', async () => {
    await page.click('button:has-text("Go Live")');
    await page.click('[data-testid="overlay-controls"]');
    await page.click('tab:has-text("PiP")');
    
    // Add PiP source
    await page.selectOption('[name="pipSource"]', 'screen-share');
    await page.selectOption('[name="pipPosition"]', 'bottom-right');
    await page.fill('[name="pipSize"]', '25'); // 25% of screen
    
    // Configure PiP style
    await page.check('[name="pipBorder"]');
    await page.fill('[name="borderColor"]', '#FFFFFF');
    await page.fill('[name="borderWidth"]', '3');
    await page.check('[name="pipShadow"]');
    
    // Enable PiP
    await page.click('button:has-text("Enable PiP")');
    
    // Verify PiP overlay
    await expect(page.locator('[data-testid="pip-overlay"]')).toBeVisible();
    
    // Resize PiP
    await page.drag('[data-testid="pip-resize-handle"]', {
      targetX: 100,
      targetY: 100
    });
    
    // Swap main and PiP content
    await page.click('button:has-text("Swap Contents")');
    await expect(page.locator('text=Contents swapped')).toBeVisible();
  });
});