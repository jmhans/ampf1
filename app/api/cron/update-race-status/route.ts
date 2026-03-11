/**
 * Cron job to update F1 race statuses from ESPN API
 * To schedule this to run once per day:
 * 
 * Option 1: Use EasyCron (free service)
 * - Create a cron job: https://www.easycron.com
 * - Set URL: https://ampf1.vercel.app/api/cron/update-race-status
 * - Schedule: Daily at midnight UTC (cron expression: 0 0 * * *)
 * - Add authorization header: Authorization: Bearer {CRON_SECRET}
 * 
 * Option 2: Set CRON_SECRET environment variable on Vercel
 * - The secret prevents unauthorized access to this endpoint
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { races } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

interface ESPNEvent {
  id: string;
  date: string;
  name: string;
  location?: {
    country?: string;
  };
}

export const runtime = 'nodejs';

export async function GET(req: Request) {
  // Verify cron secret for security
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🏁 Starting F1 race status update...');

    // Fetch from ESPN API
    const response = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/racing/f1/events'
    );
    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.statusText}`);
    }

    const data = await response.json();
    const events: ESPNEvent[] = data.events || [];

    // Parse race data and determine status
    const now = new Date();
    const raceStatuses = new Map<
      string,
      { eventDate: Date; status: 'completed' | 'in_progress' | 'scheduled' }
    >();

    events.forEach((event) => {
      if (!event.name.includes('Grand Prix')) return;
      if (
        event.name.includes('Qualifying') ||
        event.name.includes('Sprint') ||
        event.name.includes('Practice')
      )
        return;

      const eventDate = new Date(event.date);
      const raceCountry = event.location?.country || '';

      // Determine status based on date
      let status: 'completed' | 'in_progress' | 'scheduled' = 'scheduled';
      if (eventDate < now) {
        status = 'completed';
      } else if (
        eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000 &&
        eventDate > now
      ) {
        status = 'in_progress'; // Next 24 hours
      }

      raceStatuses.set(raceCountry, { eventDate, status });
    });

    if (raceStatuses.size === 0) {
      console.log('⚠️ No races found in ESPN data');
      return NextResponse.json({ message: 'No races found', updated: 0 });
    }

    console.log(`📊 Found ${raceStatuses.size} races from ESPN`);

    // Update database
    const sql = neon(process.env.POSTGRES_URL!);
    const db = drizzle(sql);

    let updated = 0;

    for (const [country, { status: newStatus }] of raceStatuses) {
      const result = await db
        .update(races)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(races.country, country))
        .returning({ id: races.id });

      if (result.length > 0) {
        console.log(`✓ Updated ${country}: ${newStatus}`);
        updated++;
      }
    }

    console.log(`✅ Updated ${updated} races`);
    return NextResponse.json({
      message: 'Race statuses updated successfully',
      updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
