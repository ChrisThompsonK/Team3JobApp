# Authentication & Authorisation Integration Plan

Date: 2025-10-14  
Target System: Express + Nunjucks Job Portal (this repo)  
Requested Stack: better-auth.com (Better Auth), JSON Web Tokens (JWT), Base64 (see notes), role separation: `admin` vs `user`.

> TL;DR After following these steps you will have: user registration + login + logout, secure password storage, short‑lived access JWT + refresh JWT rotation, role-based route guards, protected UI elements, and test coverage for core auth paths.

---
## 1. Goals & Non‑Goals
### Goals
1. Allow visitors to register and sign in.  
2. Distinguish admins from normal users (RBAC).  
3. Protect sensitive job management endpoints (create/edit/delete) so only admins can use them.  
4. Let authenticated users apply for jobs (with tracking of which user applied).  
5. Use JWTs for stateless auth (access + refresh) with secure HTTP-only cookies.  
6. Integrate (or prepare integration) with Better Auth for potential hosted / advanced features (if we adopt that platform/library).  
7. Provide a maintainable code structure (services, controllers, middleware).  
8. Add tests (unit + integration) for reliability.

### Non‑Goals (Phase 1)
- Social / SSO providers.  
- Account recovery / email verification (list as next phase).  
- Full audit logging (add later).  

---
## 2. Important Clarification About Base64
Base64 is *encoding*, not encryption. It MUST NOT be used to secure passwords or secrets. Proper security measures:
- Passwords: hash with Argon2id (preferred) or bcrypt.  
- JWT secrets: strong random string in env var.  
- Sensitive payload data: if confidentiality required, use real encryption (e.g. AES-GCM) not Base64.

Use of Base64 in this plan: (optional) representing binary (e.g. user avatar upload) or safely embedding a small opaque state value. It does **not** satisfy encryption requirements.

---
## 3. Data Model & Storage
We currently have no persistence layer for users. Choose one of:
1. Simple JSON file (quick demo, NOT for production).  
2. SQLite (using better-sqlite3 / Drizzle ORM) – recommended for speed of integration.  
3. Postgres (production).  

For an MVP choose SQLite with Drizzle ORM (adds minimal overhead and easy migration upward). If adopting Better Auth SaaS that manages storage, adapt accordingly, but we still need local user representation for role decisions.

### User Entity Fields
| Field | Type | Notes |
|-------|------|-------|
| id | string (uuid) | Primary key |
| email | string (unique, lowercase) | Indexed |
| passwordHash | string | Argon2id / bcrypt hash |
| role | enum('admin','user') | Default 'user' |
| createdAt | Date | Auto |
| updatedAt | Date | Auto |
| lastLoginAt | Date? | Nullable |
| isActive | boolean | Soft-disable support |

If using Drizzle, define a `users` table schema accordingly.

### Job Application Relation (Future enhancement)
Add `userId` foreign key on job application submissions to link which user applied.

---
## 4. Dependencies to Add
```
npm i better-auth jsonwebtoken bcrypt cookie-parser
npm i -D @types/jsonwebtoken @types/bcrypt
```
For Drizzle ORM with SQLite:
```
npm i drizzle-orm better-sqlite3 @paralleldrive/cuid2
npm i -D drizzle-kit @types/better-sqlite3
```

If Better Auth provides its own SDK name (verify actual npm package name: could be `better-auth` or similar) adjust accordingly.

---
## 5. Environment Variables (.env)
```
# Database
DATABASE_URL=./app.db         # SQLite file path (or :memory: for tests)

# JWT Configuration
JWT_ACCESS_SECRET=base64:GENERATE_256_BIT_KEY
JWT_REFRESH_SECRET=base64:GENERATE_256_BIT_KEY_DIFFERENT
JWT_ACCESS_TTL=900s           # 15 minutes
JWT_REFRESH_TTL=30d           # 30 days

# Application
NODE_ENV=development
PORT=3000

# Better Auth (if using external service)
BETTER_AUTH_API_KEY=...       # if using external Better Auth service
BETTER_AUTH_ENDPOINT=https://api.better-auth.com # example placeholder

# Security
PASSWORD_HASH_ROUNDS=12       # if bcrypt

# Admin Seed
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=ChangeMe123!
```
Generate secrets using: `openssl rand -base64 32` (store raw, you can prefix with `base64:` to remind yourself of format; strip that when reading).

