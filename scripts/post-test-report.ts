/**
 * Post-Test Report Hook
 *
 * This module provides utilities to generate test reports after any test run.
 * Can be imported and used in test setup files or CI/CD scripts.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ReportGeneratorOptions {
  outputDir?: string;
  includeScreenshots?: boolean;
  includeVideos?: boolean;
  includeLogs?: boolean;
}

const DEFAULT_OPTIONS: ReportGeneratorOptions = {
  outputDir: 'test-reports',
  includeScreenshots: true,
  includeVideos: true,
  includeLogs: true,
};

/**
 * Collect test artifacts from all test runners
 */
export async function collectTestArtifacts(projectRoot: string = process.cwd()): Promise<{
  vitest: any;
  playwright: any;
  cucumber: any;
}> {
  const artifacts = {
    vitest: null as any,
    playwright: null as any,
    cucumber: null as any,
  };

  // Collect Vitest results
  const vitestReportPath = path.join(projectRoot, 'vitest-report.json');
  if (fs.existsSync(vitestReportPath)) {
    try {
      artifacts.vitest = JSON.parse(fs.readFileSync(vitestReportPath, 'utf-8'));
    } catch (error) {
      console.warn('Failed to parse Vitest report:', error);
    }
  }

  // Collect Playwright results
  const playwrightReportPath = path.join(projectRoot, 'playwright-report/results.json');
  if (fs.existsSync(playwrightReportPath)) {
    try {
      artifacts.playwright = JSON.parse(fs.readFileSync(playwrightReportPath, 'utf-8'));
    } catch (error) {
      console.warn('Failed to parse Playwright report:', error);
    }
  }

  // Collect Cucumber results
  const cucumberReportPath = path.join(projectRoot, 'cucumber-report.json');
  if (fs.existsSync(cucumberReportPath)) {
    try {
      artifacts.cucumber = JSON.parse(fs.readFileSync(cucumberReportPath, 'utf-8'));
    } catch (error) {
      console.warn('Failed to parse Cucumber report:', error);
    }
  }

  return artifacts;
}

/**
 * Generate a test summary for console output
 */
