import type { Locator, Page } from '@playwright/test';

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
    this.baseURL = process.env.BASE_URL || 'http://localhost:3000';
  }

  /**
   * Common page elements
   */
  protected get navigation(): Locator {
    return this.page.locator('nav, header, .navbar');
  }

  protected get mainContent(): Locator {
    return this.page.locator('main, .main, #main');
  }

  protected get footer(): Locator {
    return this.page.locator('footer');
  }

  protected get loadingSpinner(): Locator {
    return this.page.locator('.loading, .spinner, [data-testid="loading"]');
  }

  protected get errorMessage(): Locator {
    return this.page.locator('.error, .alert-error, [data-testid="error"]');
  }

  protected get successMessage(): Locator {
    return this.page.locator('.success, .alert-success, [data-testid="success"]');
  }

  /**
   * Navigation methods
   */
  async goto(path: string = ''): Promise<void> {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');

    // Wait for any loading spinners to disappear
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // Loading spinner might not exist, that's okay
    }
  }

  /**
   * Authentication helpers
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Look for authenticated user elements - avatar with user initial
      const userAvatar = this.page.locator('.avatar.placeholder');
      const signInButton = this.page.locator('text="Sign In"');

      // Check if user avatar is visible and sign in button is NOT visible
      const hasUserAvatar = await userAvatar.isVisible({ timeout: 3000 });
      const hasSignIn = await signInButton.isVisible({ timeout: 1000 }).catch(() => false);

      return hasUserAvatar && !hasSignIn;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    // Logout is done via POST to /auth/logout
    // We'll use page.request to make the POST request
    await this.page.request.post(`${this.baseURL}/auth/logout`);
    await this.page.goto('/');
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
    await this.page.waitForLoadState('networkidle');
  }

  async waitForSelector(selector: string, timeout: number = 10000): Promise<Locator> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ timeout });
    return locator;
  }

  /**
   * Abstract method that each page must implement
   * to verify the page has loaded correctly
   */
  abstract verifyPageLoaded(): Promise<void>;
}
