import { expect, test } from '@playwright/test';
import { HomePage } from '../pages/index.js';

test.describe('Quick Start', () => {
  test('should load the home page successfully', async ({ page }) => {
    // Initialize the HomePage object
    const homePage = new HomePage(page);

    // Navigate to the application
    await homePage.goto();

    // Verify page title (basic check for any visitor)
    await expect(page).toHaveTitle(/Kainos.*Job.*Portal|Home/i);

    // Verify navigation items are available (works for both auth and non-auth users)
    const navItems = await homePage.verifyNavigationItems();
    expect(navItems.length).toBeGreaterThan(0);

    // Verify that the page has basic content visible
    await expect(page.locator('body')).toBeVisible();
  });
});
