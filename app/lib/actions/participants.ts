'use server';

import { db } from '@/app/lib/db';
import { participants, bingoShouts, entryCards, entryCardSquares, bingoEvents, seasons } from '@/app/lib/db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth0 } from '@/app/lib/auth0';
import { isAdmin } from '@/app/lib/auth-utils';

export type Participant = typeof participants.$inferSelect;

export type ParticipantWithStats = Participant & {
  shoutedAt: Date | null;
  achievedCount: number;
};

export async function getAllParticipants(): Promise<Participant[]> {
  return db
    .select()
    .from(participants)
    .orderBy(participants.name);
}

export async function getAllParticipantsWithStats(): Promise<ParticipantWithStats[]> {
  // Get the active season
  const activeSeason = await db
    .select({ id: seasons.id })
    .from(seasons)
    .where(eq(seasons.isActive, true))
    .limit(1);

  const activeSeasonId = activeSeason[0]?.id ?? null;

  // Get all participants
  const allParticipants = await db.select().from(participants);

  if (allParticipants.length === 0) return [];

  // Get earliest bingo shout per participant
  const shouts = await db
    .select({
      participantId: bingoShouts.participantId,
      shoutedAt: sql<string>`min(${bingoShouts.shoutedAt})`.as('shoutedAt'),
    })
    .from(bingoShouts)
    .groupBy(bingoShouts.participantId);

  const shoutMap = new Map(shouts.map(s => [s.participantId, s.shoutedAt ? new Date(s.shoutedAt) : null]));

  // Get achieved square counts per participant for the active season
  const achievedCountMap = new Map<number, number>();

  if (activeSeasonId) {
    const counts = await db
      .select({
        participantId: entryCards.participantId,
        achievedCount: sql<number>`count(case when ${entryCardSquares.isFreeSpace} = true or ${bingoEvents.isAchieved} = true then 1 end)`.as('achievedCount'),
      })
      .from(entryCards)
      .innerJoin(entryCardSquares, eq(entryCardSquares.entryCardId, entryCards.id))
      .leftJoin(bingoEvents, eq(bingoEvents.id, entryCardSquares.bingoEventId))
      .where(
        and(
          eq(entryCards.seasonId, activeSeasonId),
          isNull(entryCards.raceId)
        )
      )
      .groupBy(entryCards.participantId);

    for (const c of counts) {
      achievedCountMap.set(c.participantId, Number(c.achievedCount));
    }
  }

  // Combine participants with stats
  const result: ParticipantWithStats[] = allParticipants.map(p => ({
    ...p,
    shoutedAt: shoutMap.get(p.id) ?? null,
    achievedCount: achievedCountMap.get(p.id) ?? 0,
  }));

  // Sort: earliest shoutedAt first (nulls last), then by achievedCount descending
  result.sort((a, b) => {
    if (a.shoutedAt && b.shoutedAt) {
      return a.shoutedAt.getTime() - b.shoutedAt.getTime();
    }
    if (a.shoutedAt && !b.shoutedAt) return -1;
    if (!a.shoutedAt && b.shoutedAt) return 1;
    return b.achievedCount - a.achievedCount;
  });

  return result;
}

export async function getParticipantByAuth0Id(auth0Id: string): Promise<Participant | null> {
  const rows = await db
    .select()
    .from(participants)
    .where(eq(participants.auth0Id, auth0Id))
    .limit(1);
  return rows[0] ?? null;
}

export async function joinPool(formData: FormData, auth0Id: string, email: string | null) {
  const name = (formData.get('name') as string)?.trim();
  if (!name) throw new Error('Name is required');

  const userName = (formData.get('userName') as string)?.trim() || null;

  // Prevent duplicate registrations
  const existing = await getParticipantByAuth0Id(auth0Id);
  if (existing) throw new Error('Already registered');

  await db.insert(participants).values({
    name,
    userName,
    email,
    auth0Id,
  });

  revalidatePath('/participants');
}

async function assertCanEditParticipant(participantId: number): Promise<void> {
  const session = await auth0.getSession();
  if (!session?.user) throw new Error('Authentication required');

  if (isAdmin(session.user)) return;

  const rows = await db
    .select({ auth0Id: participants.auth0Id })
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1);

  if (!rows[0]) throw new Error('Participant not found');
  if (rows[0].auth0Id !== session.user.sub) {
    throw new Error('Access denied: you can only edit your own entries');
  }
}

export async function updateParticipantName(participantId: number, newName: string) {
  await assertCanEditParticipant(participantId);

  const trimmed = newName.trim();
  if (!trimmed) throw new Error('Name cannot be empty');

  await db
    .update(participants)
    .set({ name: trimmed })
    .where(eq(participants.id, participantId));

  revalidatePath(`/participants/${participantId}`);
  revalidatePath('/participants');
}

export async function updateParticipantUserName(participantId: number, newUserName: string) {
  await assertCanEditParticipant(participantId);

  const trimmed = newUserName.trim();

  await db
    .update(participants)
    .set({ userName: trimmed || null })
    .where(eq(participants.id, participantId));

  revalidatePath(`/participants/${participantId}`);
  revalidatePath('/participants');
}
