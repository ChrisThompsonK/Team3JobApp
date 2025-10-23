import cookieParser from 'cookie-parser';
import express from 'express';
import methodOverride from 'method-override';
import nunjucks from 'nunjucks';
import { config } from './config/index.js';
import { runMigrations } from './db/index.js';
import { authMiddleware } from './middleware/auth-middleware.js';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/index.js';
import routes from './routes/index.js';
import { adminSeedService } from './services/admin-seed-service.js';

/**
 * Create and configure the Express application
 */
export const createApp = (): express.Application => {
  const app = express();

  // Configure Nunjucks template engine
  const env = nunjucks.configure(config.paths.views, {
    autoescape: config.template.autoescape,
    express: app,
    watch: config.template.watch,
  });

  // Add environment variables as global variables for templates
  env.addGlobal('process', {
    env: {
      GA_MEASUREMENT_ID: process.env['GA_MEASUREMENT_ID'],
      NODE_ENV: process.env['NODE_ENV'],
    },
  });

  // Set template engine
  app.set('view engine', config.template.engine);
  app.set('views', config.paths.views);

  // Middleware setup
  app.use(requestLogger);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser()); // Parse cookies for authentication
  app.use(methodOverride('_method')); // Enable DELETE/PUT requests from forms

  // Serve static files
  app.use(express.static(config.paths.public));

  // Authentication middleware - must come after cookieParser
  app.use(authMiddleware);

  // Routes
  app.use('/', routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

/**
 * Start the server
 */
export const startServer = async (app: express.Application): Promise<void> => {
  try {
    console.log(`🚀 ${config.app.name} is starting...`);

    // Initialize database
    console.log('📀 Initializing database...');
    runMigrations();

    // Ensure admin user exists
    console.log('👤 Checking admin user...');
    await adminSeedService.ensureAdminExists();

    const server = app.listen(config.server.port, () => {
      console.log(`✅ Server running on http://${config.server.host}:${config.server.port}`);
      console.log(`🏗️  Environment: ${config.env.nodeEnv}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};
