'use server';

import { db } from '@/app/lib/db';
import { races } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type Race = typeof races.$inferSelect;

export async function getAllRaces(): Promise<Race[]> {
  return db.select().from(races).orderBy(races.raceDate);
}

export async function updateRaceStatus(raceId: number, status: 'scheduled' | 'in_progress' | 'completed') {
  await db
    .update(races)
    .set({ status, updatedAt: new Date() })
    .where(eq(races.id, raceId));

  revalidatePath('/admin/races');
}
