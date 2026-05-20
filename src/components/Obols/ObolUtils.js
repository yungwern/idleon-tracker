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