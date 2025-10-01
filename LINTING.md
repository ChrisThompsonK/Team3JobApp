# Code Quality & Linting Guide

This document outlines the code quality standards and linting setup for the Team 3 Job Application Frontend project.

## 🛠️ Tools

### Primary Tools
- **[Biome](https://biomejs.dev/)** - Fast, unified toolchain for formatting, linting, and import organization
- **TypeScript** - Static type checking
- **Vitest** - Testing framework with coverage reporting
- **Husky** - Git hooks for automated quality checks
- **lint-staged** - Run linters on staged files only

### Supporting Tools
- **EditorConfig** - Consistent editor settings across team members
- **GitHub Actions** - Continuous integration and automated checks
- **Codecov** - Code coverage reporting (optional)

## 📋 Code Standards

### Formatting Rules
- **Indentation**: 2 spaces
- **Line Width**: 100 characters maximum
- **Quotes**: Single quotes for JavaScript/TypeScript
- **Semicolons**: Always required
- **Trailing Commas**: ES5 style (arrays, objects)
- **End of Line**: LF (Unix style)

### Naming Conventions
- **Variables**: camelCase, PascalCase, or CONSTANT_CASE
- **Functions**: camelCase or PascalCase
- **Classes**: PascalCase
- **Interfaces**: PascalCase
- **Types**: PascalCase
- **Enums**: PascalCase
- **Files**: kebab-case or camelCase

### TypeScript Rules
- Prefer explicit types for function parameters and return values
- Use `const` assertions where appropriate
- Avoid `any` type (warning level)
- Use optional chaining and nullish coalescing
- Import type-only imports with `import type`

## 🚀 Available Scripts

### Development
```bash
# Format code
npm run format

# Check formatting without fixing
npm run format:check

# Lint and fix issues
npm run lint

# Check linting without fixing
npm run lint:check

# Run all checks and fixes
npm run check

# Run CI-friendly checks (no fixes)
npm run check:ci

# Fix all issues including unsafe fixes
npm run lint:fix
```

### Testing
```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Open coverage report in browser
npm run test:ui
```

### Build
```bash
# Type check only
npm run type-check

# Build for production
npm run build

# Build CSS
npm run build:css:prod
```

## 🔧 Git Hooks

### Pre-commit Hook
Automatically runs before each commit:
1. Code formatting and linting checks
2. TypeScript type checking
3. Test suite execution

### Commit Message Hook
Validates commit messages follow conventional commits format:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `style: formatting changes`
- `refactor: code restructuring`
- `test: add or update tests`
- `chore: maintenance tasks`

## 🏗️ CI/CD Pipeline

### Code Quality Workflow
Runs on push and pull requests:
1. **Formatting Check** - Ensures consistent code style
2. **Linting** - Catches potential issues and enforces best practices
3. **Type Checking** - Validates TypeScript types
4. **Build Verification** - Ensures code compiles successfully
5. **Test Execution** - Runs full test suite with coverage
6. **Security Audit** - Checks for known vulnerabilities

### Pull Request Validation
Additional checks for pull requests:
1. **PR Title Validation** - Ensures conventional commit format
2. **Breaking Change Detection** - Identifies potentially breaking changes
3. **Bundle Size Analysis** - Monitors build output size
4. **Coverage Reporting** - Comments coverage statistics on PR

## 📝 Editor Setup

### VS Code (Recommended)
1. Install recommended extensions (see `.vscode/extensions.json`)
2. Settings are automatically configured (see `.vscode/settings.json`)
3. Biome extension provides real-time linting and formatting

### Other Editors
1. Install EditorConfig plugin for consistent formatting
2. Configure Biome LSP for linting support
3. Set up format-on-save with Biome

## 🔍 Troubleshooting

### Common Issues

#### "Biome command not found"
```bash
# Install dependencies
npm install

# Run Biome through npm
npm run check
```

#### "Git hooks not working"
```bash
# Reinstall husky
npm run prepare

# Make hooks executable
chmod +x .husky/pre-commit .husky/commit-msg
```

#### "Linting errors in CI but not locally"
```bash
# Run CI checks locally
npm run check:ci

# Fix all issues
npm run lint:fix
```

### Configuration Files

- **`biome.json`** - Main Biome configuration
- **`.biomeignore`** - Files to ignore for linting/formatting
- **`.editorconfig`** - Editor-agnostic formatting rules
- **`.vscode/settings.json`** - VS Code specific settings
- **`.github/workflows/`** - CI/CD pipeline definitions
- **`.husky/`** - Git hook scripts

## 🤝 Contributing

Before committing:
1. Run `npm run check` to fix formatting and linting issues
2. Ensure all tests pass with `npm run test:run`
3. Follow conventional commit format for commit messages
4. Keep PRs focused and atomic

### Pre-commit Checklist
- [ ] Code is formatted and linted
- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] Commit message follows conventional format
- [ ] Changes are documented if necessary

## 📚 Resources

- [Biome Documentation](https://biomejs.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [EditorConfig](https://editorconfig.org/)
