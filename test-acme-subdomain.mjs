import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Go directly to the acme subdomain
console.log('Navigating to acme.bigfootlive.io...');
await page.goto('https://acme.bigfootlive.io/login');
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
await page.screenshot({ path: 'screenshots/acme-dashboard.png', fullPage: true });

// Check for sidebar
const sidebar = await page.$('aside');
console.log('Sidebar found:', !!sidebar);

if (sidebar) {
  // Get all text in sidebar
  const sidebarText = await sidebar.textContent();
  
  // Check for GUID
  if (sidebarText.includes('45d9d97e')) {
    console.log('\n⚠️  GUID FOUND IN SIDEBAR!');
    console.log('Full sidebar text:');
    console.log(sidebarText);
    
    // Find exact location
    const lines = sidebarText.split('\n').map(line => line.trim()).filter(line => line);
    lines.forEach((line, index) => {
      if (line.includes('45d9d97e')) {
        console.log(`\nLine ${index}: "${line}"`);
      }
    });
  }
  
  // Take sidebar screenshot
  await sidebar.screenshot({ path: 'screenshots/acme-sidebar.png' });
  
  // Look for any suspicious absolute positioned elements
  const absElements = await page.$$eval('*', elements => 
    elements
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.position === 'absolute' || style.position === 'fixed';
      })
      .map(el => ({
        tag: el.tagName,
        text: el.textContent?.substring(0, 50),
        position: window.getComputedStyle(el).position,
        bottom: window.getComputedStyle(el).bottom,
        left: window.getComputedStyle(el).left
      }))
      .filter(item => item.text && item.text.includes('45d9'))
  );
  
  if (absElements.length > 0) {
    console.log('\nAbsolute/Fixed elements with GUID:', absElements);
  }
}

await browser.close();
