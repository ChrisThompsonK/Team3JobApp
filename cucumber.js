export default {
  default: {
    require: ['features/step_definitions/**/*.ts'],
    requireModule: ['tsx'],
    format: ['progress-bar', 'html:cucumber-report.html', 'json:cucumber-report.json'],
    parallel: 2,
    timeout: 30000,
  },
};
