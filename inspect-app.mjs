import { chromium } from 'playwright';

const browser = await chromium.launch({ 
  headless: false,
  timeout: 60000 
});

const context = await browser.newContext({
  ignoreHTTPSErrors: true
});

const page = await context.newPage();

console.log('Going to acme.bigfootlive.io...');
await page.goto('https://acme.bigfootlive.io/login', { waitUntil: 'networkidle' });

console.log('Filling login form...');
await page.fill('input[type="email"]', 'admin@acme.com');
await page.fill('input[type="password"]', 'AcmeTest123!');

console.log('Clicking sign in...');
await page.getByRole('button', { name: /sign in/i }).click();

console.log('Waiting for navigation...');
try {
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('Successfully reached dashboard!');
} catch (e) {
  console.log('Failed to reach dashboard, current URL:', page.url());
}

// Take screenshot
await page.screenshot({ path: 'screenshots/final-state.png', fullPage: true });

// Get sidebar content if it exists
const sidebar = await page.$('aside');
if (sidebar) {
  const html = await sidebar.innerHTML();
  console.log('\n=== SIDEBAR HTML ===');
  console.log(html);
}

await page.waitForTimeout(5000);
await browser.close();
