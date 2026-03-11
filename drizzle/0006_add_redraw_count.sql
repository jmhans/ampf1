DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='ampf1' AND table_name='entry_cards' AND column_name='redraw_count') THEN
    ALTER TABLE "ampf1"."entry_cards" ADD COLUMN "redraw_count" integer NOT NULL DEFAULT 0;
  END IF;
END $$;
