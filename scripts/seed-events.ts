/**
 * Seed bingo_events with the 75 mock F1 events.
 * Run with: npx tsx scripts/seed-events.ts
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { pgSchema, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core';

const url = process.env.POSTGRES_URL_DEV ?? process.env.POSTGRES_URL;
if (!url) throw new Error('No POSTGRES_URL_DEV or POSTGRES_URL set');

const sql = neon(url);
const db = drizzle(sql);

// Inline schema so we don't pull in Next.js app code
const ampf1Schema = pgSchema('ampf1');
const bingoEvents = ampf1Schema.table('bingo_events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  isActive: boolean('is_active').default(true).notNull(),
  isAchieved: boolean('is_achieved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const MOCK_EVENTS = [
  // Safety
  { name: 'Safety car deployed', category: 'safety' },
  { name: 'Virtual Safety Car (VSC)', category: 'safety' },
  { name: 'Red flag', category: 'safety' },
  { name: 'Standing restart after red flag', category: 'safety' },
  { name: 'Double yellow flags', category: 'safety' },
  { name: 'Safety car lasts 3+ laps', category: 'safety' },
  { name: 'Safety car leads to pit chaos', category: 'safety' },
  { name: 'Medical car deployed on track', category: 'safety' },
  // Race incidents
  { name: 'First lap collision', category: 'race' },
  { name: 'Fastest lap awarded', category: 'race' },
  { name: 'Pole sitter leads lap 1', category: 'race' },
  { name: 'Race leader changes 3+ times', category: 'race' },
  { name: 'Last lap position change', category: 'race' },
  { name: 'Photo finish (< 1 second)', category: 'race' },
  { name: 'Lap record broken', category: 'race' },
  { name: 'Podium sweep by one team', category: 'race' },
  { name: 'Top 3 all on different strategies', category: 'race' },
  { name: 'Race winner starts from pole', category: 'race' },
  { name: 'DRS unavailable early in race', category: 'race' },
  // Driver events
  { name: 'Driver DNF — mechanical', category: 'driver' },
  { name: 'Driver DNF — collision', category: 'driver' },
  { name: 'Driver retires in final 5 laps', category: 'driver' },
  { name: 'Driver spins but continues', category: 'driver' },
  { name: 'Driver goes off track & continues', category: 'driver' },
  { name: 'Driver gains advantage off track', category: 'driver' },
  { name: 'Comeback from last to top 5', category: 'driver' },
  { name: 'Two teammates collide', category: 'driver' },
  { name: 'Driver loses 3+ positions at start', category: 'driver' },
  { name: 'Champion finishes outside top 5', category: 'driver' },
  { name: 'Driver scores first career point', category: 'driver' },
  { name: 'Driver overtakes on final lap', category: 'driver' },
  { name: 'Driver sets fastest personal lap', category: 'driver' },
  { name: 'Driver uses "the move" — divebomb', category: 'driver' },
  { name: 'Driver radio complaint goes viral', category: 'driver' },
  // Penalties
  { name: 'Time penalty issued', category: 'penalty' },
  { name: 'Drive-through penalty', category: 'penalty' },
  { name: 'Stop-go penalty', category: 'penalty' },
  { name: 'Grid penalty served', category: 'penalty' },
  { name: 'Post-race position change', category: 'penalty' },
  { name: 'Track limits warning', category: 'penalty' },
  { name: 'Investigated but no action', category: 'penalty' },
  { name: 'Pit lane speeding penalty', category: 'penalty' },
  // Pit stops
  { name: 'Sub-2.5s pit stop', category: 'pit' },
  { name: 'Sub-2s pit stop', category: 'pit' },
  { name: 'Botched pit stop (> 4s)', category: 'pit' },
  { name: 'Dropped wheel in pit lane', category: 'pit' },
  { name: 'Unsafe release penalty', category: 'pit' },
  { name: 'Double stacking (teammates same lap)', category: 'pit' },
  { name: 'Undercut works perfectly', category: 'pit' },
  { name: 'Overcut succeeds', category: 'pit' },
  { name: 'Pit stop under safety car', category: 'pit' },
  { name: 'Driver pits from the lead', category: 'pit' },
  // Strategy
  { name: 'One-stop strategy wins', category: 'strategy' },
  { name: 'Two-stop strategy wins', category: 'strategy' },
  { name: 'Three-stop strategy used', category: 'strategy' },
  { name: 'Tire blowout / puncture', category: 'strategy' },
  { name: 'Ultra-long stint (no stop for 35+ laps)', category: 'strategy' },
  { name: '"Save the car" team radio', category: 'strategy' },
  { name: 'Soft tire racer on podium', category: 'strategy' },
  { name: 'Strategy split between teammates', category: 'strategy' },
  // Weather
  { name: 'Race starts in wet conditions', category: 'weather' },
  { name: 'Weather changes mid-race', category: 'weather' },
  { name: 'Intermediates used', category: 'weather' },
  { name: 'Full wets used', category: 'weather' },
  { name: 'Safety car due to rain', category: 'weather' },
  { name: 'Race suspended for weather', category: 'weather' },
  // Team/Misc
  { name: 'Ferrari strategy error (meme)', category: 'team' },
  { name: 'Underdog team scores points', category: 'team' },
  { name: 'Both cars from one team in points', category: 'team' },
  { name: 'Team principal on pitwall drama', category: 'team' },
  { name: 'New team records best-ever finish', category: 'team' },
  { name: 'Car catches fire in pit lane', category: 'team' },
  { name: 'Commentator mispronounces name', category: 'other' },
  { name: 'Post-race protest filed', category: 'other' },
  { name: 'Race director issues statement', category: 'other' },
];

async function main() {
  console.log(`Inserting ${MOCK_EVENTS.length} events...`);
  await db.insert(bingoEvents).values(MOCK_EVENTS);
  console.log('Done!');
}

main().catch((err) => { console.error(err); process.exit(1); });
