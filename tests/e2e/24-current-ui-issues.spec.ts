import { test, expect } from '@playwright/test';

test.describe('Current UI Issues - Screenshots', () => {
  test('should capture current layout problems', async ({ page }) => {
    console.log('🔍 Capturing current UI issues...');
    
    // Set desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Test Login Page Issues
    console.log('📱 Testing login page issues...');
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot of login page with issues
    await page.screenshot({ 
      path: 'test-results/current-login-issues.png', 
      fullPage: true 
    });
    console.log('📸 Current login issues captured');
    
    // Test Landing Page Issues
    console.log('📱 Testing landing page issues...');
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take screenshot of landing page with issues
    await page.screenshot({ 
      path: 'test-results/current-landing-issues.png', 
      fullPage: true 
    });
    console.log('📸 Current landing issues captured');
    
    // Test Dashboard (will redirect to login but capture that)
    console.log('📱 Testing dashboard access...');
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/current-dashboard-redirect.png', 
      fullPage: true 
    });
    console.log('📸 Dashboard redirect captured');
    
    console.log('✅ All current issue screenshots captured');
    console.log('🌐 Production URL: https://d2dbuyze4zqbdy.cloudfront.net/');
    console.log('🔧 Issues to investigate: theme toggle positioning, form overflow, full-width layouts');
  });
});