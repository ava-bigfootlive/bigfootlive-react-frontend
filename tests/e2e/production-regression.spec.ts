/**
 * Production Regression Test Suite
 * Comprehensive E2E tests for all critical platform functionality
 */

import { test, expect, Page } from '@playwright/test';

const PRODUCTION_URL = 'https://d2dbuyze4zqbdy.cloudfront.net';
const API_URL = 'https://api.bigfootlive.io';

test.describe('Production Regression Suite', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Log console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
    
    // Log network failures
    page.on('requestfailed', request => {
      console.error('Request failed:', request.url(), request.failure()?.errorText);
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('Core Platform Health', () => {
    test('frontend loads successfully', async () => {
      const response = await page.goto(PRODUCTION_URL);
      expect(response?.status()).toBeLessThan(400);
      
      await expect(page).toHaveTitle(/BigfootLive/);
      
      // Check no critical errors in console
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      
      await page.waitForTimeout(2000);
      expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });

    test('API health check passes', async () => {
      const response = await page.request.get(`${API_URL}/health`);
      expect(response.status()).toBe(200);
      
      const health = await response.json();
      expect(health).toHaveProperty('status');
      expect(health.status).toMatch(/healthy|ok/i);
      
      console.log('API Health:', health);
    });

    test('CloudFront CDN responds correctly', async () => {
      const response = await page.request.head(PRODUCTION_URL);
      expect(response.status()).toBe(200);
      
      // Check CloudFront headers
      const headers = response.headers();
      expect(headers['x-cache'] || headers['x-amz-cf-id']).toBeTruthy();
      
      console.log('CDN Headers:', {
        cache: headers['x-cache'],
        cfId: headers['x-amz-cf-id'],
        contentType: headers['content-type']
      });
    });
  });

  test.describe('Navigation and Routing', () => {
    const routes = [
      { path: '/', name: 'Home' },
      { path: '/events', name: 'Events' },
      { path: '/streaming-live', name: 'Live Streaming' },
      { path: '/vod-upload', name: 'VOD Upload' },
      { path: '/media-assets', name: 'Media Assets' },
      { path: '/analytics', name: 'Analytics' },
      { path: '/chat', name: 'Chat' }
    ];

    for (const route of routes) {
      test(`${route.name} page loads`, async () => {
        await page.goto(`${PRODUCTION_URL}${route.path}`);
        await page.waitForLoadState('networkidle');
        
        // Check page loaded without errors
        const pageTitle = await page.title();
        expect(pageTitle).toBeTruthy();
        
        // Check main content is visible
        const mainContent = page.locator('main, #root, [role="main"]').first();
        await expect(mainContent).toBeVisible({ timeout: 5000 });
        
        console.log(`✓ ${route.name} loaded:`, route.path);
      });
    }

    test('navigation menu works', async () => {
      await page.goto(PRODUCTION_URL);
      
      // Find navigation menu
      const nav = page.locator('nav, [role="navigation"], header').first();
      await expect(nav).toBeVisible();
      
      // Test navigation links
      const navLinks = nav.locator('a[href]');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      console.log(`Found ${linkCount} navigation links`);
    });
  });

  test.describe('Media Upload and Processing', () => {
    test('upload page has all required elements', async () => {
      await page.goto(`${PRODUCTION_URL}/vod-upload`);
      
      // Check for upload area
      const uploadArea = page.locator('[class*="upload"], [data-testid*="upload"]').first();
      await expect(uploadArea).toBeVisible();
      
      // Check for file input
      const fileInput = page.locator('input[type="file"]');
      expect(await fileInput.count()).toBeGreaterThan(0);
      
      // Check for supported formats display
      const formatsText = await page.textContent('body');
      expect(formatsText).toContain('MP4');
      
      console.log('Upload page elements verified');
    });

    test('media library displays correctly', async () => {
      await page.goto(`${PRODUCTION_URL}/media-assets`);
      await page.waitForLoadState('networkidle');
      
      // Check for layout options
      const gridButton = page.locator('button[aria-label*="grid"], button:has-text("Grid")').first();
      const listButton = page.locator('button[aria-label*="list"], button:has-text("List")').first();
      
      if (await gridButton.count() > 0 && await listButton.count() > 0) {
        // Test grid view
        await gridButton.click();
        await page.waitForTimeout(500);
        
        // Test list view
        await listButton.click();
        await page.waitForTimeout(500);
        
        console.log('Media library layout toggles work');
      }
    });
  });

  test.describe('Live Streaming Features', () => {
    test('streaming page shows RTMPS configuration', async () => {
      await page.goto(`${PRODUCTION_URL}/streaming-live`);
      
      // Check for RTMPS mention
      const pageContent = await page.textContent('body');
      expect(pageContent).toContain('RTMPS');
      expect(pageContent).toContain('1936');
      expect(pageContent).toContain('TLS');
      
      // Check for security badge/notice
      const securityNotice = page.locator('[class*="secure"], [class*="security"], [class*="tls"]').first();
      if (await securityNotice.count() > 0) {
        await expect(securityNotice).toBeVisible();
        console.log('Security notice displayed');
      }
    });

    test('events page functionality', async () => {
      await page.goto(`${PRODUCTION_URL}/events`);
      
      // Check for create button
      const createButton = page.locator('button').filter({ hasText: /create|new|add/i }).first();
      expect(await createButton.count()).toBeGreaterThan(0);
      
      // Check for events list/grid
      const eventsList = page.locator('[class*="event"], [data-testid*="event"]');
      const eventsCount = await eventsList.count();
      
      console.log(`Events page has ${eventsCount} event items`);
    });
  });

  test.describe('Video Player Functionality', () => {
    test('video player test page works', async () => {
      await page.goto(`${PRODUCTION_URL}/video-test`);
      await page.waitForLoadState('networkidle');
      
      // Check for video element
      const video = page.locator('video').first();
      
      if (await video.count() > 0) {
        // Check video attributes
        const videoSrc = await video.evaluate((v: HTMLVideoElement) => v.src || v.currentSrc);
        
        if (videoSrc) {
          expect(videoSrc).toMatch(/\.m3u8|\.mp4/);
          console.log('Video source:', videoSrc);
        }
        
        // Check for player controls
        const playButton = page.locator('[aria-label*="play"], button:has-text("Play")').first();
        const volumeControl = page.locator('[aria-label*="volume"], [class*="volume"]').first();
        const fullscreenButton = page.locator('[aria-label*="fullscreen"], button[title*="fullscreen"]').first();
        
        if (await playButton.count() > 0) {
          console.log('Play button found');
        }
        if (await volumeControl.count() > 0) {
          console.log('Volume control found');
        }
        if (await fullscreenButton.count() > 0) {
          console.log('Fullscreen button found');
        }
      }
    });

    test('HLS playback support', async () => {
      await page.goto(`${PRODUCTION_URL}/video-test`);
      
      // Check for HLS.js library
      const hasHLS = await page.evaluate(() => {
        return typeof (window as any).Hls !== 'undefined' || 
               document.querySelector('script[src*="hls"]') !== null;
      });
      
      expect(hasHLS).toBe(true);
      console.log('HLS.js support confirmed');
    });
  });

  test.describe('Analytics and Monitoring', () => {
    test('analytics page displays metrics', async () => {
      await page.goto(`${PRODUCTION_URL}/analytics`);
      await page.waitForLoadState('networkidle');
      
      // Check for metric cards
      const metricCards = page.locator('[class*="card"], [class*="metric"], [class*="stat"]');
      const cardCount = await metricCards.count();
      
      expect(cardCount).toBeGreaterThan(0);
      console.log(`Analytics page has ${cardCount} metric cards`);
      
      // Check for charts
      const charts = page.locator('canvas, svg[class*="chart"], [class*="chart"]');
      const chartCount = await charts.count();
      
      if (chartCount > 0) {
        console.log(`Found ${chartCount} charts`);
      }
    });
  });

  test.describe('Responsive Design', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      test(`renders correctly on ${viewport.name}`, async () => {
        await page.setViewportSize(viewport);
        await page.goto(PRODUCTION_URL);
        
        // Check main elements are visible
        const header = page.locator('header, [role="banner"]').first();
        const main = page.locator('main, #root').first();
        
        await expect(header).toBeVisible();
        await expect(main).toBeVisible();
        
        // Check for horizontal scroll (shouldn't have any)
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        expect(hasHorizontalScroll).toBe(false);
        console.log(`✓ ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
      });
    }
  });

  test.describe('Error Handling', () => {
    test('404 page handles non-existent routes', async () => {
      const response = await page.goto(`${PRODUCTION_URL}/non-existent-page-12345`);
      
      // Should still return 200 (SPA behavior) but show 404 content
      expect(response?.status()).toBeLessThan(500);
      
      await page.waitForTimeout(1000);
      
      // Check for 404 message
      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/404|not found|doesn't exist/i);
      
      console.log('404 page displayed correctly');
    });

    test('handles API errors gracefully', async () => {
      await page.goto(`${PRODUCTION_URL}/events`);
      
      // Intercept API calls to simulate error
      await page.route('**/api/v1/events', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });
      
      // Trigger API call
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Should show empty state or error message, not crash
      const errorMessage = page.locator('[class*="error"], [class*="empty"], [role="alert"]').first();
      
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.textContent();
        console.log('Error handled:', errorText);
      }
      
      // Page should still be functional
      const mainContent = page.locator('main, #root').first();
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe('Performance Metrics', () => {
    test('page load performance', async () => {
      const startTime = Date.now();
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(10000); // Should load in under 10 seconds
      console.log(`Page load time: ${loadTime}ms`);
      
      // Check Core Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let lcp = 0;
          let fid = 0;
          let cls = 0;
          
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (entry.name === 'largest-contentful-paint') {
                lcp = entry.renderTime || entry.loadTime;
              }
            });
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          setTimeout(() => {
            resolve({ lcp, fid, cls });
          }, 3000);
        });
      });
      
      console.log('Performance metrics:', metrics);
    });
  });
});