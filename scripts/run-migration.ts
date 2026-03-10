import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import fs from 'fs';

config({ path: '.env.local' });

// Use the POSTGRES_URL from .env.local which points to dev
const dbUrl = process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error('POSTGRES_URL not set in .env.local');
  process.exit(1);
}

console.log('Using database endpoint:', dbUrl.substring(0, 50) + '...');

async function runMigration() {
  const client = neon(dbUrl!);
  
  try {
    console.log('Reading migration file...');
    const migrationSql = fs.readFileSync('./drizzle/0004_bingo_shouts.sql', 'utf-8');
    
    console.log('Executing migration on dev database...');
    const result = await client(migrationSql);
    
    console.log('✓ Migration applied successfully to dev!');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
