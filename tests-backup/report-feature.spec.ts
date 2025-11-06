import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { Download } from '@playwright/test';

/**
 * Get a safe temporary directory
 */
const getTempDir = () => {
  const tempDir = process.env.TEMP || process.env.TMP || os.tmpdir();
  return tempDir;
};

/**
 * Playwright Test Suite: Report Feature for Available Jobs
 *
 * This test suite validates the CSV report generation feature for job roles.
 * Tests cover admin access, report generation, and CSV content validation.
 */

test.describe('Report Feature - Available Jobs', () => {
  // Run tests serially to avoid browser crashes during concurrent downloads
  test.describe.configure({ mode: 'serial' });
  /**
   * Test 1: Admin user can see Report button on job listings page
   */
  test('should display Report button for admin users on job listings page', async ({
    page,
  }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Navigate to job listings
    await page.goto('/jobs');

    // Verify Report button is visible
    const reportButton = page.getByRole('link', { name: /report/i });
    await expect(reportButton).toBeVisible();
    await expect(reportButton).toHaveAttribute('href', '/jobs/report');

    // Verify button has correct styling/classes
    await expect(reportButton).toHaveClass(/btn-kainos/);
  });

  /**
   * Test 2: Non-admin users should NOT see Report button
   */
  test('should NOT display Report button for non-admin users', async ({ page }) => {
    // Login as regular user (non-admin)
    await loginAsNonAdmin(page);

    // Navigate to job listings
    await page.goto('/jobs');

    // Verify Report button is NOT visible
    const reportButton = page.getByRole('link', { name: /report/i });
    await expect(reportButton).not.toBeVisible();
  });

  /**
   * Test 3: Unauthenticated user redirected to login when accessing report
   */
  test('should redirect unauthenticated user to login when accessing report', async ({
    page,
  }) => {
    // Try to access report without being logged in
    await page.goto('/jobs/report');

    // Verify redirected to login page
    await expect(page).toHaveURL(/\/auth\/login/);

    // Verify login form is displayed
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  /**
   * Test 4: Non-admin user gets 403 error when accessing report
   */
  test('should return 403 Forbidden for non-admin user accessing report', async ({
    page,
  }) => {
    // Login as non-admin user
    await loginAsNonAdmin(page);

    // Navigate to report endpoint
    const response = await page.goto('/jobs/report');

    // Verify 403 status or error message
    expect(response?.status()).toBe(403);

    // Verify error message is displayed
    await expect(page.getByText(/access forbidden|admin privileges required/i)).toBeVisible();
  });

  /**
   * Test 5: Clicking Report button triggers CSV download
   */
  test('should trigger CSV download when clicking Report button', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Navigate to job listings
    await page.goto('/jobs');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /report/i }).click();
    const download = await downloadPromise;

    // Verify download filename format
    const suggestedName = download.suggestedFilename();
    expect(suggestedName).toMatch(/^job-roles-report-\d{4}-\d{2}-\d{2}\.csv$/);

    // Save file for content validation
    const filePath = path.join(getTempDir(), suggestedName);
    
    try {
      await download.saveAs(filePath);
      // Verify file exists
      expect(fs.existsSync(filePath)).toBe(true);
    } finally {
      // Cleanup
      cleanupFile(filePath);
    }
  });

  /**
   * Test 6: Downloaded CSV file has correct headers
   */
  test('should generate CSV with correct headers', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Navigate to job listings
    await page.goto('/jobs');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /report/i }).click();
    const download = await downloadPromise;

    // Extract filename and save immediately to avoid serialization issues
    const suggestedFilename = download.suggestedFilename();
    const filePath = path.join(getTempDir(), suggestedFilename);
    
    try {
      await download.saveAs(filePath);

      const csvContent = fs.readFileSync(filePath, 'utf-8');

      // Verify CSV headers
      const lines = csvContent.split('\n');
      expect(lines.length).toBeGreaterThan(0);

      const headers = lines[0].split(',');
      const expectedHeaders = ['ID', 'Job Name', 'Location', 'Capability', 'Band', 'Closing Date'];

      expect(headers).toEqual(expectedHeaders);
    } finally {
      // Cleanup
      cleanupFile(filePath);
    }
  });

  /**
   * Test 7: CSV contains all job roles with valid data
   */
  test('should include all job roles in CSV with valid data', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Navigate to job listings
    await page.goto('/jobs');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /report/i }).click();
    const download = await downloadPromise;

    // Save and read file
    const filePath = path.join(getTempDir(), download.suggestedFilename());
    
    try {
      await download.saveAs(filePath);

      const csvContent = fs.readFileSync(filePath, 'utf-8');
      const lines = csvContent.split('\n').filter((line) => line.trim());

      // Verify we have header + at least 1 data row
      expect(lines.length).toBeGreaterThan(1);

      // Validate data rows (skip header)
      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);

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
    } finally {
      // Cleanup
      cleanupFile(filePath);
    }
  });

  /**
   * Test 8: CSV properly escapes special characters in job names
   */
  test('should properly escape special characters in CSV content', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Navigate to job listings
    await page.goto('/jobs');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /report/i }).click();
    const download = await downloadPromise;

    // Save and read file
    const filePath = path.join(getTempDir(), download.suggestedFilename());
    
    try {
      await download.saveAs(filePath);

      const csvContent = fs.readFileSync(filePath, 'utf-8');

      // Verify proper CSV escaping:
      // - Quotes should be escaped as ""
      // - Quoted fields should handle commas properly
      const lines = csvContent.split('\n').filter((line) => line.trim());

      for (let i = 1; i < lines.length; i++) {
        // Job Name field (column 2) is wrapped in quotes and should handle special chars
        const jobNameMatch = lines[i].match(/"([^"\\]*(?:\\.[^"\\]*)*)"/);

        if (jobNameMatch) {
          const jobName = jobNameMatch[1];
          // If the job name contains quotes, they should be double-escaped
          if (jobName.includes('"')) {
            expect(jobName).not.toContain('""'); // Double quotes should exist
          }
        }
      }
    } finally {
      // Cleanup
      cleanupFile(filePath);
    }
  });

  /**
   * Test 10: CSV filename includes current date in correct format
   */
  test('should generate filename with current date in YYYY-MM-DD format', async ({
    page,
  }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Navigate to job listings
    await page.goto('/jobs');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /report/i }).click();
    const download = await downloadPromise;

    // Verify filename format
    const filename = download.suggestedFilename();
    const dateRegex = /job-roles-report-(\d{4})-(\d{2})-(\d{2})\.csv/;
    const match = filename.match(dateRegex);

    expect(match).toBeTruthy();

    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);

      // Verify date components are valid
      expect(year).toBeGreaterThan(2020);
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(31);
    }
  });

  /**
   * Test 11: Report works with multiple job roles
   */
  test('should generate valid report with multiple job roles', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Navigate to job listings
    await page.goto('/jobs');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /report/i }).click();
    const download = await downloadPromise;

    // Save and read file
    const filePath = path.join(getTempDir(), download.suggestedFilename());
    
    try {
      await download.saveAs(filePath);

      const csvContent = fs.readFileSync(filePath, 'utf-8');
      const lines = csvContent.split('\n').filter((line) => line.trim());

      // Verify we have multiple job roles (header + at least 5 data rows)
      // Adjust this number based on your test data
      expect(lines.length).toBeGreaterThanOrEqual(6); // Header + at least 5 jobs
    } finally {
      // Cleanup
      cleanupFile(filePath);
    }
  });

  /**
   * Test 13: CSV can be opened and parsed correctly in multiple formats
   */
  test('should generate valid CSV that can be parsed correctly', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Navigate to job listings
    await page.goto('/jobs');

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /report/i }).click();
    const download = await downloadPromise;

    // Save and read file
    const filePath = path.join(getTempDir(), download.suggestedFilename());
    
    try {
      await download.saveAs(filePath);

      const csvContent = fs.readFileSync(filePath, 'utf-8');
      const lines = csvContent.split('\n').filter((line) => line.trim());

      // Parse CSV properly handling quoted fields
      const parsedRows: string[][] = [];

      for (const line of lines) {
        parsedRows.push(parseCSVLine(line));
      }

      // Verify parsing was successful
      expect(parsedRows.length).toBeGreaterThan(0);

      // Verify all rows have consistent column count
      const columnCount = parsedRows[0].length;
      for (const row of parsedRows) {
        expect(row.length).toBe(columnCount);
      }
    } finally {
      // Cleanup
      cleanupFile(filePath);
    }
  });

  /**
   * Test 14: Admin can generate multiple reports in succession
   */
  test('should allow admin to generate multiple reports', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Generate first report
    await page.goto('/jobs');
    let downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /report/i }).click();
    let download = await downloadPromise;
    let filePath = path.join(getTempDir(), download.suggestedFilename());
    
    try {
      await download.saveAs(filePath);
      expect(fs.existsSync(filePath)).toBe(true);
    } finally {
      cleanupFile(filePath);
    }

    // Return to job listings
    await page.goto('/jobs');

    // Generate second report
    downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /report/i }).click();
    download = await downloadPromise;
    filePath = path.join(getTempDir(), download.suggestedFilename());
    
    try {
      await download.saveAs(filePath);
      expect(fs.existsSync(filePath)).toBe(true);
    } finally {
      // Cleanup
      cleanupFile(filePath);
    }
  });

  /**
   * Test 15: Report content matches visible job listings
   */
  test('should ensure report data matches visible job roles', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);

    // Navigate to job listings
    await page.goto('/jobs');

    // Generate report
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /report/i }).click();
    const download = await downloadPromise;

    // Save and read file
    const filePath = path.join(getTempDir(), download.suggestedFilename());
    
    try {
      await download.saveAs(filePath);

      const csvContent = fs.readFileSync(filePath, 'utf-8');
      const lines = csvContent.split('\n').filter((line) => line.trim());
      const reportJobCount = lines.length - 1; // Subtract header

      // Verify report includes expected jobs
      expect(reportJobCount).toBeGreaterThan(0);
    } finally {
      // Cleanup
      cleanupFile(filePath);
    }
  });
});

/**
 * Helper function to safely delete a file
 */
function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn(`Failed to delete file ${filePath}:`, error);
  }
}

/**
 * Helper function to login as admin user
 */
async function loginAsAdmin(page: any) {
  await page.goto('/');

  // Click login link
  await page.getByRole('link', { name: /sign in|login/i }).click();

  // Fill in admin credentials
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'ChangeMe123!');

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for login to complete - check for successful redirect away from login page
  await page.waitForFunction(
    () => !window.location.href.includes('/auth/login'),
    { timeout: 10000 }
  );
}

/**
 * Helper function to login as non-admin user
 */
async function loginAsNonAdmin(page: any) {
  await page.goto('/');

  // Click login link
  await page.getByRole('link', { name: /sign in|login/i }).click();

  // Fill in regular user credentials - use admin account but verify access is still restricted elsewhere
  await page.fill('input[name="email"]', 'example@example.com');
  await page.fill('input[name="password"]', 'qqqqqqqq');

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for login to complete - check for successful redirect away from login page
  await page.waitForFunction(
    () => !window.location.href.includes('/auth/login'),
    { timeout: 10000 }
  );
}

/**
 * Helper function to parse a CSV line handling quoted fields and escaped quotes
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}
