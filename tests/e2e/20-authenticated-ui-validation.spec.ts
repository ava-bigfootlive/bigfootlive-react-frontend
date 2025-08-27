import { test, expect } from '@playwright/test';

test.describe('Authenticated UI Validation with Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to production login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('should login and capture dashboard screenshots', async ({ page }) => {
    console.log('🔍 Starting authenticated UI validation...');
    
    // Take screenshot of login page
    await page.screenshot({ 
      path: 'test-results/01-login-page.png', 
      fullPage: true 
    });
    console.log('📸 Login page screenshot captured');
    
    // Try to login (this might fail if we don't have test credentials)
    // Let's see what happens with the UI first
    const emailInput = page.getByTestId('email-input');
    const passwordInput = page.getByTestId('password-input');
    const loginButton = page.getByTestId('login-button');
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      // Fill in some test credentials to see form behavior
      await emailInput.fill('test@example.com');
      await passwordInput.fill('testpassword');
      
      // Take screenshot of filled form
      await page.screenshot({ 
        path: 'test-results/02-login-form-filled.png', 
        fullPage: true 
      });
      console.log('📸 Login form filled screenshot captured');
      
      // Try clicking login to see error state
      await loginButton.click();
      await page.waitForTimeout(2000); // Wait for any error messages
      
      // Take screenshot of login result (likely error)
      await page.screenshot({ 
        path: 'test-results/03-login-attempt.png', 
        fullPage: true 
      });
      console.log('📸 Login attempt screenshot captured');
    }
    
    // Try to navigate directly to dashboard (should redirect to login)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of what happens when accessing protected route
    await page.screenshot({ 
      path: 'test-results/04-dashboard-redirect.png', 
      fullPage: true 
    });
    console.log('📸 Dashboard access screenshot captured');
    
    // Check if we're redirected back to login or get some other page
    const currentUrl = page.url();
    console.log('🔗 Current URL after dashboard access:', currentUrl);
    
    // Try platform admin route
    await page.goto('/platform-admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/05-platform-admin-access.png', 
      fullPage: true 
    });
    console.log('📸 Platform admin access screenshot captured');
    
    // Check various other routes to see their UI state
    const routesToTest = ['/events', '/users', '/analytics'];
    
    for (let i = 0; i < routesToTest.length; i++) {
      const route = routesToTest[i];
      console.log(`🔍 Testing route: ${route}`);
      
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: `test-results/06-route-${route.replace('/', '')}-${i}.png`, 
        fullPage: true 
      });
      console.log(`📸 Route ${route} screenshot captured`);
    }
    
    console.log('✅ All screenshots captured for UI validation');
  });
  
  test('should validate UI elements and styling issues', async ({ page }) => {
    // Test the login page UI specifically
    await page.screenshot({ 
      path: 'test-results/07-login-ui-analysis.png', 
      fullPage: true 
    });
    
    // Check for theme toggle presence and functionality
    const themeToggle = page.getByTestId('theme-toggle').or(
      page.getByRole('button', { name: /toggle theme/i })
    );
    
    if (await themeToggle.count() > 0) {
      console.log('✅ Theme toggle found on login page');
      
      // Test theme switching
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/08-login-dark-theme.png', 
        fullPage: true 
      });
      console.log('📸 Dark theme login screenshot captured');
      
      // Switch back to light
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/09-login-light-theme.png', 
        fullPage: true 
      });
      console.log('📸 Light theme login screenshot captured');
    } else {
      console.log('⚠️ Theme toggle not found on login page');
    }
    
    // Check form styling
    const formElements = await page.evaluate(() => {
      const elements = [];
      
      // Check buttons
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn, i) => {
        const computed = getComputedStyle(btn);
        elements.push({
          type: 'button',
          index: i,
          borderRadius: computed.borderRadius,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          padding: computed.padding,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight
        });
      });
      
      // Check inputs
      const inputs = document.querySelectorAll('input');
      inputs.forEach((input, i) => {
        const computed = getComputedStyle(input);
        elements.push({
          type: 'input',
          index: i,
          borderRadius: computed.borderRadius,
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor,
          padding: computed.padding,
          fontSize: computed.fontSize
        });
      });
      
      // Check cards
      const cards = document.querySelectorAll('[class*="card"], .card-modern, .card-elevated');
      cards.forEach((card, i) => {
        const computed = getComputedStyle(card);
        elements.push({
          type: 'card',
          index: i,
          backgroundColor: computed.backgroundColor,
          borderRadius: computed.borderRadius,
          boxShadow: computed.boxShadow,
          border: computed.border
        });
      });
      
      return elements;
    });
    
    console.log('🎨 UI Elements Analysis:');
    formElements.forEach(element => {
      console.log(`${element.type} ${element.index}:`, element);
    });
    
    // Check for any obvious styling issues
    const stylingIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for elements with no background color that should have one
      const potentialCards = document.querySelectorAll('[class*="card"]');
      potentialCards.forEach((card, i) => {
        const computed = getComputedStyle(card);
        if (computed.backgroundColor === 'rgba(0, 0, 0, 0)' || computed.backgroundColor === 'transparent') {
          issues.push(`Card ${i} has transparent background`);
        }
      });
      
      // Check for buttons with default styling
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn, i) => {
        const computed = getComputedStyle(btn);
        if (computed.borderRadius === '0px') {
          issues.push(`Button ${i} has no border radius`);
        }
      });
      
      // Check for text readability
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
      let textIssues = 0;
      textElements.forEach((el) => {
        const computed = getComputedStyle(el);
        if (computed.color === 'rgba(0, 0, 0, 0)' || computed.color === 'transparent') {
          textIssues++;
        }
      });
      
      if (textIssues > 0) {
        issues.push(`${textIssues} text elements have transparent color`);
      }
      
      return issues;
    });
    
    if (stylingIssues.length > 0) {
      console.log('⚠️ Styling Issues Found:');
      stylingIssues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('✅ No obvious styling issues detected on login page');
    }
  });
});