import { Page, Locator, expect } from '@playwright/test';
import { ENV } from '../config/environment';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for element to be visible and stable
   */
  async waitForElement(selector: string, timeout?: number): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ 
      state: 'visible', 
      timeout: timeout || ENV.frontend.timeout 
    });
    return element;
  }

  /**
   * Fill form field with validation
   */
  async fillField(selector: string, value: string): Promise<void> {
    const field = await this.waitForElement(selector);
    await field.clear();
    await field.fill(value);
    await expect(field).toHaveValue(value);
  }

  /**
   * Click button with loading state handling
   */
  async clickButton(selector: string): Promise<void> {
    const button = await this.waitForElement(selector);
    await expect(button).toBeEnabled();
    await button.click();
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp, timeout?: number): Promise<any> {
    const response = await this.page.waitForResponse(
      (response) => {
        if (typeof urlPattern === 'string') {
          return response.url().includes(urlPattern);
        }
        return urlPattern.test(response.url());
      },
      { timeout: timeout || ENV.backend.timeout }
    );
    return await response.json();
  }
}