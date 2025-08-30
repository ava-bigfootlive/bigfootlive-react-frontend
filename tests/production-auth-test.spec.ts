import { test, expect } from '@playwright/test';

test.describe('Production Authentication Test', () => {
  test('should successfully authenticate on production deployment', async ({ page }) => {
    console.log('🌍 Testing authentication on production deployment...');
    
    const productionUrl = 'https://d2dbuyze4zqbdy.cloudfront.net';
    
    // Listen to console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Listen to network requests to see Cognito calls
    const networkRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('cognito') || request.url().includes('amazonaws.com')) {
        networkRequests.push(`${request.method()} ${request.url()}`);
      }
    });
    
    // Go to production login page
    console.log('📍 Navigating to:', `${productionUrl}/login`);
    await page.goto(`${productionUrl}/login`, { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/production-01-login-page.png' });
    
    // Wait for any initial loading
    await page.waitForTimeout(3000);
    
    // Check if the page loaded correctly
    const pageTitle = await page.title();
    console.log('📄 Page title:', pageTitle);
    
    // Fill in the login form
    console.log('📝 Filling login form with test credentials...');
    await page.fill('#email', 'test@bigfootlive.io');
    await page.fill('#password', 'TestPassword123!');
    
    // Take screenshot after filling form
    await page.screenshot({ path: 'test-results/production-02-form-filled.png' });
    
    // Submit the form
    console.log('🚀 Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Wait for authentication to complete
    console.log('⏱️ Waiting for authentication to complete...');
    await page.waitForTimeout(8000); // Give more time for production
    
    const finalUrl = page.url();
    console.log('🔗 Final URL:', finalUrl);
    
    // Take screenshot of final state
    await page.screenshot({ path: 'test-results/production-03-final-state.png' });
    
    // Print diagnostic information
    console.log('📝 Console logs during authentication:');
    consoleLogs.forEach(log => console.log(`  ${log}`));
    
    console.log('🌐 Network requests to Cognito/AWS:');
    networkRequests.forEach(req => console.log(`  ${req}`));
    
    // Check if authentication was successful
    if (finalUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS: Authentication completed and redirected to dashboard!');
      expect(finalUrl).toContain('/dashboard');
      
      // Verify dashboard content is loaded
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
      console.log('✅ Dashboard content is visible');
      
    } else if (finalUrl.includes('/login')) {
      console.log('❌ FAILED: Still on login page after authentication attempt');
      
      // Check for error messages
      const errorMessage = await page.locator('[role="alert"], .alert, .error, [class*="error"]').first();
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log('🚨 Error message found:', errorText);
      }
      
      // This is a failure case - we should have been redirected
      expect(finalUrl).toContain('/dashboard');
      
    } else {
      console.log('🤔 UNEXPECTED: Ended up at unexpected URL:', finalUrl);
      expect(finalUrl).toContain('/dashboard');
    }
  });
});