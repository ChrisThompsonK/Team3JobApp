import { type BrowserContext, expect, type Page } from '@playwright/test';
import { type TestUser, testUsers } from '../fixtures/data/test-data.js';

/**
 * Authentication Utilities
 *
 * Helper functions for handling authentication in tests
 */
export namespace AuthUtils {
  /**
   * Login via UI
   */
  export async function loginViaUI(page: Page, user: TestUser): Promise<void> {
    await page.goto('/auth/login');

    await page.fill('input[name="email"], input[type="email"]', user.email);
    await page.fill('input[name="password"], input[type="password"]', user.password);
    await page.click('button[type="submit"], input[type="submit"]');

    // Wait for successful login redirect
    await expect(page).not.toHaveURL(/login/, { timeout: 10000 });
  } /**
   * Login as admin user
   */
  export async function loginAsAdmin(page: Page): Promise<void> {
    await loginViaUI(page, testUsers.admin);
  }

  /**
   * Login as regular user
   */
  export async function loginAsUser(page: Page): Promise<void> {
    await loginViaUI(page, testUsers.user);
  }

  /**
   * Logout via UI
   */
  export async function logout(page: Page): Promise<void> {
    const logoutButton = page.locator(
      'button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]'
    );

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/login|home|\/$/, { timeout: 10000 });
    }
  }

  /**
   * Check if user is logged in
   */
  export async function isLoggedIn(page: Page): Promise<boolean> {
    try {
      const userMenu = page.locator('[data-testid="user-menu"], .user-menu, .profile-menu');
      const logoutButton = page.locator('text="Logout", text="Sign Out", [data-testid="logout"]');

      const hasUserMenu = await userMenu.isVisible({ timeout: 2000 });
      const hasLogoutButton = await logoutButton.isVisible({ timeout: 2000 });

      return hasUserMenu || hasLogoutButton;
    } catch {
      return false;
    }
  }

  /**
   * Clear authentication state
   */
  export async function clearAuth(context: BrowserContext): Promise<void> {
    await context.clearCookies();
    await context.clearPermissions();
  }
}

/**
 * Database Utilities
 *
 * Helper functions for database operations in tests
 */
export namespace DbUtils {
  /**
   * Clear test data from database
   */
  export async function clearTestData(): Promise<void> {
    // This would implement actual database cleanup
    // For now, it's a placeholder
    console.log('🧹 Clearing test data...');
  }

  /**
   * Seed test data
   */
  export async function seedTestData(): Promise<void> {
    // This would implement actual database seeding
    // For now, it's a placeholder
    console.log('🌱 Seeding test data...');
  }

  /**
   * Create test user in database
   */
  export async function createTestUser(user: TestUser): Promise<void> {
    // This would implement actual user creation
    console.log(`👤 Creating test user: ${user.email}`);
  }

  /**
   * Delete test user from database
   */
  export async function deleteTestUser(email: string): Promise<void> {
    // This would implement actual user deletion
    console.log(`🗑️ Deleting test user: ${email}`);
  }
}

/**
 * Wait Utilities
 *
 * Custom wait functions for common scenarios
 */
export namespace WaitUtils {
  /**
   * Wait for element to be visible and enabled
   */
  export async function waitForClickable(
    page: Page,
    selector: string,
    timeout: number = 10000
  ): Promise<void> {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    await element.waitFor({ state: 'attached', timeout });
    await expect(element).toBeEnabled({ timeout });
  }

  /**
   * Wait for form to be ready
   */
  export async function waitForForm(
    page: Page,
    formSelector: string = 'form',
    timeout: number = 10000
  ): Promise<void> {
    const form = page.locator(formSelector);
    await form.waitFor({ state: 'visible', timeout });

    // Wait for form inputs to be ready
    const inputs = form.locator('input, textarea, select');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      await inputs.first().waitFor({ state: 'visible', timeout });
    }
  }

  /**
   * Wait for page transition
   */
  export async function waitForPageTransition(
    page: Page,
    expectedUrl: string | RegExp,
    timeout: number = 15000
  ): Promise<void> {
    await page.waitForURL(expectedUrl, { timeout });
    await page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for API response
   */
  export async function waitForApiResponse(
    page: Page,
    urlPattern: string | RegExp,
    timeout: number = 10000
  ): Promise<void> {
    await page.waitForResponse(urlPattern, { timeout });
  }

  /**
   * Wait for loading to complete
   */
  export async function waitForLoadingComplete(page: Page, timeout: number = 10000): Promise<void> {
    // Wait for common loading indicators to disappear
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '[data-testid="loading"]',
      '.loader',
      '.progress',
    ];

    for (const selector of loadingSelectors) {
      try {
        const loader = page.locator(selector);
        if (await loader.isVisible({ timeout: 1000 })) {
          await loader.waitFor({ state: 'hidden', timeout });
        }
      } catch {
        // Loader not found or already hidden, continue
      }
    }
  }
}

