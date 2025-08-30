import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

console.log('Navigating to site...');
await page.goto('https://d2dbuyze4zqbdy.cloudfront.net');
await page.waitForTimeout(2000);

// Login with correct credentials
console.log('Logging in with admin@acme.com...');
await page.fill('input[placeholder="Enter your email address"]', 'admin@acme.com');
await page.fill('input[placeholder="Enter your password"]', 'AcmeTest123!');
await page.click('button:has-text("Sign In")');

// Wait for navigation
console.log('Waiting for dashboard...');
await page.waitForTimeout(5000);

const currentUrl = page.url();
console.log('Current URL:', currentUrl);

// Take screenshot
await page.screenshot({ path: 'screenshots/dashboard-real.png', fullPage: true });

// Check for sidebar
const sidebar = await page.$('aside');
console.log('Sidebar found:', !!sidebar);

if (sidebar) {
  // Get all text in sidebar
  const sidebarText = await sidebar.textContent();
  console.log('\n=== SIDEBAR FULL TEXT ===');
  console.log(sidebarText);
  console.log('=========================\n');
  
  // Check for GUID
  if (sidebarText.includes('45d9d97e')) {
    console.log('⚠️  GUID FOUND IN SIDEBAR!');
    
    // Try to find the specific element
    const allTexts = await sidebar.$$eval('*', elements => 
      elements.map(el => ({
        tag: el.tagName,
        text: el.textContent,
        class: el.className
      })).filter(item => item.text && item.text.includes('45d9d97e'))
    );
    console.log('Elements containing GUID:', allTexts);
  }
  
  // Take sidebar screenshot
  await sidebar.screenshot({ path: 'screenshots/sidebar-real.png' });
  
  // Check the bottom of sidebar specifically
  const sidebarBottom = await sidebar.$('.border-t');
  if (sidebarBottom) {
    const bottomText = await sidebarBottom.textContent();
    console.log('Bottom section text:', bottomText);
  }
}

// Check page body for GUID
const bodyText = await page.textContent('body');
if (bodyText.includes('45d9d97e')) {
  console.log('⚠️  GUID found somewhere in page body!');
}

await browser.close();
