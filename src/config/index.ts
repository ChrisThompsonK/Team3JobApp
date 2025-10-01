import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
} as const;