/**
 * Screenshot Utilities
 *
 * Helper functions for taking screenshots during tests
 */
export namespace ScreenshotUtils {
  /**
   * Take a timestamped screenshot
   */
  export async function takeTimestampedScreenshot(page: Page, name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const path = `./test-results/screenshots/${filename}`;

    await page.screenshot({
      path,
      fullPage: true,
    });

    return path;
  }

  /**
   * Take screenshot on failure
   */
  export async function takeFailureScreenshot(page: Page, testName: string): Promise<void> {
    try {
      await takeTimestampedScreenshot(page, `failure-${testName}`);
      console.log(`📸 Failure screenshot taken for test: ${testName}`);
    } catch (error) {
      console.warn(`⚠️ Could not take failure screenshot: ${error}`);
    }
  }

  /**
   * Take element screenshot
   */
  export async function takeElementScreenshot(
    page: Page,
    selector: string,
    name: string
  ): Promise<void> {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible' });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `element-${name}-${timestamp}.png`;

    await element.screenshot({
      path: `./test-results/screenshots/${filename}`,
    });
  }
}

/**
 * Form Utilities
 *
 * Helper functions for form interactions
 */
export namespace FormUtils {
  /**
   * Fill form with data object
   */
  export async function fillForm(
    page: Page,
    data: Record<string, string>,
    formSelector: string = 'form'
  ): Promise<void> {
    const form = page.locator(formSelector);
    await form.waitFor({ state: 'visible' });

    for (const [fieldName, value] of Object.entries(data)) {
      const field = form.locator(`[name="${fieldName}"], #${fieldName}`);

      if (await field.isVisible()) {
        const tagName = await field.evaluate((el) => el.tagName.toLowerCase());

        if (tagName === 'select') {
          await field.selectOption(value);
        } else if (tagName === 'input' || tagName === 'textarea') {
          await field.fill(value);
        }
      }
    }
  }

  /**
   * Submit form and wait for response
   */
  export async function submitFormAndWait(
    page: Page,
    submitSelector: string = 'button[type="submit"]',
    expectedUrl?: string | RegExp
  ): Promise<void> {
    const submitButton = page.locator(submitSelector);
    await submitButton.click();

    if (expectedUrl) {
      await WaitUtils.waitForPageTransition(page, expectedUrl);
    } else {
      await page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Get form validation errors
   */
  export async function getFormErrors(
    page: Page,
    formSelector: string = 'form'
  ): Promise<string[]> {
    const form = page.locator(formSelector);
    const errorSelectors = [
      '.error',
      '.field-error',
      '.invalid-feedback',
      '[data-testid="error"]',
      '.help-text.error',
    ];

    const errors: string[] = [];

    for (const selector of errorSelectors) {
      const errorElements = form.locator(selector);
      const errorTexts = await errorElements.allTextContents();
      errors.push(...errorTexts.filter((text) => text.trim().length > 0));
    }

    return errors;
  }
}

/**
 * Browser Utilities
 *
 * Helper functions for browser operations
 */
export namespace BrowserUtils {
  /**
   * Clear browser storage
   */
  export async function clearStorage(page: Page): Promise<void> {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.context().clearCookies();
  }

  /**
   * Set viewport size
   */
  export async function setViewport(page: Page, width: number, height: number): Promise<void> {
    await page.setViewportSize({ width, height });
  }

  /**
   * Simulate slow network
   */
  export async function simulateSlowNetwork(page: Page): Promise<void> {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (200 * 1024) / 8, // 200kb/s
      uploadThroughput: (200 * 1024) / 8,
      latency: 100,
    });
  }

  /**
   * Reset network conditions
   */
  export async function resetNetworkConditions(page: Page): Promise<void> {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  }
}
