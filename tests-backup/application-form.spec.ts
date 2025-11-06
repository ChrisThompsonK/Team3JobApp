import { expect, test } from '@playwright/test';
import * as path from 'path';

test.describe('Flow 16: Submit Job Application (Authenticated User)', () => {
  const baseURL = 'http://localhost:3000';
  const testJobId = '1'; // Assuming job ID 1 exists

  test.beforeEach(async ({ page }) => {
    // Check if we need to register and login a test user
    await page.goto(baseURL);
    const isLoggedIn = await page
      .locator('[data-testid="user-menu"]')
      .isVisible()
      .catch(() => false);

    if (!isLoggedIn) {
      // Register a new test user
      await page.goto(`${baseURL}/auth/register`);
      const timestamp = Date.now();
      const testEmail = `test-user-${timestamp}@example.com`;

      // Fill registration form
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.fill('input[name="confirmPassword"]', 'TestPassword123!');

      // Submit and wait for redirect
      await page.click('button[type="submit"]');
      await page.waitForURL(baseURL, { timeout: 5000 });
    }

    // Navigate to job application page
    await page.goto(`${baseURL}/jobs/${testJobId}/apply`);
    await page.waitForLoadState('networkidle');
  });

  test('✅ should display application form with all required fields', async ({ page }) => {
    // Verify form exists
    const form = page.locator('form#applicationForm');
    await expect(form).toBeVisible();

    // Verify form title
    await expect(page.locator('text=Apply for Job Role')).toBeVisible();

    // Verify personal information fields
    await expect(page.locator('input#firstName')).toBeVisible();
    await expect(page.locator('input#lastName')).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#phone')).toBeVisible();
    await expect(page.locator('select#countryCode')).toBeVisible();

    // Verify professional information fields
    await expect(page.locator('input#currentJobTitle')).toBeVisible();
    await expect(page.locator('select#yearsOfExperience')).toBeVisible();
    await expect(page.locator('input#linkedinUrl')).toBeVisible();

    // Verify CV upload
    await expect(page.locator('input#cv')).toBeVisible();

    // Verify cover letter
    await expect(page.locator('textarea#coverLetter')).toBeVisible();

    // Verify additional comments
    await expect(page.locator('textarea#additionalComments')).toBeVisible();

    // Verify terms checkbox
    await expect(page.locator('input[name="acceptTerms"]')).toBeVisible();

    // Verify submit button
    await expect(page.locator('button#submitBtn')).toBeVisible();
  });

  test('✅ should display job role summary information', async ({ page }) => {
    // Verify job role card displays relevant info
    const jobCard = page.locator('.card').first();
    await expect(jobCard).toBeVisible();

    // Should show job title, location, capability, and band
    const cardText = await page.locator('.card').first().textContent();
    expect(cardText).toBeTruthy();
  });

  test('❌ should prevent submission with empty required fields', async ({ page }) => {
    // Attempt to submit empty form
    await page.click('button#submitBtn');

    // Browser's native validation should prevent submission
    // Check if form is still visible (not submitted)
    const form = page.locator('form#applicationForm');
    await expect(form).toBeVisible();
  });

  test('❌ should validate email format', async ({ page }) => {
    // Fill only email with invalid format
    await page.fill('input#email', 'invalid-email');

    // Submit button should trigger browser validation
    await page.click('button#submitBtn');

    // Form should still be visible
    await expect(page.locator('form#applicationForm')).toBeVisible();
  });

  test('✅ should accept valid application with all required fields', async ({ page }) => {
    const timestamp = Date.now();
    const currentJobTitle = 'Senior Software Engineer';
    const testData = {
      firstName: 'Test',
      lastName: `User${timestamp}`,
      email: `test-apply-${timestamp}@example.com`,
      countryCode: '+44',
      phone: '7700900000',
      currentJobTitle,
      yearsOfExperience: '5-10',
      linkedinUrl: 'https://www.linkedin.com/in/testprofile',
      coverLetter: `I am very interested in this position with Kainos. My experience in ${currentJobTitle} makes me an excellent fit for this role.`,
      additionalComments: 'Looking forward to discussing this opportunity.',
    };

    // Fill out the form
    await page.fill('input#firstName', testData.firstName);
    await page.fill('input#lastName', testData.lastName);
    await page.fill('input#email', testData.email);
    await page.selectOption('select#countryCode', testData.countryCode);
    await page.fill('input#phone', testData.phone);
    await page.fill('input#currentJobTitle', testData.currentJobTitle);
    await page.selectOption('select#yearsOfExperience', testData.yearsOfExperience);
    await page.fill('input#linkedinUrl', testData.linkedinUrl);
    await page.fill('textarea#coverLetter', testData.coverLetter);
    await page.fill('textarea#additionalComments', testData.additionalComments);

    // Accept terms
    await page.check('input[name="acceptTerms"]');

    // Submit the form
    await page.click('button#submitBtn');

    // Wait for navigation after successful submission
    await page.waitForURL(`/jobs/${testJobId}/details`, { timeout: 5000 });

    // Verify success message appears
    const successMessage = page.locator('text=/successfully|submitted|confirmation/i');
    await expect(successMessage).toBeVisible({ timeout: 3000 });
  });

  test('✅ should support multiple country phone codes', async ({ page }) => {
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      currentJobTitle: 'Engineer',
      yearsOfExperience: '3-5',
      coverLetter: 'Test cover letter',
    };

    const countryCodes = [
      { code: '+44', phone: '7700900000' }, // UK
      { code: '+1', phone: '5551234567' }, // US
      { code: '+91', phone: '9876543210' }, // India
      { code: '+61', phone: '412345678' }, // Australia
    ];

    for (const { code, phone } of countryCodes) {
      // Reset form by reloading
      await page.reload();

      // Fill basic fields
      await page.fill('input#firstName', testData.firstName);
      await page.fill('input#lastName', testData.lastName);
      await page.fill('input#email', `test-${Date.now()}-${code.replace('+', '')}-@example.com`);
      await page.selectOption('select#countryCode', code);
      await page.fill('input#phone', phone);
      await page.fill('input#currentJobTitle', testData.currentJobTitle);
      await page.selectOption('select#yearsOfExperience', testData.yearsOfExperience);
      await page.fill('textarea#coverLetter', testData.coverLetter);

      // Verify country code was selected
      const selectedCode = await page.locator('select#countryCode').inputValue();
      expect(selectedCode).toBe(code);
    }
  });

  test('✅ should allow file upload for CV', async ({ page, context }) => {
    const timestamp = Date.now();
    const testData = {
      firstName: 'Test',
      lastName: `User${timestamp}`,
      email: `test-cv-${timestamp}@example.com`,
      countryCode: '+44',
      phone: '7700900000',
      currentJobTitle: 'Software Engineer',
      yearsOfExperience: '1-3',
      coverLetter: 'Interested in this role',
    };

    // Fill form fields
    await page.fill('input#firstName', testData.firstName);
    await page.fill('input#lastName', testData.lastName);
    await page.fill('input#email', testData.email);
    await page.selectOption('select#countryCode', testData.countryCode);
    await page.fill('input#phone', testData.phone);
    await page.fill('input#currentJobTitle', testData.currentJobTitle);
    await page.selectOption('select#yearsOfExperience', testData.yearsOfExperience);
    await page.fill('textarea#coverLetter', testData.coverLetter);
    await page.check('input[name="acceptTerms"]');

    // Create a dummy PDF file for testing
    const cvPath = path.join('/tmp', `test-cv-${timestamp}.pdf`);

    // Upload file - Playwright will create an empty file
    await page.setInputFiles('input#cv', {
      name: `test-cv-${timestamp}.pdf`,
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 dummy pdf content'),
    });

    // Verify file input has value
    const cvInput = page.locator('input#cv');
    const files = await cvInput.inputValue();
    expect(files).toBeTruthy();
  });

  test('❌ should prevent submission without terms acceptance', async ({ page }) => {
    const timestamp = Date.now();
    const testData = {
      firstName: 'Test',
      lastName: `User${timestamp}`,
      email: `test-terms-${timestamp}@example.com`,
      countryCode: '+44',
      phone: '7700900000',
      currentJobTitle: 'Engineer',
      yearsOfExperience: '3-5',
      coverLetter: 'Test cover letter',
    };

    // Fill all required fields EXCEPT accept terms
    await page.fill('input#firstName', testData.firstName);
    await page.fill('input#lastName', testData.lastName);
    await page.fill('input#email', testData.email);
    await page.selectOption('select#countryCode', testData.countryCode);
    await page.fill('input#phone', testData.phone);
    await page.fill('input#currentJobTitle', testData.currentJobTitle);
    await page.selectOption('select#yearsOfExperience', testData.yearsOfExperience);
    await page.fill('textarea#coverLetter', testData.coverLetter);

    // Do NOT check terms
    const termsCheckbox = page.locator('input[name="acceptTerms"]');
    await expect(termsCheckbox).not.toBeChecked();

    // Try to submit
    await page.click('button#submitBtn');

    // Form should still be visible (not submitted)
    await expect(page.locator('form#applicationForm')).toBeVisible();
  });

  test('✅ should preserve form data on validation error', async ({ page }) => {
    const testData = {
      firstName: 'Preserved',
      lastName: 'Data',
      email: 'preserved@example.com',
      currentJobTitle: 'Test Engineer',
      yearsOfExperience: '5-10',
      linkedinUrl: 'https://www.linkedin.com/in/test',
      coverLetter: 'This is my cover letter text',
      additionalComments: 'Additional information here',
    };

    // Fill form
    await page.fill('input#firstName', testData.firstName);
    await page.fill('input#lastName', testData.lastName);
    await page.fill('input#email', testData.email);
    await page.fill('input#currentJobTitle', testData.currentJobTitle);
    await page.selectOption('select#yearsOfExperience', testData.yearsOfExperience);
    await page.fill('input#linkedinUrl', testData.linkedinUrl);
    await page.fill('textarea#coverLetter', testData.coverLetter);
    await page.fill('textarea#additionalComments', testData.additionalComments);

    // Try to submit (will fail validation)
    await page.click('button#submitBtn');

    // Verify data is still in form
    expect(await page.inputValue('input#firstName')).toBe(testData.firstName);
    expect(await page.inputValue('input#lastName')).toBe(testData.lastName);
    expect(await page.inputValue('input#email')).toBe(testData.email);
    expect(await page.inputValue('input#currentJobTitle')).toBe(testData.currentJobTitle);
    expect(await page.inputValue('textarea#coverLetter')).toBe(testData.coverLetter);
    expect(await page.inputValue('textarea#additionalComments')).toBe(testData.additionalComments);
  });

  test('❌ should show error for invalid LinkedIn URL', async ({ page }) => {
    const timestamp = Date.now();
    const testData = {
      firstName: 'Test',
      lastName: `User${timestamp}`,
      email: `test-linkedin-${timestamp}@example.com`,
      countryCode: '+44',
      phone: '7700900000',
      currentJobTitle: 'Engineer',
      yearsOfExperience: '1-3',
      linkedinUrl: 'not-a-valid-url',
      coverLetter: 'Test cover letter',
    };

    // Fill form with invalid LinkedIn URL
    await page.fill('input#firstName', testData.firstName);
    await page.fill('input#lastName', testData.lastName);
    await page.fill('input#email', testData.email);
    await page.selectOption('select#countryCode', testData.countryCode);
    await page.fill('input#phone', testData.phone);
    await page.fill('input#currentJobTitle', testData.currentJobTitle);
    await page.selectOption('select#yearsOfExperience', testData.yearsOfExperience);
    await page.fill('input#linkedinUrl', testData.linkedinUrl);
    await page.fill('textarea#coverLetter', testData.coverLetter);
    await page.check('input[name="acceptTerms"]');

    // Try to submit
    await page.click('button#submitBtn');

    // Check if browser/server validation catches invalid URL
    const linkedinInput = page.locator('input#linkedinUrl');
    const validity = await linkedinInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBe(false);
  });

  test('✅ should handle special characters in cover letter', async ({ page }) => {
    const timestamp = Date.now();
    const specialCharsCoverLetter = `
      I am excited about this opportunity! 
      Key strengths:
      • Leadership & team management
      • Problem-solving (complex issues)
      • Technical proficiency: C++, Java, Python
      
      Contact: test-${timestamp}@example.com
      
      Looking forward to discussing this role & compensation.
    `;

    const testData = {
      firstName: 'Test',
      lastName: `SpecialChars${timestamp}`,
      email: `test-special-${timestamp}@example.com`,
      countryCode: '+44',
      phone: '7700900000',
      currentJobTitle: 'Engineer',
      yearsOfExperience: '3-5',
      coverLetter: specialCharsCoverLetter,
    };

    // Fill form
    await page.fill('input#firstName', testData.firstName);
    await page.fill('input#lastName', testData.lastName);
    await page.fill('input#email', testData.email);
    await page.selectOption('select#countryCode', testData.countryCode);
    await page.fill('input#phone', testData.phone);
    await page.fill('input#currentJobTitle', testData.currentJobTitle);
    await page.selectOption('select#yearsOfExperience', testData.yearsOfExperience);
    await page.fill('textarea#coverLetter', testData.coverLetter);
    await page.check('input[name="acceptTerms"]');

    // Verify special characters were entered
    const coverLetterContent = await page.inputValue('textarea#coverLetter');
    expect(coverLetterContent).toContain('•');
    expect(coverLetterContent).toContain('&');
    expect(coverLetterContent).toContain('++');
  });

  test('✅ should navigate back to job details when clicking back button', async ({ page }) => {
    // Click back button
    await page.click('a:has-text("Back to Job Details")');

    // Should navigate to job details page
    await page.waitForURL(`/jobs/${testJobId}/details`);
    await expect(page).toHaveURL(new RegExp(`/jobs/${testJobId}/details`));
  });

  test('❌ should not allow non-authenticated user to access apply page', async ({ context }) => {
    // Create new context without authentication
    const newPage = await context.newPage();

    // Navigate directly to apply page
    const response = await newPage.goto(`${baseURL}/jobs/${testJobId}/apply`);

    // Should redirect to login (check URL or status code)
    await newPage.waitForURL(/login|auth/, { timeout: 5000 });

    // Verify we're on login page
    const loginForm = newPage.locator('input[name="email"]');
    await expect(loginForm).toBeVisible();

    await newPage.close();
  });

  test('✅ should prevent duplicate applications to same job', async ({ page }) => {
    const timestamp = Date.now();
    const testData = {
      firstName: 'Duplicate',
      lastName: `Tester${timestamp}`,
      email: `test-duplicate-${timestamp}@example.com`,
      countryCode: '+44',
      phone: '7700900000',
      currentJobTitle: 'Engineer',
      yearsOfExperience: '3-5',
      coverLetter: 'First application to this role',
    };

    // Submit first application
    await page.fill('input#firstName', testData.firstName);
    await page.fill('input#lastName', testData.lastName);
    await page.fill('input#email', testData.email);
    await page.selectOption('select#countryCode', testData.countryCode);
    await page.fill('input#phone', testData.phone);
    await page.fill('input#currentJobTitle', testData.currentJobTitle);
    await page.selectOption('select#yearsOfExperience', testData.yearsOfExperience);
    await page.fill('textarea#coverLetter', testData.coverLetter);
    await page.check('input[name="acceptTerms"]');
    await page.click('button#submitBtn');

    // Wait for success
    await page.waitForURL(`/jobs/${testJobId}/details`, { timeout: 5000 });

    // Navigate back to apply page
    await page.goto(`${baseURL}/jobs/${testJobId}/apply`);

    // Try to submit another application
    await page.fill('input#firstName', testData.firstName);
    await page.fill('input#lastName', testData.lastName);
    await page.fill('input#email', testData.email);
    await page.selectOption('select#countryCode', testData.countryCode);
    await page.fill('input#phone', testData.phone);
    await page.fill('input#currentJobTitle', testData.currentJobTitle);
    await page.selectOption('select#yearsOfExperience', testData.yearsOfExperience);
    await page.fill('textarea#coverLetter', 'Second application attempt');
    await page.check('input[name="acceptTerms"]');
    await page.click('button#submitBtn');

    // Should show error message for duplicate application
    const errorMessage = page.locator('text=/already applied|duplicate|already submitted/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });
});
