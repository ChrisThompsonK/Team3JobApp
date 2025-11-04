import type { Page } from '@playwright/test';

/**
 * Helper class for common page interactions
 */
export class PageHelper {
  constructor(private page: Page) {}

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if an element exists on the page
   */
  async elementExists(selector: string): Promise<boolean> {
    return (await this.page.locator(selector).count()) > 0;
  }

  /**
   * Take a screenshot with a custom name
   */
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Fill a form field by label
   */
  async fillByLabel(label: string | RegExp, value: string) {
    await this.page.getByLabel(label).fill(value);
  }

  /**
   * Click a button by text
   */
  async clickButton(text: string | RegExp) {
    await this.page.getByRole('button', { name: text }).click();
  }

  /**
   * Click a link by text
   */
  async clickLink(text: string | RegExp) {
    await this.page.getByRole('link', { name: text }).click();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Check if URL contains a specific string
   */
  urlContains(substring: string): boolean {
    return this.page.url().includes(substring);
  }
}

/**
 * Helper functions for form interactions
 */
export class FormHelper {
  constructor(private page: Page) {}

  /**
   * Fill a complete login form
   */
  async fillLoginForm(email: string, password: string) {
    await this.page.getByLabel(/email|username/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
  }

  /**
   * Fill a complete registration form
   */
  async fillRegistrationForm(email: string, password: string, confirmPassword?: string) {
    await this.page.getByLabel(/email/i).fill(email);

    const passwordFields = this.page.getByLabel(/password/i);
    const count = await passwordFields.count();

    if (count === 1) {
      await passwordFields.fill(password);
    } else if (count >= 2) {
      await passwordFields.nth(0).fill(password);
      await passwordFields.nth(1).fill(confirmPassword || password);
    }
  }

  /**
   * Submit a form
   */
  async submitForm(buttonText: string | RegExp = /submit|save|create|update/i) {
    await this.page.getByRole('button', { name: buttonText }).click();
  }

  /**
   * Check for form validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    const errorSelectors = [
      '.error',
      '.alert-error',
      '[role="alert"]',
      '.invalid-feedback',
      '.error-message',
    ];

    for (const selector of errorSelectors) {
      if ((await this.page.locator(selector).count()) > 0) {
        return true;
      }
    }

    return false;
  }
}

/**
 * Helper functions for navigation
 */
export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to home page
   */
  async goHome() {
    await this.page.goto('/');
  }

  /**
   * Navigate to login page
   */
  async goToLogin() {
    await this.page.goto('/auth/login');
  }

  /**
   * Navigate to registration page
   */
  async goToRegister() {
    await this.page.goto('/auth/register');
  }

  /**
   * Navigate to job roles list
   */
  async goToJobRoles() {
    await this.page.goto('/job-roles');
  }

  /**
   * Navigate to analytics dashboard
   */
  async goToAnalytics() {
    await this.page.goto('/analytics/dashboard');
  }

  /**
   * Navigate to my applications
   */
  async goToMyApplications() {
    await this.page.goto('/job-roles/my-applications');
  }
}

/**
 * Wait helper utilities
 */
export class WaitHelper {
  constructor(private page: Page) {}

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for a specific URL
   */
  async waitForUrl(url: string | RegExp) {
    await this.page.waitForURL(url);
  }

  /**
   * Wait for an element to be visible
   */
  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  /**
   * Custom wait with timeout
   */
  async wait(milliseconds: number) {
    await this.page.waitForTimeout(milliseconds);
  }
}
