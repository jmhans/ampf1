export interface CardSquare {
  id: number;
  name: string;
  isAchieved: boolean;
  isFree: boolean;
}

function Square({ square }: { square: CardSquare }) {
  return (
    <div
      title={square.name}
      className="relative flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 text-center aspect-square w-full overflow-hidden"
    >
      {/* Achieved overlay */}
      {square.isAchieved && (
        <div className="absolute inset-0 bg-green-400/40 dark:bg-green-500/30 rounded-md" />
      )}

      <span className="relative text-[0.6rem] sm:text-xs leading-tight font-medium px-0.5 text-gray-700 dark:text-gray-200">
        {square.isFree ? '⭐ FREE' : square.name}
      </span>
    </div>
  );
}

const COLUMN_LABELS = ['B', 'I', 'N', 'G', 'O'];

export default function BingoCard({
  squares,
  participantName,
}: {
  squares: CardSquare[];
  participantName: string;
}) {
  const achievedCount = squares.filter((s) => s.isAchieved && !s.isFree).length;

  // Check for bingo (any row, column, or diagonal)
  const lines = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
    [0,6,12,18,24],[4,8,12,16,20],
  ];
  const hasBingo = lines.some((line) => line.every((i) => squares[i]?.isAchieved));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{participantName}&apos;s Card</h2>
          <p className="text-xs text-gray-400 mt-0.5">{achievedCount} / 24 squares achieved</p>
        </div>
        {hasBingo && (
          <div className="rounded-full bg-green-600 px-4 py-1.5 text-white font-bold text-sm animate-pulse">
            🏎️ BINGO!
          </div>
        )}
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-5 gap-1 mb-1">
        {COLUMN_LABELS.map((l) => (
          <div key={l} className="text-center font-black text-red-600 text-lg">{l}</div>
        ))}
      </div>

      {/* 5×5 grid */}
      <div className="grid grid-cols-5 gap-1">
        {squares.map((sq, i) => (
          <Square key={i} square={sq} />
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        Squares highlighted in green have been marked as achieved by the admin.
      </p>
    </div>
  );
}
