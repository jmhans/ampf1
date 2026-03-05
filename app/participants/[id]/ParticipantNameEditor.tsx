'use client';

import { useState } from 'react';
import { updateParticipantName } from '@/app/lib/actions/participants';

export default function ParticipantNameEditor({
  participantId,
  initialName,
}: {
  participantId: number;
  initialName: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === initialName) {
      setIsEditing(false);
      setValue(initialName);
      return;
    }

    setIsSaving(true);
    try {
      await updateParticipantName(participantId, trimmed);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update name:', err);
      setValue(initialName);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(initialName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{initialName}</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Edit name"
        >
          ✏️
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        disabled={isSaving}
        className="text-2xl font-bold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-gray-900 dark:text-white outline-none focus:border-red-500 dark:focus:border-red-400 disabled:opacity-50"
      />
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="px-2 py-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
      >
        {isSaving ? '...' : '✓'}
      </button>
      <button
        onClick={handleCancel}
        disabled={isSaving}
        className="px-2 py-1 text-xs font-medium bg-gray-400 hover:bg-gray-500 text-white rounded transition-colors disabled:opacity-50"
      >
        ✕
      </button>
    </div>
  );
}
