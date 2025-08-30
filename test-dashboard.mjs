import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

console.log('Navigating to site...');
await page.goto('https://d2dbuyze4zqbdy.cloudfront.net');

// Login
console.log('Logging in...');
await page.fill('[data-testid="email-input"]', 'admin@bigfootlive.io');
await page.fill('[data-testid="password-input"]', 'TestPass123!');
await page.click('[data-testid="login-button"]');

// Wait for navigation
console.log('Waiting for dashboard...');
await page.waitForTimeout(5000);

const currentUrl = page.url();
console.log('Current URL:', currentUrl);

// Take screenshot
await page.screenshot({ path: 'screenshots/dashboard.png', fullPage: true });

// Check for sidebar
const sidebar = await page.$('aside');
console.log('Sidebar found:', !!sidebar);

if (sidebar) {
  // Get all text in sidebar
  const sidebarText = await sidebar.textContent();
  console.log('Sidebar text includes GUID:', sidebarText.includes('45d9d97e'));
  
  // Check specific elements
  const navUser = await sidebar.$('.border-t');
  if (navUser) {
    const userText = await navUser.textContent();
    console.log('User section text:', userText);
  }
  
  // Take sidebar screenshot
  await sidebar.screenshot({ path: 'screenshots/sidebar.png' });
}

// Check for any text nodes containing the GUID
const guidElements = await page.$$('text=/45d9d97e/');
console.log('Elements containing GUID:', guidElements.length);

await browser.close();
