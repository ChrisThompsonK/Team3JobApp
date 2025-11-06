import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { config } from '../config/config';
import { isLoggedIn, logout } from '../utils/auth.utils';

/**
 * Base Page Object Model
 *
 * Contains common functionality shared across all pages in the Kainos Job Portal
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = config.baseURL;
  }

  /**
   * Common page elements
   */
  protected get navigation(): Locator {
    return this.page.locator('[data-testid="navigation"], nav, header, .navbar');
  }

  protected get mainContent(): Locator {
    return this.page.locator('[data-testid="main-content"], main, .main, #main');
  }

  protected get footer(): Locator {
    return this.page.locator('[data-testid="footer"], footer');
  }

  protected get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading"], .loading, .spinner');
  }

  protected get errorMessage(): Locator {
    return this.page.locator('[data-testid="error"], .error, .alert-error');
  }

  protected get successMessage(): Locator {
    return this.page.locator('[data-testid="success"], .success, .alert-success');
  }

  /**
   * Navigation methods
   */
  async goto(path: string = ''): Promise<void> {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    console.log(`Navigating to ${url}`);
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    console.log('Waiting for page load');
    await this.page.waitForLoadState('domcontentloaded');

    // Wait for any loading spinners to disappear
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: config.timeouts.pageLoad });
    } catch {
      // Loading spinner might not exist, that's okay
    }
  }

  /**
   * Authentication helpers
   */
  async isLoggedIn(): Promise<boolean> {
    return isLoggedIn(this.page);
  }

  async logout(): Promise<void> {
    await logout(this.page, this.baseURL);
    await this.waitForPageLoad();
  }

  /**
   * Form helpers
   */
  async fillForm(data: Record<string, string>): Promise<void> {
    for (const [field, value] of Object.entries(data)) {
      const input = this.page.locator(
        `input[name="${field}"], textarea[name="${field}"], select[name="${field}"]`
      );

      if (await input.isVisible()) {
        const tagName = await input.evaluate((el) => el.tagName.toLowerCase());

        if (tagName === 'select') {
          await input.selectOption(value);
        } else {
          await input.fill(value);
        }
      }
    }
  }

  async submitForm(
    submitSelector: string = 'button[type="submit"], input[type="submit"]'
  ): Promise<void> {
    const submitButton = this.page.locator(submitSelector).first();
    await submitButton.click();
  }

  /**
   * Wait for specific conditions
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: config.timeouts.networkIdle });
  }

  async waitForSelector(
    selector: string,
    timeout: number = config.timeouts.selectorWait
  ): Promise<Locator> {
    const locator = this.page.locator(selector);
    await expect(locator).toBeVisible({ timeout });
    return locator;
  }

  /**
   * Abstract method that each page must implement
   * to verify the page has loaded correctly
   */
  abstract verifyPageLoaded(): Promise<void>;

  /**
   * Check accessibility of the current page
   */
  async checkAccessibility(): Promise<void> {
    const snapshot = await this.page.accessibility.snapshot();

    if (!snapshot) {
      console.log('No accessibility snapshot available');
      return;
    }

    // Log any accessibility violations
    const violations =
      snapshot.children?.filter((child) => child.role === 'error' || !child.role) || [];

    if (violations.length > 0) {
      console.warn(`Accessibility violations found: ${violations.length}`);
      violations.forEach((violation, index) => {
        console.warn(`${index + 1}. ${violation.name || 'Unnamed violation'}`);
      });
    } else {
      console.log('No accessibility violations found');
    }
  }
}
