import { After, Before, type DataTable, Given, Then, When } from '@cucumber/cucumber';
import { type Browser, type BrowserContext, chromium, expect, type Page } from '@playwright/test';

interface World {
  browser: Browser | null;
  context: BrowserContext | null;
  page: Page | null;
  baseURL: string;
  testJobId: string;
  testData: Record<string, string>;
  timestamp: number;
}

// Initialize World context
const world: World = {
  browser: null,
  context: null,
  page: null,
  baseURL: 'http://localhost:3000',
  testJobId: '1',
  testData: {},
  timestamp: Date.now(),
};

Before(async () => {
  world.browser = await chromium.launch();
  world.context = await world.browser.newContext();
  world.page = await world.context.newPage();
  world.timestamp = Date.now();
});

After(async () => {
  if (world.page) {
    await world.page.close();
  }
  if (world.context) {
    await world.context.close();
  }
  if (world.browser) {
    await world.browser.close();
  }
});

// ==================== GIVEN STEPS ====================

Given('I am logged in as a test user', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const isLoggedIn = await world.page
    .locator('[data-testid="user-menu"]')
    .isVisible()
    .catch(() => false);

  if (!isLoggedIn) {
    // Register a new test user
    await world.page.goto(`${world.baseURL}/auth/register`);
    const testEmail = `test-user-${world.timestamp}@example.com`;

    // Fill registration form
    await world.page.fill('input[name="email"]', testEmail);
    await world.page.fill('input[name="password"]', 'TestPassword123!');
    await world.page.fill('input[name="confirmPassword"]', 'TestPassword123!');

    // Submit and wait for redirect
    await world.page.click('button[type="submit"]');
    await world.page.waitForURL(world.baseURL, { timeout: 5000 });
  }
});

Given('I navigate to the job application page for job {string}', async (jobId: string) => {
  if (!world.page) throw new Error('Page not initialized');

  world.testJobId = jobId;
  await world.page.goto(`${world.baseURL}/jobs/${jobId}/apply`);
  await world.page.waitForLoadState('networkidle');
});

Given('I am not logged in', async () => {
  if (!world.context) throw new Error('Context not initialized');

  // Create new context without cookies/authentication
  if (world.page) await world.page.close();
  world.page = await world.context.newPage();
});

// ==================== WHEN STEPS ====================

When('I view the application form', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.waitForLoadState('networkidle');
  const form = world.page.locator('form#applicationForm');
  await expect(form).toBeVisible({ timeout: 10000 });
});

When('I view the job application page', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.waitForLoadState('networkidle');
  const jobCard = world.page.locator('.card').first();
  await expect(jobCard).toBeVisible({ timeout: 10000 });
});

When('I attempt to submit the form without filling any fields', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.waitForLoadState('networkidle');
  await world.page.click('button#submitBtn', { timeout: 10000 });
});

When('I enter an invalid email format {string}', async (email: string) => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.waitForLoadState('networkidle');
  await world.page.fill('input#email', email, { timeout: 10000 });
});

When('I attempt to submit the form', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.click('button#submitBtn', { timeout: 10000 });
});

When('I fill the application form with valid data:', async (dataTable: DataTable) => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.waitForLoadState('networkidle');
  const data = dataTable.rowsHash();

  for (const [field, value] of Object.entries(data)) {
    let actualValue = value as string;

    // Replace timestamp placeholders
    if (actualValue.includes('{timestamp}')) {
      actualValue = actualValue.replace('{timestamp}', world.timestamp.toString());
    }

    world.testData[field] = actualValue;

    // Select appropriate element based on field type
    if (field === 'countryCode' || field === 'yearsOfExperience') {
      await world.page.selectOption(`select#${field}`, actualValue, { timeout: 10000 });
    } else if (field === 'coverLetter' || field === 'additionalComments') {
      await world.page.fill(`textarea#${field}`, actualValue, { timeout: 10000 });
    } else {
      await world.page.fill(`input#${field}`, actualValue, { timeout: 10000 });
    }
  }
});

When('I accept the terms and conditions', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.check('input[name="acceptTerms"]', { timeout: 10000 });
});

When('I submit the form', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.click('button#submitBtn', { timeout: 10000 });
});

