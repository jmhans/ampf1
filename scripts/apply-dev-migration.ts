import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config({ path: '.env.local' });

const dbUrl = process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error('❌ POSTGRES_URL not set in .env.local');
  process.exit(1);
}

async function applyMigration() {
  try {
    // Use query() method instead of template literal
    const sql = neon(dbUrl!);
    
    console.log('📝 Reading migration file...');
    const migrationPath = path.join(process.cwd(), 'drizzle', '0004_bingo_shouts.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('🚀 Applying migration to dev database...');
    const result = await sql.query(migrationSql);
    
    console.log('✅ Migration applied successfully to dev!');
    console.log('📊 Result:', result);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
