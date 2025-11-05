import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * Login Page Object Model
 *
 * Handles all interactions with the login page
 */
export class LoginPage extends BasePage {
  // Page elements
  private get emailInput(): Locator {
    return this.page.locator('input[name="email"], input[type="email"], #email');
  }

  private get passwordInput(): Locator {
    return this.page.locator('input[name="password"], input[type="password"], #password');
  }

  private get loginButton(): Locator {
    return this.page.locator(
      'button[type="submit"], input[type="submit"], [data-testid="login-button"]'
    );
  }

  private get loginForm(): Locator {
    return this.page.locator('form');
  }

  private get validationErrors(): Locator {
    return this.page.locator(
      '.alert-error, .error, .field-error, .invalid-feedback, [data-testid="error"]'
    );
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await super.goto('/auth/login');
  }

  /**
   * Verify the login page has loaded correctly
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.loginForm).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();

    // Verify page title
    await expect(this.page).toHaveTitle(/kainos.*job.*portal|login|sign in/i);
  }

  /**
   * Login with credentials
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Click the login button and wait for either:
    //  - a redirect away from the login page (successful login), or
    //  - a visible validation/error element (failed login)
    await this.loginButton.click();

    // Wait for either condition with a reasonable timeout
    await Promise.race([
      this.page.waitForURL((url) => !url.pathname.includes('/auth/login') && url.pathname !== '/auth/login', {
        timeout: 7000,
      }).then(() => null).catch(() => null),
      this.validationErrors.first().waitFor({ state: 'visible', timeout: 7000 }).then(() => null).catch(() => null),
    ]);

    // Small pause to allow page to settle
    await this.page.waitForTimeout(300);
  }

  /**
   * Verify successful login (redirected away from login page)
   */
  async verifySuccessfulLogin(): Promise<void> {
    // Wait for redirect away from login page
    await this.page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 5000 });

    // Should be redirected away from login page
    await expect(this.page).not.toHaveURL(/login/);

    // Wait a bit for the page to render with user elements
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);

    // Should see authenticated content
    const isAuthenticated = await this.isLoggedIn();
    expect(isAuthenticated).toBe(true);
  }

  /**
   * Verify login failed (still on login page with error)
   */
  async verifyLoginFailed(): Promise<void> {
    // Should still be on login page
    await expect(this.page).toHaveURL(/login/);

    // Should see error message
    await expect(this.validationErrors.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get validation error messages
   */
  async getValidationErrors(): Promise<string[]> {
    const errors = await this.validationErrors.allTextContents();
    return errors.filter((error) => error.trim().length > 0);
  }
}
