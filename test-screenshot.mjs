import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

console.log('Navigating to site...');
await page.goto('https://d2dbuyze4zqbdy.cloudfront.net');
await page.waitForTimeout(3000);

console.log('Taking screenshot of login page...');
await page.screenshot({ path: 'screenshots/login-page.png', fullPage: true });

// Check page styling
const hasStyles = await page.evaluate(() => {
  const body = document.body;
  return window.getComputedStyle(body).backgroundColor !== 'rgba(0, 0, 0, 0)';
});
console.log('Page has styling:', hasStyles);

// Check for login elements
const emailInput = await page.$('[data-testid="email-input"]');
console.log('Email input found:', !!emailInput);

// Check page content for GUID
const pageText = await page.textContent('body');
if (pageText.includes('45d9d97e')) {
  console.log('WARNING: GUID found in page content!');
}

await browser.close();
