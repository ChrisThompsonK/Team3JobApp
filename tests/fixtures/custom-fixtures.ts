import { test as base, expect, type Page } from '@playwright/test';
import { type TestUser, testUsers } from '../fixtures/data/test-data.js';
import { HomePage, JobListingsPage, LoginPage } from '../pages/index.js';
import { AuthUtils, DbUtils } from '../utils/test-helpers.js';

/**
 * Custom Test Fixtures for Kainos Job Portal
 *
 * Extends Playwright's base test with custom fixtures for pages, authentication, and utilities
 */

// Define fixture types
type CustomFixtures = {
  // Page Object Models
  loginPage: LoginPage;
  homePage: HomePage;
  jobListingsPage: JobListingsPage;

  // Authentication fixtures
  authenticatedPage: Page;
  adminPage: Page;
  userPage: Page;

  // Utility fixtures
  testUser: TestUser;
  adminUser: TestUser;

  // Database fixtures
  cleanDatabase: undefined;
};

/**
 * Extended test with custom fixtures
 */
export const test = base.extend<CustomFixtures>({
  /**
   * Login Page fixture
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  /**
   * Home Page fixture
   */
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  /**
   * Job Listings Page fixture
   */
  jobListingsPage: async ({ page }, use) => {
    const jobListingsPage = new JobListingsPage(page);
    await use(jobListingsPage);
  },

  /**
   * Authenticated page fixture (logs in as default user)
   */
  authenticatedPage: async ({ page }, use) => {
    await AuthUtils.loginAsUser(page);
    await use(page);
    // Cleanup after test
    await AuthUtils.logout(page);
  },

  /**
   * Admin authenticated page fixture
   */
  adminPage: async ({ page }, use) => {
    await AuthUtils.loginAsAdmin(page);
    await use(page);
    // Cleanup after test
    await AuthUtils.logout(page);
  },

  /**
   * User authenticated page fixture
   */
  userPage: async ({ page }, use) => {
    await AuthUtils.loginAsUser(page);
    await use(page);
    // Cleanup after test
    await AuthUtils.logout(page);
  },

  /**
   * Test user fixture
   */
  testUser: async (_fixtures, use) => {
    await use(testUsers.user);
  },

  /**
   * Admin user fixture
   */
  adminUser: async (_fixtures, use) => {
    await use(testUsers.admin);
  },

  /**
   * Clean database fixture - ensures clean state before each test
   */
  cleanDatabase: async (_fixtures, use) => {
    await DbUtils.clearTestData();
    await DbUtils.seedTestData();
    await use(undefined);
    // Cleanup after test
    await DbUtils.clearTestData();
  },
});

/**
 * Custom expect with additional matchers
 */
export { expect } from '@playwright/test';

/**
 * Test groups for better organization
 */
export const testGroups = {
  /**
   * Authentication tests
   */
  auth: test.extend({
    // Override to ensure we start with clean auth state
    page: async ({ context }, use) => {
      const page = await context.newPage();
      await AuthUtils.clearAuth(context);
      await use(page);
    },
  }),

  /**
   * Admin-only tests
   */
  admin: test.extend({
    page: async ({ context }, use) => {
      const page = await context.newPage();
      await AuthUtils.loginAsAdmin(page);
      await use(page);
    },
  }),

  /**
   * User tests (regular authenticated user)
   */
  user: test.extend({
    page: async ({ context }, use) => {
      const page = await context.newPage();
      await AuthUtils.loginAsUser(page);
      await use(page);
    },
  }),

  /**
   * Anonymous/public tests
   */
  anonymous: test.extend({
    page: async ({ context }, use) => {
      const page = await context.newPage();
      await AuthUtils.clearAuth(context);
      await use(page);
    },
  }),
};

/**
 * Utility function to create custom test suite with specific fixtures
 */
export function createTestSuite(name: string, fixtures?: Partial<CustomFixtures>) {
  return {
    name,
    test: fixtures ? test.extend(fixtures) : test,
  };
}

/**
 * Test configuration helpers
 */
export const testConfig = {
  /**
   * Check if running in production
   */
  isProduction: () => process.env.NODE_ENV === 'production',

  /**
   * Get current browser name
   */
  getBrowserName: () => process.env.BROWSER_NAME || 'chromium',

  /**
   * Check if test should be skipped in current environment
   */
  shouldSkipInProduction: () => process.env.NODE_ENV === 'production',
};

/**
 * Test data setup helpers
 */
export const testSetup = {
  /**
   * Setup test with specific user
   */
  withUser: async (page: Page, userType: 'admin' | 'user' = 'user') => {
    if (userType === 'admin') {
      await AuthUtils.loginAsAdmin(page);
    } else {
      await AuthUtils.loginAsUser(page);
    }
  },

  /**
   * Setup test with clean database
   */
  withCleanDb: async () => {
    await DbUtils.clearTestData();
    await DbUtils.seedTestData();
  },

  /**
   * Setup test with specific viewport
   */
  withViewport: async (page: Page, width: number = 1280, height: number = 720) => {
    await page.setViewportSize({ width, height });
  },
};

/**
 * Custom assertions for the job portal
 */
export const customAssertions = {
  /**
   * Assert user is logged in
   */
  async expectLoggedIn(page: Page) {
    const isLoggedIn = await AuthUtils.isLoggedIn(page);
    expect(isLoggedIn).toBe(true);
  },

  /**
   * Assert user is logged out
   */
  async expectLoggedOut(page: Page) {
    const isLoggedIn = await AuthUtils.isLoggedIn(page);
    expect(isLoggedIn).toBe(false);
  },

  /**
   * Assert page has Kainos branding
   */
  async expectKainosBranding(page: Page) {
    // Check for Kainos-specific elements
    const hasKainosLogo = await page
      .locator('.kainos-logo, [alt*="Kainos"], [src*="kainos"]')
      .isVisible();
    const hasKainosColors = await page.locator('[class*="kainos"], .kainos-gradient').isVisible();

    expect(hasKainosLogo || hasKainosColors).toBe(true);
  },

  /**
   * Assert form has validation errors
   */
  async expectFormErrors(page: Page, expectedErrorCount?: number) {
    const errorElements = page.locator(
      '.error, .field-error, .invalid-feedback, [data-testid="error"]'
    );

    if (expectedErrorCount !== undefined) {
      await expect(errorElements).toHaveCount(expectedErrorCount);
    } else {
      await expect(errorElements.first()).toBeVisible();
    }
  },
};
