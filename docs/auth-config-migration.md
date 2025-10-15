# Authentication Configuration Migration

## Overview

All authentication-related configuration has been migrated to use **required environment variables** with **no defaults**. The application will now fail fast on startup if any required auth configuration is missing, preventing security issues from misconfiguration.

## Changes Made

### 1. Updated `src/config/index.ts`

- Added `requireEnv()` helper function that throws a clear error if an environment variable is missing
- Added `getSecret()` helper function to handle base64-prefixed secrets
- Created new `auth` configuration section with three subsections:
  - `jwt`: JWT token configuration (access & refresh secrets, expiry times)
  - `password`: Password hashing configuration (salt rounds, min length)
  - `cookie`: Cookie configuration (security settings, max ages)
- All auth secrets now use `requireEnv()` - **no defaults**

### 2. Updated `src/services/token-service.ts`

- Removed local environment variable reads and fallback defaults
- Imported centralized `config` from `src/config/index.ts`
- Updated all functions to use `config.auth.jwt.*` for secrets and expiry times
- Updated cookie functions to use `config.auth.cookie.*` for settings
- Removed duplicate environment checks (now handled at config load time)

### 3. Updated `src/services/auth-service.ts`

- Removed local `SALT_ROUNDS` constant with fallback default
- Imported centralized `config` from `src/config/index.ts`
- Updated password hashing to use `config.auth.password.saltRounds`
- Updated password validation to use `config.auth.password.minLength`

### 4. Updated `src/services/admin-seed-service.ts`

- Removed local `PASSWORD_HASH_ROUNDS` read with fallback default
- Imported centralized `config` from `src/config/index.ts`
- Updated password hashing to use `config.auth.password.saltRounds`

### 5. Updated `.env.example`

- Added comprehensive documentation for required auth environment variables
- Added clear section headers marking required vs optional variables
- Added instructions for generating secure secrets
- Added security warnings and best practices

### 6. Updated `README.md`

- Added comprehensive "Environment Variables" section
- Documented all required auth variables in a clear table
- Added instructions for generating secure JWT secrets
- Added security notes and best practices
- Added validation instructions
- Added example error messages

### 7. Created `test-env-validation.js`

- Created a test script to verify environment variable validation
- Tests that the app fails when each required variable is missing
- Tests that the app starts when all required variables are present
- Provides clear pass/fail results

## Required Environment Variables

The following variables **MUST** be set or the application will not start:

1. `JWT_ACCESS_SECRET` - Secret for signing access tokens
2. `JWT_REFRESH_SECRET` - Secret for signing refresh tokens (must be different)
3. `PASSWORD_HASH_ROUNDS` - Number of bcrypt rounds (10-12 recommended)

## Behavior

### Before Migration
- Environment variables had fallback defaults (e.g., `'fallback-secret-access'`)
- Application could start with insecure default values
- No clear indication of missing configuration
- Security risk in production

### After Migration
- **No fallback defaults** for auth configuration
- Application throws clear error on startup if any required variable is missing
- Error message identifies the specific missing variable
- **Fail-fast behavior** prevents deployment with missing config

### Example Error Output

```
Error: FATAL: Required environment variable JWT_ACCESS_SECRET is not set. Application cannot start.
    at requireEnv (/path/to/src/config/index.ts:13:11)
```

## Testing

### Manual Testing

Test that the application validates required variables:

```bash
# Should fail - missing JWT_ACCESS_SECRET
JWT_ACCESS_SECRET= npm run dev

# Should fail - missing PASSWORD_HASH_ROUNDS
PASSWORD_HASH_ROUNDS= npm run dev

# Should succeed - all required variables present
npm run dev
```

### Automated Testing

Run the validation test suite:

```bash
node test-env-validation.js
```

## Migration Guide for Developers

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Generate secure JWT secrets:**
   ```bash
   node -e "console.log('JWT_ACCESS_SECRET=base64:' + require('crypto').randomBytes(64).toString('base64'))"
   node -e "console.log('JWT_REFRESH_SECRET=base64:' + require('crypto').randomBytes(64).toString('base64'))"
   ```

3. **Update your `.env` file** with the generated secrets

4. **Set password hash rounds:**
   ```
   PASSWORD_HASH_ROUNDS=12
   ```

5. **Start the application:**
   ```bash
   npm run dev
   ```

## Security Benefits

✅ **Fail-fast behavior** - Application won't start with missing config  
✅ **No insecure defaults** - Prevents accidental deployment with weak secrets  
✅ **Clear error messages** - Identifies exactly what's missing  
✅ **Centralized configuration** - Single source of truth for auth settings  
✅ **Type-safe configuration** - TypeScript ensures correct usage  
✅ **Environment-specific settings** - Easy to configure per environment  

## Configuration Structure

```typescript
config.auth = {
  jwt: {
    accessSecret: string,      // From JWT_ACCESS_SECRET (required)
    refreshSecret: string,      // From JWT_REFRESH_SECRET (required)
    accessTokenExpiry: '15m',   // Hardcoded (can be made configurable)
    refreshTokenExpiry: '30d',  // Hardcoded (can be made configurable)
  },
  password: {
    saltRounds: number,         // From PASSWORD_HASH_ROUNDS (required)
    minLength: 8,               // Hardcoded (can be made configurable)
  },
  cookie: {
    secure: boolean,            // Based on NODE_ENV
    httpOnly: true,             // Hardcoded for security
    accessTokenMaxAge: number,  // 15 minutes in milliseconds
    refreshTokenMaxAge: number, // 30 days in milliseconds
  },
}
```

## Files Modified

- ✅ `src/config/index.ts` - Added auth configuration with validation
- ✅ `src/services/token-service.ts` - Uses centralized config
- ✅ `src/services/auth-service.ts` - Uses centralized config
- ✅ `src/services/admin-seed-service.ts` - Uses centralized config
- ✅ `.env.example` - Documented required variables
- ✅ `README.md` - Added environment variables documentation
- ✅ `test-env-validation.js` - Created validation test script
- ✅ `docs/auth-config-migration.md` - This document

## Rollback Plan

If needed, the changes can be reverted by:

1. Restoring the previous versions of the modified files
2. Re-adding default fallback values to environment variable reads

However, this would re-introduce the security concerns that this migration addressed.

## Next Steps

Consider making these additional improvements:

1. Add environment variable validation for other sensitive config (database URLs, API keys)
2. Create a startup validation script that checks all required variables before starting
3. Add CI/CD validation to ensure `.env.example` stays in sync with required variables
4. Consider using a schema validation library like `zod` for more robust config validation
5. Make token expiry times configurable via environment variables if needed
