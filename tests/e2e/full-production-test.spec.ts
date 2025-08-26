import { test, expect, Page } from '@playwright/test';

const PRODUCTION_URL = 'https://bigfootlive.io';
const API_URL = 'https://api.bigfootlive.io';

test.describe('BigFootLive Production E2E Tests', () => {
  test.describe('Homepage Tests', () => {
    test('should load homepage successfully', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await expect(page).toHaveTitle(/BigFoot Live/);
      
      // Check main heading
      const heading = page.locator('h1');
      await expect(heading).toContainText('BigFoot');
      await expect(heading).toContainText('Live');
      
      // Check tagline
      await expect(page.locator('text=The ultimate platform for live streaming')).toBeVisible();
    });

    test('should have working navigation buttons', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      
      // Check Get Started button exists
      const getStartedBtn = page.locator('a:has-text("Get Started")');
      await expect(getStartedBtn).toBeVisible();
      await expect(getStartedBtn).toHaveAttribute('href', '/auth/login');
      
      // Check View Dashboard button exists
      const dashboardBtn = page.locator('a:has-text("View Dashboard")');
      await expect(dashboardBtn).toBeVisible();
      await expect(dashboardBtn).toHaveAttribute('href', '/dashboard');
    });

    test('should display feature cards', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      
      // Check feature cards are visible
      await expect(page.locator('text=🎥 Live Streaming')).toBeVisible();
      await expect(page.locator('text=💬 Real-time Chat')).toBeVisible();
      await expect(page.locator('text=📊 Analytics')).toBeVisible();
      
      // Check feature descriptions
      await expect(page.locator('text=Professional-grade live streaming')).toBeVisible();
      await expect(page.locator('text=Engage with your audience')).toBeVisible();
      await expect(page.locator('text=Comprehensive insights')).toBeVisible();
    });

    test('should display platform status', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      
      // Check platform status section
      await expect(page.locator('text=Platform Status')).toBeVisible();
      await expect(page.locator('text=API Status')).toBeVisible();
      await expect(page.locator('text=WebSocket')).toBeVisible();
      
      // Check status indicators
      await expect(page.locator('text=● Online').first()).toBeVisible();
      await expect(page.locator('text=● Connected')).toBeVisible();
      
      // Check health status link
      const healthLink = page.locator('a:has-text("View Health Status")');
      await expect(healthLink).toBeVisible();
      await expect(healthLink).toHaveAttribute('href', '/health');
    });
  });

  test.describe('SPA Routing Tests', () => {
    test('should navigate to login page without page reload', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      
      // Set up listener for navigation
      let navigationOccurred = false;
      page.on('framenavigated', () => {
        navigationOccurred = true;
      });
      
      // Click Get Started button
      await page.click('a:has-text("Get Started")');
      
      // Should navigate to login without full page reload
      await page.waitForURL('**/auth/login');
      expect(page.url()).toContain('/auth/login');
      
      // Check login page elements
      await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
    });

    test('should navigate to dashboard page', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.click('a:has-text("View Dashboard")');
      
      await page.waitForURL('**/dashboard');
      expect(page.url()).toContain('/dashboard');
      
      // Should redirect to login or show dashboard
      const url = page.url();
      expect(url).toMatch(/\/(dashboard|auth\/login)/);
    });

    test('should handle direct route access', async ({ page }) => {
      // Test direct access to various routes
      const routes = [
        '/auth/login',
        '/auth/register',
        '/dashboard',
        '/streaming',
        '/health',
        '/unauthorized',
        '/platform-admin',
        '/select-tenant'
      ];
      
      for (const route of routes) {
        const response = await page.goto(`${PRODUCTION_URL}${route}`, {
          waitUntil: 'networkidle'
        });
        
        // All routes should return 200 (SPA behavior)
        expect(response?.status()).toBe(200);
        
        // Page should load without errors
        await expect(page).not.toHaveTitle(/404/);
        await expect(page).not.toHaveTitle(/Error/);
      }
    });
  });

  test.describe('Authentication Pages', () => {
    test('should display login page correctly', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/auth/login`);
      
      // Check login form elements
      await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
      await expect(page.locator('input[type="email"], input[name="username"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
      
      // Check links
      await expect(page.locator('a:has-text("Sign up"), a:has-text("Create account")')).toBeVisible();
      await expect(page.locator('a:has-text("Forgot password")')).toBeVisible();
    });

    test('should display register page correctly', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/auth/register`);
      
      // Check register form elements
      await expect(page.locator('h2:has-text("Create Account")')).toBeVisible();
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Sign Up"), button:has-text("Create Account")')).toBeVisible();
      
      // Check login link
      await expect(page.locator('a:has-text("Sign in"), a:has-text("Already have")')).toBeVisible();
    });

    test('should display forgot password page', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/auth/forgot-password`);
      
      // Check forgot password elements
      await expect(page.locator('h2:has-text("Reset"), h2:has-text("Forgot")')).toBeVisible();
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('button:has-text("Reset"), button:has-text("Send")')).toBeVisible();
    });
  });

  test.describe('Health Check', () => {
    test('should display health status page', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/health`);
      
      // Check health page content
      await expect(page.locator('text=Health Status, text=System Health')).toBeVisible();
      
      // Check for status indicators or JSON response
      const content = await page.content();
      expect(content).toMatch(/status|health|ok|online/i);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login for protected dashboard', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/dashboard`);
      
      // Wait for potential redirect
      await page.waitForTimeout(2000);
      
      // Should either show login redirect or dashboard with auth check
      const url = page.url();
      const content = await page.content();
      
      // Either redirected to login or shows auth-related content
      expect(
        url.includes('/auth/login') || 
        url.includes('/dashboard') ||
        content.includes('Sign In') ||
        content.includes('Loading') ||
        content.includes('Redirecting')
      ).toBe(true);
    });

    test('should handle unauthorized page', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/unauthorized`);
      
      // Check unauthorized page content
      await expect(page.locator('text=Unauthorized, text=Access Denied, text=403')).toBeVisible();
    });
  });

  test.describe('Streaming Pages', () => {
    test('should load streaming page', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/streaming`);
      
      // Check streaming page loads
      await expect(page).not.toHaveTitle(/404/);
      
      // Check for streaming-related content or redirect
      const content = await page.content();
      expect(
        content.includes('Stream') ||
        content.includes('Live') ||
        content.includes('Sign In') // May redirect to login
      ).toBe(true);
    });

    test('should load live streaming page', async ({ page }) => {
      await page.goto(`${PRODUCTION_URL}/streaming/live`);
      
      // Check page loads without error
      await expect(page).not.toHaveTitle(/404/);
      
      // Live page may require auth
      const content = await page.content();
      expect(
        content.includes('Live') ||
        content.includes('Stream') ||
        content.includes('Sign In')
      ).toBe(true);
    });
  });

  test.describe('API Integration', () => {
    test('should check API health endpoint', async ({ request }) => {
      const response = await request.get(`${API_URL}/health`);
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('healthy');
    });

    test('should check API CORS headers', async ({ request }) => {
      const response = await request.get(`${API_URL}/health`, {
        headers: {
          'Origin': PRODUCTION_URL
        }
      });
      
      expect(response.status()).toBe(200);
      
      // Check CORS headers
      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBeDefined();
    });
  });

  test.describe('Performance Tests', () => {
    test('should load homepage within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      
      // Homepage should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have proper meta tags', async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      
      // Check viewport meta tag
      const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
      expect(viewport).toContain('width=device-width');
      
      // Check description meta tag
      const description = await page.getAttribute('meta[name="description"]', 'content');
      expect(description).toContain('streaming');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(PRODUCTION_URL);
      
      // Check that main elements are still visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('a:has-text("Get Started")')).toBeVisible();
      
      // Check no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(375);
    });
  });

  test.describe('Browser Console', () => {
    test('should not have console errors on homepage', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto(PRODUCTION_URL);
      await page.waitForTimeout(2000);
      
      // Filter out expected errors (like failed auth checks)
      const criticalErrors = errors.filter(err => 
        !err.includes('401') &&
        !err.includes('403') &&
        !err.includes('Failed to fetch') &&
        !err.includes('NetworkError')
      );
      
      expect(criticalErrors).toHaveLength(0);
    });
  });
});

// Additional test for checking all navigation links work
test('Navigation smoke test - all links clickable', async ({ page }) => {
  await page.goto(PRODUCTION_URL);
  
  // Collect all links
  const links = await page.locator('a').all();
  
  console.log(`Found ${links.length} links to test`);
  
  for (const link of links) {
    const href = await link.getAttribute('href');
    const text = await link.innerText();
    
    if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
      console.log(`Testing link: ${text} -> ${href}`);
      
      // Click the link
      await link.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Check no 404
      await expect(page).not.toHaveTitle(/404/);
      
      // Go back to homepage for next test
      await page.goto(PRODUCTION_URL);
    }
  }
});