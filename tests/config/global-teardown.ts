import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FullConfig } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global test teardown for Kainos Job Portal
 *
 * This runs once after all tests complete and handles:
 * - Cleanup of test data
 * - Removal of temporary files
 * - Resource cleanup
 */
async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Starting global test teardown...');

  try {
    // Clean up authentication state files
    const authDir = path.join(__dirname, '../fixtures/auth');
    if (fs.existsSync(authDir)) {
      const authFiles = fs.readdirSync(authDir).filter((file) => file.endsWith('.json'));
      for (const file of authFiles) {
        const filePath = path.join(authDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Removed auth state: ${file}`);
        } catch {
          console.warn(`⚠️  Could not remove ${file}`);
        }
      }
    }

    // Clean up any other temporary test files
    const tempFiles = ['./test-results/temp', './screenshots', './downloads'];

    for (const tempPath of tempFiles) {
      if (fs.existsSync(tempPath)) {
        try {
          fs.rmSync(tempPath, { recursive: true, force: true });
          console.log(`🗑️  Cleaned up: ${tempPath}`);
        } catch {
          console.warn(`⚠️  Could not clean up ${tempPath}`);
        }
      }
    }

    console.log('✅ Global teardown completed');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid masking test failures
  }
}

export default globalTeardown;
