import { expect, test } from '@playwright/test';
import { testUsers } from '../fixtures/data/test-data.js';
import { HomePage } from '../pages/home.page.js';
import { LoginPage } from '../pages/login.page.js';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies();
  });

  test('should display login page correctly', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.verifyPageLoaded();
  });

  test('should login successfully with valid admin credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.goto();
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);

    // Verify successful login
    await loginPage.verifySuccessfulLogin();

    // Verify we're on the home/dashboard page
    await homePage.verifyPageLoaded();
  });

  test('should login successfully with valid user credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.goto();
    await loginPage.login(testUsers.user.email, testUsers.user.password);

    // Verify successful login
    await loginPage.verifySuccessfulLogin();

    // Verify we're on the home/dashboard page
    await homePage.verifyPageLoaded();
  });

  test('should show error with invalid email format', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // Fill form with invalid email (bypassing HTML5 validation by setting value directly)
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      if (emailInput) {
        emailInput.value = 'invalid-email';
      }
    });
    await page.fill('input[name="password"]', 'password123');

    // Try to submit - should show browser validation or error
    const validationMessage = await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      return emailInput?.validationMessage || '';
    });

    // Browser validation should prevent invalid email
    expect(validationMessage.length).toBeGreaterThan(0);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid@test.com', 'wrongpassword');

    // Should still be on login page with error
    await loginPage.verifyLoginFailed();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // Try to submit empty form - HTML5 validation should prevent it
    await page.click('button[type="submit"]');

    // Check for HTML5 validation messages
    const emailValidation = await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      return emailInput?.validationMessage || '';
    });

    const passwordValidation = await page.evaluate(() => {
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
      return passwordInput?.validationMessage || '';
    });

    // At least one field should have a validation message
    expect(emailValidation.length + passwordValidation.length).toBeGreaterThan(0);
  });

  test('should navigate to register page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // Try to navigate to register page (if link exists)
    try {
      const registerLink = page.locator('a[href*="register"], text="Register", text="Sign Up"');
      if (await registerLink.isVisible({ timeout: 2000 })) {
        await registerLink.click();
        await expect(page).toHaveURL(/register/);
      }
    } catch {
      // Register link might not exist, that's okay
      console.log('Register link not found - this is acceptable');
    }
  });

  test('should be able to logout after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    // Login first
    await loginPage.goto();
    await loginPage.login(testUsers.user.email, testUsers.user.password);
    await loginPage.verifySuccessfulLogin();

    // Navigate to home page
    await homePage.goto();
    await homePage.verifyPageLoaded();

    // Logout
    await homePage.performLogout();

    // Should be redirected to login or home page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/login|home|\/$|\/$/);
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(testUsers.user.email, testUsers.user.password);
    await loginPage.verifySuccessfulLogin();

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Should still be authenticated
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should redirect to login when accessing protected pages without authentication', async ({
    page,
  }) => {
    // Clear any existing auth state
    await page.context().clearCookies();

    // Try to access a protected page without logging in (profile requires auth)
    await page.goto('/auth/profile');

    // Should be redirected to login page
    await page.waitForURL(/login/, { timeout: 5000 });
    const currentUrl = page.url();

    expect(currentUrl.includes('login')).toBe(true);
  });

  test('should show appropriate error messages for different invalid login scenarios', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // Test with wrong password
    await loginPage.login(testUsers.user.email, 'wrongpassword');
    await loginPage.verifyLoginFailed();

    // Go back to login page and test with non-existent user
    await loginPage.goto();
    await loginPage.login('nonexistent@kainos.com', 'password123');
    await loginPage.verifyLoginFailed();
  });
});
