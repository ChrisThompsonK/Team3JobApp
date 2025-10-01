#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Request, Response } from 'express';
import express from 'express';
import nunjucks from 'nunjucks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env['PORT'] || 3000;

// Configure Nunjucks
nunjucks.configure(path.join(__dirname, '../views'), {
  autoescape: true,
  express: app,
  watch: process.env['NODE_ENV'] !== 'production', // Enable auto-reloading in development
});

// Set Nunjucks as the template engine
app.set('view engine', 'njk');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.render('index', {
    message: 'Hello World!',
    service: 'Team 3 Job Application Frontend',
    environment: process.env['NODE_ENV'] || 'development',
    timestamp: new Date().toISOString(),
    greeting: greeting('Developer'),
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.render('health', {
    status: 'healthy',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/daisyui-test', (_req: Request, res: Response) => {
  res.render('daisyui-test');
});

const greeting = (name: string): string => {
  return `Hello, ${name}! Welcome to the Team 3 Job Application Frontend.`;
};

const startServer = async (): Promise<void> => {
  try {
    console.log('🚀 Team 3 Job App Frontend is starting...');

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/health`);
      console.log(greeting('Developer'));
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Start the server when this module is run directly
await startServer();

export { app, greeting, startServer };
