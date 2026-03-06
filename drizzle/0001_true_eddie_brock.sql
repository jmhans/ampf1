DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bingo_events' AND column_name='is_achieved') THEN
    ALTER TABLE "ampf1"."bingo_events" ADD COLUMN "is_achieved" boolean DEFAULT false NOT NULL;
  END IF;
END $$;