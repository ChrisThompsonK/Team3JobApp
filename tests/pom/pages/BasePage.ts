import type { Page } from '@playwright/test';

/**
 * Base Page class that all page objects inherit from
 * Contains common utilities and functionality shared across all pages
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific URL
   */
  async goto(path: string) {
    await this.page.goto(path);
  }

  /**
   * Get current URL
   */
  getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Wait for URL to match a pattern
   */
  async waitForUrl(urlPattern: RegExp | string) {
    await this.page.waitForURL(urlPattern);
  }

  /**
   * Get the page instance
   */
  getPage() {
    return this.page;
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(selector: string) {
    return await this.page.isVisible(selector);
  }

  /**
   * Retrieve the title of the page
   */
  async getPageTitle() {
    return await this.page.title();
  }
}
