import Link from 'next/link';
import { db } from '@/app/lib/db';
import { races, seasons } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function RacesPage() {
  // Fetch 2026 season and races
  const seasonRows = await db
    .select()
    .from(seasons)
    .where(eq(seasons.year, 2026))
    .limit(1);

  const season = seasonRows[0];
  if (!season) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">2026 F1 Season</h1>
        <p className="text-gray-500 dark:text-gray-400">No races loaded yet.</p>
      </div>
    );
  }

  const allRaces = await db
    .select()
    .from(races)
    .where(eq(races.seasonId, season.id));

  // Sort by round number
  allRaces.sort((a, b) => a.round - b.round);

  const formatDate = (date: Date | null) => {
    if (!date) return 'TBD';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatStartTime = (date: Date | null) => {
    if (!date) return 'TBD';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Chicago',
      timeZoneName: 'short',
    }).format(date);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">2026 F1 Season</h1>
        <p className="text-gray-500 dark:text-gray-400">{allRaces.length} races scheduled</p>
      </div>

      {/* Races grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allRaces.map((race) => (
          <div
            key={race.id}
            className={`rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow ${
              race.status === 'cancelled'
                ? 'bg-gray-50 dark:bg-gray-900 opacity-60'
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            {/* Round and status */}
            <div className="flex items-start justify-between mb-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold">
                Round {race.round}
              </span>
              {race.status === 'cancelled' ? (
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">Cancelled</span>
              ) : race.status === 'completed' ? (
                <span className="text-xs text-gray-500 dark:text-gray-400">Completed</span>
              ) : (
                <span className="text-xs text-green-600 dark:text-green-400">Upcoming</span>
              )}
            </div>

            {/* Race name */}
            <h3 className={`text-lg font-bold mb-3 leading-tight ${race.status === 'cancelled' ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {race.name}
            </h3>

            {/* Circuit and location */}
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              {race.circuit && (
                <div>
                  <span className="font-semibold">Circuit:</span> {race.circuit}
                </div>
              )}
              {race.country && (
                <div>
                  <span className="font-semibold">Country:</span> {race.country}
                </div>
              )}
            </div>

            {/* Date and start time */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Date: </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(race.raceDate)}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Start: </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatStartTime(race.raceStartTime)}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {allRaces.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No races found for 2026.</p>
        </div>
      )}
    </div>
  );
}
