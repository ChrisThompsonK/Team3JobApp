#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enhanced Test Report Generator for Playwright Tests
 *
 * This script generates comprehensive test reports that include:
 * - Test outcomes and statistics
 * - Traceability information
 * - Diagnostics and debugging data
 * - Stakeholder-friendly PDF reports
 */

class TestReportGenerator {
  constructor() {
    this.testResultsDir = path.join(__dirname, 'test-results');
    this.playwrightReportDir = path.join(__dirname, 'playwright-report');
    this.outputDir = path.join(__dirname, 'test-reports');
  }

  async generateReport() {
    console.log('🔍 Generating comprehensive test report...');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Read test results
    const results = this.readTestResults();
    if (!results) {
      console.error('❌ No test results found. Please run tests first.');
      return;
    }

    // Generate enhanced HTML report
    await this.generateEnhancedHTMLReport(results);

    // Generate summary JSON
    this.generateSummaryJSON(results);

    // Generate PDF report (if requested)
    if (process.env.GENERATE_PDF === 'true') {
      await this.generatePDFReport(results);
    }

    console.log('✅ Test report generation completed!');
    console.log(`📊 Report available at: ${path.join(this.outputDir, 'index.html')}`);
  }

  readTestResults() {
    // Try to read Playwright results
    const jsonResultsPath = path.join(this.testResultsDir, 'results.json');
    const xmlResultsPath = path.join(this.testResultsDir, 'results.xml');

    let results = null;

    if (fs.existsSync(jsonResultsPath)) {
      try {
        results = JSON.parse(fs.readFileSync(jsonResultsPath, 'utf8'));
      } catch (error) {
        console.warn('⚠️  Could not parse JSON results:', error.message);
      }
    }

    // If JSON parsing failed, try to parse XML
    if (!results && fs.existsSync(xmlResultsPath)) {
      results = this.parseXMLResults(xmlResultsPath);
    }

    return results;
  }

