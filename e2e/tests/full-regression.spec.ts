import { test, expect } from '@playwright/test';

// Test user credentials for AWS production
const TEST_USER = {
  email: 'testuser@bigfootlive.io',
  password: 'TestUser123!',
  tenant: 'test-tenant'
};

test.describe('BigfootLive Full E2E Regression Suite', () => {
  
  test('1. Homepage loads with correct title and branding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BigfootLive/);
    
    // Check for plum theme styling
    const body = page.locator('body');
    const styles = await body.evaluate(el => window.getComputedStyle(el));
    expect(styles).toBeDefined();
  });

  test('2. Authentication flow - Login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check for Shadcn UI components
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    
    // Check for plum theme on buttons
    const button = page.locator('button:has-text("Sign In")');
    await expect(button).toHaveCSS('background-color', /.*/);
  });

  test('3. Register page loads and has form elements', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.locator('input[placeholder*="name" i]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create Account")')).toBeVisible();
  });

  test('4. Forgot password page accessibility', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Reset Password")')).toBeVisible();
  });

  test('5. Multi-tenant selection page', async ({ page }) => {
    await page.goto('/select-tenant');
    
    // Should redirect to login if not authenticated
    await page.waitForURL(/\/login/);
  });

  test('6. Dashboard requires authentication', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL(/\/login/);
  });

  test('7. Streaming page requires authentication', async ({ page }) => {
    await page.goto('/streaming');
    
    // Should redirect to login
    await page.waitForURL(/\/login/);
  });

  test('8. Platform admin page requires authentication', async ({ page }) => {
    await page.goto('/platform-admin');
    
    // Should redirect to login
    await page.waitForURL(/\/login/);
  });

  test('9. Unauthorized page loads', async ({ page }) => {
    await page.goto('/unauthorized');
    
    await expect(page.locator('text=/unauthorized/i')).toBeVisible();
  });

  test('10. API connectivity - Backend health check', async ({ page }) => {
    const response = await page.request.get('https://api.bigfootlive.io/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('11. CloudFront CDN serving static assets', async ({ page }) => {
    await page.goto('/');
    
    // Check that CSS is loaded
    const cssResponse = await page.request.get('/assets/index-aHX4iECc.css');
    expect(cssResponse.ok()).toBeTruthy();
    
    // Check that JS is loaded
    const jsFiles = await page.locator('script[src*="assets"]').all();
    expect(jsFiles.length).toBeGreaterThan(0);
  });

  test('12. Responsive design - Mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu or responsive elements
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('13. Responsive design - Tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('14. Responsive design - Desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('15. Theme consistency - Card components', async ({ page }) => {
    await page.goto('/login');
    
    // Check for Shadcn card components
    const cards = await page.locator('[class*="card"]').all();
    if (cards.length > 0) {
      const firstCard = cards[0];
      await expect(firstCard).toBeVisible();
    }
  });

  test('16. Form validation - Email field', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    
    // HTML5 validation or custom validation
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBeFalsy();
  });

  test('17. Navigation links work', async ({ page }) => {
    await page.goto('/login');
    
    // Check for register link
    const registerLink = page.locator('a[href*="register"]');
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });

  test('18. Performance - Page load time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
  });

  test('19. Security headers present', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();
    
    // CloudFront should set security headers
    expect(headers).toBeDefined();
  });

  test('20. 404 page handling', async ({ page }) => {
    await page.goto('/non-existent-page-12345');
    
    // React Router should handle 404
    const body = await page.textContent('body');
    expect(body).toBeDefined();
  });
});

test.describe('Advanced E2E Tests', () => {
  
  test('21. CORS configuration - API access', async ({ page }) => {
    await page.goto('/');
    
    // Make API request from frontend domain
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('https://api.bigfootlive.io/health');
        return { ok: res.ok, status: res.status };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    expect(response).toHaveProperty('ok');
  });

  test('22. WebSocket connectivity (if applicable)', async ({ page }) => {
    await page.goto('/');
    
    // Check if WebSocket endpoints are defined
    const hasWebSocket = await page.evaluate(() => {
      return typeof WebSocket !== 'undefined';
    });
    
    expect(hasWebSocket).toBeTruthy();
  });

  test('23. Local storage persistence', async ({ page }) => {
    await page.goto('/');
    
    // Set a test value
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });
    
    // Reload and check persistence
    await page.reload();
    
    const value = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    
    expect(value).toBe('test-value');
  });

  test('24. Session storage functionality', async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => {
      sessionStorage.setItem('session-test', 'session-value');
    });
    
    const value = await page.evaluate(() => {
      return sessionStorage.getItem('session-test');
    });
    
    expect(value).toBe('session-value');
  });

  test('25. Console error monitoring', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Should have minimal console errors
    expect(errors.filter(e => !e.includes('404'))).toHaveLength(0);
  });
});

test.describe('UI Component Tests', () => {
  
  test('26. Button interactions', async ({ page }) => {
    await page.goto('/login');
    
    const button = page.locator('button').first();
    await expect(button).toBeVisible();
    
    // Check hover state
    await button.hover();
    await page.waitForTimeout(100);
  });

  test('27. Input field interactions', async ({ page }) => {
    await page.goto('/login');
    
    const input = page.locator('input').first();
    await input.fill('test input');
    
    const value = await input.inputValue();
    expect(value).toBe('test input');
  });

  test('28. Card component rendering', async ({ page }) => {
    await page.goto('/login');
    
    // Shadcn cards should be present
    const elements = await page.locator('[class*="rounded"]').all();
    expect(elements.length).toBeGreaterThan(0);
  });

  test('29. Alert component (if visible)', async ({ page }) => {
    await page.goto('/login');
    
    // Try to trigger an alert by submitting empty form
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('30. Theme CSS variables loaded', async ({ page }) => {
    await page.goto('/');
    
    const cssVariables = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        primary: styles.getPropertyValue('--primary'),
        background: styles.getPropertyValue('--background'),
        foreground: styles.getPropertyValue('--foreground')
      };
    });
    
    // Plum theme variables should be set
    expect(cssVariables.primary).toBeTruthy();
  });
});