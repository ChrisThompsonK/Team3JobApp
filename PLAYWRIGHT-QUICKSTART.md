# Playwright Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Playwright Browsers
```bash
npm run playwright:install
```

### 2. Start Your Application
In one terminal:
```bash
npm run dev
```

### 3. Run Your First Test
In another terminal:
```bash
npm run test:e2e
```

## 🎯 What You Get

Your Playwright test framework includes:

✅ **5 Test Suites Ready**
- Home page tests
- Authentication tests (login/register)
- Job roles tests
- Analytics tests
- Authenticated user tests

✅ **Custom Test Utilities**
- Authentication fixtures
- Page Object Models
- Helper classes (Navigation, Forms, etc.)
- Mock data generators

✅ **CI/CD Integration**
- GitHub Actions workflow
- Automatic test reports
- Screenshot/video capture on failures

## 📝 Run Your First Test

### Interactive UI Mode (Recommended for Development)
```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:
- Select tests to run
- See live browser interaction
- Time travel through test steps
- View test artifacts

### Debug Mode
```bash
npm run test:e2e:debug
```

### See the Browser (Headed Mode)
```bash
npm run test:e2e:headed
```

## 🎨 Customize Tests

### Update Test Credentials

Edit `tests/utils/test-data.ts`:

```typescript
export const testConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  defaultUser: {
    email: 'your-test-user@example.com',  // ← Change this
    password: 'your-password',            // ← Change this
  },
  adminUser: {
    email: 'your-admin@example.com',      // ← Change this
    password: 'your-admin-password',      // ← Change this
  },
};
```

### Change Base URL

Edit `playwright.config.ts` or set environment variable:

```bash
BASE_URL=https://staging.example.com npm run test:e2e
```

## 📚 Next Steps

1. **Read the full docs**: `tests/README.md`
2. **Explore test files**: `tests/e2e/*.spec.ts`
3. **Try Page Objects**: `tests/e2e/page-object-examples.spec.ts`
4. **Write your own tests**: Follow the patterns in existing files

## 🆘 Troubleshooting

### Tests failing with "Navigation timeout"?
- Make sure your app is running (`npm run dev`)
- Check the BASE_URL in config matches your app URL

### Browser not opening?
- Run: `npm run playwright:install-deps`
- This installs browser dependencies

### Need help?
- Check [Playwright docs](https://playwright.dev)
- View test examples in `tests/e2e/`
- Read the full README in `tests/README.md`

## 🎉 You're Ready!

Your Playwright test framework is fully set up. Happy testing!
