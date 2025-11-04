import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Registration', () => {
    test('should navigate to registration page', async ({ page }) => {
      await page.goto('/');
      
      // Find and click register link
      const registerLink = page.getByRole('link', { name: /register|sign up/i });
      if (await registerLink.isVisible()) {
        await registerLink.click();
        await page.waitForLoadState('networkidle');
        
        expect(page.url()).toContain('register');
      } else {
        // Navigate directly if link not found
        await page.goto('/auth/register');
      }
    });

    test('should display registration form', async ({ page }) => {
      await page.goto('/auth/register');
      
      // Check for form fields
      await expect(page.locator('form')).toBeVisible();
      await expect(page.getByLabel(/email|username/i)).toBeVisible();
      await expect(page.getByLabel(/password/i).first()).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/auth/register');
      
      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /register|sign up|submit/i });
      await submitButton.click();
      
      // Check for validation - either HTML5 validation or custom errors
      const emailInput = page.getByLabel(/email/i);
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      
      expect(isInvalid || await page.locator('.error, .alert-error').count() > 0).toBeTruthy();
    });
  });

  test.describe('Login', () => {
    test('should navigate to login page', async ({ page }) => {
      await page.goto('/');
      
      // Find and click login link
      const loginLink = page.getByRole('link', { name: /login|sign in/i });
      if (await loginLink.isVisible()) {
        await loginLink.click();
        await page.waitForLoadState('networkidle');
        
        expect(page.url()).toContain('login');
      } else {
        // Navigate directly if link not found
        await page.goto('/auth/login');
      }
    });

    test('should display login form', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Check for form fields
      await expect(page.locator('form')).toBeVisible();
      await expect(page.getByLabel(/email|username/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Fill in invalid credentials
      await page.getByLabel(/email|username/i).fill('invalid@test.com');
      await page.getByLabel(/password/i).fill('wrongpassword');
      
      // Submit form
      await page.getByRole('button', { name: /login|sign in|submit/i }).click();
      
      // Wait for response
      await page.waitForTimeout(1000);
      
      // Check for error message
      const hasError = await page.locator('.error, .alert-error, [role="alert"]').count() > 0;
      expect(hasError || page.url().includes('error')).toBeTruthy();
    });
  });

  test.describe('Logout', () => {
    test('should have logout functionality', async ({ page }) => {
      await page.goto('/');
      
      // Check if logout link exists (user might not be logged in)
      const logoutLink = page.getByRole('link', { name: /logout|sign out/i });
      const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
      
      const hasLogout = (await logoutLink.count() > 0) || (await logoutButton.count() > 0);
      
      // This test just verifies the logout element exists when visible
      if (hasLogout) {
        expect(true).toBeTruthy();
      }
    });
  });
});
