const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('📸 Testing all new features...');
  
  // Navigate and login
  await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/login', { 
    waitUntil: 'networkidle' 
  });
  
  await page.fill('input[type="email"]', 'admin@acme.com');
  await page.fill('input[type="password"]', 'AcmeTest123!');
  await page.click('button:has-text("Sign In")');
  
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  // Test light mode
  console.log('Testing light mode...');
  const themeToggle = await page.locator('[data-testid="theme-toggle"]');
  await themeToggle.click();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: '/tmp/dashboard-light-fixed.png', 
    fullPage: true 
  });
  console.log('✅ Light mode screenshot: /tmp/dashboard-light-fixed.png');
  
  // Test dark mode toggle back
  console.log('Testing dark mode toggle back...');
  await themeToggle.click();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: '/tmp/dashboard-dark-fixed.png', 
    fullPage: true 
  });
  console.log('✅ Dark mode screenshot: /tmp/dashboard-dark-fixed.png');
  
  // Navigate to User Management
  console.log('Testing User Management page...');
  const userManagementLink = await page.locator('a:has-text("User Management")');
  if (await userManagementLink.isVisible()) {
    await userManagementLink.click();
    await page.waitForURL('**/users', { timeout: 5000 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: '/tmp/user-management.png', 
      fullPage: true 
    });
    console.log('✅ User Management screenshot: /tmp/user-management.png');
  } else {
    console.log('❌ User Management link not found');
  }
  
  await browser.close();
})();