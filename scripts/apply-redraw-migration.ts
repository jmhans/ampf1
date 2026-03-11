import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('Error: POSTGRES_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function applyMigration() {
  try {
    console.log('Applying 0006_add_redraw_count migration to dev db...');
    
    const migration = `DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='ampf1' AND table_name='entry_cards' AND column_name='redraw_count') THEN
    ALTER TABLE "ampf1"."entry_cards" ADD COLUMN "redraw_count" integer NOT NULL DEFAULT 0;
  END IF;
END $$;`;

    await sql.query(migration);
    console.log('✓ Migration applied successfully');

    // Verify the column exists
    const result = await sql.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema='ampf1' AND table_name='entry_cards' AND column_name='redraw_count'
    `);

    if (result && result.length > 0) {
      console.log('✓ Column verified:');
      console.log(`  - Name: ${result[0].column_name}`);
      console.log(`  - Type: ${result[0].data_type}`);
      console.log(`  - Default: ${result[0].column_default}`);
    }
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();
