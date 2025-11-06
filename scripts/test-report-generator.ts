import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface TestMetadata {
  suiteeName: string;
  environment: string;
  timestamp: string;
  commitHash: string;
  branch: string;
  triggeredBy: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: string;
}

interface FailedTest {
  name: string;
  error: string;
  file?: string;
  screenshot?: string;
  stackTrace?: string;
}

interface CoverageData {
  percentage: number;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

interface TestReport {
  metadata: TestMetadata;
  summary: TestSummary;
  failedTests: FailedTest[];
  coverage?: CoverageData;
  artifacts: {
    logs: string;
    screenshots: string;
    videos: string;
    coverage: string;
  };
  generatedAt: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const reportsDir = path.join(projectRoot, 'test-reports');

/**
 * Ensure test reports directory exists
 */
function ensureReportsDir(): void {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
}

/**
 * Get git commit hash
 */
function getCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: projectRoot,
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Get current git branch
 */
function getBranch(): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: projectRoot,
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Parse Vitest coverage report
 */
function parseVitestCoverage(): CoverageData | undefined {
  try {
    const coverageFile = path.join(projectRoot, 'coverage', 'coverage-final.json');
    if (!fs.existsSync(coverageFile)) {
      return undefined;
    }

    const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    let totalStatements = 0;
    let coveredStatements = 0;
    let totalLines = 0;
    let coveredLines = 0;
    let fileCount = 0;

    Object.values(coverage as any).forEach((file: any) => {
      if (file.s) {
        Object.values(file.s).forEach((count: any) => {
          totalStatements++;
          if (count > 0) coveredStatements++;
        });
      }
      if (file.l) {
        Object.values(file.l).forEach((count: any) => {
          totalLines++;
          if (count > 0) coveredLines++;
        });
      }
      fileCount++;
    });

    const percentage = totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 0;

    return {
      percentage,
      statements: totalStatements > 0 ? Math.round((coveredStatements / totalStatements) * 100) : 0,
      branches: 0,
      functions: 0,
      lines: percentage,
    };
  } catch (error) {
    return undefined;
  }
}

/**
 * Parse Vitest JSON report
 */
function parseVitestReport(): {
  summary: TestSummary;
  failed: FailedTest[];
} {
  try {
    // Vitest doesn't output standard JSON by default, so we parse the HTML report
    const htmlFile = path.join(projectRoot, 'coverage', 'index.html');

    // For now, return defaults - we'll enhance this if Vitest JSON output is available
    return {
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: '0s',
      },
      failed: [],
    };
  } catch {
    return {
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: '0s',
      },
      failed: [],
    };
  }
}

/**
 * Parse Playwright JSON report
 */
function parsePlaywrightReport(): {
  summary: TestSummary;
  failed: FailedTest[];
} {
  try {
    const reportFile = path.join(projectRoot, 'playwright-report', 'index.json');

    if (!fs.existsSync(reportFile)) {
      return {
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: '0s',
        },
        failed: [],
      };
    }

    const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
    const suites = report.suites || [];

    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let duration = 0;
    const failedTests: FailedTest[] = [];

    const processSuite = (suite: any) => {
      if (suite.tests) {
        suite.tests.forEach((test: any) => {
          total++;
          duration += test.duration || 0;

          if (test.status === 'passed') {
            passed++;
          } else if (test.status === 'skipped') {
            skipped++;
          } else if (test.status === 'failed') {
            failed++;
            failedTests.push({
              name: test.title || 'Unknown',
              error: test.error?.message || 'Unknown error',
              file: test.file,
              screenshot: test.attachments?.find((a: any) => a.contentType?.includes('image'))
                ?.path,
              stackTrace: test.error?.stack,
            });
          }
        });
      }

      if (suite.suites) {
        suite.suites.forEach(processSuite);
      }
    };

    suites.forEach(processSuite);

    const durationSeconds = Math.round(duration / 1000);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    return {
      summary: { total, passed, failed, skipped, duration: durationStr },
      failed: failedTests,
    };
  } catch {
    return {
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: '0s',
      },
      failed: [],
    };
  }
}

