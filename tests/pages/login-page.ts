import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  // Selectors
  private readonly emailInput = '[data-testid="email-input"]';
  private readonly passwordInput = '[data-testid="password-input"]';
  private readonly loginButton = '[data-testid="login-button"]';
  private readonly forgotPasswordLink = '[data-testid="forgot-password-link"]';
  private readonly signupLink = '[data-testid="signup-link"]';
  private readonly errorMessage = '[data-testid="error-message"]';
  private readonly loadingSpinner = '[data-testid="loading-spinner"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await super.goto('/login');
    await this.waitForPageLoad();
    await this.waitForElement(this.emailInput);
  }

  /**
   * Perform login with email and password
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput, email);
    await this.fillField(this.passwordInput, password);
    await this.clickButton(this.loginButton);

    // Wait for loading to complete
    if (await this.isVisible(this.loadingSpinner)) {
      await this.page.locator(this.loadingSpinner).waitFor({ state: 'hidden' });
    }
  }

  /**
   * Check for error message
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.isVisible(this.errorMessage)) {
      return await this.page.locator(this.errorMessage).textContent();
    }
    return null;
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.clickButton(this.forgotPasswordLink);
  }

  /**
   * Click signup link
   */
  async clickSignup(): Promise<void> {
    await this.clickButton(this.signupLink);
  }

  /**
   * Verify login form is visible
   */
  async verifyLoginForm(): Promise<void> {
    await expect(this.page.locator(this.emailInput)).toBeVisible();
    await expect(this.page.locator(this.passwordInput)).toBeVisible();
    await expect(this.page.locator(this.loginButton)).toBeVisible();
  }
}