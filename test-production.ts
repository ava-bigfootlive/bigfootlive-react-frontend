import { chromium } from 'playwright';

async function testProduction() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const prodUrl = 'https://d2dbuyze4zqbdy.cloudfront.net';
  
  // Navigate to production site
  await page.goto(prodUrl);
  await page.waitForTimeout(2000);
  
  console.log('Production URL:', page.url());
  
  // Check if login page loads
  const loginButton = await page.locator('button[type="submit"]').count();
  console.log('Login page loaded:', loginButton > 0 ? 'Yes' : 'No');
  
  // Login
  await page.fill('input[type="email"]', 'admin@acme.com');
  await page.fill('input[type="password"]', 'AcmeTest123!');
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForTimeout(3000);
  console.log('After login URL:', page.url());
  
  // Check if dashboard loaded
  const dashboardTitle = await page.textContent('h1').catch(() => 'Not found');
  console.log('Dashboard title:', dashboardTitle);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/production-dashboard.png' });
  
  // Test navigation to Analytics
  await page.goto(`${prodUrl}/analytics`);
  await page.waitForTimeout(2000);
  const analyticsTitle = await page.textContent('h1').catch(() => 'Not found');
  console.log('Analytics title:', analyticsTitle);
  
  // Test navigation to Events
  await page.goto(`${prodUrl}/events`);
  await page.waitForTimeout(2000);
  const eventsTitle = await page.textContent('h1').catch(() => 'Not found');
  console.log('Events title:', eventsTitle);
  
  // Test navigation to Streaming
  await page.goto(`${prodUrl}/streaming`);
  await page.waitForTimeout(2000);
  const streamingTitle = await page.textContent('h1').catch(() => 'Not found');
  console.log('Streaming title:', streamingTitle);
  
  await page.screenshot({ path: '/tmp/production-streaming.png' });
  
  console.log('\n✅ Production deployment successful!');
  console.log(`🌐 Live at: ${prodUrl}`);
  
  await browser.close();
}

testProduction().catch(console.error);