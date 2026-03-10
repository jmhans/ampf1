import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/app/lib/db';
import { participants, bingoEvents, entryCards, entryCardSquares, seasons } from '@/app/lib/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import BingoCard, { type CardSquare } from './BingoCard';
import ParticipantNameEditor from './ParticipantNameEditor';

export const dynamic = 'force-dynamic';

export default async function ParticipantCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const participantId = parseInt(id, 10);
  if (isNaN(participantId)) notFound();

  const [participantRows, activeSeason] = await Promise.all([
    db.select().from(participants).where(eq(participants.id, participantId)).limit(1),
    db.select().from(seasons)
      .where(eq(seasons.isActive, true))
      .orderBy(desc(seasons.id))
      .limit(1),
  ]);

  const participant = participantRows[0];
  if (!participant) notFound();

  if (!activeSeason || activeSeason.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/participants" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
            ←
          </Link>
          <ParticipantNameEditor participantId={participant.id} initialName={participant.name} initialUserName={participant.userName ?? null} />
        </div>
        <p className="text-gray-600">No active season card generated yet.</p>
      </div>
    );
  }

  // Fetch the entry card for this participant in the active season
  const card = await db
    .select()
    .from(entryCards)
    .where(
      and(
        eq(entryCards.participantId, participantId),
        eq(entryCards.seasonId, activeSeason[0].id),
        isNull(entryCards.raceId)
      )
    )
    .limit(1);

  if (!card || card.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Link href="/participants" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
            ←
          </Link>
          <ParticipantNameEditor participantId={participant.id} initialName={participant.name} initialUserName={participant.userName ?? null} />
        </div>
        <p className="text-gray-600">No bingo card generated yet. Go to Admin &gt; Generate Cards.</p>
      </div>
    );
  }

  // Fetch all squares for this card
  const squares_data = await db
    .select()
    .from(entryCardSquares)
    .where(eq(entryCardSquares.entryCardId, card[0].id))
    .orderBy(entryCardSquares.position);

  // Fetch all events for reference
  const allEvents = await db.select().from(bingoEvents);
  const eventMap = new Map(allEvents.map(e => [e.id, e]));

  // Build CardSquare array
  const squares: CardSquare[] = squares_data.map(sq => {
    if (sq.isFreeSpace || !sq.bingoEventId) {
      return { id: -1, name: 'FREE', isAchieved: true, isFree: true };
    }
    const event = eventMap.get(sq.bingoEventId);
    return {
      id: sq.bingoEventId,
      name: event?.name || '—',
      isAchieved: event?.isAchieved || false,
      isFree: false,
    };
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/participants"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300 text-sm"
        >
          ←
        </Link>
        <div className="flex-1">
          <ParticipantNameEditor participantId={participant.id} initialName={participant.name} initialUserName={participant.userName ?? null} />
        </div>
      </div>

      <BingoCard 
        squares={squares} 
        participantName={participant.name} 
        participantId={participant.id}
        entryCardId={card[0].id}
      />
    </div>
  );
}
