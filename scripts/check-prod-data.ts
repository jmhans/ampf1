/**
 * Check what's in production database
 * Run with: npx tsx scripts/check-prod-data.ts
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { pgSchema, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';

const url = process.env.POSTGRES_URL;
if (!url) throw new Error('No POSTGRES_URL set');

console.log('Connecting to:', url.substring(0, 50) + '...');

const sql = neon(url!);
const db = drizzle(sql);

const ampf1Schema = pgSchema('ampf1');
const drivers = ampf1Schema.table('drivers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  team: text('team').notNull(),
  number: integer('number'),
  nationality: text('nationality'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const races = ampf1Schema.table('races', {
  id: serial('id').primaryKey(),
  seasonId: integer('season_id').notNull(),
  round: integer('round').notNull(),
  name: text('name').notNull(),
  circuit: text('circuit'),
  country: text('country'),
  raceDate: timestamp('race_date'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

async function main() {
  try {
    const driverCount = await db.select().from(drivers);
    const raceCount = await db.select().from(races);
    
    console.log(`\nDrivers in DB: ${driverCount.length}`);
    if (driverCount.length > 0) {
      console.log('First 3 drivers:');
      driverCount.slice(0, 3).forEach(d => console.log(`  - ${d.name} (${d.team})`));
    }
    
    console.log(`\nRaces in DB: ${raceCount.length}`);
    if (raceCount.length > 0) {
      console.log('First 3 races:');
      raceCount.slice(0, 3).forEach(r => console.log(`  - ${r.name} (${r.country})`));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
