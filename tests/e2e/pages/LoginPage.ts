import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login Page Object Model
 * Encapsulates all interactions with the login page
 */
export class LoginPage extends BasePage {
  // Selectors
  private readonly emailInput = 'input[name="email"]';
  private readonly passwordInput = 'input[name="password"]';
  private readonly submitButton = 'button[type="submit"]';

  /**
   * Navigate to the home page and click sign in link
   */
  async navigateToLogin() {
    await this.goto('/');
    await this.page.getByRole('link', { name: /sign in|login/i }).click();
  }

  /**
   * Fill in the email field
   */
  async fillEmail(email: string) {
    await this.page.fill(this.emailInput, email);
  }

  /**
   * Fill in the password field
   */
  async fillPassword(password: string) {
    await this.page.fill(this.passwordInput, password);
  }

  /**
   * Click the submit button
   */
  async clickSubmit() {
    await this.page.click(this.submitButton);
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    await this.navigateToLogin();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();

    // Wait for login to complete - check for successful redirect away from login page
    await this.page.waitForFunction(() => !window.location.href.includes('/auth/login'), {
      timeout: 10000,
    });
  }

  /**
   * Login as admin user
   */
  async loginAsAdmin() {
    await this.login('admin@example.com', 'ChangeMe123!');
  }

  /**
   * Login as regular user
   */
  async loginAsRegularUser() {
    await this.login('example@example.com', 'qqqqqqqq');
  }

  /**
   * Verify login page is displayed
   */
  async isLoginPageDisplayed() {
    return await this.isElementVisible(this.submitButton);
  }

  /**
   * Get sign in heading
   */
  async getSignInHeading() {
    return await this.page.getByRole('heading', { name: /sign in/i });
  }

  /**
   * Verify user is redirected away from login page
   */
  async isNotOnLoginPage() {
    await expect(this.page).not.toHaveURL(/\/auth\/login/);
  }
}
