const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('📸 Testing login flow and taking screenshots...');
  
  // Navigate to login page
  await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/login', { 
    waitUntil: 'networkidle' 
  });
  
  // Take screenshot of login page
  await page.screenshot({ 
    path: '/tmp/login-button-issue.png', 
    fullPage: true 
  });
  console.log('✅ Login page screenshot: /tmp/login-button-issue.png');
  
  // Fill in login credentials
  await page.fill('input[type="email"]', 'admin@acme.com');
  await page.fill('input[type="password"]', 'AcmeTest123!');
  
  // Take screenshot after filling form
  await page.screenshot({ 
    path: '/tmp/login-filled.png', 
    fullPage: true 
  });
  console.log('✅ Login form filled screenshot: /tmp/login-filled.png');
  
  // Try to click the login button (even if invisible)
  // First try to find it by text
  try {
    await page.click('button:has-text("Sign in")', { timeout: 5000 });
  } catch (e) {
    console.log('⚠️ Could not find button by text, trying by type=submit');
    await page.click('button[type="submit"]');
  }
  
  // Wait for navigation to dashboard
  try {
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Successfully logged in and navigated to dashboard');
    
    // Wait a bit for dashboard to load
    await page.waitForTimeout(3000);
    
    // Take screenshot of dashboard
    await page.screenshot({ 
      path: '/tmp/dashboard-dark-text.png', 
      fullPage: true 
    });
    console.log('✅ Dashboard screenshot: /tmp/dashboard-dark-text.png');
    
  } catch (e) {
    console.log('❌ Failed to navigate to dashboard:', e.message);
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: '/tmp/login-failed.png', 
      fullPage: true 
    });
    console.log('📸 Current state screenshot: /tmp/login-failed.png');
  }
  
  // Check what's actually in the button
  const buttonHTML = await page.evaluate(() => {
    const button = document.querySelector('button[type="submit"]');
    return button ? button.outerHTML : 'Button not found';
  });
  console.log('🔍 Submit button HTML:', buttonHTML);
  
  // Check computed styles of the button
  const buttonStyles = await page.evaluate(() => {
    const button = document.querySelector('button[type="submit"]');
    if (button) {
      const styles = window.getComputedStyle(button);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        visibility: styles.visibility,
        display: styles.display,
        opacity: styles.opacity
      };
    }
    return null;
  });
  console.log('🎨 Button computed styles:', buttonStyles);
  
  await browser.close();
})();