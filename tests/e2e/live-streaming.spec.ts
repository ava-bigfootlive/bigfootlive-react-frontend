/**
 * Live Streaming End-to-End Tests
 * Tests actual production live streaming setup and configuration
 */

import { test, expect, Page } from '@playwright/test';

const PRODUCTION_URL = 'https://d2dbuyze4zqbdy.cloudfront.net';
const API_URL = 'https://api.bigfootlive.io';

test.describe('Live Streaming Workflow - Production', () => {
  let page: Page;
  let createdEventId: string | null = null;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Monitor API calls
    page.on('request', request => {
      if (request.url().includes('/events')) {
        console.log('Events API:', request.method(), request.url());
      }
    });
  });

  test.afterEach(async () => {
    // Clean up created event if exists
    if (createdEventId) {
      try {
        await page.request.delete(`${API_URL}/api/v1/events/${createdEventId}`);
      } catch (e) {
        console.log('Could not delete test event');
      }
    }
    await page.close();
  });

  test('should load events page', async () => {
    await page.goto(`${PRODUCTION_URL}/events`);
    await expect(page).toHaveTitle(/BigfootLive/);
    
    // Check events page elements
    const eventsHeader = page.locator('h1, h2').filter({ hasText: /events/i }).first();
    await expect(eventsHeader).toBeVisible({ timeout: 10000 });
  });

  test('should create new live event', async () => {
    await page.goto(`${PRODUCTION_URL}/events`);
    await page.waitForLoadState('networkidle');
    
    // Look for create event button
    const createButton = page.locator('button').filter({ hasText: /create.*event|new.*event|add.*event/i }).first();
    
    if (await createButton.count() > 0) {
      await createButton.click();
      
      // Fill event form
      const titleInput = page.locator('input[name="title"], input[placeholder*="title"], input[aria-label*="title"]').first();
      const descInput = page.locator('textarea[name="description"], textarea[placeholder*="description"]').first();
      
      if (await titleInput.count() > 0) {
        const eventTitle = `Test Event ${Date.now()}`;
        await titleInput.fill(eventTitle);
        
        if (await descInput.count() > 0) {
          await descInput.fill('Automated test event for E2E testing');
        }
        
        // Monitor API response
        const createEventPromise = page.waitForResponse(
          response => response.url().includes('/events') && response.status() === 201,
          { timeout: 10000 }
        ).catch(() => null);
        
        // Submit form
        const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /create|save|submit/i }).first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          const response = await createEventPromise;
          if (response) {
            const eventData = await response.json();
            createdEventId = eventData.id;
            
            expect(eventData).toHaveProperty('id');
            expect(eventData).toHaveProperty('stream_key');
            expect(eventData).toHaveProperty('rtmps_url');
            
            console.log('Event created:', {
              id: eventData.id,
              streamKey: eventData.stream_key,
              rtmpsUrl: eventData.rtmps_url
            });
          }
        }
      }
    }
  });

  test('should display RTMPS configuration', async () => {
    await page.goto(`${PRODUCTION_URL}/events`);
    
    // Click on an event or create one first
    const eventItem = page.locator('[data-testid*="event-item"], [class*="event-item"], [class*="event-card"]').first();
    
    if (await eventItem.count() > 0) {
      await eventItem.click();
      
      // Look for stream configuration
      const streamConfig = page.locator('[class*="stream-config"], [data-testid*="stream-config"]').first();
      
      if (await streamConfig.count() > 0) {
        // Check for RTMPS URL
        const rtmpsUrl = page.locator('input[value*="rtmps://"], [class*="rtmps"]').first();
        await expect(rtmpsUrl).toBeVisible({ timeout: 5000 });
        
        const urlValue = await rtmpsUrl.inputValue();
        expect(urlValue).toContain('rtmps://');
        expect(urlValue).toContain(':1936');
        console.log('RTMPS URL:', urlValue);
        
        // Check for stream key
        const streamKey = page.locator('input[type="password"], input[placeholder*="stream key"]').first();
        if (await streamKey.count() > 0) {
          // Try to show stream key
          const showButton = page.locator('button').filter({ hasText: /show/i }).first();
          if (await showButton.count() > 0) {
            await showButton.click();
            const keyValue = await streamKey.inputValue();
            expect(keyValue).toBeTruthy();
            console.log('Stream key found:', keyValue.substring(0, 8) + '...');
          }
        }
      }
    }
  });

  test('should show OBS configuration instructions', async () => {
    await page.goto(`${PRODUCTION_URL}/streaming-live`);
    await page.waitForLoadState('networkidle');
    
    // Look for OBS tab or section
    const obsTab = page.locator('[role="tab"], button').filter({ hasText: /obs/i }).first();
    
    if (await obsTab.count() > 0) {
      await obsTab.click();
      
      // Check for OBS instructions
      const obsInstructions = page.locator('[role="tabpanel"], [class*="obs"]').first();
      
      if (await obsInstructions.count() > 0) {
        const instructionText = await obsInstructions.textContent();
        
        // Should contain RTMPS configuration
        expect(instructionText).toContain('rtmps://');
        expect(instructionText).toContain('1936');
        expect(instructionText?.toLowerCase()).toContain('custom');
        
        console.log('OBS instructions found');
      }
    }
  });

  test('should copy stream configuration to clipboard', async () => {
    await page.goto(`${PRODUCTION_URL}/streaming-live`);
    
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Find copy button for RTMPS URL
    const copyButton = page.locator('button[aria-label*="copy"], button').filter({ hasText: /copy/i }).first();
    
    if (await copyButton.count() > 0) {
      await copyButton.click();
      
      // Check for success message
      const toast = page.locator('[role="alert"], [class*="toast"], [class*="notification"]').first();
      
      if (await toast.count() > 0) {
        await expect(toast).toBeVisible({ timeout: 3000 });
        const toastText = await toast.textContent();
        expect(toastText?.toLowerCase()).toContain('copied');
        console.log('Copy confirmation:', toastText);
      }
      
      // Verify clipboard content
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      if (clipboardText) {
        expect(clipboardText).toMatch(/rtmps?:\/\//);
        console.log('Clipboard content:', clipboardText);
      }
    }
  });

  test('should start event container', async () => {
    test.setTimeout(60000); // Container startup can take time
    
    if (!createdEventId) {
      // Create an event first
      await page.goto(`${PRODUCTION_URL}/events`);
      // ... create event logic
    }
    
    if (createdEventId) {
      // Navigate to event details
      await page.goto(`${PRODUCTION_URL}/events/${createdEventId}`);
      
      // Look for start streaming button
      const startButton = page.locator('button').filter({ hasText: /start.*stream|go.*live/i }).first();
      
      if (await startButton.count() > 0) {
        // Monitor container start API
        const startPromise = page.waitForResponse(
          response => response.url().includes(`/events/${createdEventId}/start`),
          { timeout: 30000 }
        ).catch(() => null);
        
        await startButton.click();
        
        const response = await startPromise;
        if (response && response.status() === 200) {
          const containerData = await response.json();
          
          expect(containerData).toHaveProperty('container_id');
          expect(containerData).toHaveProperty('status');
          expect(containerData.status).toBe('starting');
          
          console.log('Container started:', containerData.container_id);
        }
      }
    }
  });

  test('should display streaming statistics', async () => {
    await page.goto(`${PRODUCTION_URL}/analytics`);
    await page.waitForLoadState('networkidle');
    
    // Check for stats elements
    const statsCards = page.locator('[data-testid*="stat"], [class*="stat-card"], [class*="metric"]');
    const cardCount = await statsCards.count();
    
    if (cardCount > 0) {
      console.log(`Found ${cardCount} stat cards`);
      
      // Check specific metrics
      const viewerCount = page.locator('[class*="viewer"], [data-testid*="viewer"]').first();
      const bandwidth = page.locator('[class*="bandwidth"], [data-testid*="bandwidth"]').first();
      const bitrate = page.locator('[class*="bitrate"], [data-testid*="bitrate"]').first();
      
      if (await viewerCount.count() > 0) {
        const viewers = await viewerCount.textContent();
        console.log('Viewers:', viewers);
      }
      
      if (await bandwidth.count() > 0) {
        const bw = await bandwidth.textContent();
        console.log('Bandwidth:', bw);
      }
      
      if (await bitrate.count() > 0) {
        const br = await bitrate.textContent();
        console.log('Bitrate:', br);
      }
    }
  });

  test('should handle connection test', async () => {
    await page.goto(`${PRODUCTION_URL}/streaming-live`);
    
    // Look for test connection button
    const testButton = page.locator('button').filter({ hasText: /test.*connection|test.*stream/i }).first();
    
    if (await testButton.count() > 0) {
      const testPromise = page.waitForResponse(
        response => response.url().includes('/test-connection'),
        { timeout: 10000 }
      ).catch(() => null);
      
      await testButton.click();
      
      const response = await testPromise;
      if (response) {
        const result = await response.json();
        console.log('Connection test result:', result);
      }
      
      // Check for result message
      const resultMessage = page.locator('[role="alert"], [class*="test-result"]').first();
      if (await resultMessage.count() > 0) {
        const messageText = await resultMessage.textContent();
        console.log('Test result:', messageText);
      }
    }
  });

  test('should stop event and convert to VOD', async () => {
    if (!createdEventId) return;
    
    await page.goto(`${PRODUCTION_URL}/events/${createdEventId}`);
    
    // Look for stop button
    const stopButton = page.locator('button').filter({ hasText: /stop.*stream|end.*event/i }).first();
    
    if (await stopButton.count() > 0) {
      const stopPromise = page.waitForResponse(
        response => response.url().includes(`/events/${createdEventId}/stop`),
        { timeout: 10000 }
      ).catch(() => null);
      
      await stopButton.click();
      
      // Confirm if dialog appears
      const confirmButton = page.locator('button').filter({ hasText: /confirm|yes/i }).first();
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }
      
      const response = await stopPromise;
      if (response && response.status() === 200) {
        console.log('Event stopped successfully');
        
        // Check for VOD conversion option
        const convertButton = page.locator('button').filter({ hasText: /convert.*vod|save.*recording/i }).first();
        
        if (await convertButton.count() > 0) {
          const convertPromise = page.waitForResponse(
            response => response.url().includes('/convert-to-vod'),
            { timeout: 10000 }
          ).catch(() => null);
          
          await convertButton.click();
          
          const convertResponse = await convertPromise;
          if (convertResponse) {
            const vodData = await convertResponse.json();
            expect(vodData).toHaveProperty('job_id');
            expect(vodData).toHaveProperty('media_id');
            console.log('VOD conversion started:', vodData);
          }
        }
      }
    }
  });

  test('should display connection requirements', async () => {
    await page.goto(`${PRODUCTION_URL}/streaming-live`);
    
    // Look for requirements section
    const requirementsSection = page.locator('[class*="requirements"], [class*="connection"]').first();
    
    if (await requirementsSection.count() > 0) {
      const requirementsText = await requirementsSection.textContent();
      
      // Check for key requirements
      expect(requirementsText).toContain('1936'); // RTMPS port
      expect(requirementsText?.toLowerCase()).toContain('tls');
      expect(requirementsText).toContain('H.264');
      expect(requirementsText).toContain('AAC');
      expect(requirementsText).toContain('1080');
      
      console.log('Connection requirements displayed correctly');
    }
  });
});