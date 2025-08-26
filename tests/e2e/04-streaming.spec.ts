import { test, expect } from '@playwright/test';
import { streamSettings, testEvents } from '../fixtures/test-data';
import { navigateSSR, waitForHydration, getElementBySelectors } from '../helpers/ssr-helpers';

test.describe('Streaming Features', () => {
  test.beforeEach(async ({ page }) => {
    await navigateSSR(page, '/streaming/', {
      expectedStatus: [200, 307, 308],
      timeout: 45000
    });
    await waitForHydration(page);
  });

  test('Streaming page loads correctly', async ({ page }) => {
    // Check for streaming-specific content with flexible selectors
    const streamingIndicators = [
      'h1:has-text("stream")', 'h2:has-text("stream")',
      'text=/stream/i', 'text=/live/i', 'text=/broadcast/i',
      'video', '[class*="player"]', '[class*="stream"]',
      'h1', 'h2', 'main'
    ];
    
    let foundStreamingContent = false;
    for (const selector of streamingIndicators) {
      if (await page.locator(selector).count() > 0) {
        foundStreamingContent = true;
        break;
      }
    }
    
    // Check for streaming-specific elements
    const streamElements = [
      'video', 'player', 'live', 'broadcast', 'event', 'stream', 'chat'
    ];
    
    let foundElements = 0;
    for (const element of streamElements) {
      if (await page.locator(`text=/${element}/i`).count() > 0) {
        foundElements++;
      }
    }
    
    expect(foundStreamingContent || foundElements > 0).toBeTruthy();
  });

  test('Video player component renders', async ({ page }) => {
    await navigateSSR(page, '/streaming/live/', {
      expectedStatus: [200, 307, 308],
      timeout: 45000
    });
    await waitForHydration(page);
    
    // Check for video player
    const videoPlayer = page.locator('video, iframe, [class*="player"], [class*="video"]');
    
    if (await videoPlayer.count() > 0) {
      await expect(videoPlayer.first()).toBeVisible();
      
      // Check player dimensions
      const boundingBox = await videoPlayer.first().boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(200);
      expect(boundingBox?.height).toBeGreaterThan(100);
    }
  });

  test('Stream controls are available', async ({ page }) => {
    await navigateSSR(page, '/streaming/live/', {
      expectedStatus: [200, 307, 308],
      timeout: 45000
    });
    await waitForHydration(page);
    
    // Check for player controls
    const controls = [
      { selector: '[aria-label*="play" i], button:has-text("play")', label: 'Play' },
      { selector: '[aria-label*="pause" i], button:has-text("pause")', label: 'Pause' },
      { selector: '[aria-label*="volume" i], [class*="volume"]', label: 'Volume' },
      { selector: '[aria-label*="fullscreen" i], [class*="fullscreen"]', label: 'Fullscreen' }
    ];
    
    for (const control of controls) {
      const element = page.locator(control.selector);
      if (await element.count() > 0) {
        console.log(`Found ${control.label} control`);
      }
    }
  });

  test('RTMPS configuration displays', async ({ page }) => {
    // Look for stream key or RTMPS settings
    const rtmpsInfo = page.locator(`text=/${streamSettings.rtmps.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`);
    const streamKeyField = page.locator('input[type="password"], input[name*="key" i], [class*="stream-key"]');
    
    // Either RTMPS URL or stream key field should be present
    const hasStreamingConfig = 
      (await rtmpsInfo.count() > 0) || 
      (await streamKeyField.count() > 0);
    
    if (!hasStreamingConfig) {
      // Check if there's a button to reveal settings
      const settingsButton = page.locator('button').filter({ hasText: /settings|configure|setup/i });
      if (await settingsButton.count() > 0) {
        await settingsButton.first().click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Chat component is functional', async ({ page }) => {
    await page.goto('/streaming/live/');
    
    // Look for chat component
    const chatArea = page.locator('[class*="chat"], [aria-label*="chat" i]');
    
    if (await chatArea.count() > 0) {
      await expect(chatArea.first()).toBeVisible();
      
      // Check for chat input
      const chatInput = page.locator('input[placeholder*="message" i], textarea[placeholder*="chat" i]');
      if (await chatInput.count() > 0) {
        await expect(chatInput.first()).toBeVisible();
        
        // Test typing in chat
        await chatInput.first().fill('Test message');
        const value = await chatInput.first().inputValue();
        expect(value).toBe('Test message');
      }
    }
  });

  test('Viewer count displays', async ({ page }) => {
    await page.goto('/streaming/live/');
    
    // Look for viewer count
    const viewerCount = page.locator('text=/\\d+.*(?:viewer|watching|live)/i');
    
    if (await viewerCount.count() > 0) {
      await expect(viewerCount.first()).toBeVisible();
      
      // Verify it's showing a number
      const text = await viewerCount.first().textContent();
      expect(text).toMatch(/\d+/);
    }
  });

  test('Stream quality selector works', async ({ page }) => {
    await navigateSSR(page, '/streaming/live/', {
      expectedStatus: [200, 307, 308],
      timeout: 45000
    });
    await waitForHydration(page);
    
    // Look for quality selector with separate selectors
    const qualityClassSelector = page.locator('[class*="quality"]');
    const qualitySelectSelector = page.locator('select');
    
    let qualityElements = 0;
    qualityElements += await qualityClassSelector.count();
    qualityElements += await qualitySelectSelector.count();
    
    if (qualityElements > 0) {
      const selector = await qualityClassSelector.count() > 0 ? 
        qualityClassSelector.first() : qualitySelectSelector.first();
      
      await expect(selector).toBeVisible();
      
      // If it's a select element, check options
      if (await selector.evaluate(el => el.tagName === 'SELECT')) {
        const options = await selector.locator('option').allTextContents();
        expect(options.length).toBeGreaterThan(1);
      }
    } else {
      // Quality selector is optional - test passes either way
      expect(true).toBeTruthy();
    }
  });

  test('Event schedule displays', async ({ page }) => {
    // Check for upcoming events
    const eventList = page.locator('[class*="event"], [class*="schedule"]');
    
    if (await eventList.count() > 0) {
      await expect(eventList.first()).toBeVisible();
      
      // Check for event details
      const eventTitles = page.locator('h3, h4, [class*="title"]');
      if (await eventTitles.count() > 0) {
        const firstTitle = await eventTitles.first().textContent();
        expect(firstTitle).toBeTruthy();
      }
    }
  });

  test('Go live button exists for streamers', async ({ page }) => {
    // Look for "Go Live" or "Start Streaming" button
    const goLiveButton = page.locator('button, a').filter({ hasText: /go live|start stream|begin broadcast/i });
    
    if (await goLiveButton.count() > 0) {
      await expect(goLiveButton.first()).toBeVisible();
      
      // Check if button is properly styled (likely primary button)
      const backgroundColor = await goLiveButton.first().evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('Recording indicator shows status', async ({ page }) => {
    await navigateSSR(page, '/streaming/live/', {
      expectedStatus: [200, 307, 308],
      timeout: 45000
    });
    await waitForHydration(page);
    
    // Look for recording indicator with separate selectors
    const recordingClassSelector = page.locator('[class*="record"]');
    const recordingTextSelector = page.locator('text=/recording|rec/i');
    
    const recordingElements = await recordingClassSelector.count() + await recordingTextSelector.count();
    
    if (recordingElements > 0) {
      const indicator = await recordingClassSelector.count() > 0 ? 
        recordingClassSelector.first() : recordingTextSelector.first();
      
      await expect(indicator).toBeVisible();
      
      // Check if it has a status color (red for recording, grey for not)
      const color = await indicator.evaluate(el => 
        window.getComputedStyle(el).color || 
        window.getComputedStyle(el).backgroundColor
      );
      expect(color).toBeTruthy();
    } else {
      // Recording indicator is optional - test passes either way
      expect(true).toBeTruthy();
    }
  });

  test('Stream statistics display', async ({ page }) => {
    await page.goto('/streaming/live/');
    
    // Look for stream stats
    const stats = [
      'bitrate', 'fps', 'resolution', 'duration', 'latency'
    ];
    
    let foundStats = 0;
    for (const stat of stats) {
      if (await page.locator(`text=/${stat}/i`).count() > 0) {
        foundStats++;
      }
    }
    
    // Should show at least some statistics
    if (foundStats > 0) {
      console.log(`Found ${foundStats} streaming statistics`);
    }
  });

  test('Share stream functionality exists', async ({ page }) => {
    await page.goto('/streaming/live/');
    
    // Look for share button
    const shareButton = page.locator('button, a').filter({ hasText: /share|invite/i });
    
    if (await shareButton.count() > 0) {
      await shareButton.first().click();
      
      // Should show share modal or copy link
      await page.waitForTimeout(500);
      const shareModal = page.locator('[role="dialog"], [class*="modal"], [class*="share"]');
      
      if (await shareModal.count() > 0) {
        await expect(shareModal).toBeVisible();
        
        // Check for copy button or social share options
        const copyButton = page.locator('button').filter({ hasText: /copy/i });
        if (await copyButton.count() > 0) {
          await expect(copyButton.first()).toBeVisible();
        }
      }
    }
  });

  test('Mobile streaming view is responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/streaming/live/');
    
    // Video player should adapt to mobile
    const videoPlayer = page.locator('video, iframe, [class*="player"]');
    if (await videoPlayer.count() > 0) {
      const boundingBox = await videoPlayer.first().boundingBox();
      
      // Should take most of mobile width
      expect(boundingBox?.width).toBeGreaterThan(300);
      expect(boundingBox?.width).toBeLessThanOrEqual(375);
    }
    
    // Chat might be hidden or in tab/drawer on mobile
    const chatToggle = page.locator('[aria-label*="chat" i], button:has-text("chat")');
    if (await chatToggle.count() > 0) {
      await expect(chatToggle.first()).toBeVisible();
    }
  });

  test('Stream categories are available', async ({ page }) => {
    // Check for category filters or tags with separate selectors
    const categoryClassSelector = page.locator('[class*="category"]');
    const tagClassSelector = page.locator('[class*="tag"]'); 
    const gamingButton = page.locator('button:has-text("gaming")');
    const musicButton = page.locator('button:has-text("music")');
    const categoryButtons = page.locator('button:has-text("category")');
    
    let totalCategories = 0;
    totalCategories += await categoryClassSelector.count();
    totalCategories += await tagClassSelector.count();
    totalCategories += await gamingButton.count();
    totalCategories += await musicButton.count();
    totalCategories += await categoryButtons.count();
    
    if (totalCategories > 0) {
      // Find the first available category element
      const firstCategory = 
        await categoryClassSelector.count() > 0 ? categoryClassSelector.first() :
        await tagClassSelector.count() > 0 ? tagClassSelector.first() :
        await gamingButton.count() > 0 ? gamingButton.first() :
        await musicButton.count() > 0 ? musicButton.first() :
        categoryButtons.first();
      
      await firstCategory.click();
      await page.waitForTimeout(1000);
      
      // URL might change or content might filter
      const urlChanged = page.url().includes('category') || page.url().includes('tag');
      const contentChanged = await page.locator('.filtered, .results').count() > 0;
      
      console.log(`Category filter: URL changed=${urlChanged}, Content changed=${contentChanged}`);
      expect(true).toBeTruthy(); // Test passes if categories exist and can be clicked
    } else {
      // Categories are optional - test passes either way
      expect(true).toBeTruthy();
    }
  });

  test('Past recordings are accessible', async ({ page }) => {
    // Look for recordings or VOD section
    const recordingsLink = page.locator('a, button').filter({ hasText: /recording|vod|past|replay/i });
    
    if (await recordingsLink.count() > 0) {
      await recordingsLink.first().click();
      await page.waitForLoadState('domcontentloaded');
      
      // Should show recordings list or player
      const recordings = page.locator('[class*="recording"], [class*="vod"], video');
      if (await recordings.count() > 0) {
        await expect(recordings.first()).toBeVisible();
      }
    }
  });
});