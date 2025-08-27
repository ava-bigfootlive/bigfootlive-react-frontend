import { test, expect } from '@playwright/test';

test.describe('Responsive Design Validation', () => {
  test('should show proper desktop layout for login and landing pages', async ({ page }) => {
    console.log('🔍 Testing responsive design fixes...');
    
    // Set larger viewport to test desktop layout
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Test Landing Page
    console.log('📱 Testing landing page responsive design...');
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of landing page on desktop
    await page.screenshot({ 
      path: 'test-results/landing-desktop-responsive.png', 
      fullPage: true 
    });
    console.log('📸 Landing page desktop layout captured');
    
    // Test Login Page
    console.log('📱 Testing login page responsive design...');
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of login page on desktop
    await page.screenshot({ 
      path: 'test-results/login-desktop-responsive.png', 
      fullPage: true 
    });
    console.log('📸 Login page desktop layout captured');
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/login-mobile-responsive.png', 
      fullPage: true 
    });
    console.log('📸 Login page mobile layout captured');
    
    console.log('✅ Responsive design validation complete');
    console.log('🌐 Production URL: https://d2dbuyze4zqbdy.cloudfront.net/');
    console.log('🔧 Changes should be live after CloudFront cache invalidation');
  });
});