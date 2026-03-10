import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { bingoShouts } from '@/app/lib/db/schema';

const dbUrl = process.env.POSTGRES_URL;
if (!dbUrl) throw new Error('POSTGRES_URL not set');

const client = neon(dbUrl);
const db = drizzle(client);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entryCardId, participantId } = body;

    if (!entryCardId || !participantId) {
      return Response.json(
        { error: 'entryCardId and participantId are required' },
        { status: 400 }
      );
    }

    // Insert the bingo shout
    const result = await db
      .insert(bingoShouts)
      .values({
        entryCardId,
        participantId,
        isVerified: false,
      })
      .returning({ id: bingoShouts.id });

    return Response.json({
      success: true,
      shoutId: result[0]?.id,
      message: 'BINGO registered! Admin will verify.',
    });
  } catch (error) {
    console.error('Error registering bingo shout:', error);
    return Response.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
