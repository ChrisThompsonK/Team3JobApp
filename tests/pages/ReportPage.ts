import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Report Page Object Model
 * Encapsulates all interactions and validations for the report feature
 */
export class ReportPage extends BasePage {
  /**
   * Navigate to report page
   */
  async navigateToReportPage() {
    await this.goto('/jobs/report');
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
   * Get response status when accessing report
   */
  async getReportPageResponse() {
    const response = await this.page.goto('/jobs/report');
    return response?.status();
  }

  /**
   * Verify 403 Forbidden status
   */
  async verifyForbiddenStatus(response: number | undefined) {
    expect(response).toBe(403);
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
