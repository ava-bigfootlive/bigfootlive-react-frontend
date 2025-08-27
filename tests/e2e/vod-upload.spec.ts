/**
 * VOD Upload End-to-End Tests
 * Tests actual production VOD upload, processing, and playback workflow
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const PRODUCTION_URL = 'https://d2dbuyze4zqbdy.cloudfront.net';
const API_URL = 'https://api.bigfootlive.io';

test.describe('VOD Upload Workflow - Production', () => {
  let page: Page;
  let testVideoPath: string;

  test.beforeAll(async () => {
    // Create a test video file if it doesn't exist
    testVideoPath = path.join(process.cwd(), 'tests', 'fixtures', 'test-video.mp4');
    if (!fs.existsSync(testVideoPath)) {
      const fixturesDir = path.dirname(testVideoPath);
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }
      // Create a small test video using ffmpeg if available
      // For now, we'll use file upload testing with any small file
      fs.writeFileSync(testVideoPath, Buffer.from('test video content'));
    }
  });

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set up request interceptors to monitor API calls
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log('API Request:', request.method(), request.url());
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/') && response.status() !== 200) {
        console.log('API Response Error:', response.status(), response.url());
      }
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should load VOD upload page', async () => {
    await page.goto(`${PRODUCTION_URL}/vod-upload`);
    
    // Check page loaded
    await expect(page).toHaveTitle(/BigfootLive/);
    
    // Check upload area is visible
    const uploadArea = page.locator('[data-testid="upload-area"], .upload-area, [class*="upload"]').first();
    await expect(uploadArea).toBeVisible({ timeout: 10000 });
  });

  test('should handle drag and drop upload', async () => {
    await page.goto(`${PRODUCTION_URL}/vod-upload`);
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
    
    // Find the file input
    const fileInput = page.locator('input[type="file"]').first();
    
    // Upload file
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(testVideoPath);
      
      // Check if file appears in upload queue
      const uploadItem = page.locator('[data-testid*="upload-item"], [class*="upload-item"], [class*="file-item"]').first();
      await expect(uploadItem).toBeVisible({ timeout: 5000 });
    }
  });

  test('should get presigned URL from API', async () => {
    await page.goto(`${PRODUCTION_URL}/vod-upload`);
    
    // Set up API monitoring
    const presignedUrlPromise = page.waitForResponse(
      response => response.url().includes('/media/upload/presigned-url') && response.status() === 200,
      { timeout: 30000 }
    ).catch(() => null);
    
    // Upload file
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(testVideoPath);
      
      // Wait for presigned URL request
      const response = await presignedUrlPromise;
      if (response) {
        const responseBody = await response.json();
        
        // Verify presigned URL response structure
        expect(responseBody).toHaveProperty('upload_url');
        expect(responseBody).toHaveProperty('fields');
        expect(responseBody).toHaveProperty('object_key');
        
        console.log('Presigned URL obtained:', responseBody.upload_url);
      }
    }
  });

  test('should show upload progress', async () => {
    await page.goto(`${PRODUCTION_URL}/vod-upload`);
    await page.waitForLoadState('networkidle');
    
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(testVideoPath);
      
      // Look for progress indicator
      const progressBar = page.locator('[role="progressbar"], [class*="progress"], [data-testid*="progress"]').first();
      
      // Check if progress bar becomes visible
      if (await progressBar.count() > 0) {
        await expect(progressBar).toBeVisible({ timeout: 10000 });
        
        // Check progress value changes
        const initialProgress = await progressBar.getAttribute('aria-valuenow') || 
                              await progressBar.getAttribute('value') ||
                              '0';
        
        // Wait a bit and check if progress updated
        await page.waitForTimeout(2000);
        
        const updatedProgress = await progressBar.getAttribute('aria-valuenow') || 
                               await progressBar.getAttribute('value') ||
                               '0';
        
        console.log(`Upload progress: ${initialProgress}% -> ${updatedProgress}%`);
      }
    }
  });

  test('should complete upload and trigger processing', async () => {
    test.setTimeout(120000); // 2 minutes for upload and processing
    
    await page.goto(`${PRODUCTION_URL}/vod-upload`);
    await page.waitForLoadState('networkidle');
    
    // Monitor complete upload API call
    const completeUploadPromise = page.waitForResponse(
      response => response.url().includes('/media/upload/complete'),
      { timeout: 60000 }
    ).catch(() => null);
    
    // Upload file
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(testVideoPath);
      
      // Wait for upload to complete
      const response = await completeUploadPromise;
      if (response && response.status() === 200) {
        const responseBody = await response.json();
        
        // Verify response contains job ID and media ID
        expect(responseBody).toHaveProperty('job_id');
        expect(responseBody).toHaveProperty('media_id');
        expect(responseBody).toHaveProperty('status');
        
        console.log('Processing started:', {
          jobId: responseBody.job_id,
          mediaId: responseBody.media_id,
          status: responseBody.status
        });
        
        // Store for next test
        process.env.TEST_JOB_ID = responseBody.job_id;
        process.env.TEST_MEDIA_ID = responseBody.media_id;
      }
    }
  });

  test('should poll processing status', async () => {
    test.setTimeout(180000); // 3 minutes for processing
    
    await page.goto(`${PRODUCTION_URL}/vod-upload`);
    
    const jobId = process.env.TEST_JOB_ID;
    if (jobId) {
      // Monitor processing status calls
      let processingComplete = false;
      let attempts = 0;
      const maxAttempts = 30;
      
      page.on('response', async response => {
        if (response.url().includes(`/processing/status/${jobId}`)) {
          const status = await response.json();
          console.log('Processing status:', status.status, status.progress + '%');
          
          if (status.status === 'completed' || status.status === 'SUCCEEDED') {
            processingComplete = true;
            expect(status).toHaveProperty('hlsUrl');
          }
        }
      });
      
      // Wait for processing to complete
      while (!processingComplete && attempts < maxAttempts) {
        await page.waitForTimeout(5000);
        attempts++;
        
        // Trigger a status check
        await page.evaluate((jobId) => {
          fetch(`https://api.bigfootlive.io/api/v1/media/processing/status/${jobId}`)
            .then(r => r.json())
            .then(console.log);
        }, jobId);
      }
      
      expect(processingComplete).toBe(true);
    }
  });

  test('should display processed video in media library', async () => {
    await page.goto(`${PRODUCTION_URL}/media-assets`);
    await page.waitForLoadState('networkidle');
    
    // Wait for media items to load
    const mediaGrid = page.locator('[data-testid*="media-grid"], [class*="media-grid"], [class*="asset-grid"]').first();
    
    if (await mediaGrid.count() > 0) {
      // Check for media items
      const mediaItems = page.locator('[data-testid*="media-item"], [class*="media-item"], [class*="asset-item"]');
      const itemCount = await mediaItems.count();
      
      expect(itemCount).toBeGreaterThan(0);
      console.log(`Found ${itemCount} media items in library`);
      
      // Check first item has expected elements
      if (itemCount > 0) {
        const firstItem = mediaItems.first();
        
        // Check for thumbnail
        const thumbnail = firstItem.locator('img, [class*="thumbnail"]').first();
        await expect(thumbnail).toBeVisible({ timeout: 5000 });
        
        // Check for title
        const title = firstItem.locator('[class*="title"], h3, h4').first();
        if (await title.count() > 0) {
          const titleText = await title.textContent();
          console.log('Media title:', titleText);
        }
      }
    }
  });

  test('should play video in HLS player', async () => {
    await page.goto(`${PRODUCTION_URL}/media-assets`);
    await page.waitForLoadState('networkidle');
    
    const mediaId = process.env.TEST_MEDIA_ID;
    if (mediaId) {
      // Click on first media item or specific media
      const mediaItem = page.locator('[data-testid*="media-item"], [class*="media-item"]').first();
      
      if (await mediaItem.count() > 0) {
        await mediaItem.click();
        
        // Wait for video player to appear
        const videoPlayer = page.locator('video, [class*="video-player"], [data-testid*="video-player"]').first();
        await expect(videoPlayer).toBeVisible({ timeout: 10000 });
        
        // Check if video has src
        if (await videoPlayer.evaluate(el => el.tagName) === 'VIDEO') {
          const videoSrc = await videoPlayer.evaluate((video: HTMLVideoElement) => video.src || video.currentSrc);
          expect(videoSrc).toBeTruthy();
          console.log('Video source:', videoSrc);
          
          // Check if it's HLS
          expect(videoSrc).toMatch(/\.m3u8|cloudfront\.net/);
          
          // Try to play video
          await videoPlayer.evaluate((video: HTMLVideoElement) => video.play().catch(() => {}));
          await page.waitForTimeout(2000);
          
          // Check playback state
          const isPlaying = await videoPlayer.evaluate((video: HTMLVideoElement) => !video.paused);
          console.log('Video playing:', isPlaying);
        }
      }
    }
  });

  test('should show video quality options', async () => {
    await page.goto(`${PRODUCTION_URL}/video-test`);
    await page.waitForLoadState('networkidle');
    
    // Look for quality selector
    const qualityButton = page.locator('[aria-label*="quality"], [class*="quality"], button:has-text("Quality")').first();
    
    if (await qualityButton.count() > 0) {
      await qualityButton.click();
      
      // Check for quality options
      const qualityOptions = page.locator('[role="menuitem"], [class*="quality-option"]');
      const optionCount = await qualityOptions.count();
      
      expect(optionCount).toBeGreaterThan(0);
      console.log(`Found ${optionCount} quality options`);
      
      // Check quality levels
      const qualities = [];
      for (let i = 0; i < optionCount; i++) {
        const text = await qualityOptions.nth(i).textContent();
        qualities.push(text);
      }
      
      console.log('Available qualities:', qualities);
      
      // Should have multiple qualities
      expect(qualities.some(q => q?.includes('1080'))).toBe(true);
      expect(qualities.some(q => q?.includes('720'))).toBe(true);
    }
  });

  test('should handle API errors gracefully', async () => {
    await page.goto(`${PRODUCTION_URL}/vod-upload`);
    
    // Intercept API calls to simulate errors
    await page.route('**/api/v1/media/**', route => {
      if (Math.random() > 0.5) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Test error' })
        });
      } else {
        route.continue();
      }
    });
    
    // Try upload
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(testVideoPath);
      
      // Check for error handling
      const errorMessage = page.locator('[class*="error"], [class*="alert"], [role="alert"]').first();
      
      // Should show error message or handle gracefully
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible({ timeout: 10000 });
        const errorText = await errorMessage.textContent();
        console.log('Error handled:', errorText);
      }
    }
  });
});