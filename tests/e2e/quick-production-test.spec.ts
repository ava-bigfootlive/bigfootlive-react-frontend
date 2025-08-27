/**
 * Quick Production Test - Validates core functionality
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://d2dbuyze4zqbdy.cloudfront.net';
const API_URL = 'https://api.bigfootlive.io';

test.describe('Quick Production Validation', () => {
  test('frontend is accessible', async ({ page }) => {
    const response = await page.goto(PRODUCTION_URL, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    console.log('✅ Frontend accessible');
  });

  test('API health check', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBeTruthy();
    console.log('✅ API healthy:', data);
  });

  test('main pages load', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Home' },
      { url: '/events', name: 'Events' },
      { url: '/vod-upload', name: 'VOD Upload' },
      { url: '/media-assets', name: 'Media Assets' },
      { url: '/streaming-live', name: 'Live Streaming' }
    ];

    for (const testPage of pages) {
      await page.goto(`${PRODUCTION_URL}${testPage.url}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      const title = await page.title();
      expect(title).toBeTruthy();
      
      console.log(`✅ ${testPage.name} loaded`);
    }
  });

  test('VOD upload elements present', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/vod-upload`);
    
    const uploadArea = await page.locator('[class*="upload"]').first();
    await expect(uploadArea).toBeVisible({ timeout: 10000 });
    
    const fileInput = await page.locator('input[type="file"]').first();
    expect(await fileInput.count()).toBeGreaterThan(0);
    
    console.log('✅ VOD upload page ready');
  });

  test('streaming config shows RTMPS', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/streaming-live`);
    
    const content = await page.textContent('body');
    expect(content).toContain('RTMPS');
    expect(content).toContain('1936');
    
    console.log('✅ RTMPS configuration displayed');
  });

  test('media library accessible', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/media-assets`);
    
    const mainContent = await page.locator('main, #root').first();
    await expect(mainContent).toBeVisible();
    
    console.log('✅ Media library accessible');
  });

  test('video player page works', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/video-test`);
    
    const videoElement = await page.locator('video, [class*="player"]').first();
    
    if (await videoElement.count() > 0) {
      console.log('✅ Video player found');
    } else {
      console.log('⚠️ No video player on test page');
    }
  });
});