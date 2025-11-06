import { expect, test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

/**
 * User Login Tests using Page Object Model
 */

test.describe('User Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('should login successfully', async () => {
    await loginPage.loginAsRegularUser();

    // Verify redirect away from login page
    await loginPage.isNotOnLoginPage();
  });

  test('should login as admin successfully', async () => {
    await loginPage.loginAsAdmin();

    // Verify redirect away from login page
    await loginPage.isNotOnLoginPage();
  });
});
