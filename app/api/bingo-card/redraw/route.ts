import { auth0 } from '@/app/lib/auth0';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { desc, eq, and, isNull } from 'drizzle-orm';
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

const MAX_REDRAWS = 2;

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

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { participantId } = body;

    if (!participantId) {
      return Response.json({ error: 'participantId is required' }, { status: 400 });
    }

    // Verify the authenticated user owns this participant record
    const auth0Id = session.user.sub as string;
    const participantRows = await db
      .select()
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    if (!participantRows.length) {
      return Response.json({ error: 'Participant not found' }, { status: 404 });
    }

    const participant = participantRows[0];
    if (participant.auth0Id !== auth0Id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the active season
    const activeSeason = await db
      .select()
      .from(seasons)
      .where(eq(seasons.isActive, true))
      .orderBy(desc(seasons.id))
      .limit(1);

    if (!activeSeason.length) {
      return Response.json({ error: 'No active season found' }, { status: 400 });
    }

    const seasonId = activeSeason[0].id;

    // Find the existing card
    const existingCard = await db
      .select()
      .from(entryCards)
      .where(
        and(
          eq(entryCards.participantId, participantId),
          eq(entryCards.seasonId, seasonId),
          isNull(entryCards.raceId)
        )
      )
      .limit(1);

    if (!existingCard.length) {
      return Response.json({ error: 'No bingo card found for this season' }, { status: 404 });
    }

    const card = existingCard[0];

    if (card.redrawCount >= MAX_REDRAWS) {
      return Response.json(
        { error: 'No redraws remaining', redrawCount: card.redrawCount, maxRedraws: MAX_REDRAWS },
        { status: 400 }
      );
    }

    // Fetch all active events and shuffle them
    const allEvents = await db
      .select()
      .from(bingoEvents)
      .where(eq(bingoEvents.isActive, true));

    if (allEvents.length < 24) {
      return Response.json(
        { error: 'Not enough active bingo events to generate a card' },
        { status: 400 }
      );
    }

    const finalEvents = shuffleArray(allEvents).slice(0, 24);

    // Delete existing squares
    await db.delete(entryCardSquares).where(eq(entryCardSquares.entryCardId, card.id));

    // Create squares with positions 1-25 (position 13 is free space)
    const squaresToInsert: (typeof entryCardSquares.$inferInsert)[] = [];
    let eventIndex = 0;

    for (let position = 1; position <= 25; position++) {
      if (position === 13) {
        squaresToInsert.push({
          entryCardId: card.id,
          bingoEventId: null,
          position: 13,
          isFreeSpace: true,
        });
      } else {
        if (eventIndex < finalEvents.length) {
          squaresToInsert.push({
            entryCardId: card.id,
            bingoEventId: finalEvents[eventIndex].id,
            position,
            isFreeSpace: false,
          });
          eventIndex++;
        }
      }
    }

    await db.insert(entryCardSquares).values(squaresToInsert);

    // Increment the redraw count
    const newRedrawCount = card.redrawCount + 1;
    await db
      .update(entryCards)
      .set({ redrawCount: newRedrawCount })
      .where(eq(entryCards.id, card.id));

    return Response.json({
      success: true,
      redrawCount: newRedrawCount,
      redrawsRemaining: MAX_REDRAWS - newRedrawCount,
    });
  } catch (error) {
    console.error('Error redrawing bingo card:', error);
    return Response.json({ error: 'An error occurred while redrawing the card' }, { status: 500 });
  }
}
