// ── Ribbons ───────────────────────────────────────────────────────────────────
// Highest ribbon rank in the game (CookingR('RibbonsMaxLV'))
export const RIBBON_MAX_RANK = 25

// Base meal multiplier for a ribbon rank, from the game's RibbonBonus formula
// (Toolbox parsers/world-4/cooking.ts → getRibbonBonus). Leaves out the account
// bonuses that also scale it (Emperor set, Equinox cloud, jelly), so this is the
// value every account shares.
export const ribbonMulti = (rank) => {
  const r = rank ?? 0
  return 1 + Math.floor(5 * r + Math.floor(r / 2) * (4 + 6.5 * Math.floor(r / 5))) / 100
}

// CSS color class for a ribbon rank's number (styles in Cooking.css)
export const ribbonTierClass = (rank) => {
  if (rank <= 4) return 'ribbon-white'
  if (rank <= 9) return 'ribbon-bronze'
  if (rank <= 14) return 'ribbon-silver'
  if (rank <= 19) return 'ribbon-gold'
  if (rank <= 24) return 'ribbon-diamond'
  return 'ribbon-prismatic'
}

// ── Cooking Mastery ───────────────────────────────────────────────────────────
// Meal bonus multiplier from a meal's yellow Mastery node (game: BonusMultiCook).
// Caps toward 2x, so early points are worth far more than late ones.
export const masteryNodeMulti = (level) => {
  const l = level ?? 0
  return 1 + l / (l + 5)
}
