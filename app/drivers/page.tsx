import { db } from '@/app/lib/db';
import { drivers } from '@/app/lib/db/schema';
import { asc } from 'drizzle-orm';
import DriverCard from './DriverCard';

export const dynamic = 'force-dynamic';

export default async function DriversPage() {
  const allDrivers = await db.select().from(drivers).orderBy(asc(drivers.team), asc(drivers.name));

  // Group drivers by team
  const driversByTeam = allDrivers.reduce(
    (acc, driver) => {
      if (!acc[driver.team]) acc[driver.team] = [];
      acc[driver.team].push(driver);
      return acc;
    },
    {} as Record<string, typeof allDrivers>
  );

  // Team colors for styling
  const teamColors: Record<string, { bg: string; text: string }> = {
    'Ferrari': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
    'Red Bull Racing': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    'Mercedes': { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400' },
    'McLaren': { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
    'Aston Martin': { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
    'Alpine': { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400' },
    'Williams': { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-600 dark:text-sky-400' },
    'Haas': { bg: 'bg-gray-50 dark:bg-gray-700/20', text: 'text-gray-600 dark:text-gray-400' },
    'RB': { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' },
    'Kick Sauber': { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-500' },
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">2026 F1 Drivers</h1>
        <p className="text-gray-500 dark:text-gray-400">{allDrivers.length} drivers across {Object.keys(driversByTeam).length} teams</p>
      </div>

      {/* Teams and drivers */}
      <div className="space-y-8">
        {Object.entries(driversByTeam).map(([team, teamDrivers]) => {
          const colors = teamColors[team] || {
            bg: 'bg-gray-50 dark:bg-gray-800',
            text: 'text-gray-600 dark:text-gray-400',
          };

          return (
            <div key={team}>
              {/* Team header */}
              <div className={`rounded-t-lg border border-b-0 border-gray-200 dark:border-gray-700 ${colors.bg} px-6 py-4`}>
                <h2 className={`text-2xl font-bold ${colors.text}`}>{team}</h2>
              </div>

              {/* Drivers grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                {teamDrivers.map((driver) => (
                  <DriverCard key={driver.id} driver={driver} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {allDrivers.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No drivers found.</p>
        </div>
      )}
    </div>
  );
}
