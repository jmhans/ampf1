import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

let dbUrl = process.env.POSTGRES_URL;

if (!dbUrl) {
  console.error('POSTGRES_URL not set');
  process.exit(1);
}

// Remove quotes if they exist
dbUrl = dbUrl.replace(/^['"]|['"]$/g, '');

async function checkTables() {
  const sql = neon(dbUrl!);
  try {
    const result = await (sql as any).query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema='ampf1' 
      ORDER BY table_name
    `);
    console.log('Tables in ampf1 schema:');
    result.forEach((row: any) => console.log(`  - ${row.table_name}`));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();
