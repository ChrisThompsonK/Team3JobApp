import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { JobListingsPage } from '../pages/JobListingsPage';
import type { CucumberWorld } from '../support/world';

When('I navigate to job listings', async function (this: CucumberWorld) {
  this.jobListingsPage = new JobListingsPage(this.page!);
  await this.jobListingsPage.navigateToJobListings();
});

Then('I should see the Report button', async function (this: CucumberWorld) {
  const isVisible = await this.jobListingsPage?.isReportButtonVisible();
  expect(isVisible).toBe(true);
});
