'use client';

import { useEffect, useState } from 'react';
import { lusitana } from '@/app/ui/fonts';

interface Category {
  name: string;
  count: number;
}

interface Participant {
  id: number;
  name: string;
  email: string | null;
}

interface GenerateResult {
  participantId: number;
  participantName: string;
  cardId?: number;
  status: 'success' | 'error';
  squaresCreated?: number;
  error?: string;
}

export default function BingoCardsPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerateResult[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  // Fetch categories and participants on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/bingo-cards');
        const data = await response.json();
        setCategories(data.categories);
        setParticipants(data.participants);

        // Initialize category counts (default to 4 per category)
        const counts: Record<string, number> = {};
        data.categories.forEach((cat: string) => {
          counts[cat] = 4;
        });
        setCategoryCounts(counts);

        // Select all participants by default
        setSelectedParticipants(data.participants.map((p: Participant) => p.id));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCategoryCountChange = (category: string, value: string) => {
    setCategoryCounts({
      ...categoryCounts,
      [category]: Math.max(0, parseInt(value) || 0),
    });
  };

  const handleParticipantToggle = (participantId: number) => {
    setSelectedParticipants((prev) => {
      const updated = prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId];
      
      // Auto-deselect "Select All" if any participant is deselected
      if (updated.length < participants.length) {
        setSelectAll(false);
      }
      // Auto-select "Select All" if all participants are selected
      if (updated.length === participants.length) {
        setSelectAll(true);
      }
      
      return updated;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedParticipants(participants.map((p) => p.id));
    } else {
      setSelectedParticipants([]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResults([]);

    try {
      const response = await fetch('/api/admin/bingo-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantIds: selectAll ? participants.map((p) => p.id) : selectedParticipants,
          categoryCounts,
        }),
      });

      const data = await response.json();

      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Failed to generate cards:', error);
      setResults([
        {
          participantId: 0,
          participantName: 'Error',
          status: 'error',
          error: String(error),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalSquares = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="flex h-16 items-end rounded-lg bg-blue-600 dark:bg-blue-700 p-4 mb-8">
        <h1 className={`${lusitana.className} text-white text-3xl`}>Generate Bingo Cards</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Category Configuration */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
              Category Configuration
            </h2>

            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {category}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={categoryCounts[category] || 0}
                    onChange={(e) => handleCategoryCountChange(category, e.target.value)}
                    disabled={isGenerating}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm">
                  <span className="font-semibold">Total squares:</span> {totalSquares} / 24
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  (Position 13 is always a free space)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Participant Selection & Generate */}
        <div className="lg:col-span-2 space-y-6">
          {/* Participant Selection */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
              Select Participants
            </h2>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  disabled={isGenerating}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Select All ({participants.length})
                </span>
              </label>
            </div>

            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {participants.map((participant) => (
                <label
                  key={participant.id}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(participant.id)}
                    onChange={() => handleParticipantToggle(participant.id)}
                    disabled={isGenerating}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {participant.name}
                  </span>
                  {participant.email && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({participant.email})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div>
            <button
              onClick={handleGenerate}
              disabled={
                isGenerating ||
                selectedParticipants.length === 0 ||
                totalSquares !== 24
              }
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
            >
              {isGenerating ? 'Generating Cards...' : 'Generate Bingo Cards'}
            </button>

            {totalSquares !== 24 && selectedParticipants.length > 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                ⚠️ Total squares must equal 24 (currently {totalSquares})
              </p>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                Generation Results
              </h2>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-sm ${
                      result.status === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}
                  >
                    <div className="font-medium">{result.participantName}</div>
                    {result.status === 'success' ? (
                      <div className="text-xs mt-1">
                        ✓ Card #{result.cardId} - {result.squaresCreated} squares created
                      </div>
                    ) : (
                      <div className="text-xs mt-1">✗ {result.error}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium">
                  Success: {results.filter((r) => r.status === 'success').length} /{' '}
                  {results.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
