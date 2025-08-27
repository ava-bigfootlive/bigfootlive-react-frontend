import { test, expect } from '@playwright/test';

test.describe('Quick UI Issue Check', () => {
  test('should capture login and dashboard screenshots', async ({ page }) => {
    console.log('🔍 Quick UI validation...');
    
    // Take screenshot of login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/login-current.png', 
      fullPage: true 
    });
    console.log('📸 Login page captured');
    
    // Try to navigate to dashboard without login (should redirect)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/dashboard-redirect.png', 
      fullPage: true 
    });
    console.log('📸 Dashboard redirect captured');
    
    console.log('Current URL:', page.url());
  });
});