import fs from 'fs';
import path from 'path';
import type { File, Task } from 'vitest';
import type { Reporter } from 'vitest/reporters';

interface VitestTestData {
  name: string;
  duration: number;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
  file?: string;
}

export default class CustomVitestReporter implements Reporter {
  private testData: VitestTestData[] = [];
  private startTime = Date.now();

  onTestEnd(file: File, task: Task): void {
    const status =
      task.result?.state === 'pass' ? 'pass' : task.result?.state === 'fail' ? 'fail' : 'skip';

    this.testData.push({
      name: task.name,
      duration: (task as any).duration || 0,
      status,
      error: task.result?.errors?.[0]?.message || (task.result as any)?.error?.message,
      file: file.filepath,
    });
  }

  onFinished(): void | Promise<void> {
    const reportDir = path.join(process.cwd(), 'vitest-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const duration = Date.now() - this.startTime;
    const timestamp = new Date().toISOString();
    const reportPath = path.join(
      reportDir,
      `vitest-report-${timestamp.replace(/[:.]/g, '-')}.json`
    );

    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp,
          tests: this.testData,
          summary: {
            total: this.testData.length,
            passed: this.testData.filter((t) => t.status === 'pass').length,
            failed: this.testData.filter((t) => t.status === 'fail').length,
            skipped: this.testData.filter((t) => t.status === 'skip').length,
            duration: duration,
          },
        },
        null,
        2
      )
    );

    console.log(`✅ Vitest report saved to ${reportPath}`);
  }
}
