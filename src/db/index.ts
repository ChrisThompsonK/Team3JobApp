import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema.js';

const sqlite = new Database(process.env['DATABASE_URL'] || './app.db');
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
export function runMigrations() {
  try {
    migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  sqlite.close();
  console.log('Database connection closed.');
  process.exit(0);
});