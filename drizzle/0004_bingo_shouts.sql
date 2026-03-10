DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS "ampf1"."bingo_shouts" (
    "id" serial PRIMARY KEY NOT NULL,
    "entry_card_id" integer NOT NULL,
    "participant_id" integer NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    "shouted_at" timestamp DEFAULT now() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "ampf1"."bingo_shouts" ADD CONSTRAINT "bingo_shouts_entry_card_id_entry_cards_id_fk" FOREIGN KEY ("entry_card_id") REFERENCES "ampf1"."entry_cards"("id") ON DELETE cascade;
  ALTER TABLE "ampf1"."bingo_shouts" ADD CONSTRAINT "bingo_shouts_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "ampf1"."participants"("id") ON DELETE cascade;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
