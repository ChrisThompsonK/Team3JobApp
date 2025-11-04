import { expect, test } from '@playwright/test';

test.describe('Job Application Portal - Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Kainos Job Portal/i);
  });

  test('should display main navigation', async ({ page }) => {
    await page.goto('/');

    // Check for common navigation elements
    // Adjust these selectors based on your actual page structure
    await expect(page.locator('nav')).toBeVisible();
  });
});
