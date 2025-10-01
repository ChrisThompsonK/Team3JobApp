# Error Handling System

## Overview

The application now features a sophisticated **generic error handling system** that automatically determines the appropriate response format based on HTTP status codes and request context.

## Features

### 🔧 **Generic Error Handler**
- **Smart Response Format Detection**: Automatically chooses between HTML and JSON responses based on:
  - `Accept` header content
  - URL patterns (API endpoints starting with `/api/`)
  - Error severity (5xx errors default to JSON)

- **Request Tracking**: Each request gets a unique ID for debugging and support
- **Comprehensive Logging**: Different log levels based on error severity
- **Development vs Production**: Detailed error info in development, sanitized in production

### 📊 **HTTP Status Code Support**

The system handles all common HTTP error codes with appropriate messaging:

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource not found |
| 405 | Method Not Allowed | HTTP method not supported |
| 409 | Conflict | Resource conflict |
| 422 | Unprocessable Entity | Invalid data format |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | Upstream server error |
| 503 | Service Unavailable | Service temporarily down |
| 504 | Gateway Timeout | Upstream timeout |

### 🎯 **Response Formats**

#### HTML Responses (Web Pages)
- **Custom Error Pages**: Styled error pages using Nunjucks templates
- **User-Friendly Messages**: Clear, actionable error descriptions
- **Context-Aware Help**: Different suggestions based on error type
- **Request ID Display**: For support and debugging

#### JSON Responses (API Endpoints)
- **Structured Error Data**: Consistent error response format
- **System Information**: Additional context for debugging
- **Request Tracking**: Unique request IDs for correlation
- **Development Details**: Stack traces and detailed info in dev mode

### 🛠️ **Usage Examples**

#### In Controllers
```typescript
import { createHttpError } from '../models/errors.js';

// Throw specific HTTP errors
const error = createHttpError.badRequest('Invalid user data provided');
next(error);

// Or throw generic errors (automatically becomes 500)
const error = new Error('Database connection failed');
next(error);
```

#### Error Response Example (JSON)
```json
{
  "message": "The request could not be understood by the server",
  "statusCode": 400,
  "timestamp": "2025-01-10T10:30:00.000Z",
  "path": "/api/users",
  "requestId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

### 🧪 **Testing Error Scenarios (Development Only)**

In development mode, these demo endpoints are available for testing different error types:
- `/demo/400` - Bad Request
- `/demo/401` - Unauthorized  
- `/demo/403` - Forbidden
- `/demo/500` - Internal Server Error
- `/demo/503` - Service Unavailable
- `/nonexistent` - Not Found (404)

**Note**: Demo routes are automatically disabled in production mode for security and user experience.

### 🔍 **Error Logging**

The system provides comprehensive logging with different levels:

```
[2025-01-10T10:30:00.000Z] [request-id] WARN: 404 - Cannot GET /nonexistent
[2025-01-10T10:30:00.000Z] [request-id] ERROR: 500 - Database connection failed
```

### 🚀 **Benefits**

1. **Consistent Experience**: Uniform error handling across the application
2. **Developer Friendly**: Detailed logging and debugging information
3. **User Friendly**: Clear, actionable error messages
4. **Maintainable**: Centralized error handling logic
5. **Extensible**: Easy to add new error types and handlers
6. **Production Ready**: Proper error sanitization and logging

## Implementation

The error handling system consists of:

- `src/models/errors.ts` - HttpError class and helper functions
- `src/middleware/index.ts` - Generic error handling middleware
- `views/error.njk` - HTML error page template
- Controllers use `next(error)` to trigger error handling

This system follows best practices for HTTP error handling and provides a solid foundation for scalable error management.