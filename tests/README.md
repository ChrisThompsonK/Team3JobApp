# Playwright E2E Testing Framework

This project includes a comprehensive Playwright testing framework for end-to-end testing.

## 📁 Directory Structure

```
tests/
├── e2e/                      # E2E test files
│   ├── home.spec.ts         # Home page tests
│   ├── auth.spec.ts         # Authentication tests
│   ├── job-roles.spec.ts    # Job roles functionality tests
│   ├── analytics.spec.ts    # Analytics dashboard tests
│   └── authenticated.spec.ts # Tests requiring authentication
├── fixtures/                 # Custom test fixtures
│   └── auth.fixture.ts      # Authentication fixtures
└── utils/                    # Test utilities and helpers
    ├── helpers.ts           # Page, form, navigation helpers
    └── test-data.ts         # Mock data and test data generators
```

## 🚀 Getting Started

### Install Playwright Browsers

First time setup requires installing the Playwright browsers:

```bash
npm run playwright:install
```

Or with system dependencies:

```bash
npm run playwright:install-deps
```

## 🧪 Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### Run tests on specific browsers
```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### Run mobile tests
```bash
npm run test:e2e:mobile
```

### View test report
```bash
npm run test:e2e:report
```

## 📝 Writing Tests

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should load home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Using Custom Fixtures

```typescript
import { test, expect } from '../fixtures/auth.fixture';

test('authenticated user can view profile', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/auth/profile');
  expect(authenticatedPage.url()).toContain('profile');
});
```

### Using Helper Classes

```typescript
import { test, expect } from '@playwright/test';
import { NavigationHelper, FormHelper } from '../utils/helpers';

test('should login successfully', async ({ page }) => {
  const nav = new NavigationHelper(page);
  const form = new FormHelper(page);
  
  await nav.goToLogin();
  await form.fillLoginForm('test@example.com', 'password123');
  await form.submitForm();
  
  expect(page.url()).not.toContain('login');
});
```

### Using Test Data

```typescript
import { createTestUser, mockJobRoles } from '../utils/test-data';

test('should register new user', async ({ page }) => {
  const user = createTestUser();
  
  await page.goto('/auth/register');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /register/i }).click();
});
```

## 🎯 Test Organization

### Test Suites

Tests are organized by feature:
- **home.spec.ts**: Home page and landing page tests
- **auth.spec.ts**: Login, registration, logout tests
- **job-roles.spec.ts**: Job listing, search, application tests
- **analytics.spec.ts**: Analytics dashboard tests
- **authenticated.spec.ts**: Tests requiring authentication

### Custom Fixtures

The `auth.fixture.ts` provides:
- `authenticatedPage`: Page with regular user logged in
- `adminPage`: Page with admin user logged in

### Helper Classes

Available helper classes in `helpers.ts`:
- **PageHelper**: Common page interactions
- **FormHelper**: Form filling and validation
- **NavigationHelper**: Navigation shortcuts
- **WaitHelper**: Wait utilities

## ⚙️ Configuration

Configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000` (configurable via `BASE_URL` env var)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 retries on CI, 0 locally
- **Timeout**: 30s per test, 5s per assertion
- **Screenshots**: On failure only
- **Videos**: On failure only
- **Traces**: On first retry

### Environment Variables

Create a `.env` file to customize:

```env
BASE_URL=http://localhost:3000
CI=false
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

Reports include:
- Test results with pass/fail status
- Screenshots of failures
- Videos of failed tests
- Execution traces for debugging

## 🔧 Debugging Tests

### Debug Mode
```bash
npm run test:e2e:debug
```

Opens Playwright Inspector for step-by-step debugging.

### UI Mode
```bash
npm run test:e2e:ui
```

Interactive UI for running and debugging tests.

### VS Code Debugging

Install the "Playwright Test for VSCode" extension and use the built-in test explorer.

## 📚 Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Avoid hard waits** - use `waitForLoadState` or `waitForSelector`
3. **Keep tests independent** - each test should run in isolation
4. **Use Page Object Model** for complex pages
5. **Mock external APIs** when possible
6. **Run tests in CI/CD** pipeline
7. **Keep test data separate** from test logic
8. **Use fixtures** for common setup/teardown

## 🤝 Contributing

When adding new tests:
1. Follow the existing file structure
2. Use descriptive test names
3. Add comments for complex interactions
4. Update this README if adding new patterns
5. Ensure tests pass in all browsers

## 📖 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
