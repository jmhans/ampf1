'use client';

import { useState, useTransition } from 'react';
import { joinPool } from '@/app/lib/actions/participants';

export default function JoinPoolButton({
  auth0Id,
  email,
  displayName,
}: {
  auth0Id: string;
  email: string | null;
  displayName: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await joinPool(formData, auth0Id, email);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-red-600 hover:bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
      >
        Join Pool
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-wrap items-center gap-3">
      <div className="flex flex-col gap-2">
        <input
          name="userName"
          defaultValue=""
          placeholder="Your name (owner)"
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 w-52"
        />
        <input
          name="name"
          required
          defaultValue={displayName}
          placeholder="Entry name"
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 w-52"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-colors"
      >
        {isPending ? 'Joining…' : 'Confirm'}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setError(null); }}
        className="rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors"
      >
        Cancel
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
