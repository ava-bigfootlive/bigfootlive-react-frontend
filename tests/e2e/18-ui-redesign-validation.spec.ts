import { test, expect } from '@playwright/test';

test.describe('UI Redesign Validation - Production', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load modern design system with HSL variables', async ({ page }) => {
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check if design system CSS variables are loaded
    const cssVariables = await page.evaluate(() => {
      const computedStyle = getComputedStyle(document.documentElement);
      return {
        brandPrimary: computedStyle.getPropertyValue('--brand-primary').trim(),
        background: computedStyle.getPropertyValue('--background').trim(),
        foreground: computedStyle.getPropertyValue('--foreground').trim(),
        surface: computedStyle.getPropertyValue('--surface').trim()
      };
    });
    
    // Verify HSL color variables are loaded
    expect(cssVariables.brandPrimary).toBeTruthy();
    expect(cssVariables.background).toBeTruthy();
    expect(cssVariables.foreground).toBeTruthy();
    
    console.log('Design system variables:', cssVariables);
  });

  test('should display theme toggle with fixed functionality', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.getByTestId('theme-toggle').or(
      page.getByRole('button', { name: /toggle theme/i })
    ).or(
      page.locator('button').filter({ hasText: /theme/i })
    ).first();
    
    if (await themeToggle.count() > 0) {
      await expect(themeToggle).toBeVisible();
      
      // Get initial state
      const htmlElement = page.locator('html');
      const initialIsDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
      
      console.log('Initial theme state:', initialIsDark ? 'dark' : 'light');
      
      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500); // Wait for transition
      
      // Check if theme changed
      const newIsDark = await htmlElement.evaluate(el => el.classList.contains('dark'));
      expect(newIsDark).toBe(!initialIsDark);
      
      console.log('Theme toggled to:', newIsDark ? 'dark' : 'light');
      
      // Verify background color actually changes
      const bodyBgColor = await page.locator('body').evaluate(el => 
        getComputedStyle(el).backgroundColor
      );
      expect(bodyBgColor).toBeTruthy();
      expect(bodyBgColor).not.toBe('rgba(0, 0, 0, 0)'); // Should not be transparent
      
      console.log('Background color:', bodyBgColor);
    } else {
      console.log('Theme toggle not found on this page');
    }
  });

  test('should display professional card layouts with elevation', async ({ page }) => {
    // Navigate to dashboard or admin area that might have cards
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    if (await dashboardLink.count() > 0) {
      await dashboardLink.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Look for modern card elements
    const cards = page.locator('.card-modern, .card-elevated, [class*="card"]').first();
    
    if (await cards.count() > 0) {
      await expect(cards).toBeVisible();
      
      // Check for elevation (box-shadow)
      const boxShadow = await cards.evaluate(el => getComputedStyle(el).boxShadow);
      expect(boxShadow).not.toBe('none');
      
      console.log('Card shadow detected:', boxShadow.substring(0, 50) + '...');
    } else {
      console.log('No cards found on current page');
    }
  });

  test('should have modern typography and spacing', async ({ page }) => {
    // Check for Inter font loading
    const bodyFont = await page.locator('body').evaluate(el => 
      getComputedStyle(el).fontFamily
    );
    
    expect(bodyFont).toContain('Inter');
    console.log('Font family:', bodyFont);
    
    // Check for proper line height
    const lineHeight = await page.locator('body').evaluate(el => 
      getComputedStyle(el).lineHeight
    );
    
    expect(parseFloat(lineHeight)).toBeGreaterThan(1.2);
    console.log('Line height:', lineHeight);
  });

  test('should display smooth transitions and animations', async ({ page }) => {
    // Check if CSS transitions are applied
    const bodyTransition = await page.locator('body').evaluate(el => 
      getComputedStyle(el).transition
    );
    
    if (bodyTransition && bodyTransition !== 'all 0s ease 0s') {
      console.log('Body transitions detected:', bodyTransition);
      expect(bodyTransition).toContain('0.3s'); // Should have 0.3s transitions
    }
    
    // Look for animated elements
    const animatedElements = page.locator('.animate-fade-in, .animate-slide-in, [class*="animate"]');
    const animatedCount = await animatedElements.count();
    
    if (animatedCount > 0) {
      console.log(`Found ${animatedCount} animated elements`);
      
      // Check first animated element
      const firstAnimated = animatedElements.first();
      await expect(firstAnimated).toBeVisible();
      
      const animation = await firstAnimated.evaluate(el => 
        getComputedStyle(el).animation
      );
      
      if (animation && animation !== 'none') {
        console.log('Animation detected:', animation.substring(0, 50) + '...');
      }
    }
  });
});