---
## 6. Folder / File Structure Additions
```
src/
  db/
    schema.ts             # Drizzle schema definitions
    index.ts              # Database connection and setup
  models/
    user.ts               # User type/interface
  repositories/
    user-repository.ts    # CRUD for User (DB/Drizzle abstraction)
  services/
    auth-service.ts        # Registration, login, token gen, password hashing
    token-service.ts       # JWT sign/verify helpers
    better-auth-service.ts # Wrapper / adapter to Better Auth (if used)
  controllers/
    auth-controller.ts     # Express handlers for GET/POST forms
  middleware/
    auth-middleware.ts     # extract user from tokens
    require-auth.ts        # guard for logged-in user
    require-admin.ts       # guard for admin role
  validators/
    auth-validator.ts      # Registration/login input validation
  routes/
    auth-routes.ts         # /auth/login /auth/register /auth/logout
views/
  auth/
    login.njk
    register.njk
partials/
  navbar.njk               # (Update existing layout to show user state)
```

---
## 7. Contracts
### Registration (POST /auth/register)
Input: `{ email, password, confirmPassword }`
Validations: email format, password length >= 8, matches confirm, uniqueness.
Output (success): redirect to dashboard or login; set access + refresh cookies automatically OR redirect to login.
Errors: 400 (validation), 409 (email exists), 500 (internal).

### Login (POST /auth/login)
Input: `{ email, password }`
Output: Set `access_token` (HTTP-only, Secure, SameSite=Lax, short-lived) & `refresh_token` (HTTP-only, Secure, SameSite=Strict, long-lived) cookies.
Errors: 400 (validation), 401 (bad credentials), 423 (if disabled), 500.

### Refresh (POST /auth/refresh) (API only, maybe hidden form or XHR)
Input: Refresh token cookie.
Output: New access token (rotate refresh token optionally). 401 if invalid/expired.

### Logout (POST /auth/logout)
Clears both cookies (set empty + expires in past).

---
## 8. JWT Design
Access Token Claims:
```
sub: user.id
role: user.role
iat, exp
ver: 1           # to support future invalidation strategy
```
Refresh Token Claims (minimal):
```
sub: user.id
typ: refresh
jti: uuid (store for invalidation if implementing blacklist / rotation)
```
Signing Algorithm: HS256 (simplicity). For stronger security consider RS256 with key pair (rotate keys via kid header).  
Transport: HTTP-only cookies (avoid localStorage).  
CSRF Risk: Access token used for API: pair with SameSite=Lax + optional CSRF token for state-changing POST/PUT/DELETE forms.

---
## 9. Middleware Flow
1. `auth-middleware` runs early (after static, before protected routes).  
2. Reads `access_token` cookie; verifies signature & exp.  
3. Attaches `req.user = { id, role }` if valid.  
4. If missing/expired but refresh token present, optionally attempt silent refresh (only on API endpoints, not for each asset request) – or rely on explicit `/auth/refresh` for simplicity.  
5. Protected routes use `require-auth` which checks `req.user`; `require-admin` checks `req.user.role === 'admin'`.

Add to `src/app.ts` after body parsers:
```
import { authMiddleware } from './middleware/auth-middleware.js';
app.use(authMiddleware);
```

---
## 10. Route Protection Mapping
| Route | Protection |
|-------|------------|
| GET /jobs | Public |
| GET /jobs/:id/details | Public |
| GET /jobs/:id/apply | Authenticated (user or admin) |
| POST /jobs/:id/apply | Authenticated |
| GET /jobs/new | Admin |
| POST /jobs/new | Admin |
| GET /jobs/:id/edit | Admin |
| POST /jobs/:id/edit | Admin |
| POST /jobs/:id/delete | Admin |
| DELETE /jobs/:id | Admin |

---
## 11. View Layer Changes
1. Add `login.njk` & `register.njk` with DaisyUI form components.  
2. Update `layout.njk` (or navbar partial) to render different nav items:
   - If `user` in template context: show email + Logout button + if admin show "Admin Dashboard" or "New Job".  
   - Else: show Login / Register links.
