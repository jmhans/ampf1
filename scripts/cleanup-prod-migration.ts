import { neon } from '@neondatabase/serverless';

// This would be the production URL if AMPF1_POSTGRES_URL is set
const prodUrl = process.env.AMPF1_POSTGRES_URL;
if (!prodUrl) {
  console.error('AMPF1_POSTGRES_URL (production) not set');
  process.exit(1);
}

console.warn('⚠️  REMOVING bingo_shouts table from PRODUCTION database');
console.warn('Endpoint:', prodUrl.substring(0, 50) + '...');

async function cleanup() {
  const client = neon(prodUrl!);
  
  try {
    await (client as any).query(`DROP TABLE IF EXISTS "ampf1"."bingo_shouts" CASCADE;`);
    console.log('✓ Removed bingo_shouts from production');
  } catch (error) {
    console.error('✗ Failed to cleanup production:', error);
    process.exit(1);
  }
}

cleanup();
