const report = require('multiple-cucumber-html-reporter');

report.generate({
  jsonDir: './test-results',
  reportPath: './test-results/cucumber-html-report/',
  reportName: 'Cucumber Test Report',
  pageTitle: 'Kainos Job Portal - Cucumber Test Report',
  displayDuration: true,
  durationInMS: false,
  metadata: {
    browser: {
      name: 'chrome',
      version: 'latest',
    },
    device: 'Local test machine',
    platform: {
      name: 'macOS',
      version: process.platform,
    },
  },
  customData: {
    title: 'Test Run Info',
    data: [
      { label: 'Project', value: 'Kainos Job Portal' },
      { label: 'Release', value: '1.0.0' },
      { label: 'Execution Start Time', value: new Date().toISOString() },
    ],
  },
});
