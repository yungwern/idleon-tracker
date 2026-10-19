// ── Super Talent Utilities ────────────────────────────────────────────────────
// Kept out of TalentsTab.jsx so that file only exports its component (Vite HMR rule).

// One super talent point at level 400, plus one more every 100 levels after that
export function superTalentPoints(level = 0) {
  return Math.max(0, Math.floor((level - 400) / 100) + 1)
}

// Unspent points per talent tab: [{ tab: 1, unspent: 2 }, ...] (only tabs with points left)
export function getUnspentSuperTalents(presets, level = 0) {
  if (!presets) return []
  const total = superTalentPoints(level)
  return presets
    .map((preset, i) => ({
      tab: i + 1,
      unspent: total - (preset.superedTalents?.length ?? 0),
    }))
    .filter(t => t.unspent > 0)
}
