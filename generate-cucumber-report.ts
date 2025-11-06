#!/usr/bin/env node

/**
 * Cucumber Test Report Generator
 *
 * This script generates comprehensive test reports from Cucumber JSON output
 * with professional formatting for stakeholder communication and debugging.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CucumberFeature {
  id: string;
  name: string;
  description: string;
  line: number;
  keyword: string;
  uri: string;
  elements: CucumberScenario[];
}

interface CucumberScenario {
  id: string;
  name: string;
  description: string;
  line: number;
  keyword: string;
  type: string;
  steps: CucumberStep[];
  tags?: CucumberTag[];
}

interface CucumberStep {
  name: string;
  line: number;
  keyword: string;
  result: {
    status: 'passed' | 'failed' | 'skipped' | 'undefined';
    duration?: number;
    error_message?: string;
  };
}

interface CucumberTag {
  name: string;
  line: number;
}

interface Stats {
  features: number;
  scenarios: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    undefined: number;
    passRate: string;
  };
  steps: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    undefined: number;
    passRate: string;
  };
  duration: number;
  timestamp: string;
}

/**
 * Cucumber Test Report Generator
 *
 * This script generates comprehensive test reports from Cucumber JSON output
 * with professional formatting for stakeholder communication and debugging.
 */

class CucumberReportGenerator {
  private reportsDir: string;
  private outputDir: string;

  constructor() {
    this.reportsDir = path.join(__dirname, 'reports');
    this.outputDir = path.join(__dirname, 'test-reports');
  }

  async generateReport() {
    console.log('🥒 Generating comprehensive Cucumber test report...');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Read Cucumber results
    const results = this.readCucumberResults();
    if (!results || results.length === 0) {
      console.error('❌ No Cucumber test results found. Please run tests first.');
      console.error('💡 Run: npm run test:cucumber');
      return;
    }

    // Generate enhanced HTML report
    await this.generateEnhancedHTMLReport(results);

    // Generate summary JSON
    this.generateSummaryJSON(results);

    console.log('✅ Cucumber test report generation completed!');
    console.log(`📊 Report available at: ${path.join(this.outputDir, 'cucumber-report.html')}`);
  }

  readCucumberResults() {
    const jsonReportPath = path.join(this.reportsDir, 'cucumber-report.json');

    if (!fs.existsSync(jsonReportPath)) {
      return [];
    }

    try {
      const results = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
      return Array.isArray(results) ? results : [results];
    } catch (error) {
      console.warn('⚠️  Could not parse Cucumber JSON results:', (error as Error).message);
      return [];
    }
  }

  async generateEnhancedHTMLReport(features: CucumberFeature[]) {
    const reportPath = path.join(this.outputDir, 'cucumber-report.html');

    // Calculate statistics
    const stats = this.calculateStatistics(features);

    // Generate HTML content
    const htmlContent = this.generateHTMLContent(stats, features);

    fs.writeFileSync(reportPath, htmlContent);
    console.log(`📄 Enhanced Cucumber HTML report generated: ${reportPath}`);
  }

  calculateStatistics(features: CucumberFeature[]) {
    let totalScenarios = 0;
    let passedScenarios = 0;
    let failedScenarios = 0;
    let skippedScenarios = 0;
    let undefinedScenarios = 0;
    let totalSteps = 0;
    let passedSteps = 0;
    let failedSteps = 0;
    let skippedSteps = 0;
    let undefinedSteps = 0;
    let totalDuration = 0;

    for (const feature of features) {
      for (const scenario of feature.elements) {
        totalScenarios++;
        let scenarioPassed = true;
        let scenarioDuration = 0;

        for (const step of scenario.steps) {
          totalSteps++;
          scenarioDuration += step.result.duration || 0;

          switch (step.result.status) {
            case 'passed':
              passedSteps++;
              break;
            case 'failed':
              failedSteps++;
              scenarioPassed = false;
              break;
            case 'skipped':
              skippedSteps++;
              break;
            case 'undefined':
              undefinedSteps++;
              scenarioPassed = false;
              break;
          }
        }

        totalDuration += scenarioDuration;

        if (scenarioPassed && scenario.steps.length > 0) {
          passedScenarios++;
        } else if (scenario.steps.some((step) => step.result.status === 'failed')) {
          failedScenarios++;
        } else if (scenario.steps.some((step) => step.result.status === 'undefined')) {
          undefinedScenarios++;
        } else {
          skippedScenarios++;
        }
      }
    }

    const scenarioPassRate =
      totalScenarios > 0 ? ((passedScenarios / totalScenarios) * 100).toFixed(2) : '0.00';
    const stepPassRate = totalSteps > 0 ? ((passedSteps / totalSteps) * 100).toFixed(2) : '0.00';

    return {
      features: features.length,
      scenarios: {
        total: totalScenarios,
        passed: passedScenarios,
        failed: failedScenarios,
        skipped: skippedScenarios,
        undefined: undefinedScenarios,
        passRate: scenarioPassRate,
      },
      steps: {
        total: totalSteps,
        passed: passedSteps,
        failed: failedSteps,
        skipped: skippedSteps,
        undefined: undefinedSteps,
        passRate: stepPassRate,
      },
      duration: totalDuration,
      timestamp: new Date().toISOString(),
    };
  }

