import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * Home Page Object Model
 *
 * Handles interactions with the home/dashboard page
 */
export class HomePage extends BasePage {
  // Page elements
  private get jobListingsLink(): Locator {
    return this.page.locator(
      'a[href*="job"], text="Job Roles", text="Jobs", [data-testid="jobs-link"]'
    );
  }

  private get myApplicationsLink(): Locator {
    return this.page.locator(
      'a[href*="application"], text="My Applications", [data-testid="applications-link"]'
    );
  }

  private get profileLink(): Locator {
    return this.page.locator('a[href*="profile"], text="Profile", [data-testid="profile-link"]');
  }

  private get navigationMenu(): Locator {
    return this.page.locator('nav, .navbar, .navigation, [data-testid="navigation"]');
  }

  /**
   * Navigate to home page
   */
  async goto(): Promise<void> {
    await super.goto('/');
  }

  /**
   * Verify the home page has loaded correctly
   */
  async verifyPageLoaded(): Promise<void> {
    // Check for main page elements
    await expect(this.navigationMenu).toBeVisible();

    // Check page title
    await expect(this.page).toHaveTitle(/kainos|job portal|home|dashboard/i);

    // Note: Home page doesn't require authentication, so we don't check for it here
  }

  /**
   * Navigate to job listings
   */
  async goToJobListings(): Promise<void> {
    await this.jobListingsLink.click();
    await expect(this.page).toHaveURL(/job/);
  }

  /**
   * Navigate to my applications
   */
  async goToMyApplications(): Promise<void> {
    if (await this.myApplicationsLink.isVisible()) {
      await this.myApplicationsLink.click();
      await expect(this.page).toHaveURL(/application/);
    }
  }

  /**
   * Navigate to profile
   */
  async goToProfile(): Promise<void> {
    await this.profileLink.click();
    await expect(this.page).toHaveURL(/profile/);
  }

  /**
   * Perform logout
   */
  async performLogout(): Promise<void> {
    // Logout is done via POST request to /auth/logout
    await this.logout();
  }

  /**
   * Verify navigation menu items
   */
  async verifyNavigationItems(): Promise<string[]> {
    const navItems = await this.navigationMenu.locator('a, button').allTextContents();
    return navItems.filter((item) => item.trim().length > 0);
  }

  /**
   * Check if user has admin privileges (admin-specific elements visible)
   */
  async isAdminUser(): Promise<boolean> {
    const adminElements = this.page.locator(
      'text="Admin", text="Dashboard", [data-testid="admin"], .admin-only'
    );

    try {
      return await adminElements.first().isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }
}
