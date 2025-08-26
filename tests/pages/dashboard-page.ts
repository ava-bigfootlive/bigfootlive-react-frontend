import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  // Selectors
  private readonly userMenu = '[data-testid="user-menu"]';
  private readonly createStreamButton = '[data-testid="create-stream-button"]';
  private readonly streamsGrid = '[data-testid="streams-grid"]';
  private readonly streamCard = '[data-testid="stream-card"]';
  private readonly searchInput = '[data-testid="search-input"]';
  private readonly filterDropdown = '[data-testid="filter-dropdown"]';
  private readonly analyticsWidget = '[data-testid="analytics-widget"]';
  private readonly notificationBell = '[data-testid="notification-bell"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to dashboard
   */
  async goto(): Promise<void> {
    await super.goto('/dashboard');
    await this.waitForPageLoad();
    await this.waitForElement(this.userMenu);
  }

  /**
   * Create new stream
   */
  async createNewStream(): Promise<void> {
    await this.clickButton(this.createStreamButton);
    await this.page.waitForURL('**/stream/create');
  }

  /**
   * Get list of streams
   */
  async getStreamsList(): Promise<Array<{ title: string; status: string; viewers: number }>> {
    await this.waitForElement(this.streamsGrid);
    const streamCards = this.page.locator(this.streamCard);
    const count = await streamCards.count();
    
    const streams = [];
    for (let i = 0; i < count; i++) {
      const card = streamCards.nth(i);
      const title = await card.locator('[data-testid="stream-title"]').textContent() || '';
      const status = await card.locator('[data-testid="stream-status"]').textContent() || '';
      const viewersText = await card.locator('[data-testid="stream-viewers"]').textContent() || '0';
      const viewers = parseInt(viewersText.replace(/\D/g, ''), 10) || 0;
      
      streams.push({ title, status, viewers });
    }
    
    return streams;
  }

  /**
   * Search for streams
   */
  async searchStreams(query: string): Promise<void> {
    await this.fillField(this.searchInput, query);
    await this.page.waitForTimeout(1000); // Wait for search debounce
  }

  /**
   * Click on stream by title
   */
  async openStream(title: string): Promise<void> {
    const streamCard = this.page.locator(this.streamCard).filter({ hasText: title });
    await expect(streamCard).toBeVisible();
    await streamCard.click();
  }

  /**
   * Verify dashboard elements are present
   */
  async verifyDashboard(): Promise<void> {
    await expect(this.page.locator(this.userMenu)).toBeVisible();
    await expect(this.page.locator(this.createStreamButton)).toBeVisible();
    await expect(this.page.locator(this.streamsGrid)).toBeVisible();
  }

  /**
   * Get analytics data
   */
  async getAnalyticsData(): Promise<{ totalViews: number; liveStreams: number; totalRevenue: string }> {
    await this.waitForElement(this.analyticsWidget);
    
    const totalViews = parseInt(
      await this.page.locator('[data-testid="total-views"]').textContent() || '0',
      10
    );
    
    const liveStreams = parseInt(
      await this.page.locator('[data-testid="live-streams"]').textContent() || '0',
      10
    );
    
    const totalRevenue = await this.page.locator('[data-testid="total-revenue"]').textContent() || '$0';
    
    return { totalViews, liveStreams, totalRevenue };
  }
}