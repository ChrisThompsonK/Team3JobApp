---
applyTo: '**/*.test.ts', '**/*.spec.ts', 'tests/**', 'vitest.config.ts', 'playwright.config.ts'
---

# Testing Instructions for Team 3 Job Application

## 📋 **Read This First**
**Always read this file when creating, modifying, or reviewing tests.** This ensures consistency across all test suites and maintains quality standards.

## 🎯 **Testing Philosophy**
This project uses a **comprehensive testing pyramid** approach:
- **Unit Tests** (Vitest): Test individual services, utilities, and business logic in isolation
- **Integration Tests** (Vitest): Test services interacting with repositories and external dependencies
- **E2E Tests** (Playwright): Test complete user workflows from the browser's perspective
- **BDD Tests** (Cucumber): Document feature behavior in human-readable scenarios

### Goal
Achieve **70%+ code coverage** on critical paths (services, controllers, utils). Focus on meaningful tests that catch real bugs, not just line coverage.

---

## 🛠️ **Testing Tools & Configuration**

### Frontend & Backend Unit/Integration Tests
- **Framework**: Vitest 3.2.4
- **Config**: `vitest.config.ts`
- **Command**: `npm run test` (interactive) / `npm run test:run` (CI-mode)
- **Coverage**: `npm run test:coverage` → generates `coverage/` directory

### E2E Tests
- **Framework**: Playwright 1.56.1
- **Config**: `playwright.config.ts`
- **Pattern**: Page Object Model (POM)
- **Tests Location**: `tests/` folder (NOT `tests-backup/` - legacy, ignored)
- **Pages Location**: `tests/pages/` (page objects with selectors and actions)
- **Utils Location**: `tests/utils/` (test helpers: FileUtils, etc.)

### BDD Tests
- **Framework**: Cucumber 9.5.1
- **Feature Files**: `features/*.feature`
- **Step Definitions**: `features/step_definitions/**/*.ts`
- **Command**: `npm run test:e2e`

---

## 📁 **Test File Organization**

### Backend (team3-job-app-backend)
```
src/
├── services/
│   ├── JobService.ts
│   ├── JobService.test.ts              ✅ Unit tests for JobService
│   ├── JobService.autoClose.test.ts    ✅ Specialized test file for specific feature
│   ├── SchedulerService.ts
│   ├── SchedulerService.test.ts        ✅ Unit tests
│   └── ApplicationService.ts
│       # TODO: Add ApplicationService.test.ts
├── controllers/
│   ├── ApplicationController.ts
│   └── __tests__/
│       └── ApplicationController.test.ts    ✅ Integration tests (recommended structure)
└── repositories/
    └── __tests__/
        └── ApplicationRepository.test.ts     ✅ Optional for complex query tests
```

### Frontend (team3-job-app-frontend)
```
src/
├── services/
│   ├── auth-service.ts
│   └── auth-service.test.ts            ✅ Unit tests
└── utils.ts
    utils.test.ts                        ✅ Utility tests

tests/
├── pages/                               ✅ Page Object Model classes
│   ├── BasePage.ts                     # Base page with common methods
│   ├── LoginPage.ts                    # Login page selectors & actions
│   ├── MyApplicationsPage.ts
│   ├── JobListingsPage.ts
│   └── ReportPage.ts
├── utils/                               ✅ E2E test utilities
│   └── FileUtils.ts                    # CSV parsing, file handling
├── login-pom.spec.ts                   ✅ E2E tests for login
├── my-applications-pom.spec.ts         ✅ E2E tests for applications
└── report-feature-pom.spec.ts          ✅ E2E tests for reporting

features/                                ✅ BDD feature files
├── login.feature
├── homepage.feature
├── job-listings.feature
├── application-form.feature
└── step_definitions/                   ✅ Cucumber step implementations
    └── **/*.ts
```

---

## ✅ **Test Writing Standards**

### 1. **Unit Tests (Services & Utils)**

**Purpose**: Test isolated business logic with mocked dependencies.

**Structure**:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { JobService } from './JobService.js';
import { SchedulerService } from './SchedulerService.js';

// ✅ Mock external dependencies
const mockJobService = {
  autoCloseExpiredJobRoles: vi.fn().mockResolvedValue({
    closedCount: 2,
    message: 'Successfully auto-closed 2 job role(s)',
  }),
} as Pick<JobService, 'autoCloseExpiredJobRoles'> as JobService;

