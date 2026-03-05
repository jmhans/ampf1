export interface MockEvent {
  id: number;
  name: string;
  category: string;
}

export const MOCK_EVENTS: MockEvent[] = [
  // Safety
  { id: 1,  name: 'Safety car deployed', category: 'safety' },
  { id: 2,  name: 'Virtual Safety Car (VSC)', category: 'safety' },
  { id: 3,  name: 'Red flag', category: 'safety' },
  { id: 4,  name: 'Standing restart after red flag', category: 'safety' },
  { id: 5,  name: 'Double yellow flags', category: 'safety' },
  { id: 6,  name: 'Safety car lasts 3+ laps', category: 'safety' },
  { id: 7,  name: 'Safety car leads to pit chaos', category: 'safety' },
  { id: 8,  name: 'Medical car deployed on track', category: 'safety' },

  // Race incidents
  { id: 9,  name: 'First lap collision', category: 'race' },
  { id: 10, name: 'Fastest lap awarded', category: 'race' },
  { id: 11, name: 'Pole sitter leads lap 1', category: 'race' },
  { id: 12, name: 'Race leader changes 3+ times', category: 'race' },
  { id: 13, name: 'Last lap position change', category: 'race' },
  { id: 14, name: 'Photo finish (< 1 second)', category: 'race' },
  { id: 15, name: 'Lap record broken', category: 'race' },
  { id: 16, name: 'Podium sweep by one team', category: 'race' },
  { id: 17, name: 'Top 3 all on different strategies', category: 'race' },
  { id: 18, name: 'Race winner starts from pole', category: 'race' },
  { id: 19, name: 'DRS unavailable early in race', category: 'race' },

  // Driver events
  { id: 20, name: 'Driver DNF — mechanical', category: 'driver' },
  { id: 21, name: 'Driver DNF — collision', category: 'driver' },
  { id: 22, name: 'Driver retires in final 5 laps', category: 'driver' },
  { id: 23, name: 'Driver spins but continues', category: 'driver' },
  { id: 24, name: 'Driver goes off track & continues', category: 'driver' },
  { id: 25, name: 'Driver gains advantage off track', category: 'driver' },
  { id: 26, name: 'Comeback from last to top 5', category: 'driver' },
  { id: 27, name: 'Two teammates collide', category: 'driver' },
  { id: 28, name: 'Driver loses 3+ positions at start', category: 'driver' },
  { id: 29, name: 'Champion finishes outside top 5', category: 'driver' },
  { id: 30, name: 'Driver scores first career point', category: 'driver' },
  { id: 31, name: 'Driver overtakes on final lap', category: 'driver' },
  { id: 32, name: 'Driver sets fastest personal lap', category: 'driver' },
  { id: 33, name: 'Driver uses "the move" — divebomb', category: 'driver' },
  { id: 34, name: 'Driver radio complaint goes viral', category: 'driver' },

  // Penalties
  { id: 35, name: 'Time penalty issued', category: 'penalty' },
  { id: 36, name: 'Drive-through penalty', category: 'penalty' },
  { id: 37, name: 'Stop-go penalty', category: 'penalty' },
  { id: 38, name: 'Grid penalty served', category: 'penalty' },
  { id: 39, name: 'Post-race position change', category: 'penalty' },
  { id: 40, name: 'Track limits warning', category: 'penalty' },
  { id: 41, name: 'Investigated but no action', category: 'penalty' },
  { id: 42, name: 'Pit lane speeding penalty', category: 'penalty' },

  // Pit stops
  { id: 43, name: 'Sub-2.5s pit stop', category: 'pit' },
  { id: 44, name: 'Sub-2s pit stop', category: 'pit' },
  { id: 45, name: 'Botched pit stop (> 4s)', category: 'pit' },
  { id: 46, name: 'Dropped wheel in pit lane', category: 'pit' },
  { id: 47, name: 'Unsafe release penalty', category: 'pit' },
  { id: 48, name: 'Double stacking (teammates same lap)', category: 'pit' },
  { id: 49, name: 'Undercut works perfectly', category: 'pit' },
  { id: 50, name: 'Overcut succeeds', category: 'pit' },
  { id: 51, name: 'Pit stop under safety car', category: 'pit' },
  { id: 52, name: 'Driver pits from the lead', category: 'pit' },

  // Strategy
  { id: 53, name: 'One-stop strategy wins', category: 'strategy' },
  { id: 54, name: 'Two-stop strategy wins', category: 'strategy' },
  { id: 55, name: 'Three-stop strategy used', category: 'strategy' },
  { id: 56, name: 'Tire blowout / puncture', category: 'strategy' },
  { id: 57, name: 'Ultra-long stint (no stop for 35+ laps)', category: 'strategy' },
  { id: 58, name: '"Save the car" team radio', category: 'strategy' },
  { id: 59, name: 'Soft tire racer on podium', category: 'strategy' },
  { id: 60, name: 'Strategy split between teammates', category: 'strategy' },

  // Weather
  { id: 61, name: 'Race starts in wet conditions', category: 'weather' },
  { id: 62, name: 'Weather changes mid-race', category: 'weather' },
  { id: 63, name: 'Intermediates used', category: 'weather' },
  { id: 64, name: 'Full wets used', category: 'weather' },
  { id: 65, name: 'Safety car due to rain', category: 'weather' },
  { id: 66, name: 'Race suspended for weather', category: 'weather' },

  // Team/Misc
  { id: 67, name: 'Ferrari strategy error (meme)', category: 'team' },
  { id: 68, name: 'Underdog team scores points', category: 'team' },
  { id: 69, name: 'Both cars from one team in points', category: 'team' },
  { id: 70, name: 'Team principal on pitwall drama', category: 'team' },
  { id: 71, name: 'New team records best-ever finish', category: 'team' },
  { id: 72, name: 'Car catches fire in pit lane', category: 'team' },
  { id: 73, name: 'Commentator mispronounces name', category: 'other' },
  { id: 74, name: 'Post-race protest filed', category: 'other' },
  { id: 75, name: 'Race director issues statement', category: 'other' },
];

// Deterministic seeded shuffle so each participant always gets the same card
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Returns 24 events for a 5×5 card (position 13 = FREE space)
export function generateCardEvents(participantId: number): (MockEvent | null)[] {
  const shuffled = seededShuffle(MOCK_EVENTS, participantId);
  const picked = shuffled.slice(0, 24);
  // Build 25 squares; insert FREE at position index 12 (centre of 5×5)
  const squares: (MockEvent | null)[] = [];
  for (let i = 0; i < 25; i++) {
    if (i === 12) {
      squares.push(null); // FREE space
    } else {
      squares.push(picked[i < 12 ? i : i - 1]);
    }
  }
  return squares;
}
