const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('📸 Checking dashboard for theme toggle and navigation...');
  
  // Navigate to login page
  await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/login', { 
    waitUntil: 'networkidle' 
  });
  
  // Login
  await page.fill('input[type="email"]', 'admin@acme.com');
  await page.fill('input[type="password"]', 'AcmeTest123!');
  await page.click('button:has-text("Sign In")');
  
  // Wait for dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  // Look for theme toggle
  const themeToggleExists = await page.locator('[data-testid="theme-toggle"]').count() > 0 ||
                            await page.locator('button:has-text("Toggle theme")').count() > 0 ||
                            await page.locator('button[aria-label*="theme"]').count() > 0 ||
                            await page.locator('[class*="theme"]').count() > 0;
  
  console.log(`Theme toggle exists: ${themeToggleExists}`);
  
  // Look for navigation menu
  const navMenuExists = await page.locator('nav').count() > 0;
  const sidebarExists = await page.locator('[data-testid="sidebar"]').count() > 0 ||
                         await page.locator('aside').count() > 0;
  
  console.log(`Navigation menu exists: ${navMenuExists}`);
  console.log(`Sidebar exists: ${sidebarExists}`);
  
  // Check for menu items
  const menuItems = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button'));
    return links.map(link => link.textContent?.trim()).filter(text => text && text.length > 0);
  });
  
  console.log('Found menu/button items:', menuItems);
  
  // Take screenshot
  await page.screenshot({ 
    path: '/tmp/dashboard-features.png', 
    fullPage: true 
  });
  console.log('✅ Dashboard screenshot saved to /tmp/dashboard-features.png');
  
  await browser.close();
})();