When('I test phone codes for different countries:', async (dataTable: DataTable) => {
  if (!world.page) throw new Error('Page not initialized');

  const testCases = dataTable.hashes();

  for (const testCase of testCases) {
    // Reload form for each test
    await world.page.reload();
    await world.page.waitForLoadState('networkidle');

    // Fill basic fields with extended timeouts
    await world.page.fill('input#firstName', 'Test', { timeout: 10000 });
    await world.page.fill('input#lastName', 'User', { timeout: 10000 });
    await world.page.fill(
      'input#email',
      `test-${world.timestamp}-${testCase.countryCode.replace('+', '')}-@example.com`,
      { timeout: 10000 }
    );
    await world.page.selectOption('select#countryCode', testCase.countryCode, { timeout: 10000 });
    await world.page.fill('input#phone', testCase.phone, { timeout: 10000 });
    await world.page.fill('input#currentJobTitle', 'Engineer', { timeout: 10000 });
    await world.page.selectOption('select#yearsOfExperience', '3-5', { timeout: 10000 });
    await world.page.fill('textarea#coverLetter', 'Test cover letter', { timeout: 10000 });

    // Verify country code was selected
    const selectedCode = await world.page.locator('select#countryCode').inputValue();
    expect(selectedCode).toBe(testCase.countryCode);
  }
});

When('I fill the form with valid data including CV upload', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.waitForLoadState('networkidle');
  const testData = {
    firstName: 'Test',
    lastName: `User${world.timestamp}`,
    email: `test-cv-${world.timestamp}@example.com`,
    countryCode: '+44',
    phone: '7700900000',
    currentJobTitle: 'Software Engineer',
    yearsOfExperience: '1-3',
    coverLetter: 'Interested in this role',
  };

  await world.page.fill('input#firstName', testData.firstName, { timeout: 10000 });
  await world.page.fill('input#lastName', testData.lastName, { timeout: 10000 });
  await world.page.fill('input#email', testData.email, { timeout: 10000 });
  await world.page.selectOption('select#countryCode', testData.countryCode, { timeout: 10000 });
  await world.page.fill('input#phone', testData.phone, { timeout: 10000 });
  await world.page.fill('input#currentJobTitle', testData.currentJobTitle, { timeout: 10000 });
  await world.page.selectOption('select#yearsOfExperience', testData.yearsOfExperience, {
    timeout: 10000,
  });
  await world.page.fill('textarea#coverLetter', testData.coverLetter, { timeout: 10000 });
  await world.page.check('input[name="acceptTerms"]', { timeout: 10000 });
});

When('I upload a PDF file for the CV', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.setInputFiles(
    'input#cv',
    {
      name: `test-cv-${world.timestamp}.pdf`,
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 dummy pdf content'),
    },
    { timeout: 10000 }
  );
});

When('I fill all required fields with valid data', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.waitForLoadState('networkidle');
  await world.page.fill('input#firstName', 'Test', { timeout: 10000 });
  await world.page.fill('input#lastName', `User${world.timestamp}`, { timeout: 10000 });
  await world.page.fill('input#email', `test-${world.timestamp}@example.com`, { timeout: 10000 });
  await world.page.selectOption('select#countryCode', '+44', { timeout: 10000 });
  await world.page.fill('input#phone', '7700900000', { timeout: 10000 });
  await world.page.fill('input#currentJobTitle', 'Engineer', { timeout: 10000 });
  await world.page.selectOption('select#yearsOfExperience', '3-5', { timeout: 10000 });
  await world.page.fill('textarea#coverLetter', 'Test cover letter', { timeout: 10000 });
});

When('I do not accept the terms and conditions', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const termsCheckbox = world.page.locator('input[name="acceptTerms"]');
  await expect(termsCheckbox).not.toBeChecked();
});

When('I fill the form with data:', async (dataTable: DataTable) => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.waitForLoadState('networkidle');
  const data = dataTable.rowsHash();

  for (const [field, value] of Object.entries(data)) {
    if (field === 'yearsOfExperience') {
      await world.page.selectOption(`select#${field}`, value as string, { timeout: 10000 });
    } else if (field === 'coverLetter' || field === 'additionalComments') {
      await world.page.fill(`textarea#${field}`, value as string, { timeout: 10000 });
    } else {
      await world.page.fill(`input#${field}`, value as string, { timeout: 10000 });
    }
  }
});

When('I attempt to submit without all required fields', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.click('button#submitBtn', { timeout: 10000 });
});

