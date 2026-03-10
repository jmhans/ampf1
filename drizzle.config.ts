import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });

// Always use POSTGRES_URL which should point to the dev database
// .env.local is loaded above and should have POSTGRES_URL=dev-endpoint
const dbUrl = process.env.POSTGRES_URL;

export default defineConfig({
  out: './drizzle',
  schema: './app/lib/db/schema.ts',
  dialect: 'postgresql',
  schemaFilter: ['ampf1'],
  dbCredentials: {
    url: dbUrl!,
  },
});
