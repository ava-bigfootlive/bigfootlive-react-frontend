const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to the deployed site
  await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/login', { 
    waitUntil: 'networkidle' 
  });
  
  // Take screenshot
  await page.screenshot({ 
    path: '/tmp/login-page.png', 
    fullPage: true 
  });
  
  console.log('Screenshot saved to /tmp/login-page.png');
  
  await browser.close();
})();