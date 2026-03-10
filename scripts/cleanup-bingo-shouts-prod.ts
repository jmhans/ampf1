import { neon } from '@neondatabase/serverless';

/**
 * ONE-TIME CLEANUP SCRIPT: Remove bingo_shouts table from production
 * 
 * Usage:
 * AMPF1_POSTGRES_URL=<your-production-url-here> npx tsx scripts/cleanup-bingo-shouts-prod.ts
 * 
 * The production URL is NOT stored in .env.local to prevent accidental use
 */

const prodUrl = process.env.AMPF1_POSTGRES_URL;

if (!prodUrl) {
  console.error('❌ AMPF1_POSTGRES_URL environment variable not set');
  console.error('Usage: AMPF1_POSTGRES_URL=<url> npx tsx scripts/cleanup-bingo-shouts-prod.ts');
  process.exit(1);
}

console.warn('⚠️  REMOVING bingo_shouts table from PRODUCTION database');
console.warn('Endpoint:', prodUrl.substring(0, 80) + '...');
console.warn('Time:', new Date().toISOString());

async function cleanup() {
  try {
    const sql = neon(prodUrl!);
    
    // Drop the table with CASCADE to handle foreign keys
    // Using sql.query for conventional queries with placeholders
    await (sql as any).query(`DROP TABLE IF EXISTS "ampf1"."bingo_shouts" CASCADE;`);
    console.log('✓ Successfully removed bingo_shouts table from production');
    console.log('✓ All dependent data cleaned up');
    
  } catch (error) {
    console.error('✗ Failed to cleanup production:', error);
    process.exit(1);
  }
}

cleanup();
