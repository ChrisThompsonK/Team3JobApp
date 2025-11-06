import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Job Listings Page Object Model
 * Encapsulates all interactions with the job listings page
 */
export class JobListingsPage extends BasePage {
  // Selectors
  private readonly reportButton = '[role="link"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to job listings page
   */
  async navigateToJobListings() {
    await this.goto('/jobs');
  }

  /**
   * Get the report button
   */
  getReportButton() {
    return this.page.getByRole('link', { name: /report/i });
  }

  /**
   * Check if report button is visible
   */
  async isReportButtonVisible() {
    return await this.getReportButton().isVisible();
  }

  /**
   * Verify report button has correct href
   */
  async verifyReportButtonHref() {
    await expect(this.getReportButton()).toHaveAttribute('href', '/jobs/report');
  }

  /**
   * Verify report button has correct styling class
   */
  async verifyReportButtonStyling() {
    await expect(this.getReportButton()).toHaveClass(/btn-kainos/);
  }

  /**
   * Click the report button and wait for download
   */
  async clickReportButtonAndWaitForDownload() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.getReportButton().click(),
    ]);
    return download;
  }

  /**
   * Verify report button is not visible
   */
  async verifyReportButtonNotVisible() {
    const reportButton = this.getReportButton();
    await expect(reportButton).not.toBeVisible();
  }

  /**
   * Get job role count from page (count visible job listings)
   */
  async getJobRoleCount() {
    const jobListings = await this.page.locator('[data-testid="job-listing"]').count();
    return jobListings;
  }
}
