import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('[SKYLINE_DB] DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[SKYLINE_DB] Closing database connection...');
  await client.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[SKYLINE_DB] Closing database connection...');
  await client.end();
  process.exit(0);
});
