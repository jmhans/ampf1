import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const url = process.env.POSTGRES_URL?.replace(/^['"]|['"]$/g, '');
if (!url) { console.error('POSTGRES_URL not set'); process.exit(1); }

async function run() {
  const sql = neon(url!);
  const races = await (sql as any).query(`
    SELECT id, name, status, race_date FROM "ampf1"."races" 
    ORDER BY race_date DESC 
    LIMIT 10
  `);
  console.log('Races:', races);
}

run().catch(e => { console.error(e); process.exit(1); });
