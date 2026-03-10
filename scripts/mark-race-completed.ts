import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const url = process.env.POSTGRES_URL?.replace(/^['"]|['"]$/g, '');
if (!url) { console.error('POSTGRES_URL not set'); process.exit(1); }

async function run() {
  const sql = neon(url!);
  
  // Get the first race
  const races = await (sql as any).query(`
    SELECT id, name FROM "ampf1"."races" 
    ORDER BY race_date ASC 
    LIMIT 1
  `);
  
  const firstRace = races[0];
  if (!firstRace) {
    console.log('No races found');
    return;
  }
  
  console.log('Marking race as completed:', firstRace.name);
  
  // Update to completed
  await (sql as any).query(`
    UPDATE "ampf1"."races" 
    SET status = 'completed' 
    WHERE id = ${firstRace.id}
  `);
  
  console.log('✓ Race updated');
}

run().catch(e => { console.error(e); process.exit(1); });
