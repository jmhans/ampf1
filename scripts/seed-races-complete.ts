/**
 * Seed complete 2026 F1 calendar
 * Run with: npx tsx scripts/seed-races-complete.ts
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { pgSchema, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

const url = process.env.POSTGRES_URL_DEV ?? process.env.POSTGRES_URL;
if (!url) throw new Error('No POSTGRES_URL_DEV or POSTGRES_URL set');

const sql = neon(url);
const db = drizzle(sql);

const ampf1Schema = pgSchema('ampf1');
const seasons = ampf1Schema.table('seasons', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull().unique(),
  name: text('name').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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

// 2026 F1 Calendar - from ESPN official schedule (24 races)
const RACES_2026 = [
  { round: 1, name: 'Australian Grand Prix', circuit: 'Melbourne Grand Prix Circuit', country: 'Australia', date: '2026-03-07' },
  { round: 2, name: 'Chinese Grand Prix', circuit: 'Shanghai International Circuit', country: 'China', date: '2026-03-15' },
  { round: 3, name: 'Japanese Grand Prix', circuit: 'Suzuka International Racing Course', country: 'Japan', date: '2026-03-29' },
  { round: 4, name: 'Bahrain Grand Prix', circuit: 'Bahrain International Circuit', country: 'Bahrain', date: '2026-04-12' },
  { round: 5, name: 'Saudi Arabian Grand Prix', circuit: 'Jeddah Street Circuit', country: 'Saudi Arabia', date: '2026-04-19' },
  { round: 6, name: 'Miami Grand Prix', circuit: 'Miami International Autodrome', country: 'USA', date: '2026-05-03' },
  { round: 7, name: 'Canadian Grand Prix', circuit: 'Circuit Gilles-Villeneuve', country: 'Canada', date: '2026-05-24' },
  { round: 8, name: 'Monaco Grand Prix', circuit: 'Circuit de Monaco', country: 'Monaco', date: '2026-06-07' },
  { round: 9, name: 'Barcelona-Catalunya Grand Prix', circuit: 'Circuit de Catalunya', country: 'Spain', date: '2026-06-14' },
  { round: 10, name: 'Austrian Grand Prix', circuit: 'Red Bull Ring', country: 'Austria', date: '2026-06-28' },
  { round: 11, name: 'British Grand Prix', circuit: 'Silverstone Circuit', country: 'United Kingdom', date: '2026-07-05' },
  { round: 12, name: 'Belgian Grand Prix', circuit: 'Circuit de Spa-Francorchamps', country: 'Belgium', date: '2026-07-19' },
  { round: 13, name: 'Hungarian Grand Prix', circuit: 'Hungaroring', country: 'Hungary', date: '2026-07-26' },
  { round: 14, name: 'Dutch Grand Prix', circuit: 'Circuit Park Zandvoort', country: 'Netherlands', date: '2026-08-23' },
  { round: 15, name: 'Italian Grand Prix', circuit: 'Autodromo Nazionale Monza', country: 'Italy', date: '2026-09-06' },
  { round: 16, name: 'Spanish Grand Prix', circuit: 'Circuito Permanente de Jerez', country: 'Spain', date: '2026-09-13' },
  { round: 17, name: 'Azerbaijan Grand Prix', circuit: 'Baku City Circuit', country: 'Azerbaijan', date: '2026-09-26' },
  { round: 18, name: 'Singapore Grand Prix', circuit: 'Marina Bay Street Circuit', country: 'Singapore', date: '2026-10-11' },
  { round: 19, name: 'United States Grand Prix', circuit: 'Circuit of the Americas', country: 'USA', date: '2026-10-25' },
  { round: 20, name: 'Mexico City Grand Prix', circuit: 'Autodromo Hermanos Rodriguez', country: 'Mexico', date: '2026-11-01' },
  { round: 21, name: 'São Paulo Grand Prix', circuit: 'Autodromo Jose Carlos Pace', country: 'Brazil', date: '2026-11-08' },
  { round: 22, name: 'Las Vegas Grand Prix', circuit: 'Las Vegas Street Circuit', country: 'USA', date: '2026-11-21' },
  { round: 23, name: 'Qatar Grand Prix', circuit: 'Losail International Circuit', country: 'Qatar', date: '2026-11-29' },
  { round: 24, name: 'Abu Dhabi Grand Prix', circuit: 'Yas Marina Circuit', country: 'United Arab Emirates', date: '2026-12-06' },
];

async function main() {
  console.log('Seeding complete 2026 F1 calendar...');

  // Ensure 2026 season exists
  const existingSeason = await db
    .select()
    .from(seasons)
    .where(eq(seasons.year, 2026));

  let seasonId = existingSeason[0]?.id;
  if (!seasonId) {
    console.log('Creating 2026 season...');
    const result = await db
      .insert(seasons)
      .values({ year: 2026, name: 'Formula 1 World Championship 2026', isActive: true })
      .returning({ id: seasons.id });
    seasonId = result[0].id;
  }

  // Clear existing races for this season
  await db.delete(races).where(eq(races.seasonId, seasonId));

  // Parse and insert races
  const now = new Date();
  const racesToInsert = RACES_2026.map((r) => {
    const raceDate = new Date(r.date);
    return {
      seasonId,
      round: r.round,
      name: r.name,
      circuit: r.circuit,
      country: r.country,
      raceDate,
      status: raceDate < now ? 'completed' : 'scheduled',
    };
  });

  console.log(`Inserting ${racesToInsert.length} races...`);
  await db.insert(races).values(racesToInsert);
  console.log('✓ Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