3. Pass `req.user` to `res.locals` in `auth-middleware` so all views have easy access.

---
## 12. Implementation Steps (Detailed)
### Step 1: Install Dependencies
Add packages listed above. Commit.

### Step 2: Add User Schema & Repository
Create Drizzle schema in `db/schema.ts`. Create `models/user.ts` interface. Implement `user-repository.ts` with CRUD wrappers using Drizzle queries. Include `findByEmail`, `create`, `updateLastLogin`.

### Step 3: Seed Admin User
On startup, check if admin email exists; if not, create with env password (hash). Print warning if default password not changed.

### Step 4: Token Service
`token-service.ts` exports:
```
signAccessToken(user) => string
signRefreshToken(user) => string
verifyAccess(token) => payload | throws
verifyRefresh(token) => payload | throws
```
Add helper to set cookies:
```
setAuthCookies(res, { accessToken, refreshToken })
clearAuthCookies(res)
```

### Step 5: Auth Service
Responsibilities:
1. `register(email, password)` – validate uniqueness, hash password, store user.  
2. `login(email, password)` – validate credentials, update lastLogin, return tokens.  
3. `refresh(refreshToken)` – verify & issue new access token (rotate refresh token optionally).  
4. Password hashing/verification.  
5. (Optional) bridging calls to Better Auth if delegating password or session logic.

### Step 6: Better Auth Integration (Adapter)
Depending on Better Auth offering (SaaS or library):
1. If SaaS with REST: create `better-auth-service.ts` containing functions `createUser`, `authenticateUser` hitting their API (store their userId mapped locally).  
2. If library wraps Express middleware (hypothetical): initialize in `app.ts` before routes; adapt to produce JWT we sign locally OR rely on their JWT and map roles.  
3. Keep a feature flag: `USE_BETTER_AUTH=true|false` in env to toggle.  

### Step 7: Controllers & Routes
`auth-controller.ts` exposing:
```
GET /auth/login -> render login.njk
POST /auth/login -> validate, authService.login, set cookies, redirect
GET /auth/register -> render register.njk
POST /auth/register -> validate, authService.register (+ auto login optionally), redirect
POST /auth/logout -> clear cookies, redirect
POST /auth/refresh -> json { accessToken: ... } (for XHR)
```
Add `auth-routes.ts` and mount in `routes/index.ts` under `/auth` BEFORE job routes so pattern precedence unaffected.

### Step 8: Middleware
`auth-middleware.ts`:
```
import cookieParser from 'cookie-parser'; // add to app before this
// 1. read cookies
// 2. verify access token -> attach user object to req & res.locals.user
// 3. swallow invalid token gracefully (user stays anonymous)
```
`require-auth.ts` & `require-admin.ts` throw 401 / 403 or redirect to login.

### Step 9: Apply Guards to Job Routes
Wrap admin routes: e.g.
```
router.get('/jobs/new', requireAdmin, jobRoleController.showNewJobRoleForm...)
router.post('/jobs/new', requireAdmin, ...)
```
Wrap apply routes with `requireAuth`.

### Step 10: Update Views
Add forms with CSRF token hidden field (later enhancement). Use DaisyUI classes.

### Step 11: Testing
Add tests (Vitest):
1. `auth-service.test.ts` – register + login success, bad password, duplicate email.  
2. `token-service.test.ts` – sign/verify, expired token case (mock Date or set short ttl).  
3. `middleware/require-auth.test.ts` – denies when no token, allows when valid.  
4. Integration: simulate login then access admin route.  
Use in-memory SQLite database `:memory:` for tests with Drizzle (reset between tests).

### Step 12: Security Hardening (Phase 1)
1. Ensure cookies: `Secure` (when behind HTTPS), `HttpOnly`, `SameSite=Lax/Strict`.  
2. Rate limit login endpoint (e.g., simple in-memory map or a library like `express-rate-limit`).  
3. Input validation sanitisation (strip HTML).  
4. Use strong password hashing (Argon2id preferred).  
5. Avoid putting PII in JWT; only id + role.  
6. Set `helmet` middleware (consider adding `helmet` dependency) to improve headers.

