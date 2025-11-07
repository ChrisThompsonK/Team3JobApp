export default {
  default: {
    require: ['tests/e2e/step_definitions/**/*.ts'],
    requireModule: ['tsx'],
    format: ['progress-bar', 'html:cucumber-report.html', 'json:cucumber-report.json'],
    parallel: 2,
    timeout: 30000,
    publishQuiet: true,
  },
};