/**
 * Parse Cucumber JSON report
 */
function parseCucumberReport(): {
  summary: TestSummary;
  failed: FailedTest[];
} {
  try {
    const reportFile = path.join(projectRoot, 'cucumber-report.json');

    if (!fs.existsSync(reportFile)) {
      return {
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: '0s',
        },
        failed: [],
      };
    }

    const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));

    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let duration = 0;
    const failedTests: FailedTest[] = [];

    report.forEach((feature: any) => {
      feature.elements?.forEach((scenario: any) => {
        total++;
        let scenarioFailed = false;
        let stepDuration = 0;

        scenario.steps?.forEach((step: any) => {
          stepDuration += step.result?.duration || 0;

          if (step.result?.status === 'failed') {
            scenarioFailed = true;
            failedTests.push({
              name: `${feature.name} > ${scenario.name}`,
              error: step.result?.error_message || 'Step failed',
              file: feature.uri,
            });
          }
        });

        duration += stepDuration;

        if (scenarioFailed) {
          failed++;
        } else if (scenario.steps?.some((s: any) => s.result?.status === 'skipped')) {
          skipped++;
        } else {
          passed++;
        }
      });
    });

    const durationSeconds = Math.round(duration / 1000000000); // Cucumber uses nanoseconds
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    return {
      summary: { total, passed, failed, skipped, duration: durationStr },
      failed: failedTests,
    };
  } catch {
    return {
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: '0s',
      },
      failed: [],
    };
  }
}

/**
 * Generate combined test report
 */
