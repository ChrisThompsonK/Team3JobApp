import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Report Page Object Model
 * Encapsulates all interactions and validations for the report feature
 */
export class ReportPage extends BasePage {
  /**
   * Navigate to report page by clicking the Report link
   * Used when the link is visible (logged in as admin)
   */
  async navigateToReportPageViaLink() {
    await this.page.getByRole('link', { name: /report/i }).click();
    await this.page.waitForURL(/\/jobs\/report/);
  }

  /**
   * Navigate directly to report page using URL
   * Used for unauthenticated users or when testing redirects
   */
  async navigateToReportPage() {
    await this.page.goto('/jobs/report');
  }

  /**
   * Get response from accessing report page
   * Useful for checking status codes without rendering
   */
  async getReportPageResponse() {
    const response = await this.page.goto('/jobs/report');
    return response;
  }

  /**
   * Verify forbidden status (403)
   */
  async verifyForbiddenStatus(response: any) {
    expect(response?.status()).toBe(403);
  }

  /**
   * Verify user is redirected to login page
   */
  async verifyRedirectedToLogin() {
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }

  /**
   * Verify login form is displayed
   */
  async verifyLoginFormDisplayed() {
    await expect(this.page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessageDisplayed() {
    await expect(this.page.getByText(/access forbidden|admin privileges required/i)).toBeVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage() {
    return await this.page.getByText(/access forbidden|admin privileges required/i).textContent();
  }
}
