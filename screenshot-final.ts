import { chromium } from 'playwright';

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Navigate to login
  await page.goto('http://localhost:5173');
  
  // Login
  await page.fill('input[type="email"]', 'admin@acme.com');
  await page.fill('input[type="password"]', 'AcmeTest123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  
  // Dashboard in dark mode
  await page.screenshot({ path: '/tmp/final-dashboard-dark.png' });
  
  // Toggle to light mode
  const themeToggle = page.locator('button[aria-label*="theme"], button:has(svg[class*="sun"]), button:has(svg[class*="moon"])').first();
  await themeToggle.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/final-dashboard-light.png' });
  
  // Navigate using sidebar to Analytics
  await page.click('a:has-text("Analytics")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/final-analytics-light.png' });
  
  // Navigate to Chat
  await page.click('a:has-text("Chat")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/final-chat-light.png' });
  
  // Navigate to Events
  await page.click('a:has-text("Events")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/final-events-light.png' });
  
  // Navigate to Documentation
  await page.click('a:has-text("Documentation")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/final-docs-light.png' });
  
  // Navigate to Streaming
  await page.click('a:has-text("Streaming")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/final-streaming-light.png' });
  
  // Toggle back to dark mode
  const darkToggle = page.locator('button[aria-label*="theme"], button:has(svg[class*="sun"]), button:has(svg[class*="moon"])').first();
  await darkToggle.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/final-streaming-dark.png' });
  
  console.log('Final screenshots taken!');
  await browser.close();
}

takeScreenshots().catch(console.error);