export function generateConsoleSummary(artifacts: {
  vitest: any;
  playwright: any;
  cucumber: any;
}): string {
  const lines: string[] = [];

  lines.push('\n📋 TEST EXECUTION SUMMARY');
  lines.push('═══════════════════════════════════');

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  if (artifacts.vitest?.summary) {
    const { total, passed, failed, skipped } = artifacts.vitest.summary;
    lines.push(`\n🧪 Vitest (Unit Tests):`);
    lines.push(`   Total: ${total} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);
    totalTests += total;
    totalPassed += passed;
    totalFailed += failed;
    totalSkipped += skipped;
  }

  if (artifacts.playwright?.stats) {
    const stats = artifacts.playwright.stats;
    const total = stats.expected;
    const passed = stats.expected - stats.failed - stats.flaky;
    const failed = stats.failed;
    lines.push(`\n🎭 Playwright (UI/E2E Tests):`);
    lines.push(`   Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    totalTests += total;
    totalPassed += passed;
    totalFailed += failed;
  }

  if (artifacts.cucumber && Array.isArray(artifacts.cucumber)) {
    let cucumberTotal = 0;
    let cucumberPassed = 0;
    let cucumberFailed = 0;
    let cucumberSkipped = 0;

    artifacts.cucumber.forEach((feature: any) => {
      feature.elements?.forEach((scenario: any) => {
        cucumberTotal++;
        const failed = scenario.steps?.some((s: any) => s.result?.status === 'failed');
        const skipped = scenario.steps?.some((s: any) => s.result?.status === 'skipped');

        if (failed) {
          cucumberFailed++;
        } else if (skipped) {
          cucumberSkipped++;
        } else {
          cucumberPassed++;
        }
      });
    });

    lines.push(`\n🥒 Cucumber (BDD Tests):`);
    lines.push(
      `   Total: ${cucumberTotal} | Passed: ${cucumberPassed} | Failed: ${cucumberFailed} | Skipped: ${cucumberSkipped}`
    );
    totalTests += cucumberTotal;
    totalPassed += cucumberPassed;
    totalFailed += cucumberFailed;
    totalSkipped += cucumberSkipped;
  }

  lines.push('\n─────────────────────────────────────');
  lines.push(`📊 COMBINED RESULTS:`);
  lines.push(
    `   Total: ${totalTests} | Passed: ${totalPassed} | Failed: ${totalFailed} | Skipped: ${totalSkipped}`
  );

  const passRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 100;
  lines.push(`   Pass Rate: ${passRate}%`);

  if (totalFailed === 0) {
    lines.push(`\n✅ ALL TESTS PASSED!`);
  } else {
    lines.push(`\n❌ ${totalFailed} test(s) failed. See report for details.`);
  }

  lines.push('═══════════════════════════════════\n');

  return lines.join('\n');
}

/**
 * Export results to CSV format
 */
export function exportResultsToCSV(
  artifacts: {
    vitest: any;
    playwright: any;
    cucumber: any;
  },
  outputPath: string = 'test-results.csv'
): void {
  const rows: string[] = [];
  rows.push('Framework,Test Name,Status,Duration (ms),Error');

  // Export Vitest results
  if (artifacts.vitest?.tests) {
    artifacts.vitest.tests.forEach((test: any) => {
      const status =
        test.status === 'pass' ? 'PASSED' : test.status === 'fail' ? 'FAILED' : 'SKIPPED';
      const error = test.error ? `"${test.error.replace(/"/g, '""')}"` : '';
      rows.push(`Vitest,"${test.name.replace(/"/g, '""')}",${status},${test.duration},${error}`);
    });
  }

  // Export Playwright results
  if (artifacts.playwright?.tests) {
    artifacts.playwright.tests.forEach((test: any) => {
      const status =
        test.status === 'passed' ? 'PASSED' : test.status === 'failed' ? 'FAILED' : 'SKIPPED';
      const error = test.error ? `"${test.error.message?.replace(/"/g, '""') || ''}"` : '';
      rows.push(
        `Playwright,"${test.title.replace(/"/g, '""')}",${status},${test.duration},${error}`
      );
    });
  }

  // Export Cucumber results
  if (artifacts.cucumber && Array.isArray(artifacts.cucumber)) {
    artifacts.cucumber.forEach((feature: any) => {
      feature.elements?.forEach((scenario: any) => {
        const stepDuration =
          scenario.steps?.reduce((sum: number, s: any) => sum + (s.result?.duration || 0), 0) || 0;
        const failed = scenario.steps?.some((s: any) => s.result?.status === 'failed');
        const status = failed ? 'FAILED' : 'PASSED';
        const errorMsg = failed
          ? scenario.steps
              ?.find((s: any) => s.result?.status === 'failed')
              ?.result?.error_message?.replace(/"/g, '""') || ''
          : '';
        const error = errorMsg ? `"${errorMsg}"` : '';
        const scenarioName = `${feature.name} - ${scenario.name}`.replace(/"/g, '""');

        rows.push(`Cucumber,"${scenarioName}",${status},${stepDuration},${error}`);
      });
    });
  }

  fs.writeFileSync(outputPath, rows.join('\n'));
  console.log(`Results exported to ${outputPath}`);
}

/**
 * Main function to generate reports after tests
 */
export async function generatePostTestReport(options: ReportGeneratorOptions = {}): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const projectRoot = process.cwd();

  console.log('🔄 Collecting test artifacts...');
  const artifacts = await collectTestArtifacts(projectRoot);

  console.log('📊 Generating summary...');
  const summary = generateConsoleSummary(artifacts);
  console.log(summary);

  // Export to CSV
  const csvPath = path.join(opts.outputDir!, 'test-results.csv');
  console.log('💾 Exporting to CSV...');
  exportResultsToCSV(artifacts, csvPath);

  console.log(`\nReports available in: ${opts.outputDir}/`);
  console.log('   - test-report-*.html (Interactive HTML report)');
  console.log('   - test-report-*.json (Raw JSON data)');
  console.log('   - test-results.csv (CSV export)');
}

// Run if executed directly
const currentFile = process.argv[1];
if (import.meta.url.endsWith(currentFile)) {
  generatePostTestReport().catch((error) => {
    console.error('Error generating report:', error);
    process.exit(1);
  });
}
