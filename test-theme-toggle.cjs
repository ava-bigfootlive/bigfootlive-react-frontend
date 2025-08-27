const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('📸 Testing navigation and theme toggle...');
  
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
  
  // Take dark mode screenshot
  await page.screenshot({ 
    path: '/tmp/dashboard-dark-mode.png', 
    fullPage: true 
  });
  console.log('✅ Dark mode screenshot: /tmp/dashboard-dark-mode.png');
  
  // Find and click theme toggle
  const themeToggle = await page.locator('[data-testid="theme-toggle"]');
  if (await themeToggle.isVisible()) {
    console.log('✅ Theme toggle found, clicking to switch to light mode...');
    await themeToggle.click();
    await page.waitForTimeout(1000);
    
    // Take light mode screenshot
    await page.screenshot({ 
      path: '/tmp/dashboard-light-mode.png', 
      fullPage: true 
    });
    console.log('✅ Light mode screenshot: /tmp/dashboard-light-mode.png');
  } else {
    console.log('❌ Theme toggle not found');
  }
  
  // Check for navigation sidebar
  const sidebar = await page.locator('aside').first();
  if (await sidebar.isVisible()) {
    console.log('✅ Navigation sidebar is visible');
    
    // List navigation items
    const navItems = await page.locator('nav a').allTextContents();
    console.log('📍 Navigation items:', navItems);
  } else {
    console.log('❌ Navigation sidebar not visible');
    
    // Try to open mobile menu
    const menuButton = await page.locator('button:has(svg)').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(1000);
      console.log('📱 Opened mobile menu');
    }
  }
  
  await browser.close();
})();