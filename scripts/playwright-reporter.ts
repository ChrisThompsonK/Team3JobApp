import {
  type FullConfig,
  FullProject,
  type Reporter,
  type Suite,
  type TestCase,
  type TestResult,
} from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

interface ReporterTestData {
  name: string;
  duration: number;
  status: string;
  error?: string;
  file?: string;
  attachments: Array<{
    name: string;
    contentType: string;
    path?: string;
  }>;
}

class CustomTestReporter implements Reporter {
  private testData: ReporterTestData[] = [];
  private suites: Map<string, any> = new Map();

  onBegin(config: FullConfig, suite: Suite): void {
    console.log(`Starting tests in ${suite.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const testName = test.titlePath().join(' > ');

    const attachments = result.attachments.map((att) => ({
      name: att.name,
      contentType: att.contentType,
      path: att.path,
    }));

    this.testData.push({
      name: testName,
      duration: result.duration,
      status: result.status,
      error: result.status === 'failed' ? result.error?.message || 'Unknown error' : undefined,
      file: test.location?.file,
      attachments,
    });
  }

  onEnd(): void {
    const reportDir = path.join(process.cwd(), 'playwright-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const reportPath = path.join(
      reportDir,
      `playwright-report-${timestamp.replace(/[:.]/g, '-')}.json`
    );

    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp,
          tests: this.testData,
          summary: {
            total: this.testData.length,
            passed: this.testData.filter((t) => t.status === 'passed').length,
            failed: this.testData.filter((t) => t.status === 'failed').length,
            skipped: this.testData.filter((t) => t.status === 'skipped').length,
          },
        },
        null,
        2
      )
    );

    console.log(`✅ Playwright report saved to ${reportPath}`);
  }
}

export default CustomTestReporter;
