# Testing Instructions

## Overview
Testing stack: Playwright (E2E), TypeScript (type safety), Gherkin/Cucumber (BDD), Vitest (unit tests).

## Test Types & Structure
- **Unit Tests** (`vitest`): Test functions/utilities in isolation
- **E2E Tests** (`playwright`): Test user workflows
- **BDD Tests** (`cucumber`): Test business requirements with Gherkin

Directory structure:
```
tests/
├── config/                 # Test config & setup
├── e2e/                    # E2E tests (.spec.ts)
├── features/               # BDD features & step definitions
├── fixtures/               # Test data
├── pages/                  # Page Object Model
└── utils/                  # Test helpers
```

## Unit Testing (Vitest)

### Setup
Configuration in `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: { globals: true, environment: 'node', setupFiles: ['./vitest.setup.ts'] }
})
```

### Writing Tests
Create `.test.ts` files:
```typescript
import { describe, it, expect } from 'vitest'
import { formatDate } from './utils'

describe('formatDate', () => {
  it('formats dates correctly', () => {
    expect(formatDate(new Date('2024-01-01'))).toBe('01/01/2024')
  })
})
```

### Best Practices
- Test one thing per case
- Use descriptive names
- Arrange-Act-Assert pattern
- Mock dependencies
- Test edge cases
- Keep tests fast/isolated
- Avoid small/trivial unit tests to prevent excessive test count

## E2E Testing (Playwright)

### Configuration
`playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000', headless: true },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } }
  ]
})
```

### Page Object Model
Encapsulate interactions:
```typescript
export class LoginPage {
  constructor(private page: Page) {}
  async goto() { await this.page.goto('/auth/login') }
  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email)
    await this.page.fill('[data-testid="password"]', password)
    await this.page.click('[data-testid="login-button"]')
  }
}
```

### Writing Tests
```typescript
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'

test('successful login', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('user@example.com', 'password')
  await expect(page).toHaveURL('/dashboard')
})
```

### Best Practices
- Use Page Object Model
- Add `data-testid` attributes
- Test across browsers
- Use fixtures for data
- Capture screenshots/videos on failure
- Avoid flaky waits
- Test happy/error paths
- Use the web app as a real user would - navigate via buttons, not direct URLs

## BDD Testing (Cucumber)

### Gherkin Features
`tests/features/authentication.feature`:
```gherkin
Feature: User Authentication
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be redirected to the dashboard
```

### Step Definitions
`tests/features/step-definitions/auth-steps.ts`:
```typescript
import { Given, When, Then } from '@cucumber/cucumber'
import { LoginPage } from '../../pages/login.page'

Given('I am on the login page', async function () {
  this.loginPage = new LoginPage(this.page)
  await this.loginPage.goto()
})

When('I enter valid credentials', async function () {
  await this.loginPage.login('user@example.com', 'password')
})

Then('I should be redirected to the dashboard', async function () {
  await expect(this.page).toHaveURL('/dashboard')
})
```

### Configuration
`cucumber.js`:
```javascript
module.exports = {
  default: {
    require: ['tests/features/step-definitions/**/*.ts'],
    requireModule: ['ts-node/register'],
    paths: ['tests/features/**/*.feature']
  }
}
```

### Best Practices
- Write from user perspective
- Use declarative language
- Keep scenarios independent
- Use scenario outlines for data
- Implement reusable steps

## Running Tests

### Unit Tests
```bash
npm run test                    # All unit tests
npm run test:coverage          # With coverage
npm run test utils.test.ts     # Specific file
npm run test:watch             # Watch mode
```

### E2E Tests
```bash
npm run test:e2e               # All E2E tests
npx playwright test auth.spec.ts  # Specific test
npx playwright test --project=chromium  # Specific browser
npx playwright test --debug    # Debug mode
```

### BDD Tests
```bash
npm run test:cucumber          # All features
npx cucumber-js tests/features/auth.feature  # Specific feature
```

### All Tests
```bash
npm run test:all               # Complete suite
npm run test:ci                # CI mode
```

## Test Data & Fixtures

### Fixtures
Extend Playwright test with custom fixtures:
```typescript
import { test as base } from '@playwright/test'
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login setup
    await use(page)
  }
})
```

### Data Management
- Store data in `tests/fixtures/data/`
- Use env vars for sensitive data
- Create factories for dynamic data

## CI/CD & Debugging

### GitHub Actions
Tests run on PR/push:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run test:all
```

### Debugging
```bash
npx playwright test --debug     # Debug mode
npx playwright codegen localhost:3000  # Generate code
npx playwright show-trace       # View traces
```

### Common Issues
- Flaky tests: Use proper assertions
- Timing: Avoid `waitForTimeout()`
- Selectors: Prefer `data-testid`
- State: Clean up after tests

## Resources
- Playwright: https://playwright.dev/
- Cucumber: https://cucumber.io/docs/cucumber/
- Vitest: https://vitest.dev/

For help, check existing tests or ask the team.