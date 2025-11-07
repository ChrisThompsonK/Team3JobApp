import { Then, When } from '@cucumber/cucumber';
import { LoginPage } from '../pages/LoginPage';
import type { CucumberWorld } from '../support/world';

When('I log in as a regular user', async function (this: CucumberWorld) {
  if (!this.page) throw new Error('Page not initialized');
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.loginAsRegularUser();
});

When('I log in as an admin user', async function (this: CucumberWorld) {
  if (!this.page) throw new Error('Page not initialized');
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.loginAsAdmin();
});

Then('I should be redirected away from the login page', async function (this: CucumberWorld) {
  if (!this.loginPage) throw new Error('LoginPage not initialized');
  await this.loginPage.isNotOnLoginPage();
});
