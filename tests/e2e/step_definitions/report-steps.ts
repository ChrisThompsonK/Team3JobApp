import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { JobListingsPage } from '../pages/JobListingsPage';
import { ReportPage } from '../pages/ReportPage';
import type { CucumberWorld } from '../support/world';

When('I navigate to job listings', async function (this: CucumberWorld) {
  if (!this.page) throw new Error('Page not initialized');
  this.jobListingsPage = new JobListingsPage(this.page);
  await this.jobListingsPage.navigateToJobListings();
});

Then('I should see the Report button', async function (this: CucumberWorld) {
  if (!this.jobListingsPage) throw new Error('JobListingsPage not initialized');
  const isVisible = await this.jobListingsPage.isReportButtonVisible();
  expect(isVisible).toBe(true);
});
