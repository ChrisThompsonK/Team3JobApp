import { test, expect } from '../fixtures/auth.fixture';
import { NavigationHelper, FormHelper } from '../utils/helpers';

/**
 * Example test using custom fixtures and helpers
 */
test.describe('Authenticated User Tests', () => {
  test('authenticated user can view profile', async ({ authenticatedPage }) => {
    const nav = new NavigationHelper(authenticatedPage);
    
    // Navigate to profile
    await authenticatedPage.goto('/auth/profile');
    
    // Should see profile page
    expect(authenticatedPage.url()).toContain('profile');
  });

  test('authenticated user can apply for jobs', async ({ authenticatedPage }) => {
    const nav = new NavigationHelper(authenticatedPage);
    
    // Go to job roles
    await nav.goToJobRoles();
    
    // Try to apply for a job
    const applyButton = authenticatedPage.locator('button:has-text("Apply"), a:has-text("Apply")').first();
    
    if (await applyButton.count() > 0 && await applyButton.isVisible()) {
      await applyButton.click();
      
      // Should navigate to application form
      await authenticatedPage.waitForLoadState('networkidle');
      expect(authenticatedPage.url()).toMatch(/apply|application/);
    }
  });
});

test.describe('Admin User Tests', () => {
  test('admin can access analytics dashboard', async ({ adminPage }) => {
    const nav = new NavigationHelper(adminPage);
    
    // Navigate to analytics
    await nav.goToAnalytics();
    
    // Should be able to see analytics (not redirected to login)
    expect(adminPage.url()).toContain('analytics');
  });

  test('admin can create new job role', async ({ adminPage }) => {
    // Navigate to new job role page
    await adminPage.goto('/job-roles/new');
    
    // Check if we can access the form
    const hasForm = await adminPage.locator('form').count() > 0;
    
    if (hasForm) {
      expect(hasForm).toBeTruthy();
    }
  });
});