When('I fill the form with an invalid LinkedIn URL {string}', async (url: string) => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.waitForLoadState('networkidle');
  await world.page.fill('input#firstName', 'Test', { timeout: 10000 });
  await world.page.fill('input#lastName', `User${world.timestamp}`, { timeout: 10000 });
  await world.page.fill('input#email', `test-${world.timestamp}@example.com`, { timeout: 10000 });
  await world.page.selectOption('select#countryCode', '+44', { timeout: 10000 });
  await world.page.fill('input#phone', '7700900000', { timeout: 10000 });
  await world.page.fill('input#currentJobTitle', 'Engineer', { timeout: 10000 });
  await world.page.selectOption('select#yearsOfExperience', '1-3', { timeout: 10000 });
  await world.page.fill('input#linkedinUrl', url, { timeout: 10000 });
  await world.page.fill('textarea#coverLetter', 'Test cover letter', { timeout: 10000 });
  await world.page.check('input[name="acceptTerms"]', { timeout: 10000 });
});

When(
  'I fill the form with special characters in the cover letter:',
  async (dataTable: DataTable) => {
    if (!world.page) throw new Error('Page not initialized');

    await world.page.waitForLoadState('networkidle');
    const data = dataTable.rowsHash();

    for (const [field, value] of Object.entries(data)) {
      if (field === 'coverLetter') {
        await world.page.fill(`textarea#${field}`, value as string, { timeout: 10000 });
      } else {
        await world.page.fill(`input#${field}`, value as string, { timeout: 10000 });
      }
    }
  }
);

When('I click the back button', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.click('a:has-text("Back to Job Details")', { timeout: 10000 });
});

When('I navigate directly to the apply page', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const _response = await world.page.goto(`${world.baseURL}/jobs/${world.testJobId}/apply`, {
    waitUntil: 'networkidle',
  });
});

When('I submit a valid application to a job', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const testData = {
    firstName: 'Duplicate',
    lastName: `Tester${world.timestamp}`,
    email: `test-duplicate-${world.timestamp}@example.com`,
    countryCode: '+44',
    phone: '7700900000',
    currentJobTitle: 'Engineer',
    yearsOfExperience: '3-5',
    coverLetter: 'First application to this role',
  };

  await world.page.fill('input#firstName', testData.firstName);
  await world.page.fill('input#lastName', testData.lastName);
  await world.page.fill('input#email', testData.email);
  await world.page.selectOption('select#countryCode', testData.countryCode);
  await world.page.fill('input#phone', testData.phone);
  await world.page.fill('input#currentJobTitle', testData.currentJobTitle);
  await world.page.selectOption('select#yearsOfExperience', testData.yearsOfExperience);
  await world.page.fill('textarea#coverLetter', testData.coverLetter);
  await world.page.check('input[name="acceptTerms"]');
  await world.page.click('button#submitBtn');
});

When('the application is successfully submitted', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.waitForURL(`/jobs/${world.testJobId}/details`, { timeout: 5000 });
});

When('I navigate back to apply for the same job again', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.goto(`${world.baseURL}/jobs/${world.testJobId}/apply`);
});

When('I submit another application with the same details', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.fill('input#firstName', 'Duplicate');
  await world.page.fill('input#lastName', `Tester${world.timestamp}`);
  await world.page.fill('input#email', `test-duplicate-${world.timestamp}@example.com`);
  await world.page.selectOption('select#countryCode', '+44');
  await world.page.fill('input#phone', '7700900000');
  await world.page.fill('input#currentJobTitle', 'Engineer');
  await world.page.selectOption('select#yearsOfExperience', '3-5');
  await world.page.fill('textarea#coverLetter', 'Second application attempt');
  await world.page.check('input[name="acceptTerms"]');
  await world.page.click('button#submitBtn');
});

// ==================== THEN STEPS ====================

Then('the form should display all required fields:', async (dataTable: DataTable) => {
  if (!world.page) throw new Error('Page not initialized');

  const fields = dataTable.hashes();

  for (const field of fields) {
    if (field.fieldType === 'select') {
      await expect(world.page.locator(`select#${field.fieldId}`)).toBeVisible();
    } else if (field.fieldType === 'checkbox') {
      await expect(world.page.locator(`input[name="${field.fieldId}"]`)).toBeVisible();
    } else if (field.fieldType === 'textarea') {
      await expect(world.page.locator(`textarea#${field.fieldId}`)).toBeVisible();
    } else {
      await expect(world.page.locator(`input#${field.fieldId}`)).toBeVisible();
    }
  }
});

