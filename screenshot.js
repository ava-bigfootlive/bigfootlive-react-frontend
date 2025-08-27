const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Screenshot landing page
  await page.goto('https://d39hsmqppuzm82.cloudfront.net/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'landing-page.png', fullPage: false });
  
  // Screenshot login page
  await page.goto('https://d39hsmqppuzm82.cloudfront.net/login');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'login-page.png', fullPage: false });
  
  await browser.close();
})();
