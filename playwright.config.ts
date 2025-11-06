import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Kainos Job Portal E2E Test Configuration
 *
 * This configuration sets up comprehensive end-to-end testing for the Kainos Job Portal
 * with proper test environments, data management, and reporting.
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Test output and artifacts */
  outputDir: './test-results',

  /* Global test timeout */
  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,

  /* Workers configuration */
  workers: process.env.CI ? 2 : 4, // Increased for better parallelism

  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],

  /* Global test setup and teardown */
  // globalSetup: './tests/config/global-setup.ts',
  // globalTeardown: './tests/config/global-teardown.ts',

  /* Shared settings for all projects */
  use: {
    /* Base URL for the application */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Browser context options */
    viewport: { width: 1280, height: 720 },

    /* Collect artifacts on failure for debugging */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Ignore HTTPS errors for local development */
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for different browsers and test types */
  projects: [
    // Setup project for database preparation
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup',
    },

    // Cleanup project
    {
      name: 'cleanup',
      testMatch: /.*\.teardown\.ts/,
    },

    // Main test suite - Chromium only
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './tests/fixtures/auth/admin-storage-state.json',
      },
      dependencies: ['setup'],
      testIgnore: ['**/examples.spec.ts'], // Ignore framework examples
    },
  ],

  /* Start local dev server before running the tests */
  webServer: {
    command:
      'JWT_ACCESS_SECRET=dev-access-secret-replace-in-production-with-secure-random-string-abcdef123456 JWT_REFRESH_SECRET=dev-refresh-secret-replace-in-production-with-different-secure-string-xyz789 PASSWORD_HASH_ROUNDS=12 DATABASE_URL=./jobs.db node --import tsx/esm src/index.ts',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
      PORT: '3000',
    },
  },
});
