/**
 * Seed F1 2026 races from ESPN API
 * Run with: npx tsx scripts/seed-races-espn.ts
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

// Inline schema
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
  seasonId: integer('season_id')
    .notNull(),
  round: integer('round').notNull(),
  name: text('name').notNull(),
  circuit: text('circuit'),
  country: text('country'),
  raceDate: timestamp('race_date'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

interface ESPNEvent {
  id: string;
  date: string;
  name: string;
  shortName?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

async function main() {
  console.log('Fetching F1 2026 schedule from ESPN...');
  const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/racing/f1/events');
  const data = await response.json();

  const events: ESPNEvent[] = data.events || [];
  console.log(`Found ${events.length} events`);

  // Filter for 2026 races (exclude practice, qualifiers, older years)
  const races2026 = events.filter((e) => {
    const eventDate = new Date(e.date);
    return eventDate.getFullYear() === 2026 && e.name && !e.name.includes('Practice');
  });

  console.log(`Filtered to ${races2026.length} 2026 race events`);

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

  console.log(`Using season ID: ${seasonId}`);

  // Parse races, extract round number from name or order
  const parsedRaces = races2026.map((event, index) => {
    const eventDate = new Date(event.date);
    
    // Try to extract round from event name (e.g., "Round 1 - ...")
    const roundMatch = event.name.match(/Round\s+(\d+)/i);
    const round = roundMatch ? parseInt(roundMatch[1], 10) : index + 1;

    // Clean up name (remove "QualifyingRound", "Sprint" etc, keep "Grand Prix")
    const cleanName = event.name
      .replace(/\s+Qualifying Round.*$/i, '')
      .replace(/\s+Sprint Qualifying.*$/i, '')
      .trim();

    // Extract location
    const country = event.location?.country || '';
    const city = event.location?.city || '';
    
    // Try to infer circuit from name
    let circuit = '';
    if (cleanName.includes('Bahrain')) circuit = 'Bahrain International Circuit';
    else if (cleanName.includes('Saudi')) circuit = 'Jeddah Corniche Circuit';
    else if (cleanName.includes('Australia')) circuit = 'Albert Park Circuit';
    else if (cleanName.includes('Japan')) circuit = 'Suzuka Circuit';
    else if (cleanName.includes('China')) circuit = 'Shanghai International Circuit';
    else if (cleanName.includes('Miami')) circuit = 'Miami International Autodrome';
    else if (cleanName.includes('Monaco')) circuit = 'Circuit de Monaco';
    else if (cleanName.includes('Spanish')) circuit = 'Circuit de Barcelona-Catalunya';
    else if (cleanName.includes('Austrian')) circuit = 'Red Bull Ring';
    else if (cleanName.includes('British')) circuit = 'Silverstone Circuit';
    else if (cleanName.includes('Hungarian')) circuit = 'Hungaroring';
    else if (cleanName.includes('Belgian')) circuit = 'Circuit de Spa-Francorchamps';
    else if (cleanName.includes('Dutch')) circuit = 'Circuit Zandvoort';
    else if (cleanName.includes('Italian')) circuit = 'Autodromo Nazionale di Monza';
    else if (cleanName.includes('Azerbaijan')) circuit = 'Baku City Circuit';
    else if (cleanName.includes('Singapore')) circuit = 'Marina Bay Street Circuit';
    else if (cleanName.includes('Mexico')) circuit = 'Autódromo Hermanos Rodríguez';
    else if (cleanName.includes('Brazilian')) circuit = 'Autódromo José Carlos Pace';
    else if (cleanName.includes('Las Vegas')) circuit = 'Las Vegas Street Circuit';
    else if (cleanName.includes('Abu Dhabi')) circuit = 'Yas Marina Circuit';

    return {
      seasonId,
      round,
      name: cleanName,
      circuit,
      country,
      raceDate: eventDate,
      status: eventDate < new Date() ? 'completed' : 'scheduled',
    };
  });

  console.log(`Inserting ${parsedRaces.length} races...`);
  console.log('Sample race:', parsedRaces[0]);

  await db.insert(races).values(parsedRaces);
  console.log('✓ Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
