// ── Obol Utilities ────────────────────────────────────────────────────────────
// Separated from ObolBoard.jsx to avoid Vite HMR Fast Refresh conflicts.
// ObolBoard.jsx must only export React components.

export function isUpgraded(stoneData) {
  if (!stoneData || typeof stoneData !== 'object') return false
  return Object.entries(stoneData).some(([key, val]) => {
    if (key === 'SuperFunItemDisplayType') return false
    return typeof val === 'number' && val !== 0
  })
}

// Every character obol slot is unlocked by this character level.
// Below it, empty slots may just be locked, so they aren't flagged.
export const ALL_OBOL_SLOTS_LEVEL = 250

// Obol problems for one character, used by the Overview notifications.
//   noBonus    — equipped obols with no bonus stat yet, grouped by obol: [{ rawName, count }]
//   emptySlots — number of empty slots (only counted once all slots are unlocked)
export function getObolNotices(obols = [], level = 0) {
  const noBonusCounts = {}
  let emptySlots = 0

  obols.forEach(({ rawName, stoneData }) => {
    if (!rawName || rawName === 'Blank') {
      emptySlots++
      return
    }
    if (!isUpgraded(stoneData)) {
      noBonusCounts[rawName] = (noBonusCounts[rawName] ?? 0) + 1
    }
  })

  return {
    noBonus: Object.entries(noBonusCounts).map(([rawName, count]) => ({ rawName, count })),
    emptySlots: level >= ALL_OBOL_SLOTS_LEVEL ? emptySlots : 0,
  }
}
