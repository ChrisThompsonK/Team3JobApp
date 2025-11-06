import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * Job Listings Page Object Model
 *
 * Handles interactions with the job listings/roles page
 */
export class JobListingsPage extends BasePage {
  // Page elements
  private get pageTitle(): Locator {
    return this.page.locator('[data-testid="job-listings"], .job-listings, main');
  }

  private get jobCards(): Locator {
    return this.page.locator('tbody tr.hover'); // Jobs are rendered as table rows
  }

  private get searchInput(): Locator {
    return this.page.locator(
      'input[type="search"], input[placeholder*="search"], [data-testid="search"]'
    );
  }

  private get noJobsMessage(): Locator {
    return this.page.locator('.no-jobs, .empty-state, [data-testid="no-jobs"], .alert-info');
  }

  /**
   * Navigate to job listings page
   */
  async goto(): Promise<void> {
    await super.goto('/jobs');
  }

  /**
   * Verify the job listings page has loaded correctly
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageTitle).toContainText(/job|role/i);

    // Either jobs are present or no jobs message is shown
    const hasJobs = await this.jobCards.first().isVisible({ timeout: 5000 });
    const hasNoJobsMessage = await this.noJobsMessage.isVisible({ timeout: 1000 });

    expect(hasJobs || hasNoJobsMessage).toBe(true);
  }

  /**
   * Get number of job cards displayed
   */
  async getJobCount(): Promise<number> {
    return await this.jobCards.count();
  }

  /**
   * Click on a specific job card by index
   */
  async clickJobCard(index: number = 0): Promise<void> {
    const jobRow = this.jobCards.nth(index);
    await expect(jobRow).toBeVisible();

    // Click on the "View Details" link within the table row
    const viewDetailsLink = jobRow.locator('a[href*="details"]');
    await expect(viewDetailsLink).toBeVisible();
    await viewDetailsLink.click();

    // Wait for navigation to job detail page
    await expect(this.page).toHaveURL(/\/jobs\/\d+\/details/);
  }

  /**
   * Search for jobs
   */
  async searchJobs(searchTerm: string): Promise<void> {
    if (await this.searchInput.isVisible()) {
      await this.searchInput.fill(searchTerm);
      await this.searchInput.press('Enter');

      // Wait for page to reload with search results
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForLoadState('domcontentloaded');

      // Wait for job listings to be visible again
      await expect(this.jobCards.first()).toBeVisible({ timeout: 10000 });
    }
  }
}
