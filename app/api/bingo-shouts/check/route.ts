import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { bingoShouts } from '@/app/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const dbUrl = process.env.POSTGRES_URL;
if (!dbUrl) throw new Error('POSTGRES_URL not set');

const client = neon(dbUrl);
const db = drizzle(client);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const entryCardId = url.searchParams.get('entryCardId');
    const participantId = url.searchParams.get('participantId');

    if (!entryCardId || !participantId) {
      return Response.json(
        { error: 'entryCardId and participantId are required' },
        { status: 400 }
      );
    }

    // Check if this participant has already shouted for this entry card
    const existing = await db
      .select({ id: bingoShouts.id })
      .from(bingoShouts)
      .where(
        and(
          eq(bingoShouts.entryCardId, parseInt(entryCardId)),
          eq(bingoShouts.participantId, parseInt(participantId))
        )
      );

    const hasShoutedBingo = existing.length > 0;

    return Response.json({
      hasShoutedBingo,
      shoutCount: existing.length,
    });
  } catch (error) {
    console.error('Error checking bingo shout status:', error);
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
