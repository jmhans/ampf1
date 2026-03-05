import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/app/lib/db';
import { participants, bingoEvents } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import BingoCard, { type CardSquare } from './BingoCard';
import ParticipantNameEditor from './ParticipantNameEditor';

export const dynamic = 'force-dynamic';

// Deterministic seeded shuffle so each participant always gets the same card
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default async function ParticipantCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const participantId = parseInt(id, 10);
  if (isNaN(participantId)) notFound();

  const [participantRows, allEvents] = await Promise.all([
    db.select().from(participants).where(eq(participants.id, participantId)).limit(1),
    db.select().from(bingoEvents).where(eq(bingoEvents.isActive, true)),
  ]);

  const participant = participantRows[0];
  if (!participant) notFound();

  // Shuffle events deterministically per participant, pick 24 for the card
  const shuffled = seededShuffle(allEvents, participantId);
  const picked = shuffled.slice(0, 24);

  // Build 25 squares; position 12 (0-indexed centre) = FREE space
  const squares: CardSquare[] = [];
  for (let i = 0; i < 25; i++) {
    if (i === 12) {
      squares.push({ id: -1, name: 'FREE', isAchieved: true, isFree: true });
    } else {
      const ev = picked[i < 12 ? i : i - 1];
      squares.push(ev
        ? { id: ev.id, name: ev.name, isAchieved: ev.isAchieved, isFree: false }
        : { id: -1, name: '—', isAchieved: false, isFree: false }
      );
    }
  }

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
          <ParticipantNameEditor participantId={participant.id} initialName={participant.name} />
        </div>
      </div>

      <BingoCard squares={squares} participantName={participant.name} />
    </div>
  );
}
