export default function ParticipantsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Participants
        </h2>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No participants yet. Add participants to get started.
        </p>
      </div>
    </div>
  );
}
