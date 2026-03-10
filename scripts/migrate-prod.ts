import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Apply pending migrations to the PRODUCTION database.
 *
 * Usage:
 *   AMPF1_POSTGRES_URL=<prod-url> npx tsx scripts/migrate-prod.ts
 */

const prodUrl = process.env.AMPF1_POSTGRES_URL;
if (!prodUrl) {
  console.error('❌ AMPF1_POSTGRES_URL not set');
  console.error('Usage: AMPF1_POSTGRES_URL=<url> npx tsx scripts/migrate-prod.ts');
  process.exit(1);
}

console.warn('⚠️  Applying migrations to PRODUCTION database');
console.warn('Endpoint:', prodUrl.substring(0, 80) + '...');

async function migrate() {
  const sql = neon(prodUrl!);

  const migrations = [
    '0004_bingo_shouts.sql',
  ];

  for (const file of migrations) {
    const migrationSql = readFileSync(join(process.cwd(), 'drizzle', file), 'utf-8');
    console.log(`\nApplying: ${file}`);
    try {
      await (sql as any).query(migrationSql);
      console.log(`✓ ${file} applied`);
    } catch (error) {
      console.error(`✗ ${file} failed:`, error);
      process.exit(1);
    }
  }

  console.log('\n✅ All migrations applied to production!');
}

migrate();
