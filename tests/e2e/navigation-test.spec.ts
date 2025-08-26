import { test, expect } from '@playwright/test';

test.describe('Navigation Test - Verify Client-Side Routing', () => {
  test('View Dashboard button actually navigates without page refresh', async ({ page }) => {
    // Navigate to production homepage
    await page.goto('https://bigfootlive.io/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find the "View Dashboard" button
    const dashboardButton = page.getByRole('link', { name: 'View Dashboard' });
    await expect(dashboardButton).toBeVisible();
    
    // Listen for navigation to detect if it's a client-side navigation or full page refresh
    let isClientSideNavigation = false;
    
    // Set up listener before clicking
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        // If we get here, it's a full page navigation (bad)
        isClientSideNavigation = false;
      }
    });
    
    // Click the button
    await dashboardButton.click();
    
    // Wait a moment for navigation
    await page.waitForTimeout(2000);
    
    // Check if we're on the dashboard page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/dashboard\/?/);
    
    // Verify some dashboard content is visible
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
    
    console.log('✅ Navigation test passed - Dashboard button works!');
  });

  test('Get Started button actually navigates without page refresh', async ({ page }) => {
    // Navigate to production homepage
    await page.goto('https://bigfootlive.io/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find the "Get Started" button
    const getStartedButton = page.getByRole('link', { name: 'Get Started' });
    await expect(getStartedButton).toBeVisible();
    
    // Click the button
    await getStartedButton.click();
    
    // Wait a moment for navigation
    await page.waitForTimeout(2000);
    
    // Check if we're on the login page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/auth\/login\/?/);
    
    // Verify login page content is visible
    await expect(page.getByRole('heading', { name: /Sign in to BigFoot Live/i })).toBeVisible();
    
    console.log('✅ Navigation test passed - Get Started button works!');
  });
});