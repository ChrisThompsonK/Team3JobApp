import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { CucumberWorld } from './world';

setDefaultTimeout(60 * 1000);

Before(async function (this: CucumberWorld) {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  this.browser = await chromium.launch();
  this.context = await this.browser!.newContext({ baseURL });
  this.page = await this.context!.newPage();
});

After(async function (this: CucumberWorld) {
  if (this.page) await this.page.close();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();
});