  parseXMLResults(xmlPath) {
    // Simple XML parser for JUnit results
    const xmlContent = fs.readFileSync(xmlPath, 'utf8');

    // Extract basic information from XML
    const testSuiteMatch = xmlContent.match(
      /<testsuite[^>]*tests="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"[^>]*time="([^"]+)"/
    );
    if (!testSuiteMatch) return null;

    const [, total, failures, errors, time] = testSuiteMatch;

    return {
      summary: {
        total: parseInt(total, 10),
        passed: parseInt(total, 10) - parseInt(failures, 10) - parseInt(errors, 10),
        failed: parseInt(failures, 10),
        errors: parseInt(errors, 10),
        duration: parseFloat(time) * 1000, // Convert to milliseconds
        timestamp: new Date().toISOString(),
      },
      tests: [], // Would need more complex XML parsing for individual tests
    };
  }

  async generateEnhancedHTMLReport(results) {
    const reportPath = path.join(this.outputDir, 'index.html');

    // Calculate statistics
    const stats = this.calculateStatistics(results);

    // Generate HTML content
    const htmlContent = this.generateHTMLContent(stats, results);

    fs.writeFileSync(reportPath, htmlContent);
    console.log(`📄 Enhanced HTML report generated: ${reportPath}`);
  }

  calculateStatistics(results) {
    if (!results || !results.summary) {
      return {
        total: 0,
        passed: 0,
        failed: 0,
        errors: 0,
        skipped: 0,
        duration: 0,
        passRate: 0,
        timestamp: new Date().toISOString(),
      };
    }

    const { total, passed, failed, errors, duration, timestamp } = results.summary;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;

    return {
      total,
      passed,
      failed,
      errors,
      skipped: total - passed - failed - errors,
      duration,
      passRate,
      timestamp: timestamp || new Date().toISOString(),
    };
  }

  generateHTMLContent(stats, _results) {
    const statusColor = stats.failed > 0 || stats.errors > 0 ? '#dc3545' : '#28a745';
    const statusText = stats.failed > 0 || stats.errors > 0 ? 'FAILED' : 'PASSED';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kainos Job Portal - Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            background-color: ${statusColor};
            color: white;
            border-radius: 25px;
            font-weight: bold;
            font-size: 1.2em;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }

        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .errors { color: #ffc107; }
        .skipped { color: #6c757d; }

        .details-section {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }

        .details-section h2 {
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        }

        .artifacts-list {
            list-style: none;
            padding: 0;
        }

        .artifacts-list li {
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .artifacts-list a {
            color: #667eea;
            text-decoration: none;
        }

        .artifacts-list a:hover {
            text-decoration: underline;
        }

        .traceability-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-top: 20px;
        }

        .traceability-info h3 {
            color: #495057;
            margin-bottom: 10px;
        }

        .traceability-info ul {
            margin-left: 20px;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 2em;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .stat-value {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Kainos Job Portal</h1>
            <p>Test Execution Report</p>
            <div class="status-badge">${statusText}</div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value passed">${stats.total}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value passed">${stats.passed}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value failed">${stats.failed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value errors">${stats.errors}</div>
                <div class="stat-label">Errors</div>
            </div>
            <div class="stat-card">
                <div class="stat-value skipped">${stats.skipped}</div>
                <div class="stat-label">Skipped</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.passRate}%</div>
                <div class="stat-label">Pass Rate</div>
            </div>
        </div>

        <div class="details-section">
            <h2>Test Execution Details</h2>
            <p><strong>Execution Time:</strong> ${new Date(stats.timestamp).toLocaleString()}</p>
            <p><strong>Duration:</strong> ${(stats.duration / 1000).toFixed(2)} seconds</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p><strong>Test Framework:</strong> Playwright</p>
        </div>

        <div class="details-section">
            <h2>Test Artifacts & Reports</h2>
            <ul class="artifacts-list">
                <li><a href="../playwright-report/index.html" target="_blank">📊 Playwright HTML Report</a> - Interactive test results with screenshots and traces</li>
                <li><a href="../test-results/results.json" target="_blank">📄 JSON Results</a> - Machine-readable test data</li>
                <li><a href="../test-results/results.xml" target="_blank">📋 JUnit XML Report</a> - CI/CD integration format</li>
                ${
                  fs.existsSync(path.join(this.playwrightReportDir, 'test-report.pdf'))
                    ? '<li><a href="../playwright-report/test-report.pdf" target="_blank">📕 PDF Report</a> - Stakeholder-friendly document</li>'
                    : ''
                }
            </ul>
        </div>

        <div class="details-section">
            <h2>Traceability & Diagnostics</h2>
            <div class="traceability-info">
                <h3>Test Coverage Areas</h3>
                <ul>
                    <li><strong>Authentication:</strong> Login, registration, session management</li>
                    <li><strong>Job Management:</strong> Job listings, applications, role details</li>
                    <li><strong>User Interface:</strong> Navigation, forms, responsive design</li>
                    <li><strong>API Integration:</strong> Data persistence, error handling</li>
                    <li><strong>Performance:</strong> Page load times, user interactions</li>
                </ul>
            </div>

            <div class="traceability-info">
                <h3>Debugging Information</h3>
                <ul>
                    <li><strong>Screenshots:</strong> Captured on test failures for visual debugging</li>
                    <li><strong>Traces:</strong> Playwright traces available for step-by-step execution analysis</li>
                    <li><strong>Logs:</strong> Console and network logs captured during test execution</li>
                    <li><strong>Videos:</strong> Full test execution videos for complex failure analysis</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>Report generated by Kainos Job Portal Test Framework</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
  }

  generateSummaryJSON(results) {
    const summaryPath = path.join(this.outputDir, 'summary.json');
    const summary = {
      ...this.calculateStatistics(results),
      metadata: {
        framework: 'Playwright',
        environment: process.env.NODE_ENV || 'development',
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        generatedAt: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      },
      artifacts: {
        htmlReport: '../playwright-report/index.html',
        jsonResults: '../test-results/results.json',
        xmlResults: '../test-results/results.xml',
        pdfReport: fs.existsSync(path.join(this.playwrightReportDir, 'test-report.pdf'))
          ? '../playwright-report/test-report.pdf'
          : null,
      },
    };

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📄 Summary JSON generated: ${summaryPath}`);
  }

  async generatePDFReport(_results) {
    // Note: PDF generation would require additional dependencies like puppeteer or playwright
    // For now, we'll create a placeholder and suggest using the existing PDF if available
    console.log(
      '📕 PDF report generation requires additional setup. Using existing PDF if available.'
    );

    const existingPdfPath = path.join(this.playwrightReportDir, 'test-report.pdf');
    if (fs.existsSync(existingPdfPath)) {
      const pdfDestPath = path.join(this.outputDir, 'test-report.pdf');
      fs.copyFileSync(existingPdfPath, pdfDestPath);
      console.log(`📕 PDF report copied: ${pdfDestPath}`);
    }
  }
}

// Main execution
async function main() {
  try {
    const generator = new TestReportGenerator();
    await generator.generateReport();
  } catch (error) {
    console.error('❌ Error generating test report:', error.message);
    process.exit(1);
  }
}

main();
