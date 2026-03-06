'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventAchieved,
  toggleEventActive,
  type BingoEvent,
} from '@/app/lib/actions/events';

const CATEGORIES = ['Common', 'Uncommon', 'Rare'];

type Mode = 'view' | 'edit';

function EventForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: Partial<BingoEvent>;
  onSubmit: (formData: FormData) => void;
  onCancel?: () => void;
  submitLabel: string;
}) {
  return (
    <form action={onSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          defaultValue={initial?.name ?? ''}
          required
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="e.g. Safety car deployed"
        />
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Category
        </label>
        <select
          name="category"
          defaultValue={initial?.category ?? ''}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">— none —</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex-[2] min-w-[220px]">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Description
        </label>
        <input
          name="description"
          defaultValue={initial?.description ?? ''}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Optional longer description"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function EventRow({ event }: { event: BingoEvent }) {
  const [mode, setMode] = useState<Mode>('view');
  const [isPending, startTransition] = useTransition();

  if (mode === 'edit') {
    return (
      <tr className="border-t border-gray-100 dark:border-gray-700 bg-red-50 dark:bg-red-900/10">
        <td colSpan={5} className="px-4 py-3">
          <EventForm
            initial={event}
            submitLabel="Save"
            onCancel={() => setMode('view')}
            onSubmit={(fd) => {
              startTransition(async () => {
                await updateEvent(event.id, fd);
                setMode('view');
              });
            }}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr className={`border-t border-gray-100 dark:border-gray-700 ${!event.isActive ? 'opacity-50' : ''}`}>
      {/* Name + description */}
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900 dark:text-white text-sm">{event.name}</p>
        {event.description && (
          <p className="text-xs text-gray-400 mt-0.5">{event.description}</p>
        )}
      </td>

      {/* Category */}
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
        {event.category
          ? <span className="capitalize rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs">{event.category}</span>
          : <span className="text-gray-300">—</span>
        }
      </td>

      {/* Achieved badge */}
      <td className="px-4 py-3">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => toggleEventAchieved(event.id, event.isAchieved))}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            event.isAchieved
              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 hover:bg-green-200'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {event.isAchieved ? '✅ Achieved' : 'Not achieved'}
        </button>
      </td>

      {/* Active toggle */}
      <td className="px-4 py-3">
        <button
          disabled={isPending}
          onClick={() => startTransition(() => toggleEventActive(event.id, event.isActive))}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            event.isActive
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 hover:bg-gray-200'
          }`}
        >
          {event.isActive ? 'Active' : 'Inactive'}
        </button>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('edit')}
            className="rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 text-xs text-gray-700 dark:text-gray-300 transition-colors"
          >
            Edit
          </button>
          <button
            disabled={isPending}
            onClick={() => {
              if (confirm(`Delete "${event.name}"?`)) {
                startTransition(() => deleteEvent(event.id));
              }
            }}
            className="rounded-md bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 px-3 py-1 text-xs text-red-700 dark:text-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function EventsClient({ events }: { events: BingoEvent[] }) {
  const [isPending, startTransition] = useTransition();
  const [showInactive, setShowInactive] = useState(false);

  const visible = showInactive ? events : events.filter((e) => e.isActive);
  const achievedCount = events.filter((e) => e.isAchieved && e.isActive).length;
  const activeCount = events.filter((e) => e.isActive).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
          >
            ←
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bingo Events</h2>
          <span className="text-sm text-gray-400">{achievedCount}/{activeCount} achieved</span>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded"
          />
          Show inactive
        </label>
      </div>

      {/* Add new event form */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Add New Event</h3>
        <EventForm
          submitLabel="Add Event"
          onSubmit={(fd) => startTransition(() => createEvent(fd))}
        />
      </div>

      {/* Events table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {visible.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No events yet. Add one above.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isPending && (
        <p className="text-center text-sm text-gray-400 mt-4">Saving…</p>
      )}
    </div>
  );
}
