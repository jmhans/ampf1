import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDb | null = null;

function getDb(): DrizzleDb {
  if (_db) return _db;

  const dbUrl = process.env.NODE_ENV === 'production'
    ? (process.env.POSTGRES_URL || process.env.AMPF1_POSTGRES_URL)
    : (process.env.POSTGRES_URL_DEV || process.env.POSTGRES_URL);

  if (!dbUrl) {
    throw new Error('Database URL not found. Set POSTGRES_URL or POSTGRES_URL_DEV in environment variables.');
  }

  const sql = neon(dbUrl);
  _db = drizzle(sql, { schema });
  return _db;
}

// Proxy so callers can still use `db.select()...` directly
export const db = new Proxy({} as DrizzleDb, {
  get(_, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
