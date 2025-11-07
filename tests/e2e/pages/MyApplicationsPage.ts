import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * My Applications Page Object Model
 * Encapsulates all interactions and validations for the My Applications feature
 */
export class MyApplicationsPage extends BasePage {
  /**
   * Navigate to My Applications page by clicking the button
   */
  async navigateToMyApplicationsPage() {
    await this.clickMyApplicationsButton();
  }

  /**
   * Navigate to My Applications page by clicking the button
   */
  async clickMyApplicationsButton() {
    await this.page.getByRole('link', { name: /my applications/i }).click();
  }

  /**
   * Navigate to My Applications page by clicking the button
   */
  async clickBackToHomeButton() {
    await this.page.getByRole('link', { name: /back to home/i }).click();
  }

  /**
   * Navigate to main menu by clicking Kainos logo
   */
  async clickKainosLogo() {
    await this.page.getByRole('img', { name: /kainos/i }).click();
  }

  /**
   * Navigate to job details by clicking the view job button for a specific application
   */
  async clickViewJobButton(jobTitle?: string) {
    // If a specific job title is provided, find that application first
    if (jobTitle) {
      await this.page
        .locator('div')
        .filter({ has: this.page.getByRole('link', { name: new RegExp(jobTitle, 'i') }) })
        .getByRole('link', { name: /view job/i })
        .first()
        .click();
    } else {
      // Otherwise, click the first View Job link
      await this.page
        .getByRole('link', { name: /view job/i })
        .first()
        .click();
    }
  }

  /**
   * Verify job details are displayed for a specific job
   */
  async verifyJobDetailsDisplayed(jobTitle: string) {
    await expect(this.page.getByRole('heading', { name: new RegExp(jobTitle, 'i') })).toBeVisible();
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
}
