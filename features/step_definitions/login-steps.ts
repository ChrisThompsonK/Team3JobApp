import { Given, When, Then, Before, After, DataTable } from '@cucumber/cucumber';
import { Page, Browser, BrowserContext, expect } from '@playwright/test';
import { chromium } from '@playwright/test';

interface LoginWorld {
  browser: Browser | null;
  context: BrowserContext | null;
  page: Page | null;
  baseURL: string;
  timestamp: number;
  testEmail: string;
  testPassword: string;
}

// Initialize World context
let loginWorld: LoginWorld = {
  browser: null,
  context: null,
  page: null,
  baseURL: 'http://localhost:3000',
  timestamp: Date.now(),
  testEmail: '',
  testPassword: '',
};

Before(async function () {
  loginWorld.browser = await chromium.launch();
  loginWorld.context = await loginWorld.browser.newContext();
  loginWorld.page = await loginWorld.context.newPage();
  loginWorld.timestamp = Date.now();
});

After(async function () {
  if (loginWorld.page) {
    await loginWorld.page.close();
  }
  if (loginWorld.context) {
    await loginWorld.context.close();
  }
  if (loginWorld.browser) {
    await loginWorld.browser.close();
  }
});

// ==================== GIVEN STEPS ====================

Given('I am on the register page', async function () {
  if (!loginWorld.page) throw new Error('Page not initialized');
  await loginWorld.page.goto(`${loginWorld.baseURL}/auth/register`, { waitUntil: 'networkidle' });
});

Given('I am on the login page', async function () {
  if (!loginWorld.page) throw new Error('Page not initialized');
  await loginWorld.page.goto(`${loginWorld.baseURL}/auth/login`, { waitUntil: 'networkidle' });
});

Given('I am logged in as {string} with password {string}', async function (email: string, password: string) {
  if (!loginWorld.page) throw new Error('Page not initialized');
  
  loginWorld.testEmail = email;
  loginWorld.testPassword = password;
  
  // Navigate to login page
  await loginWorld.page.goto(`${loginWorld.baseURL}/auth/login`, { waitUntil: 'networkidle' });
  
  // Fill in login form
  await loginWorld.page.fill('input[name="email"]', email, { timeout: 10000 });
  await loginWorld.page.fill('input[name="password"]', password, { timeout: 10000 });
  
  // Click submit button
  await loginWorld.page.click('button[type="submit"]', { timeout: 10000 });
  
  // Wait for redirect to home page
  await loginWorld.page.waitForURL(`${loginWorld.baseURL}/`, { timeout: 10000 });
});

// ==================== WHEN STEPS ====================

When('I fill in the registration form with:', async function (dataTable: DataTable) {
  if (!loginWorld.page) throw new Error('Page not initialized');
  
  const data = dataTable.rowsHash();
  
  for (const [field, value] of Object.entries(data)) {
    await loginWorld.page.fill(`input[name="${field}"]`, value as string, { timeout: 10000 });
    if (field === 'email') {
      loginWorld.testEmail = value as string;
    }
    if (field === 'password') {
      loginWorld.testPassword = value as string;
    }
  }
});

When('I click the register button', async function () {
  if (!loginWorld.page) throw new Error('Page not initialized');
  
  await loginWorld.page.click('button[type="submit"]', { timeout: 10000 });
});

When('I fill in the login form with:', async function (dataTable: DataTable) {
  if (!loginWorld.page) throw new Error('Page not initialized');
  
  const data = dataTable.rowsHash();
  
  for (const [field, value] of Object.entries(data)) {
    await loginWorld.page.fill(`input[name="${field}"]`, value as string, { timeout: 10000 });
  }
});

When('I click the login button', async function () {
  if (!loginWorld.page) throw new Error('Page not initialized');
  
  await loginWorld.page.click('button[type="submit"]', { timeout: 10000 });
});

When('I click the logout button', async function () {
  if (!loginWorld.page) throw new Error('Page not initialized');
  
  // Look for logout button (may be in a dropdown menu)
  const logoutButton = loginWorld.page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout-btn"]').first();
  await logoutButton.click({ timeout: 10000 });
});

// ==================== THEN STEPS ====================

Then('I should be logged in', async function () {
  if (!loginWorld.page) throw new Error('Page not initialized');
  
  // Check for user menu or logged in indicator
  const userMenu = loginWorld.page.locator('[data-testid="user-menu"], .user-profile, .user-menu').first();
  await expect(userMenu).toBeVisible({ timeout: 10000 });
});

Then('I should be redirected to the home page', async function () {
  if (!loginWorld.page) throw new Error('Page not initialized');
  
  await expect(loginWorld.page).toHaveURL(loginWorld.baseURL, { timeout: 10000 });
});

Then('I should be logged out', async function () {
  if (!loginWorld.page) throw new Error('Page not initialized');
  
  // Check that user menu is not visible
  const userMenu = loginWorld.page.locator('[data-testid="user-menu"]');
  const isVisible = await userMenu.isVisible().catch(() => false);
  expect(isVisible).toBe(false);
});

Then('I should see an error message about invalid credentials', async function () {
  if (!loginWorld.page) throw new Error('Page not initialized');
  
  const errorMessage = loginWorld.page.locator('[role="alert"], .alert-error, .error').first();
  await expect(errorMessage).toBeVisible({ timeout: 10000 });
});

Then('I should remain on the login page', async function () {
  if (!loginWorld.page) throw new Error('Page not initialized');
  
  await expect(loginWorld.page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
});
