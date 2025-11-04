import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Extended test fixtures for authentication
 */
type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
};

/**
 * Custom fixtures for authenticated users
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Fixture for a regular authenticated user
   */
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Fill in credentials (adjust selectors based on your form)
    await page.getByLabel(/email|username/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit login form
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
    
    // Use the authenticated page
    await use(page);
    
    // Cleanup: logout after test
    const logoutLink = page.getByRole('link', { name: /logout|sign out/i });
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    
    if (await logoutLink.count() > 0) {
      await logoutLink.click();
    } else if (await logoutButton.count() > 0) {
      await logoutButton.click();
    }
  },

  /**
   * Fixture for an admin user
   */
  adminPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Fill in admin credentials
    await page.getByLabel(/email|username/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('admin123');
    
    // Submit login form
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
    
    // Use the authenticated admin page
    await use(page);
    
    // Cleanup: logout after test
    const logoutLink = page.getByRole('link', { name: /logout|sign out/i });
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    
    if (await logoutLink.count() > 0) {
      await logoutLink.click();
    } else if (await logoutButton.count() > 0) {
      await logoutButton.click();
    }
  },
});

export { expect };
