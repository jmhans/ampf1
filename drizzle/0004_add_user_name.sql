DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='ampf1' AND table_name='participants' AND column_name='user_name') THEN
    ALTER TABLE "ampf1"."participants" ADD COLUMN "user_name" text;
  END IF;
END $$;
