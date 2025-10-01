#!/usr/bin/env node

import { createApp, startServer } from './app.js';

// Create the application using the 3-tier architecture
const app = createApp();

// Only run server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await startServer(app);
}

// Export for testing and external use
export { app, createApp, startServer };
