export interface CardSquare {
  id: number;
  name: string;
  isAchieved: boolean;
  isFree: boolean;
}

function Square({ square, isBingoSquare }: { square: CardSquare; isBingoSquare?: boolean }) {
  return (
    <div
      title={square.name}
      className={`relative flex items-center justify-center rounded-md p-1 text-center aspect-square w-full overflow-hidden bg-white dark:bg-gray-800 ${
        isBingoSquare
          ? 'border-2 border-green-700 dark:border-green-500'
          : 'border border-gray-200 dark:border-gray-700'
      }`}
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

// All possible winning lines: 5 rows, 5 columns, 2 diagonals
const LINES = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

export default function BingoCard({
  squares,
  participantName,
}: {
  squares: CardSquare[];
  participantName: string;
}) {
  const achievedCount = squares.filter((s) => s.isAchieved && !s.isFree).length;

  // Find all completed lines and collect their square indices
  const winningLines = LINES.filter((line) => line.every((i) => squares[i]?.isAchieved));
  const hasBingo = winningLines.length > 0;
  const bingoSquareIndices = new Set(winningLines.flat());

  return (
    <div className="max-w-2xl mx-auto">
      {/* Bingo banner – shown above the card when a bingo is achieved */}
      {hasBingo && (
        <div className="mb-4 rounded-lg bg-green-700 px-6 py-4 text-center text-white shadow-lg">
          <p className="text-2xl font-black tracking-wide">🏎️ BINGO!</p>
          <p className="mt-1 text-sm font-medium opacity-90">
            {participantName} has achieved a bingo!
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{participantName}&apos;s Card</h2>
          <p className="text-xs text-gray-400 mt-0.5">{achievedCount} / 24 squares achieved</p>
        </div>
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
          <Square key={i} square={sq} isBingoSquare={bingoSquareIndices.has(i)} />
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        Squares highlighted in green have been marked as achieved by the admin.
      </p>
    </div>
  );
}
