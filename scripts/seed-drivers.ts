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

// 2026 F1 Grid - actual 2026 drivers and teams
// Using official F1 Cloudinary images with balanced head/shoulder crop
const getDriverImageUrl = (teamFolder: string, driverCode: string) =>
  `https://media.formula1.com/image/upload/c_crop,g_faces,w_512,h_640/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000000/common/f1/2026/${teamFolder}/${driverCode}/2026${teamFolder}${driverCode}right.webp`;

const DRIVERS_2026 = [
  // Alpine
  { name: 'Pierre Gasly', team: 'Alpine', number: 10, nationality: 'French', imageUrl: getDriverImageUrl('alpine', 'piegas01') },
  { name: 'Franco Colapinto', team: 'Alpine', number: 43, nationality: 'Argentine', imageUrl: getDriverImageUrl('alpine', 'fracol01') },

  // Aston Martin
  { name: 'Fernando Alonso', team: 'Aston Martin', number: 14, nationality: 'Spanish', imageUrl: getDriverImageUrl('astonmartin', 'feralo01') },
  { name: 'Lance Stroll', team: 'Aston Martin', number: 18, nationality: 'Canadian', imageUrl: getDriverImageUrl('astonmartin', 'lanstr01') },

  // Williams
  { name: 'Carlos Sainz', team: 'Williams', number: 55, nationality: 'Spanish', imageUrl: getDriverImageUrl('williams', 'carlsa01') },
  { name: 'Alexander Albon', team: 'Williams', number: 23, nationality: 'Thai-British', imageUrl: getDriverImageUrl('williams', 'alealb01') },

  // Audi
  { name: 'Nico Hulkenberg', team: 'Audi', number: 27, nationality: 'German', imageUrl: getDriverImageUrl('audi', 'nichul01') },
  { name: 'Gabriel Bortoleto', team: 'Audi', number: 5, nationality: 'Brazilian', imageUrl: getDriverImageUrl('audi', 'gabbor01') },

  // Cadillac
  { name: 'Sergio Perez', team: 'Cadillac', number: 11, nationality: 'Mexican', imageUrl: getDriverImageUrl('cadillac', 'serper01') },
  { name: 'Valtteri Bottas', team: 'Cadillac', number: 77, nationality: 'Finnish', imageUrl: getDriverImageUrl('cadillac', 'valbot01') },

  // Ferrari
  { name: 'Charles Leclerc', team: 'Ferrari', number: 16, nationality: 'Monégasque', imageUrl: getDriverImageUrl('ferrari', 'chalec01') },
  { name: 'Lewis Hamilton', team: 'Ferrari', number: 44, nationality: 'British', imageUrl: getDriverImageUrl('ferrari', 'lewham01') },

  // Haas F1 Team
  { name: 'Esteban Ocon', team: 'Haas F1 Team', number: 31, nationality: 'French', imageUrl: getDriverImageUrl('haasf1team', 'estoco01') },
  { name: 'Oliver Bearman', team: 'Haas F1 Team', number: 87, nationality: 'British', imageUrl: getDriverImageUrl('haasf1team', 'olivbe01') },

  // McLaren
  { name: 'Lando Norris', team: 'McLaren', number: 4, nationality: 'British', imageUrl: getDriverImageUrl('mclaren', 'lannor01') },
  { name: 'Oscar Piastri', team: 'McLaren', number: 81, nationality: 'Australian', imageUrl: getDriverImageUrl('mclaren', 'oscpia01') },

  // Mercedes
  { name: 'George Russell', team: 'Mercedes', number: 63, nationality: 'British', imageUrl: getDriverImageUrl('mercedes', 'georus01') },
  { name: 'Kimi Antonelli', team: 'Mercedes', number: 12, nationality: 'Italian', imageUrl: getDriverImageUrl('mercedes', 'kimant01') },

  // Red Bull Racing
  { name: 'Max Verstappen', team: 'Red Bull Racing', number: 1, nationality: 'Dutch', imageUrl: getDriverImageUrl('redbullracing', 'maxver01') },
  { name: 'Isack Hadjar', team: 'Red Bull Racing', number: 32, nationality: 'Swiss', imageUrl: getDriverImageUrl('redbullracing', 'isahad01') },
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
