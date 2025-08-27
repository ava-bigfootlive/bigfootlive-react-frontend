import { test, expect, Page } from '@playwright/test';

test.describe('Closed Captioning System', () => {
  let page: Page;
  let streamPage: Page;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Login as streamer
    await page.goto('/login');
    await page.fill('[name="email"]', 'streamer@bigfootlive.io');
    await page.fill('[name="password"]', 'Stream123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Create event with captions enabled
    await page.goto('/events');
    await page.click('button:has-text("Create Event")');
    await page.fill('[name="title"]', 'Caption Test Event');
    await page.click('text=Streaming Configuration');
    await page.check('[name="enableLiveCaptions"]');
    await page.click('button:has-text("Create Event")');
  });

  test('should configure caption settings', async () => {
    // Go to caption settings
    await page.click('button:has-text("Caption Settings")');
    
    // Configure caption provider
    await page.selectOption('[name="captionProvider"]', 'aws-transcribe');
    
    // Set language
    await page.selectOption('[name="primaryLanguage"]', 'en-US');
    
    // Enable multi-language support
    await page.check('[name="enableMultiLanguage"]');
    await page.click('button:has-text("Add Language")');
    await page.selectOption('[name="additionalLanguage"]', 'es-ES');
    
    // Configure caption display
    await page.fill('[name="captionDelay"]', '2');
    await page.selectOption('[name="captionPosition"]', 'bottom');
    await page.fill('[name="captionLines"]', '2');
    
    // Configure accuracy settings
    await page.check('[name="enableProfanityFilter"]');
    await page.check('[name="enableSpeakerIdentification"]');
    await page.check('[name="enablePunctuation"]');
    
    // Save settings
    await page.click('button:has-text("Save Caption Settings")');
    await expect(page.locator('text=Caption settings saved')).toBeVisible();
  });

  test('should display live captions during stream', async () => {
    // Start streaming
    await page.click('button:has-text("Go Live")');
    await page.click('button:has-text("Start Streaming")');
    
    // Open viewer page
    const context = await page.context().browser()?.newContext();
    streamPage = await context!.newPage();
    await streamPage.goto('/event/caption-test-event/live');
    
    // Verify caption display container
    await expect(streamPage.locator('[data-testid="caption-display"]')).toBeVisible();
    await expect(streamPage.locator('[data-testid="caption-toggle"]')).toBeVisible();
    
    // Simulate speech (in real test, would use actual audio)
    await page.evaluate(() => {
      // Trigger mock caption event
      window.dispatchEvent(new CustomEvent('caption-received', {
        detail: {
          text: 'Hello, welcome to our live stream.',
          timestamp: Date.now(),
          speaker: 'Host'
        }
      }));
    });
    
    // Verify caption appears
    await expect(streamPage.locator('text=Hello, welcome to our live stream.')).toBeVisible();
    await expect(streamPage.locator('text=Host:')).toBeVisible();
  });

  test('should handle caption customization by viewer', async () => {
    await streamPage.goto('/event/caption-test-event/live');
    
    // Open caption settings
    await streamPage.click('[data-testid="caption-settings"]');
    
    // Change font size
    await streamPage.click('[data-testid="font-size-increase"]');
    const fontSize = await streamPage.locator('[data-testid="caption-text"]').evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(parseInt(fontSize)).toBeGreaterThan(16);
    
    // Change font color
    await streamPage.fill('[name="captionColor"]', '#FF0000');
    const color = await streamPage.locator('[data-testid="caption-text"]').evaluate(el => 
      window.getComputedStyle(el).color
    );
    expect(color).toBe('rgb(255, 0, 0)');
    
    // Change background opacity
    await streamPage.fill('[name="backgroundOpacity"]', '0.5');
    const opacity = await streamPage.locator('[data-testid="caption-background"]').evaluate(el => 
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBe(0.5);
    
    // Change position
    await streamPage.selectOption('[name="captionPosition"]', 'top');
    await expect(streamPage.locator('[data-testid="caption-display"].caption-top')).toBeVisible();
  });

  test('should support multiple languages', async () => {
    await streamPage.goto('/event/caption-test-event/live');
    
    // Change caption language
    await streamPage.click('[data-testid="language-selector"]');
    await streamPage.click('text=Español');
    
    // Verify language change
    await expect(streamPage.locator('text=Subtítulos en español')).toBeVisible();
    
    // Simulate Spanish caption
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('caption-received', {
        detail: {
          text: 'Hola, bienvenidos a nuestra transmisión en vivo.',
          timestamp: Date.now(),
          language: 'es-ES'
        }
      }));
    });
    
    await expect(streamPage.locator('text=Hola, bienvenidos')).toBeVisible();
  });

  test('should export caption transcript', async () => {
    // Stream for a bit with captions
    await page.click('button:has-text("Go Live")');
    
    // Add test captions
    const testCaptions = [
      'Welcome to our presentation.',
      'Today we will discuss important topics.',
      'Let me share my screen.',
      'As you can see on this slide.'
    ];
    
    for (const caption of testCaptions) {
      await page.evaluate((text) => {
        window.dispatchEvent(new CustomEvent('caption-received', {
          detail: { text, timestamp: Date.now() }
        }));
      }, caption);
      await page.waitForTimeout(1000);
    }
    
    // Stop streaming
    await page.click('button:has-text("End Stream")');
    
    // Export transcript
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Transcript")');
    
    // Select export format
    await page.selectOption('[name="transcriptFormat"]', 'srt');
    await page.click('button:has-text("Download")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.srt');
  });

  test('should edit caption transcript post-stream', async () => {
    // Go to completed event
    await page.goto('/events');
    await page.click('tr:has-text("Caption Test Event")');
    await page.click('tab:has-text("Captions")');
    
    // Load transcript editor
    await page.click('button:has-text("Edit Transcript")');
    
    // Find and edit a caption
    const captionRow = page.locator('tr:has-text("Hello, welcome")').first();
    await captionRow.click();
    
    // Edit caption text
    await page.fill('[name="captionText"]', 'Hello, welcome to our amazing live stream.');
    
    // Adjust timing
    await page.fill('[name="startTime"]', '00:00:05.000');
    await page.fill('[name="endTime"]', '00:00:08.000');
    
    // Add speaker identification
    await page.fill('[name="speaker"]', 'John Doe');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Transcript updated')).toBeVisible();
  });

  test('should handle real-time caption corrections', async () => {
    await page.click('button:has-text("Go Live")');
    
    // Enable live correction mode
    await page.click('[data-testid="enable-corrections"]');
    
    // Simulate incorrect caption
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('caption-received', {
        detail: {
          text: 'The whether is nice today.',
          timestamp: Date.now(),
          id: 'caption-1'
        }
      }));
    });
    
    // Correct the caption
    await page.click('[data-testid="caption-1-edit"]');
    await page.fill('[name="correctedText"]', 'The weather is nice today.');
    await page.keyboard.press('Enter');
    
    // Verify correction applied to viewers
    await expect(streamPage.locator('text=The weather is nice today.')).toBeVisible();
    await expect(streamPage.locator('text=The whether is nice today.')).not.toBeVisible();
  });

  test('should integrate with lower thirds for speaker names', async () => {
    await page.click('button:has-text("Go Live")');
    
    // Enable speaker lower thirds
    await page.click('[data-testid="caption-settings"]');
    await page.check('[name="showSpeakerLowerThird"]');
    
    // Configure speaker
    await page.fill('[name="speakerName"]', 'Dr. Jane Smith');
    await page.fill('[name="speakerTitle"]', 'Chief Technology Officer');
    
    // Start speaking
    await page.click('button:has-text("Start Speaking")');
    
    // Verify lower third appears with captions
    await expect(streamPage.locator('[data-testid="lower-third"]')).toBeVisible();
    await expect(streamPage.locator('text=Dr. Jane Smith')).toBeVisible();
    await expect(streamPage.locator('text=Chief Technology Officer')).toBeVisible();
    
    // Verify captions attributed to speaker
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('caption-received', {
        detail: {
          text: 'Thank you for joining us today.',
          speaker: 'Dr. Jane Smith'
        }
      }));
    });
    
    await expect(streamPage.locator('text=Dr. Jane Smith: Thank you for joining us today.')).toBeVisible();
  });

  test('should handle caption search and navigation', async () => {
    // Go to event with existing captions
    await page.goto('/events');
    await page.click('tr:has-text("Previous Event With Captions")');
    await page.click('tab:has-text("Captions")');
    
    // Search in transcript
    await page.fill('[placeholder="Search transcript..."]', 'important');
    
    // Verify search results
    await expect(page.locator('.search-result').first()).toBeVisible();
    await expect(page.locator('mark:has-text("important")')).toBeVisible();
    
    // Click to jump to timestamp
    await page.click('.search-result:first-child');
    
    // Verify video seeks to caption timestamp
    const currentTime = await page.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime);
    expect(currentTime).toBeGreaterThan(0);
  });

  test('should generate caption analytics', async () => {
    // Complete a stream with captions
    await page.click('button:has-text("Go Live")');
    await page.waitForTimeout(5000); // Simulate streaming
    await page.click('button:has-text("End Stream")');
    
    // Go to analytics
    await page.click('tab:has-text("Analytics")');
    await page.click('text=Caption Analytics');
    
    // Verify caption metrics
    await expect(page.locator('text=Caption Statistics')).toBeVisible();
    await expect(page.locator('[data-testid="total-captions"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-accuracy"]')).toBeVisible();
    await expect(page.locator('[data-testid="words-per-minute"]')).toBeVisible();
    await expect(page.locator('[data-testid="caption-coverage"]')).toBeVisible();
    
    // Check language breakdown
    await expect(page.locator('text=Language Distribution')).toBeVisible();
    await expect(page.locator('[data-testid="language-chart"]')).toBeVisible();
    
    // Verify viewer engagement with captions
    await expect(page.locator('text=Caption Usage')).toBeVisible();
    await expect(page.locator('text=82% of viewers enabled captions')).toBeVisible();
  });
});