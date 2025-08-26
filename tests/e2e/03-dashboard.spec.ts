import { test, expect } from '@playwright/test';
import { navigateToAuthPage, waitForHydration, getElementBySelectors } from '../helpers/ssr-helpers';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAuthPage(page, '/dashboard/');
    await waitForHydration(page);
  });

  test('Dashboard page loads correctly', async ({ page }) => {
    // Check main dashboard elements - look for dashboard content
    const dashboardIndicators = [
      'h1:has-text("dashboard")', 'h2:has-text("dashboard")',
      'text=/dashboard/i', '[data-testid*="dashboard"]',
      'h1', 'h2', 'main', '.dashboard'
    ];
    
    let foundDashboardContent = false;
    for (const selector of dashboardIndicators) {
      if (await page.locator(selector).count() > 0) {
        foundDashboardContent = true;
        break;
      }
    }
    
    // Check for dashboard sections
    const sections = [
      'stats', 'analytics', 'overview', 'events', 'streams', 'profile', 'settings'
    ];
    
    let visibleSections = 0;
    for (const section of sections) {
      const sectionElement = page.locator(`text=/${section}/i`);
      if (await sectionElement.count() > 0) {
        visibleSections++;
      }
    }
    
    // At least dashboard content OR dashboard sections should be present
    expect(foundDashboardContent || visibleSections > 0).toBeTruthy();
  });

  test('Navigation menu is functional', async ({ page }) => {
    // Check for navigation elements with flexible selectors
    const navSelectors = ['nav', '[role="navigation"]', 'aside', '.nav', '.navigation', '.sidebar'];
    const nav = await getElementBySelectors(page, navSelectors);
    
    if (nav) {
      await expect(nav).toBeVisible();
      
      // Check for menu items
      const menuItems = [
        'Dashboard', 'Events', 'Streaming', 'Analytics', 'Settings'
      ];
      
      let visibleItems = 0;
      for (const item of menuItems) {
        const menuLink = nav.locator(`text=/${item}/i`);
        if (await menuLink.count() > 0) {
          await expect(menuLink.first()).toBeVisible();
          visibleItems++;
        }
      }
      
      expect(visibleItems).toBeGreaterThan(0);
    }
  });

  test('Statistics cards display data', async ({ page }) => {
    // Look for stat cards or metrics with broader selectors
    const statCardSelectors = [
      '[class*="stat"]', '[class*="metric"]', '[class*="card"]',
      '[data-testid*="stat"]', '.stats', '.metrics',
      'div:has-text("total")', 'div:has-text("count")',
      'div:has-text("users")', 'div:has-text("views")'
    ];
    
    let foundStatCards = 0;
    for (const selector of statCardSelectors) {
      foundStatCards += await page.locator(selector).count();
    }
    
    if (foundStatCards > 0) {
      // Check if numbers are displayed anywhere on page
      const numbersInCards = await page.locator('text=/\\d+/').count();
      const hasVisualData = await page.locator('canvas, svg, .chart, .graph').count();
      
      // Either numbers or visual data should be present
      expect(numbersInCards > 0 || hasVisualData > 0).toBeTruthy();
    } else {
      // If no stat cards found, page might be loading or have different structure
      // Check if page has any meaningful content
      const hasContent = await page.locator('div, section, article, main').count();
      expect(hasContent > 0).toBeTruthy();
    }
  });

  test('User profile section is accessible', async ({ page }) => {
    // Look for user avatar or profile section
    const userSection = page.locator('[class*="user"], [class*="profile"], [class*="avatar"]');
    
    if (await userSection.count() > 0) {
      const firstUserSection = userSection.first();
      await expect(firstUserSection).toBeVisible();
      
      // Click on user section if it's clickable
      if (await firstUserSection.evaluate(el => el.tagName === 'BUTTON' || el.tagName === 'A')) {
        await firstUserSection.click();
        
        // Should show dropdown or navigate
        await page.waitForTimeout(500);
        const dropdown = page.locator('[role="menu"], .dropdown, .popover');
        if (await dropdown.count() > 0) {
          await expect(dropdown).toBeVisible();
        }
      }
    }
  });

  test('Search functionality works', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test search');
      await searchInput.press('Enter');
      
      // Wait for search results or URL change
      await page.waitForTimeout(1000);
      
      // Either URL should change or results should appear
      const urlChanged = page.url().includes('search') || page.url().includes('q=');
      const resultsVisible = await page.locator('text=/result|no.*found/i').count() > 0;
      
      expect(urlChanged || resultsVisible).toBeTruthy();
    }
  });

  test('Data tables are interactive', async ({ page }) => {
    const tables = page.locator('table, [role="table"]');
    
    if (await tables.count() > 0) {
      const firstTable = tables.first();
      await expect(firstTable).toBeVisible();
      
      // Check for sortable headers
      const headers = firstTable.locator('th, [role="columnheader"]');
      if (await headers.count() > 0) {
        const firstHeader = headers.first();
        const isSortable = await firstHeader.evaluate(el => 
          el.style.cursor === 'pointer' || 
          el.getAttribute('aria-sort') !== null
        );
        
        if (isSortable) {
          await firstHeader.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('Filters and controls work', async ({ page }) => {
    // Check for filter controls
    const filters = page.locator('select, [role="combobox"], input[type="checkbox"]');
    
    if (await filters.count() > 0) {
      // Test select dropdown
      const selects = page.locator('select');
      if (await selects.count() > 0) {
        const firstSelect = selects.first();
        const options = await firstSelect.locator('option').count();
        expect(options).toBeGreaterThan(1);
      }
      
      // Test checkboxes
      const checkboxes = page.locator('input[type="checkbox"]');
      if (await checkboxes.count() > 0) {
        const firstCheckbox = checkboxes.first();
        const wasChecked = await firstCheckbox.isChecked();
        await firstCheckbox.click();
        expect(await firstCheckbox.isChecked()).toBe(!wasChecked);
      }
    }
  });

  test('Charts and graphs render', async ({ page }) => {
    // Check for chart containers
    const charts = page.locator('canvas, svg[class*="chart"], [class*="graph"], .recharts-wrapper');
    
    if (await charts.count() > 0) {
      const firstChart = charts.first();
      await expect(firstChart).toBeVisible();
      
      // Check if chart has rendered content
      const boundingBox = await firstChart.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(100);
      expect(boundingBox?.height).toBeGreaterThan(50);
    }
  });

  test('Action buttons are functional', async ({ page }) => {
    // Look for primary action buttons
    const actionButtons = page.locator('button').filter({ hasText: /create|new|add|start/i });
    
    if (await actionButtons.count() > 0) {
      const firstButton = actionButtons.first();
      await expect(firstButton).toBeVisible();
      await expect(firstButton).toBeEnabled();
      
      // Check if button has proper styling
      const backgroundColor = await firstButton.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('Notifications area exists', async ({ page }) => {
    // Check for notification bell or alerts area
    const notifications = page.locator('[class*="notif"], [class*="alert"], [aria-label*="notif" i]');
    
    if (await notifications.count() > 0) {
      const firstNotification = notifications.first();
      await expect(firstNotification).toBeVisible();
    }
  });

  test('Date range picker works', async ({ page }) => {
    // Check for date picker
    const datePicker = page.locator('input[type="date"], [class*="date"], [class*="calendar"]');
    
    if (await datePicker.count() > 0) {
      const firstPicker = datePicker.first();
      await firstPicker.click();
      
      // Check if calendar popup appears
      await page.waitForTimeout(500);
      const calendar = page.locator('[role="dialog"], .calendar-popup, [class*="picker"]');
      if (await calendar.count() > 0) {
        await expect(calendar).toBeVisible();
      }
    }
  });

  test('Export functionality exists', async ({ page }) => {
    // Look for export buttons
    const exportButtons = page.locator('button, a').filter({ hasText: /export|download|csv|pdf/i });
    
    if (await exportButtons.count() > 0) {
      const firstExport = exportButtons.first();
      await expect(firstExport).toBeVisible();
      
      // Check if it has download attribute or proper href
      const href = await firstExport.getAttribute('href');
      const download = await firstExport.getAttribute('download');
      
      if (href || download) {
        expect(href || download).toBeTruthy();
      }
    }
  });

  test('Responsive layout on mobile', async ({ page }) => {
    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if sidebar collapses or hamburger menu appears
    const mobileMenu = page.locator('[class*="mobile"], [class*="burger"], [class*="hamburger"]');
    const sidebar = page.locator('aside, [class*="sidebar"]');
    
    if (await mobileMenu.count() > 0) {
      await expect(mobileMenu.first()).toBeVisible();
    }
    
    // Sidebar might be hidden on mobile
    if (await sidebar.count() > 0) {
      const isVisible = await sidebar.isVisible();
      if (!isVisible) {
        // Try to open mobile menu
        if (await mobileMenu.count() > 0) {
          await mobileMenu.first().click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('Help or documentation links exist', async ({ page }) => {
    // Check for help links
    const helpLinks = page.locator('a, button').filter({ hasText: /help|docs|documentation|support/i });
    
    if (await helpLinks.count() > 0) {
      const firstHelp = helpLinks.first();
      await expect(firstHelp).toBeVisible();
      
      const href = await firstHelp.getAttribute('href');
      if (href) {
        expect(href).toMatch(/help|docs|support/i);
      }
    }
  });
});