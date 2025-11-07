import { World, setWorldConstructor, IWorldOptions } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import type { LoginPage } from '../pages/LoginPage';
import type { MyApplicationsPage } from '../pages/MyApplicationsPage';
import type { JobListingsPage } from '../pages/JobListingsPage';
import type { ReportPage } from '../pages/ReportPage';

export class CucumberWorld extends World {
  public browser: Browser | null = null;
  public context: BrowserContext | null = null;
  public page: Page | null = null;
  public loginPage: LoginPage | null = null;
  public myApplicationsPage: MyApplicationsPage | null = null;
  public jobListingsPage: JobListingsPage | null = null;
  public reportPage: ReportPage | null = null;
}

setWorldConstructor(CucumberWorld);