describe('SchedulerService', () => {
  let schedulerService: SchedulerService;

  beforeEach(() => {
    // ✅ Initialize with mocked dependencies
    schedulerService = new SchedulerService(mockJobService);
    vi.clearAllMocks(); // ✅ Reset mocks between tests
  });

  afterEach(() => {
    // ✅ Cleanup resources
    schedulerService.destroy();
  });

  describe('initialization', () => {
    it('should initialize schedules without errors', () => {
      // ✅ Clear test name describing intent
      expect(() => schedulerService.initializeSchedules()).not.toThrow();
    });
  });

  describe('manual triggers', () => {
    it('should manually trigger auto-close job roles', async () => {
      // ✅ Arrange: Set up test data
      // ✅ Act: Call the function
      const result = await schedulerService.triggerAutoCloseJobRoles();

      // ✅ Assert: Verify expectations
      expect(mockJobService.autoCloseExpiredJobRoles).toHaveBeenCalledOnce();
      expect(result).toEqual({
        closedCount: 2,
        message: 'Successfully auto-closed 2 job role(s)',
      });
    });

    it('should handle errors gracefully', async () => {
      // ✅ Test error scenarios
      const error = new Error('Database connection failed');
      vi.mocked(mockJobService.autoCloseExpiredJobRoles).mockRejectedValueOnce(error);

      await expect(schedulerService.triggerAutoCloseJobRoles()).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
```

**Conventions**:
- ✅ Use AAA pattern (Arrange, Act, Assert)
- ✅ Mock all external dependencies with `vi.mock()` or `vi.fn()`
- ✅ Use `beforeEach`/`afterEach` for setup/teardown
- ✅ Clear mock state with `vi.clearAllMocks()` between tests
- ✅ Test both happy paths AND error cases
- ✅ Use descriptive test names (avoid vague names like "should work")
- ✅ Test edge cases (null, undefined, invalid values)

### 2. **Integration Tests (Controllers & Routes)**

**Purpose**: Test HTTP endpoints with mocked services (or real DB for integration).

**Structure**:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { ApplicationController } from '../ApplicationController.js';
import { ApplicationService } from '../../services/ApplicationService.js';

// ✅ Mock the service
vi.mock('../../services/ApplicationService.js');

describe('ApplicationController', () => {
  let app: express.Application;
  let applicationService: ApplicationService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // ✅ Create Express app with controller routes
    app = express();
    app.use(express.json());
    
    applicationService = new ApplicationService();
    const controller = new ApplicationController(applicationService);
    
    // ✅ Register routes
    app.post('/applications', controller.submitApplication.bind(controller));
    app.get('/applications/:id', controller.getApplicationById.bind(controller));
  });

  describe('POST /applications', () => {
    it('should submit application successfully', async () => {
      // ✅ Mock service
      const mockResponse = {
        success: true,
        applicationID: 123,
        message: 'Application submitted successfully',
      };
      vi.spyOn(applicationService, 'submitApplication').mockResolvedValue(mockResponse);

      // ✅ Make HTTP request
      const response = await request(app)
        .post('/applications')
        .send({
          emailAddress: 'test@example.com',
          phoneNumber: '123-456-7890',
          jobRoleId: 1,
          coverLetter: 'I am interested.',
        });

      // ✅ Assert HTTP response and body
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(applicationService.submitApplication).toHaveBeenCalledWith(
        expect.objectContaining({ emailAddress: 'test@example.com' })
      );
    });

    it('should return 400 for invalid data', async () => {
      // ✅ Test error case
      const mockResponse = { success: false, message: 'Invalid email address' };
      vi.spyOn(applicationService, 'submitApplication').mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/applications')
        .send({ emailAddress: 'invalid', phoneNumber: '123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid');
    });

    it('should validate required fields', async () => {
      // ✅ Test validation
      const response = await request(app)
        .post('/applications')
        .send({}); // Missing required fields

      expect(response.status).toBe(400);
    });
  });

  describe('GET /applications/:id', () => {
    it('should return application by ID', async () => {
      const mockApplication = { applicationID: 1, emailAddress: 'test@example.com' };
      vi.spyOn(applicationService, 'getApplicationById').mockResolvedValue(mockApplication);

      const response = await request(app).get('/applications/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockApplication);
    });

    it('should return 404 for non-existent ID', async () => {
      vi.spyOn(applicationService, 'getApplicationById').mockResolvedValue(null);

      const response = await request(app).get('/applications/9999');

      expect(response.status).toBe(404);
    });

    it('should handle invalid ID format', async () => {
      const response = await request(app).get('/applications/invalid');

      expect(response.status).toBe(400);
    });
  });
});
```

**Dependencies**:
```bash
npm install --save-dev supertest @types/supertest
```

### 3. **E2E Tests (Playwright - Page Object Model)**

**Purpose**: Test complete user workflows from the browser.

**Structure**:

**Base Page (tests/pages/BasePage.ts)**:
```typescript
import { Page } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    await this.page.goto(`http://localhost:3000${path}`);
  }

  async waitForUrl(urlMatcher: RegExp | string) {
    await this.page.waitForURL(urlMatcher);
  }
}
```

**Page Object (tests/pages/LoginPage.ts)**:
```typescript
import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // ✅ Selectors as private properties
  private readonly emailInput = 'input[name="email"]';
  private readonly passwordInput = 'input[name="password"]';
  private readonly submitButton = 'button[type="submit"]';

  constructor(page: Page) {
    super(page);
  }

  // ✅ Public methods for actions
  async navigateToLogin() {
    await this.goto('/');
    await this.page.getByRole('link', { name: /sign in|login/i }).click();
  }

  async fillEmail(email: string) {
    await this.page.fill(this.emailInput, email);
  }

  async fillPassword(password: string) {
    await this.page.fill(this.passwordInput, password);
  }

  async clickSubmit() {
    await this.page.click(this.submitButton);
  }

  async loginAsRegularUser() {
    await this.navigateToLogin();
    await this.fillEmail('user@example.com');
    await this.fillPassword('Password123!');
    await this.clickSubmit();
    await this.page.waitForURL('/applications');
  }

  async isNotOnLoginPage() {
    // ✅ Helper assertion
    expect(this.page.url()).not.toContain('/login');
  }
}
```

**E2E Test (tests/login-pom.spec.ts)**:
```typescript
import { expect, test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('User Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    // ✅ Initialize page object
    loginPage = new LoginPage(page);
  });

  test('should login successfully', async () => {
    // ✅ Use page object methods
    await loginPage.loginAsRegularUser();

    // ✅ Verify result
    await loginPage.isNotOnLoginPage();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.fillEmail('wrong@example.com');
    await loginPage.fillPassword('WrongPassword123!');
    await loginPage.clickSubmit();

    // ✅ Assert error message
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });
});
```

**Conventions**:
- ✅ Use Page Object Model (POM) pattern - encapsulate selectors and actions in page classes
- ✅ Keep page classes DRY (Don't Repeat Yourself)
- ✅ Make selectors private, expose public methods
- ✅ Test complete user workflows (not individual clicks)
- ✅ Use `test.describe.configure({ mode: 'serial' })` for tests that must run sequentially
- ✅ Use descriptive test names matching user intent
- ✅ Avoid hardcoding test data - use fixtures or test databases

### 4. **BDD Tests (Cucumber)**

**Feature File (features/login.feature)**:
```gherkin
Feature: User Login
  As a user
  I want to log in to the application
  So that I can access protected features

  Scenario: User can register and log in
    Given I am on the register page
    When I fill in the registration form with:
      | field            | value                      |
      | email            | testuser@example.com       |
      | password         | TestPassword123!           |
      | confirmPassword  | TestPassword123!           |
    And I click the register button
    Then I should be logged in
    And I should be redirected to the home page

  Scenario: User cannot log in with wrong password
    Given I am on the login page
    When I fill in the login form with:
      | field    | value                |
      | email    | testuser@example.com |
      | password | WrongPassword123!    |
    And I click the login button
    Then I should see an error message about invalid credentials
```

**Step Definition (features/step_definitions/login.ts)**:
```typescript
import { Given, When, Then, Before, DataTable } from '@cucumber/cucumber';
import { Browser, Page } from 'playwright';
import { LoginPage } from '../../tests/pages/LoginPage';

let browser: Browser;
let page: Page;
let loginPage: LoginPage;

Before(async function () {
  // ✅ Setup browser before each scenario
  // Initialize browser and page
});

Given('I am on the login page', async () => {
  await loginPage.navigateToLogin();
});

When('I fill in the login form with:', async (dataTable: DataTable) => {
  // ✅ Parse table data
  const data = dataTable.rowsHash();
  await loginPage.fillEmail(data.email);
  await loginPage.fillPassword(data.password);
});

Then('I should see an error message about invalid credentials', async () => {
  // ✅ Assert error
  await expect(page.locator('.error')).toContainText('Invalid credentials');
});
```

---

## 📊 **Coverage Requirements**

### Targets
- **Services & Business Logic**: 70%+ coverage (high priority)
- **Controllers**: 60%+ coverage (medium priority)
- **Utilities**: 80%+ coverage (important for helpers)
- **Repositories**: 50%+ coverage (focus on complex queries)
- **Routes/Middleware**: 40%+ coverage (lower priority, tested via integration)

### Generate Coverage Report
```bash
npm run test:coverage
# Opens coverage/ folder with HTML report
```

### Exclude from Coverage
```typescript
// vitest.config.ts
coverage: {
  exclude: [
    'node_modules/',
    'dist/',
    'src/**/*.d.ts',
    'src/**/*.config.ts',
    'coverage/**',
  ],
}
```

---

## 🚀 **Running Tests**

### All Tests
```bash
npm run test              # Interactive mode (Vitest)
npm run test:run         # Run all tests once
npm run test:coverage    # Generate coverage report
npm run test:ui          # Open Vitest UI in browser
npm run test:e2e         # Run Cucumber BDD tests
npm run test:e2e:headed  # Run E2E with browser visible
```

### Specific Test Files
```bash
# Vitest specific file
npm run test:run -- JobService.test.ts

# Playwright specific file
npx playwright test tests/login-pom.spec.ts

# Cucumber specific feature
npx cucumber-js features/login.feature
```

### Watch Mode (Development)
```bash
npm run test    # Starts interactive watch mode
# Press:
#  - 'a' to run all tests
#  - 'f' to run only failed tests
#  - 'p' to filter by filename
#  - 'q' to quit
```

---

## 🔍 **Test Naming Conventions**

### File Names
```typescript
// ✅ GOOD
JobService.test.ts              // Service unit tests
ApplicationController.test.ts   // Controller integration tests
login-pom.spec.ts               // Playwright E2E tests
login.feature                   // Cucumber BDD

// ❌ AVOID
test.ts                         // Too generic
tests.ts                        // Not descriptive
JobServiceTests.ts              // Avoid plural "Tests"
```

### Test Descriptions
```typescript
// ✅ GOOD - Clear intent
describe('JobService', () => {
  it('should add a valid job successfully', () => {});
  it('should reject a job with missing required fields', () => {});
  it('should handle database errors gracefully', () => {});
});

// ❌ AVOID - Unclear or redundant
describe('tests', () => {
  it('should work', () => {});
  it('test 1', () => {});
  it('JobService tests', () => {});
});
```

---

## ⚠️ **Common Test Pitfalls**

### ❌ DO NOT
- **Skip cleanup**: Always use `afterEach()` to clean up resources
- **Mock everything**: Only mock external dependencies, test real logic
- **Hardcode test data**: Use fixtures, builders, or data generators
- **Write flaky tests**: Avoid timing issues, use proper waits
- **Test implementation**: Test behavior/contracts, not internal details
- **Ignore error cases**: Test both happy paths AND error scenarios
- **Use test.only() permanently**: Always remove before committing
- **Make assumptions about order**: Don't rely on test execution order

### ✅ DO
- **Use clear, descriptive names**: "should add a job with all fields" not "should add job"
- **Follow AAA pattern**: Arrange, Act, Assert
- **Mock responsibly**: Only mock external APIs, databases, third-party services
- **Test edge cases**: null, undefined, empty strings, large values
- **Keep tests focused**: One assertion per test when possible (or related assertions)
- **Use helper methods**: Reduce duplication with setup methods
- **Group related tests**: Use `describe()` blocks for organization
- **Run tests locally**: Always test before pushing

---

## 🔗 **Integration with CI/CD**

### Pre-commit
```bash
# Run before committing
npm run test:run
npm run type-check
npm run lint
```

### CI Pipeline (GitHub Actions, etc.)
```bash
npm run test:run
npm run test:coverage
npm run type-check
```

### Acceptance Criteria for Merging
- ✅ All tests pass
- ✅ Coverage meets targets (70%+ for services)
- ✅ No test.only() left in code
- ✅ No console.log() in tests
- ✅ TypeScript strict mode passes

---

## 📚 **Resources & References**

- **Vitest Docs**: https://vitest.dev/
- **Playwright Docs**: https://playwright.dev/
- **Cucumber Docs**: https://cucumber.io/docs/cucumber/
- **Supertest Docs**: https://github.com/visionmedia/supertest
- **Testing Library Docs**: https://testing-library.com/
- **Jest Matchers** (similar to Vitest): https://jestjs.io/docs/expect

### Local Documentation
- **Main Instructions**: `.copilot-instructions.md` (general project guidelines)
- **Design Guidelines**: `design-guidelines.md` (UI/styling standards)
- **README**: Always reference the project README for updated info

---

## 🎯 **Testing Checklist**

Before submitting a test file:
- [ ] File follows naming convention (`*test.ts` or `*spec.ts`)
- [ ] Tests are organized with `describe()` blocks
- [ ] All external dependencies are mocked
- [ ] Setup/teardown with `beforeEach`/`afterEach`
- [ ] Clear, descriptive test names
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases tested
- [ ] No hardcoded test data
- [ ] No `test.only()` or `test.skip()` left behind
- [ ] Coverage targets met (70%+ for services)
- [ ] All tests pass locally
- [ ] TypeScript strict mode compliance
- [ ] No console.log() in tests
- [ ] JSDoc comments for complex helpers

---

**Last Updated**: November 2025
**Maintainer**: Team 3 Engineering Academy
**Questions?** Refer to this document first, then the main `.copilot-instructions.md`.
