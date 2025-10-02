#!/usr/bin/env node

import { createApp, startServer } from "./app.js";

// Create the application using the 3-tier architecture
const app = createApp();

// Start the server when this module is run directly
// (Compatible with main branch expectations while using 3-tier architecture)
await startServer(app);

// Export for testing and external use
export { app, createApp, startServer };
