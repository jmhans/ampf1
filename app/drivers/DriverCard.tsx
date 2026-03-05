'use client';

import Image from 'next/image';

const TEAM_COLORS: { [key: string]: string } = {
  'Ferrari': 'bg-red-600',
  'Red Bull Racing': 'bg-blue-600',
  'Mercedes': 'bg-cyan-500',
  'McLaren': 'bg-orange-500',
  'Aston Martin': 'bg-green-600',
  'Alpine': 'bg-cyan-600',
  'Williams': 'bg-blue-400',
  'Haas': 'bg-gray-700',
  'RB': 'bg-indigo-600',
  'Kick Sauber': 'bg-green-900',
};

export default function DriverCard({ driver }: { driver: any }) {
  const teamColor = TEAM_COLORS[driver.team] || 'bg-gray-600';

  return (
    <div className="flex flex-col items-center text-center rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow">
      {/* Driver photo */}
      {driver.imageUrl && (
        <div className="relative w-32 h-40 mb-4 overflow-hidden rounded-md flex-shrink-0">
          <Image
            src={driver.imageUrl}
            alt={driver.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Driver info */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{driver.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{driver.nationality}</p>

      {/* Car number */}
      <div className={`${teamColor} rounded-full text-white font-bold text-lg w-12 h-12 flex items-center justify-center mb-2`}>
        {driver.number}
      </div>

      {/* Team */}
      <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">{driver.team}</p>
    </div>
  );
}
