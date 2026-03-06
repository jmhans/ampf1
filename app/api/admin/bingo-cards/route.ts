import { auth0 } from '@/app/lib/auth0';
import { isAdmin } from '@/app/lib/auth-utils';
import { redirect } from 'next/navigation';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { desc, eq, and, sql, isNull, inArray } from 'drizzle-orm';
import {
  participants,
  seasons,
  bingoEvents,
  entryCards,
  entryCardSquares,
} from '@/app/lib/db/schema';

const dbUrl = process.env.POSTGRES_URL;
if (!dbUrl) throw new Error('POSTGRES_URL not set');

const client = neon(dbUrl);
const db = drizzle(client);

// Shuffle array utility
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();

    if (!session?.user || !isAdmin(session.user)) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { participantIds, categoryCounts } = body;

    if (!categoryCounts || typeof categoryCounts !== 'object') {
      return Response.json(
        { error: 'categoryCounts is required' },
        { status: 400 }
      );
    }

    // Get active season (most recent)
    const activeSeason = await db
      .select()
      .from(seasons)
      .orderBy(desc(seasons.year))
      .limit(1);

    if (!activeSeason.length) {
      return Response.json(
        { error: 'No season found' },
        { status: 400 }
      );
    }

    const seasonId = activeSeason[0].id;

    // Get participants to update
    let targetParticipants;
    if (participantIds && participantIds.length > 0) {
      targetParticipants = await db
        .select()
        .from(participants)
        .where(inArray(participants.id, participantIds))
    } else {
      targetParticipants = await db.select().from(participants);
    }

    console.log('🎲 Bingo Card Generation Started');
    console.log('Participants to generate:', targetParticipants.length);
    console.log('Category Counts:', categoryCounts);

    const results = [];

    // For each participant, generate card
    for (const participant of targetParticipants) {
      try {
        // Create or get entry card
        const existingCard = await db
          .select()
          .from(entryCards)
          .where(
            and(
              eq(entryCards.participantId, participant.id),
              eq(entryCards.seasonId, seasonId),
              isNull(entryCards.raceId)
            )
          )
          .limit(1);

        let cardId: number;

        if (existingCard.length > 0) {
          cardId = existingCard[0].id;
          console.log(`  ✏️ Existing card found (ID: ${cardId}), deleting ${existingCard[0].squares?.length || 'unknown'} old squares`);
          // Delete existing squares
          const deleteResult = await db.delete(entryCardSquares).where(
            eq(entryCardSquares.entryCardId, cardId)
          );
          console.log(`  ✓ Deleted old squares`);
        } else {
          // Create new card
          const newCard = await db
            .insert(entryCards)
            .values({
              participantId: participant.id,
              seasonId: seasonId,
              raceId: null,
            })
            .returning({ id: entryCards.id });
          cardId = newCard[0].id;
          console.log(`  ➕ New card created (ID: ${cardId})`);
        }

        // Fetch events by category
        const allEvents = await db.select().from(bingoEvents);

        // Separate events by category
        const eventsByCategory: Record<string, typeof bingoEvents.$inferSelect[]> = {};
        allEvents.forEach((event) => {
          const cat = event.category || 'general';
          if (!eventsByCategory[cat]) {
            eventsByCategory[cat] = [];
          }
          eventsByCategory[cat].push(event);
        });

        // Select random events based on counts
        const selectedEvents: (typeof bingoEvents.$inferSelect)[] = [];

        for (const [category, count] of Object.entries(categoryCounts)) {
          const categoryEvents = eventsByCategory[category] || [];
          const shuffled = shuffleArray(categoryEvents);
          selectedEvents.push(...shuffled.slice(0, Number(count)));
        }

        // Shuffle final event list
        const finalEvents = shuffleArray(selectedEvents).slice(0, 24); // 24 + 1 free space = 25

        console.log(`  📋 Selected ${finalEvents.length} events for card`);
        console.log(`  Events: ${finalEvents.map(e => e.name).join(', ')}`);

        // Create squares with positions 1-25 (13 is free space)
        const squaresToInsert: (typeof entryCardSquares.$inferInsert)[] = [];

        // Add events to positions 1-12, 14-25, leave 13 for free space
        let eventIndex = 0;
        for (let position = 1; position <= 25; position++) {
          if (position === 13) {
            // Free space
            squaresToInsert.push({
              entryCardId: cardId,
              bingoEventId: null,
              position: 13,
              isFreeSpace: true,
            });
          } else {
            if (eventIndex < finalEvents.length) {
              squaresToInsert.push({
                entryCardId: cardId,
                bingoEventId: finalEvents[eventIndex].id,
                position,
                isFreeSpace: false,
              });
              eventIndex++;
            }
          }
        }

        await db.insert(entryCardSquares).values(squaresToInsert);
        
        console.log(`  ✓ Inserted ${squaresToInsert.length} squares`);

        results.push({
          participantId: participant.id,
          participantName: participant.name,
          cardId,
          status: 'success',
          squaresCreated: squaresToInsert.length,
        });
      } catch (error) {
        results.push({
          participantId: participant.id,
          participantName: participant.name,
          status: 'error',
          error: String(error),
        });
      }
    }

    return Response.json({
      success: true,
      generatedCards: results.length,
      results,
    });
  } catch (error) {
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth0.getSession();

    if (!session?.user || !isAdmin(session.user)) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all distinct categories
    const categories = await db
      .selectDistinct({ category: bingoEvents.category })
      .from(bingoEvents)
      .where(eq(bingoEvents.isActive, true));

    // Get all participants
    const allParticipants = await db.select().from(participants);

    return Response.json({
      categories: categories
        .map((c) => c.category)
        .filter((c) => c != null),
      participants: allParticipants,
    });
  } catch (error) {
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
