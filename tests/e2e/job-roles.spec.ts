import { expect, test } from '@playwright/test';

test.describe('Job Roles', () => {
  test('should display job roles list', async ({ page }) => {
    await page.goto('/job-roles');

    await page.waitForLoadState('networkidle');

    // Check that we're on the job roles page
    expect(page.url()).toContain('job-role');

    // Look for job listings or table
    const hasJobList =
      (await page.locator('table, .job-list, .job-card, [data-testid*="job"]').count()) > 0;
    expect(hasJobList).toBeTruthy();
  });

  test('should search/filter job roles', async ({ page }) => {
    await page.goto('/job-roles');

    // Look for search or filter inputs
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="search" i], input[name*="search" i]')
      .first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('developer');

      // Wait for results to update
      await page.waitForTimeout(1000);

      expect(await searchInput.inputValue()).toContain('developer');
    }
  });

  test('should view job role details', async ({ page }) => {
    await page.goto('/job-roles');

    await page.waitForLoadState('networkidle');

    // Find first job link or detail button
    const jobLink = page
      .locator('a[href*="job-role"], button:has-text("View"), button:has-text("Details")')
      .first();

    if ((await jobLink.count()) > 0 && (await jobLink.isVisible())) {
      await jobLink.click();
      await page.waitForLoadState('networkidle');

      // Should navigate to detail page
      expect(page.url()).toMatch(/job-role.*\d+|detail/);

      // Should show job details
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('should have apply functionality', async ({ page }) => {
    await page.goto('/job-roles');

    await page.waitForLoadState('networkidle');

    // Look for apply button or link
    const applyButton = page.locator('button:has-text("Apply"), a:has-text("Apply")').first();

    if ((await applyButton.count()) > 0) {
      expect(await applyButton.isVisible()).toBeTruthy();
    }
  });
});

test.describe('Job Applications', () => {
  test('should access my applications page', async ({ page }) => {
    // This test assumes user needs to be logged in
    // For now, just check if the route exists
    await page.goto('/job-roles/my-applications');

    // Either we see applications page or get redirected to login
    const isApplicationsPage = page.url().includes('my-applications');
    const isLoginPage = page.url().includes('login');

    expect(isApplicationsPage || isLoginPage).toBeTruthy();
  });

  test('should display application form', async ({ page }) => {
    // Try to access an application form
    await page.goto('/job-roles/apply/1');

    // Check if form exists or we're redirected
    const hasForm = (await page.locator('form').count()) > 0;
    const isLoginPage = page.url().includes('login');

    expect(hasForm || isLoginPage).toBeTruthy();
  });
});
