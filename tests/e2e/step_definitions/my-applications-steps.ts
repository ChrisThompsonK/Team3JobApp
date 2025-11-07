import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { MyApplicationsPage } from '../pages/MyApplicationsPage';
import type { CucumberWorld } from '../support/world';

When('I click the My Applications button', async function (this: CucumberWorld) {
  this.myApplicationsPage = new MyApplicationsPage(this.page!);
  await this.myApplicationsPage.clickMyApplicationsButton();
});

Then('I should see the applications page', async function (this: CucumberWorld) {
  await expect(this.page!).toHaveURL(/\/my-applications/);
});

When('I click the back to home button', async function (this: CucumberWorld) {
  await this.myApplicationsPage!.clickBackToHomeButton();
});

When('I click the Kainos logo', async function (this: CucumberWorld) {
  await this.myApplicationsPage!.clickKainosLogo();
});

Then('I should be on the home page', async function (this: CucumberWorld) {
  await expect(this.page!).toHaveURL(/\/$/);
});
