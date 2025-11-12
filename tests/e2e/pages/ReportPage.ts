import { expect } from '@playwright/test';
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
   * Verify user is redirected to login page (UI assertion)
   */
  async verifyRedirectedToLogin() {
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }

  /**
   * Verify login form is displayed (UI assertion)
   */
  async verifyLoginFormDisplayed() {
    await expect(this.page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  }

  /**
   * Verify access is forbidden - check for error page or message
   */
  async verifyAccessForbidden() {
    // Check that either the login form is shown OR an error message appears
    const loginHeading = this.page.getByRole('heading', { name: /sign in/i });
    const errorMessage = this.page.getByText(
      /access forbidden|admin privileges required|unauthorized/i
    );

    const headingVisible = await loginHeading.isVisible().catch(() => false);
    const errorVisible = await errorMessage.isVisible().catch(() => false);

    expect(headingVisible || errorVisible).toBe(true);
  }

  /**
   * Verify error message is displayed (UI assertion)
   */
  async verifyErrorMessageDisplayed() {
    await expect(
      this.page.getByText(/access forbidden|admin privileges required|unauthorized/i)
    ).toBeVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage() {
    return await this.page
      .getByText(/access forbidden|admin privileges required|unauthorized/i)
      .textContent();
  }

  /**
   * Verify report page is loaded and visible (UI assertion)
   */
  async verifyReportPageLoaded() {
    // Check for report button or report content
    const reportButton = this.page.getByRole('button', { name: /report|download/i });
    const reportHeading = this.page.getByRole('heading', { name: /report|job.*report/i });

    const buttonVisible = await reportButton.isVisible().catch(() => false);
    const headingVisible = await reportHeading.isVisible().catch(() => false);

    expect(buttonVisible || headingVisible).toBe(true);
  }

  /**
   * Verify report button is visible (UI assertion)
   */
  async verifyReportButtonVisible() {
    await expect(this.page.getByRole('button', { name: /report|download/i })).toBeVisible();
  }

  /**
   * Verify report button is NOT visible (UI assertion)
   */
  async verifyReportButtonNotVisible() {
    await expect(this.page.getByRole('button', { name: /report|download/i })).not.toBeVisible();
  }
}
