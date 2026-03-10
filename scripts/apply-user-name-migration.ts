import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const url = process.env.POSTGRES_URL?.replace(/^['"]|['"]$/g, '');
if (!url) { console.error('POSTGRES_URL not set'); process.exit(1); }

async function run() {
  const sql = neon(url!);
  await (sql as any).query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='ampf1' AND table_name='participants' AND column_name='user_name'
      ) THEN
        ALTER TABLE "ampf1"."participants" ADD COLUMN "user_name" text;
      END IF;
    END $$
  `);
  console.log('✓ user_name column applied to participants');
}

run().catch(e => { console.error(e); process.exit(1); });
