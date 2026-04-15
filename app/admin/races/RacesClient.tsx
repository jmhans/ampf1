'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { updateRaceStatus, type Race } from '@/app/lib/actions/races';

interface RacesClientProps {
  races: Race[];
}

export default function RacesClient({ races }: RacesClientProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRaces, setSelectedRaces] = useState<Map<number, 'scheduled' | 'in_progress' | 'completed' | 'cancelled'>>(new Map());

  const handleStatusChange = (raceId: number, newStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') => {
    setSelectedRaces((prev) => {
      const updated = new Map(prev);
      updated.set(raceId, newStatus);
      return updated;
    });
  };

  const handleSaveStatus = (raceId: number) => {
    const newStatus = selectedRaces.get(raceId);
    if (!newStatus) return;

    startTransition(async () => {
      await updateRaceStatus(raceId, newStatus);
    });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
          ←
        </Link>
        <h1 className="text-3xl font-bold">Race Status Management</h1>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-900 dark:text-white">Round</th>
              <th className="px-6 py-3 font-semibold text-gray-900 dark:text-white">Race Name</th>
              <th className="px-6 py-3 font-semibold text-gray-900 dark:text-white">Country</th>
              <th className="px-6 py-3 font-semibold text-gray-900 dark:text-white">Date</th>
              <th className="px-6 py-3 font-semibold text-gray-900 dark:text-white">Current Status</th>
              <th className="px-6 py-3 font-semibold text-gray-900 dark:text-white">New Status</th>
              <th className="px-6 py-3 font-semibold text-gray-900 dark:text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {races.map((race) => {
              const newStatus = selectedRaces.get(race.id);
              const isChanged = newStatus && newStatus !== race.status;

              return (
                <tr
                  key={race.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{race.round}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{race.name}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{race.country || '—'}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {race.raceDate ? new Date(race.raceDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        race.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : race.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : race.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {race.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={newStatus || race.status || ''}
                      onChange={(e) =>
                        handleStatusChange(race.id, e.target.value as 'scheduled' | 'in_progress' | 'completed' | 'cancelled')
                      }
                      className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm text-gray-900 dark:text-white"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleSaveStatus(race.id)}
                      disabled={!isChanged || isPending}
                      className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                        isChanged && !isPending
                          ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isPending ? 'Saving...' : 'Save'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {races.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No races found</p>
        </div>
      )}
    </div>
  );
}