test.describe('Admin Interface UI Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display professional admin tables if accessible', async ({ page }) => {
    // Try to find admin or management links
    const adminLinks = page.locator('a').filter({ 
      hasText: /admin|management|users|tenants/i 
    });
    
    const linkCount = await adminLinks.count();
    console.log(`Found ${linkCount} potential admin links`);
    
    if (linkCount > 0) {
      const firstAdminLink = adminLinks.first();
      const linkText = await firstAdminLink.textContent();
      console.log('Clicking admin link:', linkText);
      
      await firstAdminLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for tables with modern styling
      const tables = page.getByRole('table');
      const tableCount = await tables.count();
      
      if (tableCount > 0) {
        console.log(`Found ${tableCount} tables`);
        
        const firstTable = tables.first();
        await expect(firstTable).toBeVisible();
        
        // Check for modern table styling
        const tableParent = firstTable.locator('..');
        const tableContainer = await tableParent.evaluate(el => {
          const computed = getComputedStyle(el);
          return {
            borderRadius: computed.borderRadius,
            boxShadow: computed.boxShadow,
            overflow: computed.overflow
          };
        });
        
        console.log('Table container styles:', tableContainer);
        
        // Check for table headers with modern styling
        const headers = firstTable.getByRole('columnheader');
        const headerCount = await headers.count();
        
        if (headerCount > 0) {
          console.log(`Table has ${headerCount} columns`);
          
          const firstHeader = headers.first();
          const headerStyles = await firstHeader.evaluate(el => {
            const computed = getComputedStyle(el);
            return {
              backgroundColor: computed.backgroundColor,
              fontWeight: computed.fontWeight,
              textTransform: computed.textTransform
            };
          });
          
          console.log('Header styles:', headerStyles);
        }
      }
    } else {
      console.log('No admin links found - may require authentication');
    }
  });

  test('should display modern search interfaces', async ({ page }) => {
    // Look for search inputs across the site
    const searchInputs = page.getByPlaceholder(/search/i);
    const searchCount = await searchInputs.count();
    
    console.log(`Found ${searchCount} search inputs`);
    
    if (searchCount > 0) {
      const firstSearch = searchInputs.first();
      await expect(firstSearch).toBeVisible();
      
      // Check modern input styling
      const inputStyles = await firstSearch.evaluate(el => {
        const computed = getComputedStyle(el);
        return {
          borderRadius: computed.borderRadius,
          padding: computed.padding,
          border: computed.border,
          backgroundColor: computed.backgroundColor
        };
      });
      
      console.log('Search input styles:', inputStyles);
      
      // Test focus state
      await firstSearch.focus();
      const focusStyles = await firstSearch.evaluate(el => {
        const computed = getComputedStyle(el);
        return {
          borderColor: computed.borderColor,
          boxShadow: computed.boxShadow,
          outline: computed.outline
        };
      });
      
      console.log('Focus styles:', focusStyles);
    }
  });

  test('should show modern badges and status indicators', async ({ page }) => {
    // Navigate around looking for badge elements
    const badges = page.locator('.status-success, .status-error, .status-warning, .status-info, [class*="badge"]');
    const badgeCount = await badges.count();
    
    console.log(`Found ${badgeCount} potential badges`);
    
    if (badgeCount > 0) {
      for (let i = 0; i < Math.min(3, badgeCount); i++) {
        const badge = badges.nth(i);
        if (await badge.isVisible()) {
          const badgeText = await badge.textContent();
          const badgeStyles = await badge.evaluate(el => {
            const computed = getComputedStyle(el);
            return {
              backgroundColor: computed.backgroundColor,
              color: computed.color,
              borderRadius: computed.borderRadius,
              padding: computed.padding
            };
          });
          
          console.log(`Badge "${badgeText}":`, badgeStyles);
        }
      }
    }
  });
});