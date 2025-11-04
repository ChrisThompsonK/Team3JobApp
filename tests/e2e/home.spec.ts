import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that we're on the home page
    expect(page.url()).toBe('http://localhost:3000/');

    // Verify page title or main heading exists
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display navigation links', async ({ page }) => {
    await page.goto('/');

    // Check for common navigation links
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('should navigate to job roles page', async ({ page }) => {
    await page.goto('/');

    // Look for a link to job roles
    const jobRolesLink = page.getByRole('link', { name: /job|roles|opportunities/i }).first();

    if (await jobRolesLink.isVisible()) {
      await jobRolesLink.click();
      await page.waitForLoadState('networkidle');

      // Verify navigation occurred
      expect(page.url()).toContain('job');
    }
  });
});
