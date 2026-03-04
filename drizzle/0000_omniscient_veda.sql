CREATE SCHEMA "ampf1";
--> statement-breakpoint
CREATE TABLE "ampf1"."bingo_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ampf1"."drivers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"team" text NOT NULL,
	"number" integer,
	"nationality" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ampf1"."entry_card_squares" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_card_id" integer NOT NULL,
	"bingo_event_id" integer,
	"position" integer NOT NULL,
	"is_free_space" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entry_card_squares_entry_card_id_position_unique" UNIQUE("entry_card_id","position")
);
--> statement-breakpoint
CREATE TABLE "ampf1"."entry_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant_id" integer NOT NULL,
	"season_id" integer NOT NULL,
	"race_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entry_cards_participant_id_season_id_race_id_unique" UNIQUE("participant_id","season_id","race_id")
);
--> statement-breakpoint
CREATE TABLE "ampf1"."event_occurrences" (
	"id" serial PRIMARY KEY NOT NULL,
	"bingo_event_id" integer NOT NULL,
	"race_id" integer NOT NULL,
	"notes" text,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_occurrences_bingo_event_id_race_id_unique" UNIQUE("bingo_event_id","race_id")
);
--> statement-breakpoint
CREATE TABLE "ampf1"."participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"auth0_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ampf1"."picks" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant_id" integer NOT NULL,
	"race_id" integer NOT NULL,
	"driver_id" integer,
	"slot" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ampf1"."race_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"race_id" integer NOT NULL,
	"driver_id" integer NOT NULL,
	"finish_position" integer,
	"grid_position" integer,
	"points" real DEFAULT 0,
	"fastest_lap" boolean DEFAULT false,
	"dnf" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ampf1"."races" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"round" integer NOT NULL,
	"name" text NOT NULL,
	"circuit" text,
	"country" text,
	"race_date" timestamp,
	"status" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ampf1"."seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "seasons_year_unique" UNIQUE("year")
);
--> statement-breakpoint
CREATE TABLE "ampf1"."system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "ampf1"."entry_card_squares" ADD CONSTRAINT "entry_card_squares_entry_card_id_entry_cards_id_fk" FOREIGN KEY ("entry_card_id") REFERENCES "ampf1"."entry_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ampf1"."entry_card_squares" ADD CONSTRAINT "entry_card_squares_bingo_event_id_bingo_events_id_fk" FOREIGN KEY ("bingo_event_id") REFERENCES "ampf1"."bingo_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ampf1"."entry_cards" ADD CONSTRAINT "entry_cards_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "ampf1"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ampf1"."entry_cards" ADD CONSTRAINT "entry_cards_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "ampf1"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ampf1"."entry_cards" ADD CONSTRAINT "entry_cards_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "ampf1"."races"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ampf1"."event_occurrences" ADD CONSTRAINT "event_occurrences_bingo_event_id_bingo_events_id_fk" FOREIGN KEY ("bingo_event_id") REFERENCES "ampf1"."bingo_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ampf1"."event_occurrences" ADD CONSTRAINT "event_occurrences_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "ampf1"."races"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ampf1"."picks" ADD CONSTRAINT "picks_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "ampf1"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ampf1"."picks" ADD CONSTRAINT "picks_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "ampf1"."races"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ampf1"."picks" ADD CONSTRAINT "picks_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "ampf1"."drivers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ampf1"."race_results" ADD CONSTRAINT "race_results_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "ampf1"."races"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ampf1"."race_results" ADD CONSTRAINT "race_results_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "ampf1"."drivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ampf1"."races" ADD CONSTRAINT "races_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "ampf1"."seasons"("id") ON DELETE cascade ON UPDATE no action;