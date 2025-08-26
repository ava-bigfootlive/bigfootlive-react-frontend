import { Page, expect } from '@playwright/test';

/**
 * SSR-specific helpers for BigFootLive platform testing
 */

/**
 * Navigate to a page and handle SSR redirects
 */
export async function navigateSSR(page: Page, url: string, options?: {
  expectedStatus?: number[];
  waitForSelector?: string;
  timeout?: number;
}) {
  const validStatuses = options?.expectedStatus || [200, 307, 308];
  const timeout = options?.timeout || 30000;
  
  const response = await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: timeout
  });
  
  // Accept 307/308 redirects as valid for SSR
  if (response) {
    expect(validStatuses).toContain(response.status());
  }
  
  // Wait for hydration to complete
  await page.waitForLoadState('networkidle', { timeout: timeout });
  
  // Wait for specific selector if provided
  if (options?.waitForSelector) {
    await page.waitForSelector(options.waitForSelector, {
      timeout: timeout,
      state: 'visible'
    });
  }
  
  // Wait for React hydration
  await waitForHydration(page);
  
  return response;
}

/**
 * Wait for React hydration to complete
 */
export async function waitForHydration(page: Page) {
  try {
    // Wait for Next.js root to be present and have content
    await page.waitForFunction(() => {
      // Look for various possible root elements
      const possibleRoots = [
        '#__next',
        '#root', 
        '[data-reactroot]',
        'main',
        'body > div:first-child'
      ];
      
      for (const selector of possibleRoots) {
        const element = document.querySelector(selector);
        if (element && element.children.length > 0) {
          return true;
        }
      }
      
      // Fallback: check if body has meaningful content
      const body = document.body;
      return body && body.children.length > 0 && body.textContent && body.textContent.trim().length > 50;
    }, { timeout: 15000 });
    
    // Wait for network to settle
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Additional wait for hydration
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('Hydration wait timeout, continuing anyway...');
    // Continue anyway - page might be static or hydration might be different
    await page.waitForTimeout(2000);
  }
}

/**
 * Check if a page loaded successfully considering SSR
 */
export async function verifyPageLoad(page: Page, options?: {
  titlePattern?: RegExp;
  urlPattern?: RegExp | string;
  contentSelector?: string;
}) {
  // Check title if provided
  if (options?.titlePattern) {
    await expect(page).toHaveTitle(options.titlePattern);
  }
  
  // Check URL if provided
  if (options?.urlPattern) {
    await expect(page).toHaveURL(options.urlPattern);
  }
  
  // Check for content
  if (options?.contentSelector) {
    await expect(page.locator(options.contentSelector)).toBeVisible();
  }
  
  // Ensure no critical errors
  const hasError = await page.locator('text=/error|failed to load|something went wrong/i').count();
  expect(hasError).toBe(0);
}

/**
 * Handle authentication pages that may redirect
 */
export async function navigateToAuthPage(page: Page, authPath: string) {
  const response = await navigateSSR(page, authPath, {
    expectedStatus: [200, 307, 308, 401],
    timeout: 45000
  });
  
  // Auth pages might redirect to login or show content
  const currentUrl = page.url();
  const isAuthPage = currentUrl.includes('/auth/') || 
                     currentUrl.includes('/login') || 
                     currentUrl.includes('/register') ||
                     currentUrl.includes('/dashboard');
  
  expect(isAuthPage).toBeTruthy();
  
  return response;
}

/**
 * Wait for API response with proper error handling
 */
export async function waitForAPIResponse(
  page: Page, 
  urlPattern: string | RegExp,
  timeout: number = 10000
): Promise<boolean> {
  try {
    const response = await page.waitForResponse(
      resp => {
        const url = resp.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
    return response.ok();
  } catch (e) {
    // API call might not happen on all pages
    return false;
  }
}

/**
 * Get element with multiple possible selectors (for production variations)
 */
export async function getElementBySelectors(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    const element = page.locator(selector);
    if (await element.count() > 0) {
      return element.first();
    }
  }
  return null;
}

/**
 * Check if element exists with any of the provided selectors
 */
export async function elementExistsAny(page: Page, selectors: string[]): Promise<boolean> {
  for (const selector of selectors) {
    if (await page.locator(selector).count() > 0) {
      return true;
    }
  }
  return false;
}

/**
 * Wait for any of the provided selectors to appear
 */
export async function waitForAnySelector(
  page: Page, 
  selectors: string[], 
  options?: { timeout?: number; state?: 'visible' | 'attached' | 'detached' | 'hidden' }
) {
  const timeout = options?.timeout || 30000;
  const state = options?.state || 'visible';
  
  const promises = selectors.map(selector => 
    page.waitForSelector(selector, { 
      timeout, 
      state 
    }).catch(() => null)
  );
  
  const result = await Promise.race(promises);
  if (!result) {
    throw new Error(`None of the selectors appeared: ${selectors.join(', ')}`);
  }
  return result;
}