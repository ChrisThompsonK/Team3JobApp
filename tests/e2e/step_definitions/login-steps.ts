import { Then, When } from '@cucumber/cucumber';
import { LoginPage } from '../pages/LoginPage';
import type { CucumberWorld } from '../support/world';

When('I log in as a regular user', async function (this: CucumberWorld) {
  this.loginPage = new LoginPage(this.page!);
  await this.loginPage.loginAsRegularUser();
});

When('I log in as an admin user', async function (this: CucumberWorld) {
  this.loginPage = new LoginPage(this.page!);
  await this.loginPage.loginAsAdmin();
});

Then('I should be redirected away from the login page', async function (this: CucumberWorld) {
  await this.loginPage?.isNotOnLoginPage();
});
