import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

// Screenshot landing page
await page.goto('http://localhost:5173/');
await page.waitForTimeout(1000);
await page.screenshot({ path: 'landing-page.png', fullPage: false });

// Screenshot login page  
await page.goto('http://localhost:5173/login');
await page.waitForTimeout(1000);
await page.screenshot({ path: 'login-page.png', fullPage: false });

await browser.close();
console.log('Screenshots saved: landing-page.png and login-page.png');
