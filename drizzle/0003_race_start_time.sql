DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='races' AND column_name='race_start_time') THEN
    ALTER TABLE "ampf1"."races" ADD COLUMN "race_start_time" timestamp;
  END IF;
END $$;
