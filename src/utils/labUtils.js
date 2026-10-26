// Lab (W4) mainframe bonuses. Which nodes and jewels are connected depends on every
// character's position and line width, which isn't ported, so owned jewels and the lab
// bonuses that boost them are assumed connected (true on most endgame accounts).

const JEWEL_BONUS = { 16: 16 } // jewel index → base bonus (shared-data jewels)
const SPELUNKER_OBOL = 1.5 // lab bonus 8: 1.5x jewel effects (jewel 19 excepted)

// Returns { value, missing } like the other partial sources
export function getAssumedJewelBonus(snapshot, index) {
  if (!snapshot?.labJewels?.owned?.[index]) return { value: 0, missing: [] }
  return {
    value: (JEWEL_BONUS[index] ?? 0) * (index === 19 ? 1 : SPELUNKER_OBOL),
    missing: ['Lab jewel and Spelunker Obol (assumed connected)'],
  }
}
