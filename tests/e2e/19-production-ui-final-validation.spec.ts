import { test, expect } from '@playwright/test';

test.describe('Final Production UI Validation', () => {
  test('should load and display the new BigFootLive UI with modern design', async ({ page }) => {
    // Navigate to the production site
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/production-ui-validation.png', fullPage: true });
    
    console.log('✅ Page loaded successfully');
    
    // Verify the site title
    await expect(page).toHaveTitle(/BigFootLive|BigfootLive/i);
    console.log('✅ Page title verified');
    
    // Verify modern design system variables are loaded
    const cssVariables = await page.evaluate(() => {
      const computedStyle = getComputedStyle(document.documentElement);
      return {
        brandPrimary: computedStyle.getPropertyValue('--brand-primary').trim(),
        background: computedStyle.getPropertyValue('--background').trim(),
        foreground: computedStyle.getPropertyValue('--foreground').trim(),
        surface: computedStyle.getPropertyValue('--surface').trim(),
        borderRadius: computedStyle.getPropertyValue('--radius').trim()
      };
    });
    
    // Verify HSL color variables are present
    expect(cssVariables.brandPrimary).toBeTruthy();
    expect(cssVariables.background).toBeTruthy();
    expect(cssVariables.foreground).toBeTruthy();
    
    console.log('✅ Design system variables loaded:', cssVariables);
    
    // Check for Inter font
    const bodyStyles = await page.locator('body').evaluate(el => {
      const computed = getComputedStyle(el);
      return {
        fontFamily: computed.fontFamily,
        lineHeight: computed.lineHeight,
        transition: computed.transition
      };
    });
    
    expect(bodyStyles.fontFamily).toContain('Inter');
    console.log('✅ Modern typography applied:', bodyStyles);
    
    // Check for smooth transitions
    if (bodyStyles.transition && bodyStyles.transition !== 'all 0s ease 0s') {
      expect(bodyStyles.transition).toContain('0.3s');
      console.log('✅ Smooth transitions detected:', bodyStyles.transition);
    }
    
    // Look for any buttons and verify modern styling
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} buttons on page`);
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const buttonStyles = await firstButton.evaluate(el => {
        const computed = getComputedStyle(el);
        return {
          borderRadius: computed.borderRadius,
          padding: computed.padding,
          fontWeight: computed.fontWeight
        };
      });
      
      // Modern buttons should have border radius
      expect(buttonStyles.borderRadius).not.toBe('0px');
      console.log('✅ Modern button styling:', buttonStyles);
    }
    
    // Look for any links and verify they exist
    const links = page.getByRole('link');
    const linkCount = await links.count();
    console.log(`Found ${linkCount} links on page`);
    
    if (linkCount > 0) {
      // Test hover state on first visible link
      const firstLink = links.first();
      if (await firstLink.isVisible()) {
        await firstLink.hover();
        console.log('✅ Link hover interaction tested');
      }
    }
    
    // Check if any navigation or main content areas exist
    const nav = page.locator('nav, header, main, [role="navigation"], [role="main"]').first();
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
      console.log('✅ Main page structure detected');
    }
    
    // Verify the page is interactive (not just a static error page)
    const isInteractive = await page.evaluate(() => {
      // Check if React or other JS framework has loaded
      return !!(
        window.React || 
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || 
        document.querySelector('[data-reactroot]') ||
        document.querySelector('script[type="module"]') ||
        document.querySelector('div[id="root"]')
      );
    });
    
    expect(isInteractive).toBe(true);
    console.log('✅ Interactive React application detected');
    
    // Log page performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.navigationStart),
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    console.log('⚡ Performance metrics:', performanceMetrics);
    
    // Verify reasonable load times
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000); // Less than 5 seconds
    expect(performanceMetrics.loadComplete).toBeLessThan(10000); // Less than 10 seconds
    
    console.log('✅ Performance benchmarks met');
  });
  
  test('should display proper color scheme and theme support', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check initial color scheme
    const initialColors = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const computed = getComputedStyle(body);
      
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        isDarkClass: html.classList.contains('dark'),
        isLightClass: html.classList.contains('light')
      };
    });
    
    console.log('Initial theme state:', initialColors);
    
    // Verify we have actual colors, not defaults
    expect(initialColors.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(initialColors.color).not.toBe('rgba(0, 0, 0, 0)');
    
    // Look for theme toggle if available
    const themeToggle = page.locator('button').filter({ 
      hasText: /theme|dark|light|toggle/i 
    }).or(
      page.getByTestId('theme-toggle')
    ).or(
      page.locator('[aria-label*="theme" i]')
    );
    
    const toggleCount = await themeToggle.count();
    console.log(`Found ${toggleCount} potential theme toggles`);
    
    if (toggleCount > 0) {
      const firstToggle = themeToggle.first();
      if (await firstToggle.isVisible()) {
        console.log('✅ Theme toggle found and visible');
        
        // Test theme toggle functionality
        await firstToggle.click();
        await page.waitForTimeout(500);
        
        const afterToggle = await page.evaluate(() => {
          const body = document.body;
          const html = document.documentElement;
          const computed = getComputedStyle(body);
          
          return {
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            isDarkClass: html.classList.contains('dark'),
            isLightClass: html.classList.contains('light')
          };
        });
        
        console.log('After theme toggle:', afterToggle);
        
        // Verify theme actually changed
        const themeChanged = (
          initialColors.backgroundColor !== afterToggle.backgroundColor ||
          initialColors.isDarkClass !== afterToggle.isDarkClass ||
          initialColors.isLightClass !== afterToggle.isLightClass
        );
        
        if (themeChanged) {
          console.log('✅ Theme toggle functionality working');
        } else {
          console.log('⚠️ Theme toggle may not have changed colors visibly');
        }
      }
    } else {
      console.log('ℹ️ No theme toggle found on this page (may be on dashboard)');
    }
    
    console.log('✅ Color scheme validation completed');
  });
  
  test('should be responsive and work on mobile viewport', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/production-ui-mobile.png', fullPage: true });
    
    // Verify page still loads properly on mobile
    await expect(page).toHaveTitle(/BigFootLive|BigfootLive/i);
    
    // Check for mobile-responsive elements
    const mobileElements = await page.evaluate(() => {
      const body = document.body;
      const computed = getComputedStyle(body);
      
      // Check if viewport meta tag exists
      const viewport = document.querySelector('meta[name="viewport"]');
      
      return {
        hasViewportMeta: !!viewport,
        viewportContent: viewport?.getAttribute('content'),
        bodyWidth: body.offsetWidth,
        windowWidth: window.innerWidth
      };
    });
    
    expect(mobileElements.hasViewportMeta).toBe(true);
    expect(mobileElements.windowWidth).toBe(375);
    
    console.log('✅ Mobile responsive validation:', mobileElements);
  });
});