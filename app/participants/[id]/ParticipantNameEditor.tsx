'use client';

import { useState } from 'react';
import { updateParticipantName, updateParticipantUserName } from '@/app/lib/actions/participants';

function InlineEditor({
  label,
  value: initialValue,
  onSave,
  className,
}: {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (trimmed === initialValue) {
      setValue(initialValue);
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(trimmed);
      setIsEditing(false);
    } catch (err) {
      console.error(`Failed to update ${label}:`, err);
      setValue(initialValue);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (!isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ''}`}>
        <span>{value || <span className="text-gray-400 italic">—</span>}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title={`Edit ${label}`}
        >
          ✏️
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        disabled={isSaving}
        placeholder={label}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-gray-900 dark:text-white outline-none focus:border-red-500 dark:focus:border-red-400 disabled:opacity-50"
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

export default function ParticipantNameEditor({
  participantId,
  initialName,
  initialUserName,
}: {
  participantId: number;
  initialName: string;
  initialUserName: string | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 w-20">Owner:</span>
        <InlineEditor
          label="owner name"
          value={initialUserName ?? ''}
          onSave={(v) => updateParticipantUserName(participantId, v)}
          className="text-base text-gray-700 dark:text-gray-300"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 w-20">Entry:</span>
        <InlineEditor
          label="entry name"
          value={initialName}
          onSave={(v) => {
            if (!v) return Promise.reject(new Error('Name cannot be empty'));
            return updateParticipantName(participantId, v);
          }}
          className="text-2xl font-bold text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );
}
