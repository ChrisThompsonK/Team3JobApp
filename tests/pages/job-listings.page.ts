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
    return this.page.locator('[data-testid="job-card"], .job-card');
  }

  private get searchInput(): Locator {
    return this.page.locator(
      'input[type="search"], input[placeholder*="search"], [data-testid="search"]'
    );
  }

  private get noJobsMessage(): Locator {
    return this.page.locator('.no-jobs, .empty-state, [data-testid="no-jobs"]');
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
    const jobCard = this.jobCards.nth(index);
    await expect(jobCard).toBeVisible();
    await jobCard.click();

    // Wait for navigation to job detail page
    await expect(this.page).toHaveURL(/job.*detail|job\/\d+/);
  }

  /**
   * Search for jobs
   */
  async searchJobs(searchTerm: string): Promise<void> {
    if (await this.searchInput.isVisible()) {
      await this.searchInput.fill(searchTerm);
      await this.searchInput.press('Enter');
      await this.waitForNetworkIdle();
    }
  }
}
