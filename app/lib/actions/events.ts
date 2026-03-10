'use server';

import { db } from '@/app/lib/db';
import { bingoEvents, eventOccurrences, races } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type BingoEvent = typeof bingoEvents.$inferSelect;
export type NewBingoEvent = typeof bingoEvents.$inferInsert;
export type Race = typeof races.$inferSelect;

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getAllEvents(): Promise<BingoEvent[]> {
  return db
    .select()
    .from(bingoEvents)
    .orderBy(bingoEvents.category, bingoEvents.name);
}

export async function getCompletedRaces(): Promise<Race[]> {
  return db
    .select()
    .from(races)
    .where(eq(races.status, 'completed'))
    .orderBy(races.raceDate);
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createEvent(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const category = formData.get('category') as string | null;

  if (!name?.trim()) throw new Error('Name is required');

  await db.insert(bingoEvents).values({
    name: name.trim(),
    description: description?.trim() || null,
    category: category?.trim() || null,
    isActive: true,
    isAchieved: false,
  });

  revalidatePath('/admin/events');
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateEvent(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const category = formData.get('category') as string | null;

  if (!name?.trim()) throw new Error('Name is required');

  await db
    .update(bingoEvents)
    .set({
      name: name.trim(),
      description: description?.trim() || null,
      category: category?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(bingoEvents.id, id));

  revalidatePath('/admin/events');
}

// ── Toggle achieved ───────────────────────────────────────────────────────────

export async function toggleEventAchieved(id: number, current: boolean) {
  await db
    .update(bingoEvents)
    .set({ isAchieved: !current, updatedAt: new Date() })
    .where(eq(bingoEvents.id, id));

  revalidatePath('/admin/events');
}

// ── Record event occurrence ───────────────────────────────────────────────────

export async function recordEventOccurrence(
  bingoEventId: number,
  raceId: number,
  notes?: string
) {
  // Mark the event as achieved
  await db
    .update(bingoEvents)
    .set({ isAchieved: true, updatedAt: new Date() })
    .where(eq(bingoEvents.id, bingoEventId));

  // Record the occurrence
  await db
    .insert(eventOccurrences)
    .values({
      bingoEventId,
      raceId,
      notes: notes || null,
      occurredAt: new Date(),
      createdAt: new Date(),
    });

  revalidatePath('/admin/events');
}

// ── Toggle active (soft delete) ───────────────────────────────────────────────

export async function toggleEventActive(id: number, current: boolean) {
  await db
    .update(bingoEvents)
    .set({ isActive: !current, updatedAt: new Date() })
    .where(eq(bingoEvents.id, id));

  revalidatePath('/admin/events');
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteEvent(id: number) {
  await db.delete(bingoEvents).where(eq(bingoEvents.id, id));
  revalidatePath('/admin/events');
}
