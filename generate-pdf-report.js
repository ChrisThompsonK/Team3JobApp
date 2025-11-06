#!/usr/bin/env node

/**
 * Playwright Report PDF Generator
 *
 * This script converts the Playwright HTML report to PDF format
 * with professional formatting for better sharing and archiving.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generatePDFReport() {
  console.log('📄 Generating professional PDF report from Playwright HTML report...');

  const reportPath = join(process.cwd(), 'playwright-report', 'index.html');
  const pdfPath = join(process.cwd(), 'playwright-report', 'test-report.pdf');

  try {
    // Check if HTML report exists
    readFileSync(reportPath);
    console.log('✅ Found HTML report at:', reportPath);

    // Launch browser
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set viewport for better PDF layout
    await page.setViewportSize({ width: 1200, height: 800 });

    // Load the HTML report
    await page.goto(`file://${reportPath}`, { waitUntil: 'networkidle' });

    // Wait for content to load and expand any collapsed sections
    await page.waitForTimeout(3000);

    // Try to expand all test details for complete PDF
    try {
      await page.evaluate(() => {
        // Click on any expand/collapse buttons to show full details
        const buttons = document.querySelectorAll('button, [role="button"]');
        buttons.forEach((button) => {
          if (
            button.textContent?.includes('expand') ||
            button.textContent?.includes('show') ||
            button.getAttribute('aria-expanded') === 'false'
          ) {
            button.click();
          }
        });
      });
      await page.waitForTimeout(1000);
    } catch {
      // Ignore if expanding fails
    }

    // Generate PDF with professional formatting
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '25px',
        right: '20px',
        bottom: '25px',
        left: '20px',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 9px; font-family: Arial, sans-serif; color: #666; text-align: center; width: 100%; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          <strong>Kainos Job Portal - E2E Test Report</strong>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 8px; font-family: Arial, sans-serif; color: #666; text-align: center; width: 100%; border-top: 1px solid #ddd; padding-top: 5px;">
          <span>Generated on ${new Date().toLocaleString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}</span>
          <span style="float: right; margin-right: 20px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      preferCSSPageSize: false,
    });

    await browser.close();

    console.log('✅ Professional PDF report generated successfully!');
    console.log('📁 PDF saved to:', pdfPath);
    console.log(
      '📊 Report includes: Test outcomes, traceability, diagnostics, and professional formatting'
    );
    console.log('💼 Perfect for: Stakeholder communication, documentation, and archiving');
  } catch (error) {
    console.error('❌ Error generating PDF report:', error.message);
    console.error('💡 Make sure to run tests first with: npm run test:e2e');
    process.exit(1);
  }
}

// Run the script
generatePDFReport();
