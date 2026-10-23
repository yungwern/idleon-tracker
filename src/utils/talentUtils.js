import { talentGrowthMap } from '../data'
import { growth } from './mathUtils'

// ── Super Talent Utilities ────────────────────────────────────────────────────
// Used by the Overview notification for unspent super talent points.

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

// ── Talent Bonuses ────────────────────────────────────────────────────────────
// Uses the best base talent level across characters (snapshot.talents.highestBaseLevels).
// Added talent levels aren't parsed yet, so bonuses can read a little low.
export function getHighestTalentLevel(talents, id) {
  return talents?.highestBaseLevels?.[id] ?? 0
}

export function getHighestTalentBonus(talents, id) {
  const stats = talentGrowthMap[id]
  return stats ? growth(stats.func, getHighestTalentLevel(talents, id), stats.x1, stats.x2) : 0
}
