/**
 * Seed 2026 F1 drivers
 * Run with: npx tsx scripts/seed-drivers.ts
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { pgSchema, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';

const url = process.env.POSTGRES_URL_DEV ?? process.env.POSTGRES_URL;
if (!url) throw new Error('No POSTGRES_URL_DEV or POSTGRES_URL set');

const sql = neon(url);
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

// 2026 F1 Grid - hypothetical for this scenario
// Using dicebear avataaars which generates colorful avatar illustrations
const getAvatarUrl = (name: string) => 
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&scale=80`;

const DRIVERS_2026 = [
  // Ferrari
  { name: 'Charles Leclerc', team: 'Ferrari', number: 16, nationality: 'Monégasque', imageUrl: getAvatarUrl('Charles Leclerc') },
  { name: 'Lewis Hamilton', team: 'Ferrari', number: 44, nationality: 'British', imageUrl: getAvatarUrl('Lewis Hamilton') },

  // Red Bull Racing
  { name: 'Max Verstappen', team: 'Red Bull Racing', number: 1, nationality: 'Dutch', imageUrl: getAvatarUrl('Max Verstappen') },
  { name: 'Pérez', team: 'Red Bull Racing', number: 11, nationality: 'Mexican', imageUrl: getAvatarUrl('Sergio Perez') },

  // Mercedes
  { name: 'George Russell', team: 'Mercedes', number: 63, nationality: 'British', imageUrl: getAvatarUrl('George Russell') },
  { name: 'Andrea Kimi Antonelli', team: 'Mercedes', number: 12, nationality: 'Italian', imageUrl: getAvatarUrl('Andrea Antonelli') },

  // McLaren
  { name: 'Lando Norris', team: 'McLaren', number: 4, nationality: 'British', imageUrl: getAvatarUrl('Lando Norris') },
  { name: 'Oscar Piastri', team: 'McLaren', number: 81, nationality: 'Australian', imageUrl: getAvatarUrl('Oscar Piastri') },

  // Aston Martin
  { name: 'Fernando Alonso', team: 'Aston Martin', number: 14, nationality: 'Spanish', imageUrl: getAvatarUrl('Fernando Alonso') },
  { name: 'Lance Stroll', team: 'Aston Martin', number: 18, nationality: 'Canadian', imageUrl: getAvatarUrl('Lance Stroll') },

  // Alpine
  { name: 'Esteban Ocon', team: 'Alpine', number: 31, nationality: 'French', imageUrl: getAvatarUrl('Esteban Ocon') },
  { name: 'Jack Doohan', team: 'Alpine', number: 34, nationality: 'Australian', imageUrl: getAvatarUrl('Jack Doohan') },

  // Williams
  { name: 'Alex Albon', team: 'Williams', number: 23, nationality: 'Thai-British', imageUrl: getAvatarUrl('Alexander Albon') },
  { name: 'Carlos Sainz', team: 'Williams', number: 55, nationality: 'Spanish', imageUrl: getAvatarUrl('Carlos Sainz') },

  // Haas
  { name: 'Nico Hülkenberg', team: 'Haas', number: 27, nationality: 'German', imageUrl: getAvatarUrl('Nico Hulkenberg') },
  { name: 'Oliver Bearman', team: 'Haas', number: 87, nationality: 'British', imageUrl: getAvatarUrl('Oliver Bearman') },

  // RB
  { name: 'Yuki Tsunoda', team: 'RB', number: 22, nationality: 'Japanese', imageUrl: getAvatarUrl('Yuki Tsunoda') },
  { name: 'Isack Hadjar', team: 'RB', number: 32, nationality: 'Swiss', imageUrl: getAvatarUrl('Isack Hadjar') },

  // Kick Sauber
  { name: 'Guanyu Zhou', team: 'Kick Sauber', number: 24, nationality: 'Chinese', imageUrl: getAvatarUrl('Guanyu Zhou') },
  { name: 'Valteri Bottas', team: 'Kick Sauber', number: 77, nationality: 'Finnish', imageUrl: getAvatarUrl('Valtteri Bottas') },
];

async function main() {
  console.log('Seeding 2026 F1 drivers...');

  // Clear existing drivers
  await db.delete(drivers);

  console.log(`Inserting ${DRIVERS_2026.length} drivers...`);
  await db.insert(drivers).values(
    DRIVERS_2026.map((d) => ({
      name: d.name,
      team: d.team,
      number: d.number,
      nationality: d.nationality,
      imageUrl: d.imageUrl,
    }))
  );

  console.log('✓ Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
