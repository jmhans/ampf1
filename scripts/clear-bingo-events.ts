/**
 * Clear bingo events from production
 * Run with: POSTGRES_URL=<prod-url> npx tsx scripts/clear-bingo-events.ts
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { bingoEvents } from '../app/lib/db/schema';

const url = process.env.POSTGRES_URL;
if (!url) throw new Error('POSTGRES_URL not set');

const sql = neon(url!);
const db = drizzle(sql);

async function clearBingoEvents() {
  try {
    console.log('Clearing bingo events from production...');
    await db.delete(bingoEvents);
    console.log('✓ All bingo events cleared');
  } catch (error) {
    console.error('Error clearing bingo events:', error);
    process.exit(1);
  }
}

clearBingoEvents();