### Step 13: Future Enhancements (Backlog)
- Email verification & password reset flow.  
- Remember device & revoke sessions UI.  
- Admin panel for managing users & roles.  
- Audit logging of auth events.  
- Key rotation (kid header) for JWT.  
- WebAuthn / MFA.

---
## 13. Drizzle Schema & Database Setup
### Database Schema (src/db/schema.ts)
```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).notNull().default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
```

### Database Connection (src/db/index.ts)
```ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema.js';

const sqlite = new Database(process.env.DATABASE_URL || './app.db');
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
migrate(db, { migrationsFolder: './drizzle' });
```

### User Repository (src/repositories/user-repository.ts)
```ts
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, type User, type InsertUser } from '../db/schema.js';

export class UserRepository {
  async findByEmail(email: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
  }

  async findById(id: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  async create(userData: Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: InsertUser = {
      ...userData,
      email: userData.email.toLowerCase(),
    };
    
    return db.insert(users).values(newUser).returning().get();
  }

  async updateLastLogin(id: string): Promise<void> {
    await db.update(users)
      .set({ 
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  async updateRole(id: string, role: 'admin' | 'user'): Promise<void> {
    await db.update(users)
      .set({ 
        role,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }
}

export const userRepository = new UserRepository();
```

### Drizzle Configuration (drizzle.config.ts)
```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './app.db',
  },
} satisfies Config;
```

### Package.json Scripts Addition
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:sqlite",
    "db:push": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio"
  }
}
```

---
## 14. Example Snippets (Illustrative Only)
### Token Service (sketch)
```ts
import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET!;
const refreshSecret = process.env.JWT_REFRESH_SECRET!;

export function signAccessToken(user: { id: string; role: string }) {
  return jwt.sign({ role: user.role }, accessSecret, { subject: user.id, expiresIn: process.env.JWT_ACCESS_TTL || '15m' });
}

export function signRefreshToken(user: { id: string }) {
  return jwt.sign({ typ: 'refresh' }, refreshSecret, { subject: user.id, expiresIn: process.env.JWT_REFRESH_TTL || '30d' });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, accessSecret);
}
```

### Auth Middleware (sketch)
```ts
export function authMiddleware(req, res, next) {
  const token = req.cookies?.access_token;
  if (!token) return next();
  try {
    const payload = verifyAccess(token) as any;
    req.user = { id: payload.sub, role: payload.role };
    res.locals.user = req.user;
  } catch (_) {
    // ignore invalid token
  }
  next();
}
```

### Require Admin
```ts
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).redirect('/auth/login');
  if (req.user.role !== 'admin') return res.status(403).render('error', { message: 'Forbidden' });
  next();
}
```

---
## 15. Implementation Order Checklist
1. Install deps (including Drizzle ORM and better-sqlite3).  
2. Set up Drizzle config and schema.  
3. Generate and run initial migration.  
4. Add user model + repository using Drizzle.  
5. Create token + auth services.
6. Seed admin on startup.  
7. Create controllers + routes + views.  
8. Add middleware & integrate into `app.ts`.  
9. Protect job routes.  
10. Update layout nav.  
11. Add tests & make them pass (using in-memory SQLite).  
12. Security hardening (rate limit, helmet).  
13. Document environment variables in README.  
14. Open follow-up issues for backlog items.

---
## 15. Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Misuse of Base64 as encryption | Explicit documentation (this section) + code comments |
| Token theft via XSS | HTTP-only cookies + minimal payload |
| CSRF on state-changing forms | SameSite cookies + (later) CSRF token middleware |
| Password brute force | Rate limiting + strong hashing parameters |
| Stale refresh tokens after role change | Include `ver` claim or token version and bump on privilege change |

---
## 16. Definition of Done
- All new routes functional.  
- Admin can create/edit/delete jobs; normal user cannot.  
- Unauthenticated user redirected to login when accessing protected resources.  
- Tests covering success & failure paths.  
- README updated with auth usage summary.  
- No high severity security lint warnings.  

---
## 17. Next Actions
1. Approve this plan.  
2. Proceed with dependency install & scaffold (can be batched into first PR).  
3. Implement services + middleware + routes + views.  
4. Add tests, then enforce in CI.  

---
Questions / clarifications welcome before implementation.
