import { expect, test } from '@playwright/test';
import { AuthUtils, DbUtils } from '../utils/test-helpers.js';

test.describe('Setup Tests', () => {
  test('global.setup', async ({ page }) => {
    console.log('🚀 Running global setup...');

    // Initialize test database
    await DbUtils.seedTestData();

    // Test that the application is running
    await page.goto('/');
    await expect(page).toHaveTitle(/kainos|job portal|job|portal/i);

    // Test admin login and save state
    try {
      await AuthUtils.loginAsAdmin(page);
      await page.context().storageState({ path: './tests/fixtures/auth/admin-storage-state.json' });
      console.log('✅ Admin authentication state saved');
    } catch (error) {
      console.warn('⚠️ Could not save admin state:', error);
    }

    // Test user login and save state
    await page.context().clearCookies();
    try {
      await AuthUtils.loginAsUser(page);
      await page.context().storageState({ path: './tests/fixtures/auth/user-storage-state.json' });
      console.log('✅ User authentication state saved');
    } catch (error) {
      console.warn('⚠️ Could not save user state:', error);
    }

    console.log('✅ Global setup completed');
  });
});
