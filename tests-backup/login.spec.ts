import { expect, test } from '@playwright/test';

test.describe('User Login', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/');

    // Click login button/link
    await page.getByRole('link', { name: 'Sign In' }).click();

    // Fill in login form
    await page.fill('input[name="email"]', 'example@example.com');
    await page.fill('input[name="password"]', 'qqqqqqqq');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirect away from login page
    await expect(page).not.toHaveURL(/\/auth\/login/);
  });
});
