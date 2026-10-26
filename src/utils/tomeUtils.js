// Tome (W4). Total Tome points come from ~100 account stats, so the app takes them as an
// input (the number shown in the game's Tome) instead of recomputing them.

// Tome bubbles (Crop Chapter, Tome Strength...) give their bonus once per 2000 points above 5000
export function getTomeBubbleMulti(tomePoints) {
  return Math.floor(Math.max(0, (Number(tomePoints) || 0) - 5000) / 2000)
}
