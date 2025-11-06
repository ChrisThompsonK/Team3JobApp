import { After, Before, DataTable, Given, Then, When } from '@cucumber/cucumber';
import { type Browser, type BrowserContext, chromium, expect, type Page } from '@playwright/test';

interface World {
  browser: Browser | null;
  context: BrowserContext | null;
  page: Page | null;
  baseURL: string;
}

const world: World = {
  browser: null,
  context: null,
  page: null,
  baseURL: 'http://localhost:3000',
};

Before(async () => {
  world.browser = await chromium.launch();
  world.context = await world.browser.newContext();
  world.page = await world.context.newPage();
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

// ==================== HOMEPAGE STEPS ====================

When('I navigate to the homepage', async () => {
  if (!world.page) throw new Error('Page not initialized');
  await world.page.goto(world.baseURL);
});

Then('the page title should contain {string}', async (title: string) => {
  if (!world.page) throw new Error('Page not initialized');
  await expect(world.page).toHaveTitle(new RegExp(title, 'i'));
});

Then('the main navigation should be visible', async () => {
  if (!world.page) throw new Error('Page not initialized');
  await expect(world.page.locator('nav')).toBeVisible();
});

// ==================== JOB LISTINGS STEPS ====================

When('I navigate to the job listings page', async () => {
  if (!world.page) throw new Error('Page not initialized');
  await world.page.goto(`${world.baseURL}/job-roles`);
});

Then('I should be on the job listings page', async () => {
  if (!world.page) throw new Error('Page not initialized');
  await expect(world.page).toHaveURL(/job-roles/);
});

When('I click on the first job listing', async () => {
  if (!world.page) throw new Error('Page not initialized');
  const firstJob = world.page.locator('.job-card').first();
  await firstJob.click();
});

Then('the job details page should load', async () => {
  if (!world.page) throw new Error('Page not initialized');
  await expect(world.page).toHaveURL(/job-roles\/\d+/);
});
