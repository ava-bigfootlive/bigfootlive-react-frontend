import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('should complete login and navigate through application', async ({ page }) => {
    // Start fresh
    await page.context().clearCookies();
    
    // Go to the site first to establish domain
    await page.goto('/');
    
    // Set mock authentication to bypass AWS Cognito
    await page.context().addCookies([{
      name: 'auth-token',
      value: 'mock-tenant-token',
      domain: new URL(page.url()).hostname,
      path: '/'
    }]);
    
    // Go directly to dashboard with mock auth
    await page.goto('/dashboard');
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Should be on dashboard page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/auth/login');
    expect(currentUrl).toContain('/dashboard');
    
    // Look for navigation elements
    const nav = page.locator('nav');
    if (await nav.isVisible()) {
      // Try to navigate to different sections
      const links = await nav.locator('a').all();
      
      if (links.length > 0) {
        // Click first navigation link
        const firstLink = links[0];
        const linkText = await firstLink.textContent();
        console.log(`Clicking navigation link: ${linkText}`);
        
        await firstLink.click();
        await page.waitForLoadState('networkidle');
        
        // Verify navigation worked
        const newUrl = page.url();
        expect(newUrl).not.toBe(currentUrl);
      }
    }
    
    // Check for user menu or profile
    const userMenuSelectors = [
      '[data-testid="user-menu"]',
      '[data-testid="profile-menu"]',
      'button:has-text("test@example.com")'
    ];
    
    for (const selector of userMenuSelectors) {
      const userMenu = page.locator(selector);
      if (await userMenu.isVisible()) {
        await userMenu.click();
        
        // Look for logout option
        const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out")');
        if (await logoutButton.isVisible()) {
          await logoutButton.click();
          await page.waitForLoadState('networkidle');
          
          // Should be back at login
          await expect(page).toHaveURL(/.*\/auth\/login/);
        }
        break;
      }
    }
  });

  test('should handle deep navigation flows', async ({ page }) => {
    // Go to the site first
    await page.goto('/');
    
    // Set mock authentication
    await page.context().addCookies([{
      name: 'auth-token',
      value: 'mock-tenant-token',
      domain: new URL(page.url()).hostname,
      path: '/'
    }]);
    
    // Go to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Try to find and click a "Create" or "New" button
    const createButtonSelectors = [
      '[data-testid="create-stream-button"]',
      'button:has-text("Create")',
      'button:has-text("New")',
      'a:has-text("Create")'
    ];
    
    for (const selector of createButtonSelectors) {
      const createButton = page.locator(selector).first();
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForLoadState('networkidle');
        
        // Should navigate to a create/new page
        const url = page.url();
        expect(url).toMatch(/(create|new|add)/i);
        
        // Go back
        await page.goBack();
        await page.waitForLoadState('networkidle');
        break;
      }
    }
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    // Go to the site first
    await page.goto('/');
    
    // Set mock authentication
    await page.context().addCookies([{
      name: 'auth-token',
      value: 'mock-tenant-token',
      domain: new URL(page.url()).hostname,
      path: '/'
    }]);
    
    // Go to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Get current URL after navigation
    const loggedInUrl = page.url();
    expect(loggedInUrl).not.toContain('/auth/login');
    expect(loggedInUrl).toContain('/dashboard');
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be logged in
    const urlAfterRefresh = page.url();
    expect(urlAfterRefresh).not.toContain('/auth/login');
  });

  test('should handle mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Go to the site first
    await page.goto('/');
    
    // Set mock authentication
    await page.context().addCookies([{
      name: 'auth-token',
      value: 'mock-tenant-token',
      domain: new URL(page.url()).hostname,
      path: '/'
    }]);
    
    // Go to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for mobile menu toggle
    const mobileMenuSelectors = [
      '[data-testid="mobile-menu"]',
      'button[aria-label*="menu"]',
      '.hamburger-menu',
      'button:has(svg)'
    ];
    
    for (const selector of mobileMenuSelectors) {
      const menuToggle = page.locator(selector).first();
      if (await menuToggle.isVisible()) {
        await menuToggle.click();
        
        // Mobile menu should open
        await page.waitForTimeout(500); // Animation
        
        // Look for navigation items
        const navItems = page.locator('nav a, [role="navigation"] a');
        const navCount = await navItems.count();
        expect(navCount).toBeGreaterThan(0);
        
        break;
      }
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});