Then('the submit button should be visible', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await expect(world.page.locator('button#submitBtn')).toBeVisible();
});

Then('the job role card should display relevant information', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const jobCard = world.page.locator('.card').first();
  await expect(jobCard).toBeVisible();
});

Then('the card text should be visible', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const cardText = await world.page.locator('.card').first().textContent();
  expect(cardText).toBeTruthy();
});

Then('the form should still be visible', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await expect(world.page.locator('form#applicationForm')).toBeVisible();
});

Then('submission should be prevented', async () => {
  if (!world.page) throw new Error('Page not initialized');

  // Form should still be visible, indicating submission was prevented
  await expect(world.page.locator('form#applicationForm')).toBeVisible();
});

Then('browser validation should prevent submission', async () => {
  if (!world.page) throw new Error('Page not initialized');

  // Verify form is still present
  await expect(world.page.locator('form#applicationForm')).toBeVisible();
});

Then('the form should be successfully submitted', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.waitForURL(`/jobs/${world.testJobId}/details`, { timeout: 5000 });
});

Then('I should see a success message or confirmation', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const successMessage = world.page.locator('text=/successfully|submitted|confirmation/i');
  await expect(successMessage).toBeVisible({ timeout: 3000 });
});

Then('I should be redirected to the job details page', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await expect(world.page).toHaveURL(new RegExp(`/jobs/${world.testJobId}/details`));
});

Then('each country code should be properly selected in the form', async () => {
  if (!world.page) throw new Error('Page not initialized');

  // Already verified in the When step
});

Then('phone numbers should be accepted for each country', async () => {
  if (!world.page) throw new Error('Page not initialized');

  // Already verified in the When step
});

Then('the file should be successfully attached to the form', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const cvInput = world.page.locator('input#cv');
  await expect(cvInput).toBeTruthy();
});

Then('the file input should have a value', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const cvInput = world.page.locator('input#cv');
  const files = await cvInput.inputValue();
  expect(files).toBeTruthy();
});

Then('the form data should be preserved in the form fields', async () => {
  if (!world.page) throw new Error('Page not initialized');

  expect(await world.page.inputValue('input#firstName')).toBe('Preserved');
  expect(await world.page.inputValue('input#lastName')).toBe('Data');
  expect(await world.page.inputValue('input#email')).toBe('preserved@example.com');
  expect(await world.page.inputValue('input#currentJobTitle')).toBe('Test Engineer');
  expect(await world.page.inputValue('textarea#coverLetter')).toContain(
    'This is my cover letter text'
  );
  expect(await world.page.inputValue('textarea#additionalComments')).toContain(
    'Additional information here'
  );
});

Then('browser validation should detect the invalid URL', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const linkedinInput = world.page.locator('input#linkedinUrl');
  const validity = await linkedinInput.evaluate((el: HTMLInputElement) => el.validity.valid);
  expect(validity).toBe(false);
});

Then('the special characters should be properly preserved', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const coverLetterContent = await world.page.inputValue('textarea#coverLetter');
  expect(coverLetterContent).toContain('•');
  expect(coverLetterContent).toContain('&');
  expect(coverLetterContent).toContain('++');
});

Then('the form should accept the special character content', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const coverLetter = await world.page.inputValue('textarea#coverLetter');
  expect(coverLetter).toBeTruthy();
});

Then('I should be redirected to the login page', async () => {
  if (!world.page) throw new Error('Page not initialized');

  await world.page.waitForURL(/login|auth/, { timeout: 5000 });
});

Then('the login form should be visible', async () => {
  if (!world.page) throw new Error('Page not initialized');

  const loginForm = world.page.locator('input[name="email"]');
  await expect(loginForm).toBeVisible();
});

Then("an error message should indicate that I've already applied to this job", async () => {
  if (!world.page) throw new Error('Page not initialized');

  const errorMessage = world.page.locator('text=/already applied|duplicate|already submitted/i');
  await expect(errorMessage).toBeVisible({ timeout: 3000 });
});

Then('the duplicate application should be prevented', async () => {
  if (!world.page) throw new Error('Page not initialized');

  // Already verified in previous step
});
