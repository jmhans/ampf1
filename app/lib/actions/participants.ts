'use server';

import { db } from '@/app/lib/db';
import { participants } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth0 } from '@/app/lib/auth0';
import { isAdmin } from '@/app/lib/auth-utils';

export type Participant = typeof participants.$inferSelect;

export async function getAllParticipants(): Promise<Participant[]> {
  return db
    .select()
    .from(participants)
    .orderBy(participants.name);
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
