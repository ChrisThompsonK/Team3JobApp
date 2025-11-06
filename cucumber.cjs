module.exports = {
  default: {
    format: ['pretty', 'html:reports/cucumber-report.html', 'json:reports/cucumber-report.json'],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    paths: ['tests/features/**/*.feature'],
    import: ['tests/features/step-definitions/**/*.ts'],
    requireModule: ['tsx/esm'],
    worldParameters: {
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
    },
    parallel: 2,
    retry: 1,
  },
};
