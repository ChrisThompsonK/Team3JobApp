import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validates that a required environment variable is set
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `FATAL: Required environment variable ${name} is not set. Application cannot start.`
    );
  }
  return value;
}

/**
 * Application Configuration
 */
export const config = {
  // Server Configuration
  server: {
    port: Number(process.env['PORT']) || 3000,
    host: process.env['HOST'] || 'localhost',
  },

  // Environment Configuration
  env: {
    nodeEnv: process.env['NODE_ENV'] || 'development',
    isDevelopment: process.env['NODE_ENV'] === 'development',
    isProduction: process.env['NODE_ENV'] === 'production',
    isTest: process.env['NODE_ENV'] === 'test',
  },

  // Path Configuration
  paths: {
    root: path.resolve(__dirname, '../..'),
    src: path.resolve(__dirname, '..'),
    views: path.resolve(__dirname, '../../views'),
    public: path.resolve(__dirname, '../../public'),
    dist: path.resolve(__dirname, '../../dist'),
  },

  // Template Engine Configuration
  template: {
    engine: 'njk',
    autoescape: true,
    watch: process.env['NODE_ENV'] !== 'production',
  },

  // Application Metadata
  app: {
    name: 'Team 3 Job Application Frontend',
    version: process.env['npm_package_version'] || '1.0.0',
    description: 'Team 3 Job Application Frontend',
  },

  // Backend API Configuration
  api: {
    baseUrl: process.env['BACKEND_URL'] || 'http://localhost:3001/api',
  },

  // Authentication Configuration - ALL REQUIRED
  auth: {
    // JWT Secrets - REQUIRED, no defaults
    jwt: {
      accessSecret: requireEnv('JWT_ACCESS_SECRET'),
      refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
      accessTokenExpiry: '15m',
      refreshTokenExpiry: '30d',
    },

    // Password Hashing - REQUIRED, no defaults
    password: {
      saltRounds: Number.parseInt(requireEnv('PASSWORD_HASH_ROUNDS'), 10),
      minLength: 9,
    },

    // Cookie Configuration
    cookie: {
      secure: process.env['NODE_ENV'] === 'production',
      httpOnly: true,
      accessTokenMaxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
      refreshTokenMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    },
  },
} as const;
