[![Code Quality](https://github.com/ChrisThompsonK/team3-job-app-frontend/actions/workflows/code-quality.yml/badge.svg)](https://github.com/ChrisThompsonK/team3-job-app-frontend/actions/workflows/code-quality.yml)

# Team 3 Job Application Frontend

A TypeScript/Node.js web application built with a clean 3-tier architecture and Nunjucks templating.

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

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run start` - Start the production server
- `npm run clean` - Remove build artifacts
- `npm run type-check` - Run TypeScript type checking

## 🌐 API Endpoints

- `GET /` - Home page (HTML)
- `GET /health` - Health check page (HTML)
- `GET /api/health` - Health check API (JSON)

## 🎨 Template Engine

This project uses **Nunjucks** as the template engine:
- Auto-escaping enabled for security
- Template inheritance with base layouts
- Dynamic content rendering
- Development mode auto-reloading

## 🔧 Code Quality & Formatting

This project uses [Biome](https://biomejs.dev/) for code formatting, linting, and import organization.

### Code Quality Scripts

- `npm run format` - Format all files using Biome
- `npm run lint` - Lint all files and apply safe fixes
- `npm run check` - Format, lint, and organize imports all at once
- `npm run ci` - CI-optimized command for build pipelines

### Code Style

The project follows these formatting standards:
- **Indentation**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Single quotes for JavaScript/TypeScript, double quotes for JSX
- **Semicolons**: Always required
- **Trailing commas**: ES5 style

### Pre-commit Workflow

Before committing code, run:

```bash
npm run check
```

This will automatically:
- Format your code
- Fix linting issues
- Organize imports
- Report any remaining issues

### Editor Integration

For the best development experience, install the Biome extension for your editor:
- **VS Code**: Search for "Biome" in the Extensions marketplace
- **Other editors**: See [Biome editor integrations](https://biomejs.dev/guides/editors/first-party-extensions/)

## 📡 API Endpoints

- `GET /` - Welcome message with service information
- `GET /health` - Health check endpoint

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

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Code Quality**: Biome (formatting, linting, import organization)
- **Build Tool**: TypeScript Compiler (tsc)
- **Development**: tsx (TypeScript execution with hot reload)

## 📝 Environment Variables

- `PORT` - Server port (default: 3000)

## 🤝 Contributing

1. Ensure your code follows the project's formatting standards by running `npm run check`
2. All linting rules should pass
3. Add appropriate tests for new features
4. Update documentation as needed

## 📄 License

MIT