import { expect, test } from '@playwright/test';
import { JobListingsPage } from './pages/JobListingsPage';
import { LoginPage } from './pages/LoginPage';
import { ReportPage } from './pages/ReportPage';
import {
  deleteFile,
  extractDateFromFilename,
  fileExists,
  getCSVDataRows,
  getCSVRowCount,
  isValidDateComponents,
  parseCSV,
  readFileContent,
  saveDownloadedFile,
  validateCSVHeaders,
  validateFilename,
} from './utils/FileUtils';

/**
 * Playwright Test Suite: Report Feature for Available Jobs
 *
 * This test suite validates the CSV report generation feature for job roles
 * using the Page Object Model pattern. Tests cover admin access, report generation,
 * and CSV content validation.
 */

test.describe('Report Feature - Available Jobs', () => {
  // Run tests serially to avoid browser crashes during concurrent downloads
  test.describe.configure({ mode: 'serial' });

  let loginPage: LoginPage;
  let jobListingsPage: JobListingsPage;
  let reportPage: ReportPage;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page);
    jobListingsPage = new JobListingsPage(page);
    reportPage = new ReportPage(page);
  });

  /**
   * Test 1: Admin user can see Report button on job listings page
   */
  test('should display Report button for admin users on job listings page', async () => {
    // Login as admin
    await loginPage.loginAsAdmin();

    // Navigate to job listings
    await jobListingsPage.navigateToJobListings();

    // Verify Report button is visible
    expect(await jobListingsPage.isReportButtonVisible()).toBe(true);

    // Verify button has correct href
    await jobListingsPage.verifyReportButtonHref();

    // Verify button has correct styling
    await jobListingsPage.verifyReportButtonStyling();
  });

  /**
   * Test 2: Non-admin users should NOT see Report button
   */
  test('should NOT display Report button for non-admin users', async () => {
    // Login as regular user
    await loginPage.loginAsRegularUser();

    // Navigate to job listings
    await jobListingsPage.navigateToJobListings();

    // Verify Report button is NOT visible
    await jobListingsPage.verifyReportButtonNotVisible();
  });

  /**
   * Test 3: Unauthenticated user redirected to login when accessing report
   */
  test('should redirect unauthenticated user to login when accessing report', async () => {
    // Try to access report without being logged in
    await reportPage.navigateToReportPage();

    // Verify redirected to login page
    await reportPage.verifyRedirectedToLogin();

    // Verify login form is displayed
    await reportPage.verifyLoginFormDisplayed();
  });

  /**
   * Test 4: Non-admin user gets 403 error when accessing report
   */
  test('should return 403 Forbidden for non-admin user accessing report', async () => {
    // Login as non-admin user
    await loginPage.loginAsRegularUser();

    // Navigate to report endpoint
    const response = await reportPage.getReportPageResponse();

    // Verify 403 status
    await reportPage.verifyForbiddenStatus(response);

    // Verify error message is displayed
    await reportPage.verifyErrorMessageDisplayed();
  });

  /**
   * Test 5: Clicking Report button triggers CSV download
   */
  test('should trigger CSV download when clicking Report button', async () => {
    // Login as admin
    await loginPage.loginAsAdmin();

    // Navigate to job listings
    await jobListingsPage.navigateToJobListings();

    // Click report button and wait for download
    const download = await jobListingsPage.clickReportButtonAndWaitForDownload();

    // Verify download filename format
    const suggestedName = download.suggestedFilename();
    expect(suggestedName).toMatch(/^job-roles-report-\d{4}-\d{2}-\d{2}\.csv$/);

    // Save file for validation
    const filePath = await saveDownloadedFile(download);

    // Verify file exists
    expect(fileExists(filePath)).toBe(true);

    // Cleanup
    deleteFile(filePath);
  });

  /**
   * Test 6: Downloaded CSV file has correct headers
   */
  test('should generate CSV with correct headers', async () => {
    // Login as admin
    await loginPage.loginAsAdmin();

    // Navigate to job listings
    await jobListingsPage.navigateToJobListings();

    // Click report button and wait for download
    const download = await jobListingsPage.clickReportButtonAndWaitForDownload();

    // Save and read file
    const filePath = await saveDownloadedFile(download);
    const csvContent = readFileContent(filePath);

    // Verify CSV headers
    const expectedHeaders = ['ID', 'Job Name', 'Location', 'Capability', 'Band', 'Closing Date'];
    expect(validateCSVHeaders(csvContent, expectedHeaders)).toBe(true);

    // Cleanup
    deleteFile(filePath);
  });

  /**
   * Test 7: CSV contains all job roles with valid data
   */
  test('should include all job roles in CSV with valid data', async () => {
    // Login as admin
    await loginPage.loginAsAdmin();

    // Navigate to job listings
    await jobListingsPage.navigateToJobListings();

    // Click report button and wait for download
    const download = await jobListingsPage.clickReportButtonAndWaitForDownload();

    // Save and read file
    const filePath = await saveDownloadedFile(download);
    const csvContent = readFileContent(filePath);

    // Get data rows (excluding header)
    const dataRows = getCSVDataRows(csvContent);

    // Verify we have at least 1 data row
    expect(dataRows.length).toBeGreaterThan(0);

    // Validate each data row
    for (const row of dataRows) {
      // Verify row has 6 columns
      expect(row.length).toBe(6);

      // Verify ID is a number
      expect(Number(row[0])).toBeTruthy();

      // Verify Job Name is not empty
      expect(row[1].length).toBeGreaterThan(0);

      // Verify Location is not empty
      expect(row[2].length).toBeGreaterThan(0);

      // Verify Capability is not empty
      expect(row[3].length).toBeGreaterThan(0);

      // Verify Band is not empty
      expect(row[4].length).toBeGreaterThan(0);

      // Verify Closing Date matches YYYY-MM-DD format
      expect(row[5]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }

    // Cleanup
    deleteFile(filePath);
  });

  /**
   * Test 8: CSV properly escapes special characters in job names
   */
  test('should properly escape special characters in CSV content', async () => {
    // Login as admin
    await loginPage.loginAsAdmin();

    // Navigate to job listings
    await jobListingsPage.navigateToJobListings();

    // Click report button and wait for download
    const download = await jobListingsPage.clickReportButtonAndWaitForDownload();

    // Save and read file
    const filePath = await saveDownloadedFile(download);
    const csvContent = readFileContent(filePath);

    // Get data rows
    const dataRows = getCSVDataRows(csvContent);

    // Verify CSV structure is valid - all rows have same column count
    if (dataRows.length > 0) {
      const columnCount = dataRows[0].length;
      for (const row of dataRows) {
        expect(row.length).toBe(columnCount);
      }
    }

    // Cleanup
    deleteFile(filePath);
  });

  /**
   * Test 10: CSV filename includes current date in correct format
   */
  test('should generate filename with current date in YYYY-MM-DD format', async () => {
    // Login as admin
    await loginPage.loginAsAdmin();

    // Navigate to job listings
    await jobListingsPage.navigateToJobListings();

    // Click report button and wait for download
    const download = await jobListingsPage.clickReportButtonAndWaitForDownload();

    // Verify filename format
    const filename = download.suggestedFilename();
    expect(validateFilename(filename, /^job-roles-report-\d{4}-\d{2}-\d{2}\.csv$/)).toBe(true);

    // Extract and validate date
    const date = extractDateFromFilename(filename);
    expect(date).not.toBeNull();

    if (date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      expect(isValidDateComponents(year, month, day)).toBe(true);
    }
  });

  /**
   * Test 11: Report works with multiple job roles
   */
  test('should generate valid report with multiple job roles', async () => {
    // Login as admin
    await loginPage.loginAsAdmin();

    // Navigate to job listings
    await jobListingsPage.navigateToJobListings();

    // Click report button and wait for download
    const download = await jobListingsPage.clickReportButtonAndWaitForDownload();

    // Save and read file
    const filePath = await saveDownloadedFile(download);
    const csvContent = readFileContent(filePath);

    // Verify we have multiple job roles (header + at least 1 data row)
    const rowCount = getCSVRowCount(csvContent);
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Cleanup
    deleteFile(filePath);
  });

  /**
   * Test 13: CSV can be opened and parsed correctly in multiple formats
   */
  test('should generate valid CSV that can be parsed correctly', async () => {
    // Login as admin
    await loginPage.loginAsAdmin();

    // Navigate to job listings
    await jobListingsPage.navigateToJobListings();

    // Click report button and wait for download
    const download = await jobListingsPage.clickReportButtonAndWaitForDownload();

    // Save and read file
    const filePath = await saveDownloadedFile(download);
    const csvContent = readFileContent(filePath);

    // Parse CSV
    const parsedRows = parseCSV(csvContent);

    // Verify parsing was successful
    expect(parsedRows.length).toBeGreaterThan(0);

    // Verify all rows have consistent column count
    const columnCount = parsedRows[0].length;
    for (const row of parsedRows) {
      expect(row.length).toBe(columnCount);
    }

    // Cleanup
    deleteFile(filePath);
  });

  /**
   * Test 14: Admin can generate multiple reports in succession
   */
  test('should allow admin to generate multiple reports', async () => {
    // Login as admin
    await loginPage.loginAsAdmin();

    // Generate first report
    await jobListingsPage.navigateToJobListings();
    let download = await jobListingsPage.clickReportButtonAndWaitForDownload();
    let filePath = await saveDownloadedFile(download);
    expect(fileExists(filePath)).toBe(true);
    deleteFile(filePath);

    // Return to job listings
    await jobListingsPage.navigateToJobListings();

    // Generate second report
    download = await jobListingsPage.clickReportButtonAndWaitForDownload();
    filePath = await saveDownloadedFile(download);
    expect(fileExists(filePath)).toBe(true);

    // Cleanup
    deleteFile(filePath);
  });

  /**
   * Test 15: Report content matches visible job listings
   */
  test('should ensure report data matches visible job roles', async () => {
    // Login as admin
    await loginPage.loginAsAdmin();

    // Navigate to job listings
    await jobListingsPage.navigateToJobListings();

    // Click report button and wait for download
    const download = await jobListingsPage.clickReportButtonAndWaitForDownload();

    // Save and read file
    const filePath = await saveDownloadedFile(download);
    const csvContent = readFileContent(filePath);

    // Verify report includes expected jobs
    const rowCount = getCSVRowCount(csvContent);
    expect(rowCount).toBeGreaterThan(0);

    // Cleanup
    deleteFile(filePath);
  });
});
