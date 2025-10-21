[![Code Quality](https://github.com/ChrisThompsonK/team3-job-app-frontend/actions/workflows/code-quality.yml/badge.svg)](https://github.com/ChrisThompsonK/team3-job-app-frontend/actions/workflows/code-quality.yml)

# Kainos Job Portal

**Connecting talent with opportunity through digital innovation**

A TypeScript/Node.js web application featuring Kainos branding, built with a clean 3-tier architecture and modern web technologies.

## 🎨 Kainos Branding

This application features complete Kainos visual identity including:

- **Brand Colors**: Kainos blue (#003366), light blue (#0066CC), cyan (#00A3D9)
- **Typography**: Open Sans font family for consistent brand experience  
- **Logo & Visual Elements**: Custom Kainos logo and branded components
- **Theme**: Custom DaisyUI theme matching Kainos design system

> 🤖 **For AI Assistants**: Please read [`.copilot-instructions.md`](./.copilot-instructions.md) first to understand project context, architecture, and conventions before starting any task.

## 🏗️ Architecture

This project follows a **3-tier architecture** pattern for clean separation of concerns:

### 📊 **Presentation Layer** (`/src/controllers`, `/src/routes`, `/views`)
- **Controllers**: Handle HTTP requests/responses and presentation logic
- **Routes**: Define URL routing and middleware
- **Views**: Nunjucks templates for rendering HTML

### 🔧 **Business Logic Layer** (`/src/services`)
- **Services**: Contain application business rules and logic
- Data validation, processing, and transformation
- Orchestrate calls between presentation and data layers

### 🗄️ **Data Access Layer** (`/src/repositories`, `/src/models`)
- **Models**: Define data structures and interfaces
- **Repositories**: Handle data access and storage operations
- Database queries and external API calls (when implemented)

### 📁 Project Structure

```
src/
├── controllers/     # Presentation layer - HTTP request handlers
├── services/        # Business logic layer - Application rules
├── repositories/    # Data access layer - Data operations
├── models/          # Data models and interfaces
├── routes/          # Route definitions and middleware
├── middleware/      # Custom Express middleware
├── config/          # Application configuration
├── app.ts           # Application factory and setup
└── index.ts         # Application entry point

views/               # Nunjucks templates
public/              # Static assets (CSS, JS, images)
.copilot-instructions.md  # AI assistant context and conventions
.copilotignore           # Files for AI assistants to ignore
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in the `PORT` environment variable).

## 📋 Available Commands

### 🚀 **Development & Runtime**
```bash
# Start development server with hot reload
npm run dev

# Build the project for production
npm run build

# Start the production server (requires build first)
npm run start

# Clean build artifacts
npm run clean

# Type checking without building
npm run type-check
```

### 🎨 **CSS & Styling**
```bash

## �🔧 **Code Quality & Formatting**

This project uses [Biome](https://biomejs.dev/) for code formatting, linting, and import organization.

### **Linting Standards**
- **TypeScript strict mode** enabled
- **ESLint-style rules** via Biome
- **Import organization** and unused import removal
- **Code formatting** with consistent style

### **Code Style Guidelines**
- **Indentation**: Tabs (2 spaces in JSON files)
- **Line width**: 100 characters
- **Quotes**: Double quotes for strings
- **Semicolons**: Always required
- **Trailing commas**: Always where valid

### **Quality Assurance Workflow**

**During Development:**
```bash
# Check code quality (recommended before commits)
npm run check

# Fix formatting issues
npm run format

# Fix linting issues
npm run lint
```

**In CI/CD Pipeline:**
```bash
# CI-optimized check (no auto-fixes, fails on issues)
npm run ci

# Type checking
npm run type-check

# Run tests
npm run test:run
```

### **Editor Integration**

For the best development experience:
- **VS Code**: Install the "Biome" extension
- **Other editors**: See [Biome editor integrations](https://biomejs.dev/guides/editors/first-party-extensions/)
- **Format on save** is configured in `.vscode/settings.json`

## **Build & Deployment**

### **Development Build**
```bash
npm run build:css        # Build development CSS
npm run build           # Build TypeScript to JavaScript
```

### **Production Build**
```bash
npm run clean           # Clean previous builds
npm run build:css:prod  # Build minified production CSS
npm run build           # Build TypeScript with optimizations
```

### **Build Outputs**
- **JavaScript**: `dist/` directory (from TypeScript compilation)
- **CSS**: `public/css/output.css` (from Tailwind CSS)
- **Static Assets**: `public/` directory (served directly)

## �📡 **API Endpoints**

### **Frontend Routes**
- `GET /` - Home page with job listings
- `GET /job-roles` - Job roles listing page

### **Static Assets**
- `GET /css/*` - Stylesheets
- `GET /js/*` - JavaScript files
- `GET /images/*` - Images and media

## 🏗️ Project Structure

```
.
├── src/
│   └── index.ts          # Main application entry point
├── dist/                 # Build output (auto-generated)
├── biome.json           # Biome configuration
├── .biomeignore         # Files ignored by Biome
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies and scripts
```

## 🧪 **Testing**

This project uses **Vitest** for fast and reliable testing.

### **Test Types**
- **Unit Tests**: Testing individual functions and components
- **Integration Tests**: Testing service layer interactions
- **Coverage Reports**: Comprehensive code coverage analysis

### **Testing Commands**
```bash
# Interactive test runner (watches for changes)
npm run test

# Run all tests once (CI/CD)
npm run test:run

# Visual test interface in browser
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### **Test Structure**
- **Test files**: `*.test.ts` or `*.spec.ts`
- **Test utilities**: `/src/utils.test.ts`
- **Service tests**: `/src/services/*.test.ts`
- **Coverage output**: `/coverage` directory

### **Writing Tests**
```typescript
// Example test structure
import { describe, it, expect } from 'vitest'
import { myFunction } from './my-module'

describe('MyModule', () => {
  it('should do something', () => {
    expect(myFunction()).toBe('expected result')
  })
})
```

## 🛠️ **Technology Stack**

### **Core Technologies**
- **Runtime**: Node.js >= 18.0.0
- **Language**: TypeScript 5.3.3
- **Framework**: Express.js 5.1.0
- **Template Engine**: Nunjucks 3.2.4

### **Development Tools**
- **Build Tool**: TypeScript Compiler (tsc)
- **Development Server**: tsx (hot reload)
- **Code Quality**: Biome 2.2.4 (formatting, linting)
- **Testing**: Vitest 3.2.4 (unit testing, coverage)
- **CSS Framework**: Tailwind CSS 4.1.13 + DaisyUI 5.1.26

### **Architecture**
- **Pattern**: 3-tier architecture (Presentation, Business, Data)
- **Module System**: ES Modules
- **Package Manager**: npm

## 📝 Environment Variables

### ⚠️ Required Authentication Variables

The following environment variables are **REQUIRED** for the application to start. If any are missing, the application will throw a `FATAL` error and exit immediately on startup. **No default values are used for security.**

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

#### **Required Variables**

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `JWT_ACCESS_SECRET` | Secret key for signing access tokens | `your-long-random-string` or `base64:...` | ✅ Yes |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens (must be different from access secret) | `your-other-long-random-string` or `base64:...` | ✅ Yes |
| `PASSWORD_HASH_ROUNDS` | Number of bcrypt salt rounds for password hashing (10-12 recommended) | `12` | ✅ Yes |

**Generate secure secrets:**
```bash
# Generate JWT secrets (recommended approach)
node -e "console.log('JWT_ACCESS_SECRET=base64:' + require('crypto').randomBytes(64).toString('base64'))"
node -e "console.log('JWT_REFRESH_SECRET=base64:' + require('crypto').randomBytes(64).toString('base64'))"
```

#### **Optional Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `localhost` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `DATABASE_URL` | Database file path | `./app.db` |
| `API_BASE_URL` | Backend API URL | `http://localhost:3001` |
| `ADMIN_SEED_EMAIL` | Admin user email for initial setup | - |
| `ADMIN_SEED_PASSWORD` | Admin user password for initial setup | - |

### 🔐 Security Notes

- **Never commit** `.env` files to version control (already in `.gitignore`)
- Use **strong, randomly generated secrets** for JWT keys
- Use **different secrets** for access and refresh tokens
- In production, use `PASSWORD_HASH_ROUNDS=12` or higher
- Change the `ADMIN_SEED_PASSWORD` immediately after first login
- Set `NODE_ENV=production` in production environments

### ✅ Validation

Test that your environment variables are properly configured:

```bash
# This will fail if any required auth variables are missing
npm run dev
```

The application will display a clear error message indicating which required variable is missing:
```
Error: FATAL: Required environment variable JWT_ACCESS_SECRET is not set. Application cannot start.
```

## 🚨 **Troubleshooting**

### **Common Issues**

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

**TypeScript compilation errors:**
```bash
# Clean and rebuild
npm run clean
npm run build
```

**CSS not updating:**
```bash
# Rebuild CSS
npm run build:css

# Or use watch mode
npm run build:css:watch
```

**Tests failing:**
```bash
# Run tests with verbose output
npm run test:run -- --reporter=verbose

# Clear test cache
rm -rf node_modules/.vite
```

### **Performance Tips**
- Use `npm run dev` for development (hot reload)
- Use `npm run build:css:watch` for CSS development
- Run `npm run test:ui` for interactive testing
- Use `npm run ci` to validate before pushing

## 🤝 **Contributing**

### **Development Workflow**
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Install** dependencies: `npm install`
4. **Develop** with: `npm run dev`

### **Before Submitting**
```bash
# 1. Run all quality checks
npm run check

# 2. Run type checking
npm run type-check

# 3. Run tests
npm run test:run

# 4. Test build
npm run build
```

### **Code Standards**
- **Code Quality**: All Biome checks must pass
- **Testing**: Add tests for new features
- **Types**: Maintain strict TypeScript compliance
- **Documentation**: Update README for significant changes

### **Pull Request Checklist**
- [ ] Code follows project formatting standards
- [ ] All tests pass
- [ ] TypeScript compilation succeeds
- [ ] No linting errors
- [ ] Documentation updated if needed

## 📄 License

MIT