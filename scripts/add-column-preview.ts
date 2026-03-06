import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const client = neon(process.env.POSTGRES_URL!);
const db = drizzle(client);

(async () => {
  try {
    console.log('Adding race_start_time column to preview database...');
    await db.execute(
      sql`ALTER TABLE "ampf1"."races" ADD COLUMN IF NOT EXISTS "race_start_time" timestamp`
    );
    console.log('✓ Column added successfully');
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
