import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

config({ path: '.env.local' });

let dbUrl = process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error('POSTGRES_URL not set');
  process.exit(1);
}

dbUrl = dbUrl.replace(/^['"]|['"]$/g, '');

async function applyMigration() {
  try {
    const sql = neon(dbUrl!);
    
    // Read the migration file
    const migrationPath = join(process.cwd(), 'drizzle', '0004_bingo_shouts.sql');
    const migrationSql = readFileSync(migrationPath, 'utf-8');
    
    console.log('Applying migration: 0004_bingo_shouts.sql');
    
    // Execute the migration
    await (sql as any).query(migrationSql);
    
    console.log('✓ Migration applied successfully!');
    
  } catch (error) {
    console.error('✗ Failed to apply migration:', error);
    process.exit(1);
  }
}

applyMigration();
