const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('📸 Testing full login to dashboard flow...');
  
  // Navigate to login page
  await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/login', { 
    waitUntil: 'networkidle' 
  });
  
  // Fill and submit login
  await page.fill('input[type="email"]', 'admin@acme.com');
  await page.fill('input[type="password"]', 'AcmeTest123!');
  await page.click('button:has-text("Sign In")');
  
  // Wait for dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  // Take dashboard screenshot
  await page.screenshot({ 
    path: '/tmp/dashboard-fixed.png', 
    fullPage: true 
  });
  console.log('✅ Dashboard screenshot: /tmp/dashboard-fixed.png');
  
  await browser.close();
})();