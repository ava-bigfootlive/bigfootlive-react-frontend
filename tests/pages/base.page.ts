import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly footer: Locator;
  readonly navMenu: Locator;
  readonly userMenu: Locator;
  readonly notificationBell: Locator;
  readonly searchBar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header');
    this.footer = page.locator('footer');
    this.navMenu = page.locator('nav[role="navigation"]');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.notificationBell = page.locator('[data-testid="notification-bell"]');
    this.searchBar = page.locator('input[type="search"]');
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyPageTitle(expectedTitle: string) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  async verifyURL(expectedURL: string | RegExp) {
    await expect(this.page).toHaveURL(expectedURL);
  }

  async clickNavLink(linkText: string) {
    await this.navMenu.getByRole('link', { name: linkText }).click();
  }

  async search(query: string) {
    await this.searchBar.fill(query);
    await this.searchBar.press('Enter');
  }

  async openUserMenu() {
    await this.userMenu.click();
  }

  async logout() {
    await this.openUserMenu();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
  }

  async checkNotifications() {
    await this.notificationBell.click();
    return await this.page.locator('[data-testid="notification-list"]').count();
  }

  async acceptCookies() {
    const cookieBanner = this.page.locator('[data-testid="cookie-banner"]');
    if (await cookieBanner.isVisible()) {
      await cookieBanner.getByRole('button', { name: 'Accept' }).click();
    }
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  async checkAccessibility() {
    // Basic accessibility checks
    const images = await this.page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    const buttons = await this.page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      expect(ariaLabel || text).toBeTruthy();
    }
  }

  async verifyNoConsoleErrors() {
    const errors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await this.page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  }

  async waitForAPIResponse(url: string | RegExp) {
    return await this.page.waitForResponse(url);
  }

  async mockAPIResponse(url: string | RegExp, response: any) {
    await this.page.route(url, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }
}