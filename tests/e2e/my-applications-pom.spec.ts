import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';

test.describe('My Applications - View Applications', () => {
  let loginPage: LoginPage;
  let myApplicationsPage: MyApplicationsPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    myApplicationsPage = new MyApplicationsPage(page);
  });

  /**
   * Test 1: Regular user can see their applications
   */
  test('should display list of applications for regular users', async () => {
    // Login as regular user
    await loginPage.loginAsRegularUser();

    // Navigate to My Applications by clicking the button
    await myApplicationsPage.clickMyApplicationsButton();
  });

  test('should return to main menu when clicking back to home button', async () => {
    // Login as regular user
    await loginPage.loginAsRegularUser();

    // Navigate to My Applications by clicking the button
    await myApplicationsPage.clickMyApplicationsButton();

    // Click back to home button
    await myApplicationsPage.clickBackToHomeButton();
  });

  test('should return to main menu when kainos logo clicked', async () => {
    // Login as regular user
    await loginPage.loginAsRegularUser();

    // Navigate to My Applications by clicking the button
    await myApplicationsPage.clickMyApplicationsButton();

    // Click Kainos logo to return to home
    await myApplicationsPage.clickKainosLogo();
  });

  test('should display the details of the correct job when view job button clicked', async () => {
    // Login as regular user
    await loginPage.loginAsRegularUser();

    // Navigate to My Applications by clicking the button
    await myApplicationsPage.clickMyApplicationsButton();

    // Click the view job button for the first application
    await myApplicationsPage.clickViewJobButton();

    // Verify that we're on a job details page by checking the URL
    await myApplicationsPage.waitForUrl(/\/jobs\/\d+\/details/);
  });
});
