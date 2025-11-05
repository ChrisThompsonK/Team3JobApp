# 🎭 Kainos Job Portal - Test Framework

A comprehensive, TypeScript-based end-to-end testing framework built with Playwright for the Kainos Job Portal application.

## 📋 Table of Contents

- [Features](#-features)
- [Test Plan](#-test-plan)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Framework Architecture](#-framework-architecture)
- [Running Tests](#-running-tests)
- [Writing Tests](#-writing-tests)
- [Configuration](#-configuration)
- [CI/CD Integration](#-cicd-integration)
- [Troubleshooting](#-troubleshooting)

## 🚀 Features

- **Page Object Model (POM)** - Maintainable and reusable page abstractions
- **TypeScript Support** - Full type safety and IntelliSense
- **Multi-Browser Testing** - Chrome, Firefox, Safari, and mobile browsers
- **Authentication Management** - Automatic login/logout handling
- **Test Data Management** - Configurable test data and generators
- **Visual Testing** - Screenshot capture and comparison
- **Parallel Execution** - Fast test execution with proper isolation
- **Detailed Reporting** - HTML reports with traces and videos
- **CI/CD Ready** - GitHub Actions and other CI/CD platforms

## � Test Plan

The comprehensive test plan is documented in [`TEST-PLAN.md`](./TEST-PLAN.md) and includes:
- **101 test cases** organized by priority (P0-P3)
- Coverage across Authentication, Job Listings, Applications, Admin features, and Cross-functional tests
- Currently **~10% automated**, targeting **50-60% coverage**

**Key automated tests:**
- ✅ TC-AUTH-002: Login with valid credentials
- ✅ TC-JOBS-003: Search jobs by keyword
- 📋 90+ test cases ready for automation

## �📦 Prerequisites

- Node.js 18+ 
- npm or yarn
- The Kainos Job Portal application running locally

## 🔧 Installation

The framework is already set up in your project. To install Playwright browsers:

```bash
# Install Playwright browsers
npm run playwright:install

# Or install specific browsers
npx playwright install chromium firefox webkit
```

## ⚡ Quick Start

```bash
# Run all tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests with UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium

# Debug tests
npm run test:e2e:debug
```

## 🏗️ Framework Architecture

```
tests/
├── e2e/                    # Test specifications
│   ├── auth.spec.ts        # Authentication tests
│   ├── home.spec.ts        # Home page tests
│   ├── job-listings.spec.ts # Job listing tests
│   ├── examples.spec.ts    # Framework usage examples
│   └── global.setup.ts     # Global test setup
├── pages/                  # Page Object Models
│   ├── base.page.ts        # Base page class
│   ├── login.page.ts       # Login page
│   ├── home.page.ts        # Home page
│   ├── job-listings.page.ts # Job listings page  
│   └── index.ts            # Page exports
├── fixtures/               # Test fixtures and data
│   ├── auth/               # Authentication states
│   ├── data/               # Test data
│   │   └── test-data.ts    # Test data definitions
│   └── custom-fixtures.ts  # Custom Playwright fixtures
├── utils/                  # Utility functions
│   └── test-helpers.ts     # Helper functions
└── config/                 # Test configuration
    ├── global-setup.ts     # Global setup
    └── global-teardown.ts  # Global cleanup
```

## 🎯 Running Tests

### Basic Commands

```bash
# Run all tests
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Run specific test file
npx playwright test auth.spec.ts

# Run tests matching pattern
npx playwright test --grep "login"

# Run in specific browser
npx playwright test --project=firefox

# Run tests in parallel
npx playwright test --workers=4
```

### Advanced Options

```bash
# Run with debug mode
npx playwright test --debug

# Run with trace
npx playwright test --trace=on

# Run with video recording
npx playwright test --video=on

# Generate test report
npx playwright show-report

# Run specific test by line number
npx playwright test auth.spec.ts:25
```

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage, HomePage } from '../pages/index.js';
import { testUsers } from '../fixtures/data/test-data.js';

test.describe('My Test Suite', () => {
  test('should do something', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login(testUsers.user.email, testUsers.user.password);
    await loginPage.verifySuccessfulLogin();
  });
});
```

### Using Page Objects

```typescript
// Create page objects
const loginPage = new LoginPage(page);
const homePage = new HomePage(page);

// Use page methods
await loginPage.goto();
await loginPage.verifyPageLoaded();
await loginPage.loginAsAdmin();

// Chain page interactions
await homePage.goto();
await homePage.goToJobListings();
```

### Using Test Data

```typescript
import { testUsers, TestDataGenerator } from '../fixtures/data/test-data.js';

// Use predefined test data
await loginPage.login(testUsers.admin.email, testUsers.admin.password);

// Generate random test data
const randomUser = TestDataGenerator.generateRandomUser();
const randomJob = TestDataGenerator.generateRandomJobRole();
```

### Using Utilities

```typescript
import { AuthUtils, WaitUtils, ScreenshotUtils } from '../utils/test-helpers.js';

// Authentication utilities
await AuthUtils.loginAsAdmin(page);
await AuthUtils.logout(page);
const isLoggedIn = await AuthUtils.isLoggedIn(page);

// Wait utilities
await WaitUtils.waitForLoadingComplete(page);
await WaitUtils.waitForForm(page);

// Screenshot utilities
await ScreenshotUtils.takeTimestampedScreenshot(page, 'test-name');
```

## ⚙️ Configuration

### Playwright Configuration

The main configuration is in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
  ],
});
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# Application URL
BASE_URL=http://localhost:3000

# Test environment
NODE_ENV=test

# Database (if needed)
DATABASE_URL=sqlite:./test.db

# Admin credentials
ADMIN_EMAIL=admin@kainos.com
ADMIN_PASSWORD=Admin123!
```

### Test Data Configuration

Modify `tests/fixtures/data/test-data.ts` to customize test data:

```typescript
export const testUsers = {
  admin: {
    email: 'your-admin@kainos.com',
    password: 'YourAdminPassword',
    role: 'admin'
  },
  user: {
    email: 'your-user@kainos.com', 
    password: 'YourUserPassword',
    role: 'user'
  }
};
```

## 🔄 CI/CD Integration

### GitHub Actions

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright browsers
      run: npx playwright install --with-deps
      
    - name: Start application
      run: npm run dev &
      
    - name: Wait for app to be ready
      run: npx wait-on http://localhost:3000
      
    - name: Run Playwright tests
      run: npm run test:e2e
      
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

### Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed", 
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**Tests timing out:**
```bash
# Increase timeout in playwright.config.ts
timeout: 60000,
expect: { timeout: 10000 }
```

**Authentication failures:**
```bash
# Check test user credentials in test-data.ts
# Verify application is running on correct port
# Clear browser storage between tests
```

**Page not loading:**
```bash
# Verify baseURL in playwright.config.ts
# Check if webServer is configured correctly
# Ensure application dependencies are installed
```

**Flaky tests:**
```bash
# Add proper waits
await page.waitForLoadState('networkidle');

# Use expect with timeout
await expect(element).toBeVisible({ timeout: 10000 });

# Add retry logic
retries: process.env.CI ? 2 : 1
```

### Debug Mode

```bash
# Run single test in debug mode
npx playwright test auth.spec.ts --debug

# Debug specific test
npx playwright test auth.spec.ts:25 --debug

# Debug with headed browser
npx playwright test --headed --debug
```

### Trace Viewer

```bash
# Run with trace
npx playwright test --trace=on

# View trace
npx playwright show-trace trace.zip
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Test Data Management](https://playwright.dev/docs/test-fixtures)

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Add tests for new page objects
3. Update documentation for new features
4. Ensure all tests pass before submitting

## 📄 License

This test framework is part of the Kainos Job Portal project.

---

## 📞 Support

For questions or issues with the test framework:

1. Check the troubleshooting section
2. Review existing test examples
3. Consult Playwright documentation
4. Create an issue in the project repository

Happy Testing! 🎉