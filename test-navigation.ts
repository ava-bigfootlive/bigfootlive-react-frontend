import { chromium } from 'playwright';

async function testNavigation() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Navigate to login
  await page.goto('http://localhost:5173');
  
  // Login
  await page.fill('input[type="email"]', 'admin@acme.com');
  await page.fill('input[type="password"]', 'AcmeTest123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  
  // Toggle to light mode
  const themeToggle = page.locator('button[aria-label*="theme"], button:has(svg[class*="sun"]), button:has(svg[class*="moon"])').first();
  await themeToggle.click();
  await page.waitForTimeout(500);
  
  console.log('Current URL after dashboard:', page.url());
  
  // Try navigating to Analytics via URL
  await page.goto('http://localhost:5173/analytics');
  await page.waitForTimeout(1000);
  console.log('URL after analytics navigation:', page.url());
  const analyticsTitle = await page.textContent('h1');
  console.log('Analytics page title:', analyticsTitle);
  await page.screenshot({ path: '/tmp/test-analytics.png' });
  
  // Try navigating to Events via URL
  await page.goto('http://localhost:5173/events');
  await page.waitForTimeout(1000);
  console.log('URL after events navigation:', page.url());
  const eventsTitle = await page.textContent('h1');
  console.log('Events page title:', eventsTitle);
  await page.screenshot({ path: '/tmp/test-events.png' });
  
  // Try navigating to Streaming via URL
  await page.goto('http://localhost:5173/streaming');
  await page.waitForTimeout(1000);
  console.log('URL after streaming navigation:', page.url());
  const streamingTitle = await page.textContent('h1');
  console.log('Streaming page title:', streamingTitle);
  await page.screenshot({ path: '/tmp/test-streaming.png' });
  
  await browser.close();
}

testNavigation().catch(console.error);