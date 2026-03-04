import { pgSchema, serial, text, integer, timestamp, boolean, real } from 'drizzle-orm/pg-core';

// Create a custom schema for the F1 fantasy app
export const ampf1Schema = pgSchema('ampf1');

// Participants table - pool members
export const participants = ampf1Schema.table('participants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  auth0Id: text('auth0_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Seasons table - F1 seasons (e.g. 2026)
export const seasons = ampf1Schema.table('seasons', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull().unique(),
  name: text('name').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Drivers table - F1 drivers
export const drivers = ampf1Schema.table('drivers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  team: text('team').notNull(),
  number: integer('number'),
  nationality: text('nationality'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Races table - individual F1 race events
export const races = ampf1Schema.table('races', {
  id: serial('id').primaryKey(),
  seasonId: integer('season_id')
    .notNull()
    .references(() => seasons.id, { onDelete: 'cascade' }),
  round: integer('round').notNull(),
  name: text('name').notNull(),      // e.g. "Bahrain Grand Prix"
  circuit: text('circuit'),           // e.g. "Bahrain International Circuit"
  country: text('country'),
  raceDate: timestamp('race_date'),
  status: text('status'),             // 'scheduled' | 'in_progress' | 'completed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Race results - finishing positions and points per driver per race
export const raceResults = ampf1Schema.table('race_results', {
  id: serial('id').primaryKey(),
  raceId: integer('race_id')
    .notNull()
    .references(() => races.id, { onDelete: 'cascade' }),
  driverId: integer('driver_id')
    .notNull()
    .references(() => drivers.id, { onDelete: 'cascade' }),
  finishPosition: integer('finish_position'),
  gridPosition: integer('grid_position'),
  points: real('points').default(0),
  fastestLap: boolean('fastest_lap').default(false),
  dnf: boolean('dnf').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Picks - each participant picks drivers for each race
export const picks = ampf1Schema.table('picks', {
  id: serial('id').primaryKey(),
  participantId: integer('participant_id')
    .notNull()
    .references(() => participants.id, { onDelete: 'cascade' }),
  raceId: integer('race_id')
    .notNull()
    .references(() => races.id, { onDelete: 'cascade' }),
  driverId: integer('driver_id')
    .references(() => drivers.id, { onDelete: 'set null' }),
  slot: integer('slot').notNull(),    // pick slot number (1, 2, 3...)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// System settings for app-level metadata
export const systemSettings = ampf1Schema.table('system_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
