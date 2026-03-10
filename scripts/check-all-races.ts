import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const url = process.env.POSTGRES_URL?.replace(/^['"]|['"]$/g, '');
if (!url) { console.error('POSTGRES_URL not set'); process.exit(1); }

async function run() {
  const sql = neon(url!);
  const races = await (sql as any).query(`
    SELECT id, name, status, race_date FROM "ampf1"."races" 
    ORDER BY race_date ASC
  `);
  console.log('All races:');
  races.forEach((r: any) => console.log(`  ${r.id}: ${r.name} - ${r.status}`));
}

run().catch(e => { console.error(e); process.exit(1); });
