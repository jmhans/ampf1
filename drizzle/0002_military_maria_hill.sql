DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='drivers' AND column_name='image_url') THEN
    ALTER TABLE "ampf1"."drivers" ADD COLUMN "image_url" text;
  END IF;
END $$;