function generateTestReport(): void {
  ensureReportsDir();

  const now = new Date();
  const metadata: TestMetadata = {
    suiteeName: 'Job Application Portal - Full Test Suite',
    environment: process.env.TEST_ENV || 'local',
    timestamp: now.toISOString(),
    commitHash: getCommitHash(),
    branch: getBranch(),
    triggeredBy: process.env.TRIGGERED_BY || 'manual run',
  };

  // Parse individual test reports
  const vitestData = parseVitestReport();
  const playwrightData = parsePlaywrightReport();
  const cucumberData = parseCucumberReport();

  // Combine summaries
  const combinedSummary: TestSummary = {
    total: vitestData.summary.total + playwrightData.summary.total + cucumberData.summary.total,
    passed: vitestData.summary.passed + playwrightData.summary.passed + cucumberData.summary.passed,
    failed: vitestData.summary.failed + playwrightData.summary.failed + cucumberData.summary.failed,
    skipped:
      vitestData.summary.skipped + playwrightData.summary.skipped + cucumberData.summary.skipped,
    duration: `${vitestData.summary.duration} + ${playwrightData.summary.duration} + ${cucumberData.summary.duration}`,
  };

  // Combine failed tests
  const allFailedTests = [
    ...vitestData.failed.map((t) => ({
      ...t,
      framework: 'Vitest',
    })),
    ...playwrightData.failed.map((t) => ({
      ...t,
      framework: 'Playwright',
    })),
    ...cucumberData.failed.map((t) => ({
      ...t,
      framework: 'Cucumber',
    })),
  ];

  // Parse coverage
  const coverage = parseVitestCoverage();

  const report: TestReport = {
    metadata,
    summary: combinedSummary,
    failedTests: allFailedTests,
    coverage,
    artifacts: {
      logs: path.join(reportsDir, 'test.log'),
      screenshots: path.join(projectRoot, 'test-results'),
      videos: path.join(projectRoot, 'playwright-report'),
      coverage: path.join(projectRoot, 'coverage'),
    },
    generatedAt: now.toISOString(),
  };

  // Save JSON report
  const reportPath = path.join(
    reportsDir,
    `test-report-${now.toISOString().replace(/[:.]/g, '-')}.json`
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate HTML report
  generateHtmlReport(report);

  console.log(`✅ Test report generated: ${reportPath}`);
}

/**
 * Generate HTML report from test data
 */
function generateHtmlReport(report: TestReport): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - ${report.metadata.timestamp}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }

        h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }

        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 10px;
        }

        .status-badge.passed {
            background: #10b981;
            color: white;
        }

        .status-badge.failed {
            background: #ef4444;
            color: white;
        }

        .metadata {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            padding: 20px;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
        }

        .metadata-item {
            padding: 12px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }

        .metadata-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .metadata-value {
            font-size: 14px;
            font-weight: 500;
            color: #111827;
            word-break: break-all;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: white;
        }

        .summary-card {
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            color: white;
            text-align: center;
        }

        .summary-card.passed {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .summary-card.failed {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .summary-card.skipped {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .summary-card-value {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .summary-card-label {
            font-size: 14px;
            opacity: 0.9;
        }

        .section {
            padding: 30px;
            border-top: 1px solid #e5e7eb;
        }

        .section h2 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #111827;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-icon {
            font-size: 24px;
        }

        .failure-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .failure-item {
            border: 1px solid #fee2e2;
            border-radius: 8px;
            overflow: hidden;
            background: #fef2f2;
        }

        .failure-header {
            padding: 15px;
            background: #fecaca;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            color: #7f1d1d;
        }

        .failure-header:hover {
            background: #fca5a5;
        }

        .failure-content {
            display: none;
            padding: 15px;
        }

        .failure-content.expanded {
            display: block;
        }

        .failure-framework {
            display: inline-block;
            padding: 4px 8px;
            background: white;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
            color: #667eea;
        }

        .error-message {
            background: white;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 10px;
            border-left: 4px solid #ef4444;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            color: #374151;
            overflow-x: auto;
        }

        .stack-trace {
            background: #1f2937;
            color: #d1d5db;
            padding: 12px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            overflow-x: auto;
            max-height: 300px;
            overflow-y: auto;
        }

        .coverage-bar {
            display: flex;
            align-items: center;
            gap: 15px;
            margin: 15px 0;
        }

        .coverage-label {
            width: 120px;
            font-weight: 600;
            color: #374151;
        }

        .coverage-progress {
            flex: 1;
            height: 24px;
            background: #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
        }

        .coverage-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: 600;
        }

        .coverage-fill.low {
            background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
        }

        .coverage-fill.medium {
            background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
        }

        .empty-state {
            text-align: center;
            padding: 40px;
            color: #6b7280;
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }

        .artifacts {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }

        .artifact-link {
            padding: 15px;
            background: #f3f4f6;
            border-radius: 8px;
            text-decoration: none;
            color: #667eea;
            font-weight: 600;
            transition: all 0.2s;
            text-align: center;
            border: 2px solid #e5e7eb;
        }

        .artifact-link:hover {
            background: #e5e7eb;
            border-color: #667eea;
        }

        footer {
            padding: 20px;
            background: #f9fafb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
        }

        .toggle-icon::after {
            content: '▼';
            font-size: 12px;
            transition: transform 0.2s;
        }

        .failure-item.collapsed .toggle-icon::after {
            transform: rotate(-90deg);
        }

        @media (max-width: 768px) {
            header {
                padding: 20px;
            }

            h1 {
                font-size: 24px;
            }

            .summary {
                padding: 20px;
            }

            .section {
                padding: 20px;
            }

            .failure-header {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🧪 Test Execution Report</h1>
            <div class="status-badge ${report.summary.failed === 0 ? 'passed' : 'failed'}">
                ${report.summary.failed === 0 ? '✅ All Tests Passed' : '❌ Tests Failed'}
            </div>
        </header>

        <div class="metadata">
            <div class="metadata-item">
                <div class="metadata-label">Test Suite</div>
                <div class="metadata-value">${report.metadata.suiteeName}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Environment</div>
                <div class="metadata-value">${report.metadata.environment}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Date & Time</div>
                <div class="metadata-value">${new Date(report.metadata.timestamp).toLocaleString()}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Commit</div>
                <div class="metadata-value" style="font-family: monospace;">${report.metadata.commitHash}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Branch</div>
                <div class="metadata-value">${report.metadata.branch}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Triggered By</div>
                <div class="metadata-value">${report.metadata.triggeredBy}</div>
            </div>
        </div>

        <div class="summary">
            <div class="summary-card">
                <div class="summary-card-value">${report.summary.total}</div>
                <div class="summary-card-label">Total Tests</div>
            </div>
            <div class="summary-card passed">
                <div class="summary-card-value">${report.summary.passed}</div>
                <div class="summary-card-label">Passed</div>
            </div>
            <div class="summary-card failed">
                <div class="summary-card-value">${report.summary.failed}</div>
                <div class="summary-card-label">Failed</div>
            </div>
            <div class="summary-card skipped">
                <div class="summary-card-value">${report.summary.skipped}</div>
                <div class="summary-card-label">Skipped</div>
            </div>
        </div>

        ${
          report.coverage
            ? `
        <div class="section">
            <h2><span class="section-icon">📊</span>Code Coverage</h2>
            <div class="coverage-bar">
                <div class="coverage-label">Lines</div>
                <div class="coverage-progress">
                    <div class="coverage-fill ${report.coverage.lines < 50 ? 'low' : report.coverage.lines < 80 ? 'medium' : ''}" style="width: ${report.coverage.lines}%">
                        ${report.coverage.lines}%
                    </div>
                </div>
            </div>
            <div class="coverage-bar">
                <div class="coverage-label">Statements</div>
                <div class="coverage-progress">
                    <div class="coverage-fill ${report.coverage.statements < 50 ? 'low' : report.coverage.statements < 80 ? 'medium' : ''}" style="width: ${report.coverage.statements}%">
                        ${report.coverage.statements}%
                    </div>
                </div>
            </div>
        </div>
        `
            : ''
        }

        ${
          report.failedTests.length > 0
            ? `
        <div class="section">
            <h2><span class="section-icon">❌</span>Failed Tests (${report.failedTests.length})</h2>
            <div class="failure-list">
                ${report.failedTests
                  .map(
                    (test, index) => `
                    <div class="failure-item collapsed">
                        <div class="failure-header" onclick="this.parentElement.classList.toggle('collapsed'); this.parentElement.querySelector('.failure-content').classList.toggle('expanded')">
                            <div>
                                ${test.name}
                                <span class="failure-framework">${(test as any).framework || 'Unknown'}</span>
                            </div>
                            <div class="toggle-icon"></div>
                        </div>
                        <div class="failure-content">
                            <div class="error-message">${escapeHtml(test.error)}</div>
                            ${test.file ? `<div class="error-message"><strong>File:</strong> ${escapeHtml(test.file)}</div>` : ''}
                            ${test.stackTrace ? `<div class="stack-trace">${escapeHtml(test.stackTrace)}</div>` : ''}
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>
        `
            : `
        <div class="section">
            <div class="empty-state">
                <div class="empty-state-icon">🎉</div>
                <h3>All Tests Passed!</h3>
                <p>No failed tests to report</p>
            </div>
        </div>
        `
        }

        <div class="section">
            <h2><span class="section-icon">📎</span>Test Artifacts</h2>
            <div class="artifacts">
                <a href="${report.artifacts.coverage}" class="artifact-link">📊 Coverage Report</a>
                <a href="${report.artifacts.videos}" class="artifact-link">🎬 Playwright Videos</a>
                <a href="${report.artifacts.screenshots}" class="artifact-link">📸 Screenshots</a>
            </div>
        </div>

        <footer>
            Report generated on ${new Date(report.generatedAt).toLocaleString()} | Test Automation Suite v1.0
        </footer>
    </div>

    <script>
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }
    </script>
</body>
</html>`;

  const htmlPath = path.join(
    reportsDir,
    `test-report-${new Date().toISOString().split('T')[0]}.html`
  );
  fs.writeFileSync(htmlPath, html);
  console.log(`✅ HTML report generated: ${htmlPath}`);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Run the generator
generateTestReport();
