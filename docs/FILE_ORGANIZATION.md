# File Organization Structure

## Overview
The project has been refactored to follow a **modular file organization** pattern where each class, service, controller, and model is in its own dedicated file. This improves code maintainability, readability, and follows software engineering best practices.

## Directory Structure

```
src/
├── app.ts                          # Application factory and setup
├── index.ts                        # Application entry point
├── utils.ts                        # Utility functions
├── utils.test.ts                   # Utility function tests
│
├── config/
│   └── index.ts                    # Application configuration
│
├── models/                         # Data models and interfaces
│   ├── index.ts                    # Re-exports all models
│   ├── app-info.ts                 # AppInfo interface
│   ├── health-status.ts            # HealthStatus interface
│   └── errors.ts                   # HTTP error classes and types
│
├── repositories/                   # Data access layer
│   ├── index.ts                    # Re-exports all repositories
│   ├── app-repository.ts           # Application data access
│   └── health-repository.ts        # Health check data access
│
├── services/                       # Business logic layer
│   ├── index.ts                    # Re-exports all services
│   ├── app-service.ts              # Application business logic
│   └── health-service.ts           # Health check business logic
│
├── controllers/                    # Presentation layer
│   ├── index.ts                    # Re-exports all controllers
│   ├── home-controller.ts          # Home page controller
│   ├── health-controller.ts        # Health check controller
│   └── demo-controller.ts          # Error handling demo controller
│
├── middleware/                     # Express middleware
│   ├── index.ts                    # Re-exports all middleware
│   ├── request-logger.ts           # Request logging middleware
│   ├── error-handler.ts            # Generic error handling middleware
│   └── not-found-handler.ts        # 404 error handler
│
└── routes/
    └── index.ts                    # Route definitions
```

## Benefits of This Structure

### 🔍 **Improved Code Navigation**
- **Single Responsibility**: Each file has a clear, focused purpose
- **Easy Location**: Find specific functionality quickly by filename
- **IDE Support**: Better autocomplete and navigation in IDEs

### 🧪 **Better Testing**
- **Isolated Testing**: Test individual components without dependencies
- **Focused Tests**: Write targeted tests for specific functionality
- **Mock-Friendly**: Easy to mock specific services/repositories

### 🔧 **Enhanced Maintainability**
- **Reduced Conflicts**: Fewer merge conflicts in team development
- **Clear Dependencies**: Import statements show exact dependencies
- **Easier Refactoring**: Modify single components without affecting others

### 📦 **Scalability**
- **Easy Extension**: Add new controllers/services without cluttering index files
- **Team Development**: Multiple developers can work on different files simultaneously
- **Feature Organization**: Group related functionality naturally

## Import Patterns

### Direct Imports (Recommended for specific components)
```typescript
import { AppService } from '../services/app-service.js';
import { HealthController } from '../controllers/health-controller.js';
import { requestLogger } from '../middleware/request-logger.js';
```

### Index Imports (Convenient for multiple imports)
```typescript
import { AppService, HealthService } from '../services/index.js';
import { HomeController, HealthController, DemoController } from '../controllers/index.js';
```

## File Naming Conventions

- **kebab-case**: All files use kebab-case naming (e.g., `app-service.ts`)
- **Descriptive Names**: Names clearly indicate the file's purpose
- **Consistent Suffixes**: 
  - `-controller.ts` for controllers
  - `-service.ts` for services
  - `-repository.ts` for repositories
  - `-handler.ts` for middleware

## Index Files

Each directory contains an `index.ts` file that:
- **Re-exports** all components from the directory
- **Provides Convenience**: Single import point for related components
- **Maintains Backward Compatibility**: Existing imports continue to work
- **Documents Structure**: Shows all available components at a glance

## Migration Benefits

### Before (Monolithic index.ts files)
```typescript
// Everything in one file - hard to navigate
export const AppService = { ... };
export const HealthService = { ... };
export const UserService = { ... };
// ... 200+ lines of mixed functionality
```

### After (Modular structure)
```typescript
// app-service.ts - focused on app functionality
export const AppService = { ... };

// health-service.ts - focused on health functionality  
export const HealthService = { ... };

// index.ts - clean re-exports
export { AppService } from './app-service.js';
export { HealthService } from './health-service.js';
```

This refactored structure provides a solid foundation for scaling the application while maintaining clean, maintainable code that follows industry best practices.