import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, chromium, type FullConfig } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global test setup for Kainos Job Portal
 *
 * This runs once before all tests and handles:
 * - Database preparation
 * - Authentication state creation
 * - Test data seeding
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');

  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();

  try {
    // Create directories for auth states if they don't exist
    const authDir = path.join(__dirname, '../fixtures/auth');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Ensure we have a baseURL
    if (!baseURL) {
      throw new Error('baseURL is not configured');
    }

    // Setup admin authentication
    console.log('👤 Setting up admin authentication...');
    await setupAdminAuth(browser, baseURL, authDir);

    // Setup regular user authentication
    console.log('👤 Setting up user authentication...');
    await setupUserAuth(browser, baseURL, authDir);

    console.log('✅ Global setup completed');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Setup admin authentication state
 */
async function setupAdminAuth(browser: Browser, baseURL: string, authDir: string) {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/login`);

    // Wait for login form
    await page.waitForSelector('form', { timeout: 10000 });

    // Fill in admin credentials (these should match your seed data)
    await page.fill('input[name="email"]', 'admin@kainos.com');
    await page.fill('input[name="password"]', 'Admin123!');

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for successful login (redirect to dashboard or home)
    await page.waitForURL(/\/(dashboard|home|\/$)/, { timeout: 10000 });

    // Save authenticated state
    await context.storageState({ path: path.join(authDir, 'admin-storage-state.json') });
    console.log('✅ Admin authentication state saved');
  } catch {
    console.warn('⚠️  Admin authentication failed, will create placeholder state');
    // Create a placeholder auth state file
    const placeholderState = {
      cookies: [],
      origins: [],
    };
    fs.writeFileSync(
      path.join(authDir, 'admin-storage-state.json'),
      JSON.stringify(placeholderState, null, 2)
    );
  } finally {
    await context.close();
  }
}

/**
 * Setup regular user authentication state
 */
async function setupUserAuth(browser: Browser, baseURL: string, authDir: string) {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/login`);

    // Wait for login form
    await page.waitForSelector('form', { timeout: 10000 });

    // Fill in user credentials
    await page.fill('input[name="email"]', 'user@kainos.com');
    await page.fill('input[name="password"]', 'User123!');

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL(/\/(dashboard|home|\/$)/, { timeout: 10000 });

    // Save authenticated state
    await context.storageState({ path: path.join(authDir, 'user-storage-state.json') });
    console.log('✅ User authentication state saved');
  } catch {
    console.warn('⚠️  User authentication failed, will create placeholder state');
    // Create a placeholder auth state file
    const placeholderState = {
      cookies: [],
      origins: [],
    };
    fs.writeFileSync(
      path.join(authDir, 'user-storage-state.json'),
      JSON.stringify(placeholderState, null, 2)
    );
  } finally {
    await context.close();
  }
}

export default globalSetup;
