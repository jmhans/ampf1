'use client';

import Image from 'next/image';

export default function DriverCard({ driver }: { driver: any }) {
  return (
    <div className="flex flex-col items-center text-center rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow">
      {/* Driver photo */}
      <div className="relative w-32 h-40 mb-4 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700 flex-shrink-0">
        {driver.imageUrl && (
          <Image
            src={driver.imageUrl}
            alt={driver.name}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Driver info */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{driver.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{driver.nationality}</p>

      {/* Car number */}
      <div className="inline-block rounded-full bg-red-600 dark:bg-red-700 text-white font-bold text-lg w-10 h-10 flex items-center justify-center">
        {driver.number}
      </div>
    </div>
  );
}
