import { test, expect } from '@playwright/test';

test.describe('Dashboard UI Validation After Fixes', () => {
  test('should show updated dashboard with modern design system', async ({ page }) => {
    console.log('🔍 Validating fixed dashboard UI...');
    
    // Navigate to production URL
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of landing page first
    await page.screenshot({ 
      path: 'test-results/fixed-landing-page.png', 
      fullPage: true 
    });
    console.log('📸 Fixed landing page captured');
    
    // Navigate to login
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/login');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/fixed-login-page.png', 
      fullPage: true 
    });
    console.log('📸 Fixed login page captured');
    
    // Navigate to dashboard (should redirect to login if not authenticated)
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/dashboard-after-fixes.png', 
      fullPage: true 
    });
    console.log('📸 Dashboard after fixes captured');
    
    // Try platform admin route
    await page.goto('https://d2dbuyze4zqbdy.cloudfront.net/platform-admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/platform-admin-after-fixes.png', 
      fullPage: true 
    });
    console.log('📸 Platform admin after fixes captured');
    
    console.log('✅ All UI validation screenshots captured');
    console.log('🌐 Production URL: https://d2dbuyze4zqbdy.cloudfront.net/');
  });
});