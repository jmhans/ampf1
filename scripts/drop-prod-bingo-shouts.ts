import { neon } from '@neondatabase/serverless';

// Production endpoint - pass via environment variable, never hardcode
const prodUrl = process.env.AMPF1_POSTGRES_URL;
if (!prodUrl) {
  console.error('AMPF1_POSTGRES_URL not set');
  process.exit(1);
}

async function cleanup() {
  console.warn('⚠️  Removing bingo_shouts table from PRODUCTION...');
  
  try {
    const sql = neon(prodUrl!);
    
    // Drop the table
    await (sql as any).query(`DROP TABLE IF EXISTS "ampf1"."bingo_shouts" CASCADE`);
    
    console.log('✓ Successfully removed bingo_shouts from production');
  } catch (error) {
    console.error('✗ Failed to remove from production:', error);
    process.exit(1);
  }
}

cleanup();
