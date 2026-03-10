import { pgSchema, serial, text, integer, timestamp, boolean, real, unique } from 'drizzle-orm/pg-core';

// Create a custom schema for the F1 fantasy app
export const ampf1Schema = pgSchema('ampf1');

// Participants table - pool members
export const participants = ampf1Schema.table('participants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  userName: text('user_name'),
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
  imageUrl: text('image_url'),        // URL to driver photo
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
  raceStartTime: timestamp('race_start_time'), // Race start time stored as UTC
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

// ---------------------------------------------------------------------------
// Bingo
// ---------------------------------------------------------------------------

// Master list of events that can appear as bingo squares
// e.g. "Safety car deployed", "Red flag", "Driver DNF", "Fastest lap awarded"
export const bingoEvents = ampf1Schema.table('bingo_events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),               // Short label shown on the card
  description: text('description'),           // Optional longer description
  category: text('category'),                 // e.g. 'safety', 'race', 'driver', 'pit'
  isActive: boolean('is_active').default(true).notNull(), // Can be deactivated without deleting
  isAchieved: boolean('is_achieved').default(false).notNull(), // Marked true when event has occurred
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// One bingo card per participant per race (or season if raceId is null)
export const entryCards = ampf1Schema.table('entry_cards', {
  id: serial('id').primaryKey(),
  participantId: integer('participant_id')
    .notNull()
    .references(() => participants.id, { onDelete: 'cascade' }),
  seasonId: integer('season_id')
    .notNull()
    .references(() => seasons.id, { onDelete: 'cascade' }),
  raceId: integer('race_id')
    .references(() => races.id, { onDelete: 'cascade' }), // null = season-wide card
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.participantId, t.seasonId, t.raceId), // one card per participant per race
]);

// The individual squares on a bingo card (typically 25 for a 5x5 grid)
// position 1-25 maps to the grid left-to-right, top-to-bottom; position 13 = free space
export const entryCardSquares = ampf1Schema.table('entry_card_squares', {
  id: serial('id').primaryKey(),
  entryCardId: integer('entry_card_id')
    .notNull()
    .references(() => entryCards.id, { onDelete: 'cascade' }),
  bingoEventId: integer('bingo_event_id')
    .references(() => bingoEvents.id, { onDelete: 'set null' }), // null = free space
  position: integer('position').notNull(),    // 1–25
  isFreeSpace: boolean('is_free_space').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.entryCardId, t.position),     // one event per position per card
]);

// Admin marks an event as having occurred in a specific race
// This is what "calls" a square across all cards that contain it
export const eventOccurrences = ampf1Schema.table('event_occurrences', {
  id: serial('id').primaryKey(),
  bingoEventId: integer('bingo_event_id')
    .notNull()
    .references(() => bingoEvents.id, { onDelete: 'cascade' }),
  raceId: integer('race_id')
    .notNull()
    .references(() => races.id, { onDelete: 'cascade' }),
  notes: text('notes'),                       // Optional admin note (e.g. "Lap 34, Verstappen")
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => [
  unique().on(t.bingoEventId, t.raceId),      // an event can only be called once per race
]);
// Bingo shouts - when a participant claims they've achieved a bingo
export const bingoShouts = ampf1Schema.table('bingo_shouts', {
  id: serial('id').primaryKey(),
  entryCardId: integer('entry_card_id')
    .notNull()
    .references(() => entryCards.id, { onDelete: 'cascade' }),
  participantId: integer('participant_id')
    .notNull()
    .references(() => participants.id, { onDelete: 'cascade' }),
  isVerified: boolean('is_verified').default(false).notNull(), // Admin marks as verified
  shoutedAt: timestamp('shouted_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
// ---------------------------------------------------------------------------
// System settings for app-level metadata
export const systemSettings = ampf1Schema.table('system_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
