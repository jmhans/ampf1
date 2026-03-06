/**
 * Seed bingo events from CSV
 * Run with: npx tsx scripts/seed-bingo-events.ts
 * For production: POSTGRES_URL=<prod-url> npx tsx scripts/seed-bingo-events.ts
 */
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { bingoEvents } from '../app/lib/db/schema';
import * as fs from 'fs';
import * as path from 'path';

// Use POSTGRES_URL_DEV if set (for dev/preview), fall back to POSTGRES_URL (for prod)
const url = process.env.POSTGRES_URL_DEV || process.env.POSTGRES_URL;
if (!url) throw new Error('No POSTGRES_URL or POSTGRES_URL_DEV set');

const sql = neon(url);
const db = drizzle(sql);

// Simple CSV parser that handles quoted values
function parseCSV(content: string): Array<Record<string, string>> {
  const lines = content.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

async function seedBingoEvents() {
  try {
    console.log('Seeding bingo events from CSV...');

    // Drop existing events
    console.log('Clearing existing bingo events...');
    await db.delete(bingoEvents);
    console.log('✓ Cleared existing events');

    const csvPath = path.join(__dirname, '../events.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(csvContent);

    console.log(`Found ${rows.length} events in CSV`);

    for (const row of rows) {
      const eventName = row['Event - Classics'];
      const category = row['Likelihood'];

      if (!eventName) {
        console.warn('Skipping row with missing event name:', row);
        continue;
      }

      await db.insert(bingoEvents).values({
        name: eventName,
        category: category || 'general',
        isActive: true,
        isAchieved: false,
      });
      console.log(`✓ Added: "${eventName}" (${category})`);
    }

    console.log('✓ Bingo events seeding complete!');
  } catch (error) {
    console.error('Error seeding bingo events:', error);
    process.exit(1);
  }
}

seedBingoEvents();
