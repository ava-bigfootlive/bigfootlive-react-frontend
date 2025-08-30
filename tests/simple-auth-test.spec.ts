import { test, expect } from '@playwright/test';

test.describe('Simple Authentication Test', () => {
  test('should successfully log in and redirect to dashboard', async ({ page }) => {
    console.log('🧪 Starting simple authentication test...');
    
    // Listen to console logs to see what's happening
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Go to login page
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'test-results/simple-auth-01-login-page.png' });
    
    // Fill in the form
    console.log('📝 Filling login form...');
    await page.fill('#email', 'test@bigfootlive.io');
    await page.fill('#password', 'TestPassword123!');
    
    // Take screenshot of filled form
    await page.screenshot({ path: 'test-results/simple-auth-02-form-filled.png' });
    
    // Submit the form
    console.log('🚀 Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Wait a bit to see what happens
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('🔗 URL after login attempt:', currentUrl);
    
    // Take screenshot after submit
    await page.screenshot({ path: 'test-results/simple-auth-03-after-submit.png' });
    
    // Print console logs
    console.log('📝 Browser console logs:');
    consoleLogs.forEach(log => console.log(`  ${log}`));
    
    // Check if we're on the dashboard or still on login
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS: Redirected to dashboard!');
      expect(currentUrl).toContain('/dashboard');
    } else if (currentUrl.includes('/login')) {
      console.log('❌ FAILED: Still on login page');
      
      // Check if there's an error message
      const errorElement = await page.locator('[role="alert"], .alert, .error').first();
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log('🚨 Error message:', errorText);
      }
      
      // This will fail the test so we can see what went wrong
      expect(currentUrl).toContain('/dashboard');
    } else {
      console.log('🤔 UNKNOWN: Unexpected page:', currentUrl);
      expect(currentUrl).toContain('/dashboard');
    }
  });
});