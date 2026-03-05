'use server';

import { db } from '@/app/lib/db';
import { participants } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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

  // Prevent duplicate registrations
  const existing = await getParticipantByAuth0Id(auth0Id);
  if (existing) throw new Error('Already registered');

  await db.insert(participants).values({
    name,
    email,
    auth0Id,
  });

  revalidatePath('/participants');
}

export async function updateParticipantName(participantId: number, newName: string) {
  const trimmed = newName.trim();
  if (!trimmed) throw new Error('Name cannot be empty');

  await db
    .update(participants)
    .set({ name: trimmed })
    .where(eq(participants.id, participantId));

  revalidatePath(`/participants/${participantId}`);
  revalidatePath('/participants');
}
