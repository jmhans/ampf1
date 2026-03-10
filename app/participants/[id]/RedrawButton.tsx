'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MAX_REDRAWS = 2;

export default function RedrawButton({
  participantId,
  redrawCount,
}: {
  participantId: number;
  redrawCount: number;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const redrawsRemaining = MAX_REDRAWS - redrawCount;
  const canRedraw = redrawsRemaining > 0;

  const handleRedraw = async () => {
    if (!canRedraw || isLoading) return;

    const confirmed = window.confirm(
      'Are you sure you want to redraw your bingo card? Your current card will be replaced with a new one.'
    );
    if (!confirmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bingo-card/redraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to redraw card');
        return;
      }

      // Refresh the page to show the new card
      router.refresh();
    } catch (err) {
      setError('Failed to redraw card. Please try again.');
      console.error('Redraw error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handleRedraw}
        disabled={!canRedraw || isLoading}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white transition-colors"
      >
        {isLoading ? 'Redrawing...' : '🔀 Redraw Card'}
      </button>
      <span className={`text-sm font-medium ${canRedraw ? 'text-gray-600 dark:text-gray-400' : 'text-red-500 dark:text-red-400'}`}>
        {redrawsRemaining} / {MAX_REDRAWS} redraws remaining
      </span>
      {error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
