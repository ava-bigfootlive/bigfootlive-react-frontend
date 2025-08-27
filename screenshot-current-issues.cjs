const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('📸 Taking screenshots of current issues...');
  
  // Navigate and login
  await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/login', { 
    waitUntil: 'networkidle' 
  });
  
  await page.fill('input[type="email"]', 'admin@acme.com');
  await page.fill('input[type="password"]', 'AcmeTest123!');
  await page.click('button:has-text("Sign In")');
  
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Dashboard in light mode
  console.log('Testing Dashboard light mode...');
  const themeToggle = await page.locator('[data-testid="theme-toggle"]');
  if (await themeToggle.isVisible()) {
    await themeToggle.click();
    await page.waitForTimeout(1000);
  }
  
  await page.screenshot({ 
    path: '/tmp/before-dashboard-light.png', 
    fullPage: true 
  });
  console.log('✅ Dashboard light: /tmp/before-dashboard-light.png');
  
  // Navigate to User Management
  await page.click('a:has-text("User Management")');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: '/tmp/before-user-mgmt.png', 
    fullPage: true 
  });
  console.log('✅ User Management: /tmp/before-user-mgmt.png');
  
  // Navigate to Streaming page
  await page.click('a:has-text("Streaming")');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: '/tmp/before-streaming.png', 
    fullPage: true 
  });
  console.log('✅ Streaming page: /tmp/before-streaming.png');
  
  // Try Analytics (should redirect to dashboard)
  await page.click('a:has-text("Analytics")');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: '/tmp/before-analytics.png', 
    fullPage: true 
  });
  console.log('✅ Analytics page: /tmp/before-analytics.png');
  
  await browser.close();
})();