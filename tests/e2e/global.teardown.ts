import { test } from '@playwright/test';
import { DbUtils } from '../utils/test-helpers.js';

test.describe('Teardown Tests', () => {
  test('global.teardown', async () => {
    console.log('🧹 Running global teardown...');

    // Clean up test data
    await DbUtils.clearTestData();

    console.log('✅ Global teardown completed');
  });
});
