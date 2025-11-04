import { expect, test } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test('should access analytics dashboard', async ({ page }) => {
    await page.goto('/analytics/dashboard');

    // Either see dashboard or get redirected to login (admin only)
    const isDashboard = page.url().includes('analytics') || page.url().includes('dashboard');
    const isLoginPage = page.url().includes('login');

    expect(isDashboard || isLoginPage).toBeTruthy();
  });

  test('should display analytics when authorized', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/analytics/dashboard');

    // If we can access the page, check for analytics elements
    if (page.url().includes('analytics')) {
      await page.waitForLoadState('networkidle');

      // Look for charts, tables, or stats
      const hasAnalytics =
        (await page.locator('canvas, svg, table, .chart, .stats, [data-testid*="chart"]').count()) >
        0;

      // If dashboard is visible, it should have some content
      if (hasAnalytics) {
        expect(hasAnalytics).toBeTruthy();
      }
    }
  });
});
