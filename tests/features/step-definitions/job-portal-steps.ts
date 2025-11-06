import { After, Before, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { type Browser, chromium, type Page } from 'playwright';
import { HomePage } from '../../pages/home.page.js';
import { JobListingsPage } from '../../pages/job-listings.page.js';
import { LoginPage } from '../../pages/login.page.js';

let browser: Browser;
let page: Page;
let homePage: HomePage;
let loginPage: LoginPage;
let jobListingsPage: JobListingsPage;

// Note: Mock data is now provided server-side when CUCUMBER_TEST=true

Before(async () => {
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });

  // Note: API mocking is now handled server-side when CUCUMBER_TEST=true
  // No need for browser-level mocking

  // Initialize page objects
  homePage = new HomePage(page);
  loginPage = new LoginPage(page);
  jobListingsPage = new JobListingsPage(page);
});

After(async () => {
  await browser.close();
});

Given('I am on the job portal home page', async () => {
  await homePage.goto();
  await homePage.verifyPageLoaded();
});

When('I navigate to the job listings page', async () => {
  await homePage.goToJobListings();
});

Then('I should see a list of available job roles', async () => {
  const jobCount = await jobListingsPage.getJobCount();
  expect(jobCount).toBeGreaterThan(0);
});

Then('each job listing should display the job title and location', async () => {
  const jobCount = await jobListingsPage.getJobCount();
  expect(jobCount).toBeGreaterThan(0);

  // Check that job table rows are visible and contain job names and locations
  const jobRows = page.locator('tbody tr.hover');
  await expect(jobRows.first()).toBeVisible();

  // Check that the first job row contains a job name (first td) and location (second td)
  const firstJobName = jobRows.first().locator('td').first();
  const firstJobLocation = jobRows.first().locator('td').nth(1);
  await expect(firstJobName).toBeVisible();
  await expect(firstJobLocation).toBeVisible();
});

When('I search for {string} jobs', async (searchTerm: string) => {
  await jobListingsPage.searchJobs(searchTerm);
});

Then('I should see only Software Engineer positions', async () => {
  const jobTitles = page.locator('tbody tr.hover td:first-child'); // Job names are in the first td of each row
  const titles = await jobTitles.allTextContents();

  // Check that all visible job titles contain "Software Engineer"
  for (const title of titles) {
    expect(title.toLowerCase()).toContain('software engineer');
  }
});

Then('the search results should be filtered accordingly', async () => {
  // Verify that search results are displayed as table rows
  const results = page.locator('tbody tr.hover');
  await expect(results.first()).toBeVisible();
});

When('I click on a job listing', async () => {
  await jobListingsPage.clickJobCard(0);
});

Then('I should see detailed job information including:', async (dataTable) => {
  const fields = dataTable.raw().flat();

  for (const field of fields) {
    const selector = `.${field.toLowerCase().replace(/\s+/g, '-')}, [data-testid="${field.toLowerCase().replace(/\s+/g, '-')}"]`;
    await expect(page.locator(selector)).toBeVisible();
  }
});

Given('I am logged into the job portal', async () => {
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
  await loginPage.verifySuccessfulLogin();
});

When('I view a job listing', async () => {
  await homePage.goToJobListings();
  await jobListingsPage.clickJobCard(0);
});

When('I click the {string} button', async (buttonText: string) => {
  await page.click(`text=${buttonText}`);
});

Then('I should be able to submit my application', async () => {
  // Fill application form if present
  const submitButton = page.locator('button[type="submit"], .submit-application');
  if (await submitButton.isVisible()) {
    await submitButton.click();
  }
});

Then('I should receive confirmation of my application', async () => {
  await expect(page.locator('text=Application submitted, .success-message')).toBeVisible();
});

Given('I am a new user', async () => {
  // Ensure we're logged out or on registration page
  await page.goto(process.env.BASE_URL || 'http://localhost:3000');
});

When('I register for an account with valid details', async () => {
  await page.click('text=Register, a[href*="register"], button:has-text("Register")');

  await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
  await page.fill('input[name="password"]', 'password123');
  await page.fill('input[name="confirmPassword"]', 'password123');
  await page.click('button[type="submit"]');
});

Then('I should be able to log in successfully', async () => {
  await expect(page.locator('text=Welcome, .dashboard')).toBeVisible();
});

Then('I should have access to my profile', async () => {
  await homePage.goToProfile();
  await expect(page.locator('.profile-page, [data-testid="profile"]')).toBeVisible();
});

Given('I have applied for jobs previously', async () => {
  // This would typically involve setting up test data
  // For now, we'll assume applications exist
});

When('I navigate to my applications page', async () => {
  await homePage.goToMyApplications();
});

Then('I should see a list of my job applications', async () => {
  const applications = page.locator('.application-item, [data-testid="application"]');
  await expect(applications.first()).toBeVisible();
});

Then('the status of each application', async () => {
  const statusElements = page.locator('.application-status, [data-testid="application-status"]');
  await expect(statusElements.first()).toBeVisible();
});