  generateHTMLContent(stats: Stats, features: CucumberFeature[]) {
    const statusColor =
      stats.scenarios.failed > 0 || stats.scenarios.undefined > 0 ? '#dc3545' : '#28a745';
    const statusText =
      stats.scenarios.failed > 0 || stats.scenarios.undefined > 0 ? 'FAILED' : 'PASSED';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kainos Job Portal - Cucumber Test Report</title>
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
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
        .skipped { color: #ffc107; }
        .undefined { color: #6c757d; }

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

        .feature {
            margin-bottom: 30px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            overflow: hidden;
        }

        .feature-header {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e9ecef;
        }

        .feature-name {
            font-size: 1.2em;
            font-weight: bold;
            color: #495057;
        }

        .feature-description {
            color: #6c757d;
            margin-top: 5px;
        }

        .scenario {
            margin-bottom: 15px;
            border-left: 4px solid #28a745;
        }

        .scenario.failed { border-left-color: #dc3545; }
        .scenario.skipped { border-left-color: #ffc107; }
        .scenario.undefined { border-left-color: #6c757d; }

        .scenario-header {
            padding: 10px 20px;
            background: #f8f9fa;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .scenario-name {
            font-weight: 500;
        }

        .scenario-status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }

        .scenario-status.passed { background: #d4edda; color: #155724; }
        .scenario-status.failed { background: #f8d7da; color: #721c24; }
        .scenario-status.skipped { background: #fff3cd; color: #856404; }
        .scenario-status.undefined { background: #e2e3e5; color: #383d41; }

        .scenario-steps {
            padding: 15px 20px;
            background: white;
            display: none;
        }

        .scenario-steps.expanded {
            display: block;
        }

        .step {
            margin-bottom: 8px;
            padding: 8px 12px;
            border-radius: 4px;
            display: flex;
            align-items: center;
        }

        .step-keyword {
            font-weight: bold;
            margin-right: 10px;
            min-width: 60px;
        }

        .step-name {
            flex: 1;
        }

        .step-status {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.8em;
            font-weight: bold;
        }

        .step.passed { background: #f8fff8; }
        .step.passed .step-status { background: #d4edda; color: #155724; }

        .step.failed { background: #fff8f8; }
        .step.failed .step-status { background: #f8d7da; color: #721c24; }

        .step.skipped { background: #fffef8; }
        .step.skipped .step-status { background: #fff3cd; color: #856404; }

        .step.undefined { background: #f8f8f8; }
        .step.undefined .step-status { background: #e2e3e5; color: #383d41; }

        .step-error {
            margin-top: 10px;
            padding: 10px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            color: #721c24;
            font-family: monospace;
            white-space: pre-wrap;
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
            <p>Cucumber BDD Test Report</p>
            <div class="status-badge">${statusText}</div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value passed">${stats.features}</div>
                <div class="stat-label">Features</div>
            </div>
            <div class="stat-card">
                <div class="stat-value passed">${stats.scenarios.total}</div>
                <div class="stat-label">Total Scenarios</div>
            </div>
            <div class="stat-card">
                <div class="stat-value passed">${stats.scenarios.passed}</div>
                <div class="stat-label">Passed Scenarios</div>
            </div>
            <div class="stat-card">
                <div class="stat-value failed">${stats.scenarios.failed}</div>
                <div class="stat-label">Failed Scenarios</div>
            </div>
            <div class="stat-card">
                <div class="stat-value skipped">${stats.scenarios.skipped}</div>
                <div class="stat-label">Skipped Scenarios</div>
            </div>
            <div class="stat-card">
                <div class="stat-value undefined">${stats.scenarios.undefined}</div>
                <div class="stat-label">Undefined Scenarios</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.scenarios.passRate}%</div>
                <div class="stat-label">Scenario Pass Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.steps.passRate}%</div>
                <div class="stat-label">Step Pass Rate</div>
            </div>
        </div>

        <div class="details-section">
            <h2>Test Execution Details</h2>
            <p><strong>Execution Time:</strong> ${new Date(stats.timestamp).toLocaleString()}</p>
            <p><strong>Duration:</strong> ${(stats.duration / 1000000).toFixed(2)} seconds</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p><strong>Test Framework:</strong> Cucumber.js with Playwright</p>
        </div>

        <div class="details-section">
            <h2>Feature Results</h2>
            ${this.generateFeatureHTML(features)}
        </div>

        <div class="footer">
            <p>Report generated by Kainos Job Portal Cucumber Test Framework</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>

    <script>
        // Toggle scenario details
        document.addEventListener('DOMContentLoaded', function() {
            const scenarioHeaders = document.querySelectorAll('.scenario-header');

            scenarioHeaders.forEach(header => {
                header.addEventListener('click', function() {
                    const steps = this.nextElementSibling;
                    steps.classList.toggle('expanded');
                });
            });
        });
    </script>
</body>
</html>`;
  }

  generateFeatureHTML(features: CucumberFeature[]): string {
    return features
      .map(
        (feature) => `
        <div class="feature">
            <div class="feature-header">
                <div class="feature-name">${feature.keyword}: ${feature.name}</div>
                <div class="feature-description">${feature.description || ''}</div>
            </div>
            ${feature.elements.map((scenario) => this.generateScenarioHTML(scenario)).join('')}
        </div>
    `
      )
      .join('');
  }

  generateScenarioHTML(scenario: CucumberScenario): string {
    const status = this.getScenarioStatus(scenario);
    const statusClass = status.toLowerCase();

    return `
        <div class="scenario ${statusClass}">
            <div class="scenario-header">
                <span class="scenario-name">${scenario.keyword}: ${scenario.name}</span>
                <span class="scenario-status ${statusClass}">${status}</span>
            </div>
            <div class="scenario-steps">
                ${scenario.steps.map((step) => this.generateStepHTML(step)).join('')}
            </div>
        </div>
    `;
  }

  generateStepHTML(step: CucumberStep): string {
    const statusClass = step.result.status;
    const duration = step.result.duration
      ? ` (${(step.result.duration / 1000000).toFixed(3)}s)`
      : '';

    return `
        <div class="step ${statusClass}">
            <span class="step-keyword">${step.keyword}</span>
            <span class="step-name">${step.name}</span>
            <span class="step-status ${statusClass}">${step.result.status}${duration}</span>
            ${step.result.error_message ? `<div class="step-error">${step.result.error_message}</div>` : ''}
        </div>
    `;
  }

  getScenarioStatus(scenario: CucumberScenario): string {
    if (scenario.steps.some((step) => step.result.status === 'failed')) {
      return 'FAILED';
    }
    if (scenario.steps.some((step) => step.result.status === 'undefined')) {
      return 'UNDEFINED';
    }
    if (scenario.steps.some((step) => step.result.status === 'skipped')) {
      return 'SKIPPED';
    }
    if (scenario.steps.every((step) => step.result.status === 'passed')) {
      return 'PASSED';
    }
    return 'UNKNOWN';
  }

  generateSummaryJSON(features: CucumberFeature[]) {
    const summaryPath = path.join(this.outputDir, 'cucumber-summary.json');
    const summary = {
      ...this.calculateStatistics(features),
      metadata: {
        framework: 'Cucumber.js',
        environment: process.env.NODE_ENV || 'development',
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        generatedAt: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      },
      features: features.map((feature) => ({
        name: feature.name,
        description: feature.description,
        scenarios: feature.elements.length,
        uri: feature.uri,
      })),
    };

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📄 Cucumber summary JSON generated: ${summaryPath}`);
  }
}

// Main execution
async function main() {
  try {
    const generator = new CucumberReportGenerator();
    await generator.generateReport();
  } catch (error) {
    console.error('❌ Error generating Cucumber test report:', (error as Error).message);
    process.exit(1);
  }
}

main();
