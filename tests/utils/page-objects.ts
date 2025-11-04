import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Login Page
 * 
 * This class encapsulates all interactions with the login page,
 * providing a clean interface for test files.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email|username/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.loginButton = page.getByRole('button', { name: /login|sign in/i });
    this.errorMessage = page.locator('.error, .alert-error, [role="alert"]');
    this.registerLink = page.getByRole('link', { name: /register|sign up/i });
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/auth/login');
  }

  /**
   * Perform login with credentials
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Check if error message is displayed
   */
  async hasError(): Promise<boolean> {
    return (await this.errorMessage.count()) > 0;
  }

  /**
   * Get the error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.first().textContent() || '';
  }

  /**
   * Navigate to registration page
   */
  async goToRegister() {
    await this.registerLink.click();
  }
}

/**
 * Page Object Model for Job Roles List Page
 */
export class JobRolesPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly jobCards: Locator;
  readonly applyButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[type="search"], input[name*="search" i]').first();
    this.jobCards = page.locator('.job-card, [data-testid*="job"]');
    this.applyButtons = page.locator('button:has-text("Apply"), a:has-text("Apply")');
  }

  /**
   * Navigate to job roles page
   */
  async goto() {
    await this.page.goto('/job-roles');
  }

  /**
   * Search for jobs
   */
  async search(query: string) {
    await this.searchInput.fill(query);
  }

  /**
   * Get count of visible job listings
   */
  async getJobCount(): Promise<number> {
    return await this.jobCards.count();
  }

  /**
   * Click apply button for first job
   */
  async applyToFirstJob() {
    await this.applyButtons.first().click();
  }

  /**
   * Click on a specific job by index
   */
  async viewJob(index: number) {
    await this.jobCards.nth(index).click();
  }
}

/**
 * Page Object Model for Registration Page
 */
export class RegisterPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/^password/i).first();
    this.confirmPasswordInput = page.getByLabel(/confirm.*password|password.*confirm/i);
    this.registerButton = page.getByRole('button', { name: /register|sign up/i });
    this.errorMessage = page.locator('.error, .alert-error, [role="alert"]');
  }

  /**
   * Navigate to registration page
   */
  async goto() {
    await this.page.goto('/auth/register');
  }

  /**
   * Fill registration form
   */
  async register(email: string, password: string, confirmPassword?: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    if (await this.confirmPasswordInput.count() > 0) {
      await this.confirmPasswordInput.fill(confirmPassword || password);
    }
  }

  /**
   * Submit registration form
   */
  async submit() {
    await this.registerButton.click();
  }

  /**
   * Complete registration flow
   */
  async registerUser(email: string, password: string, confirmPassword?: string) {
    await this.register(email, password, confirmPassword);
    await this.submit();
  }

  /**
   * Check if error message is displayed
   */
  async hasError(): Promise<boolean> {
    return (await this.errorMessage.count()) > 0;
  }
}
