// ============================================================
// ROYAL GUARDIAN — ROYAL STATUES
// Each marble (RGshard0-6) restores and upgrades one Royal Statue.
// Source: IdleOn Toolbox (parsers/class-specific/royalGuardian.ts + website-data)
//   names/base/perLevel — CustomLists.Research rows 40-42
//   firstOdds          — gameTables.royalStatueFirstOdds ("StatueUpgOdds" at level 0)
// Save: RoyalG[0] = statue levels, RoyalG[2][45] = Royal Reverence armory level
// ============================================================

export const ROYAL_STATUES = [
  { index: 0, marble: 'RGshard0', bonus: 'Total Damage', base: 200, perLevel: 15, firstOdds: 25 },
  { index: 1, marble: 'RGshard1', bonus: 'Drop Rate', base: 50, perLevel: 5, firstOdds: 50 },
  { index: 2, marble: 'RGshard2', bonus: 'Extra Kills', base: 30, perLevel: 3, firstOdds: 100 },
  { index: 3, marble: 'RGshard3', bonus: 'Class EXP', base: 300, perLevel: 20, firstOdds: 250 },
  // Not released yet — the game data has placeholder names for these statues
  { index: 4, marble: 'RGshard4', bonus: null, base: 10, perLevel: 3, firstOdds: 500 },
  { index: 5, marble: 'RGshard5', bonus: null, base: 10, perLevel: 3, firstOdds: 1000 },
  { index: 6, marble: 'RGshard6', bonus: null, base: 10, perLevel: 3, firstOdds: 2500 },
]

// Upgrading an unlocked statue costs this item instead of a marble
export const PARCHMENT_KEY = 'RGenh'

// Royal Reverence armory upgrade: +1% to every statue bonus per level
export const ROYAL_REVERENCE_PER_LEVEL = 1

// Chance of the next attempt succeeding, as "1 in N" (N = average attempts needed).
// Level 0 is the unlock (costs a marble); after that each level-up costs a Parchment.
export function royalStatueOddsN(statue, level) {
  if (level === 0) return statue.firstOdds
  return 10 * Math.ceil(((25 + 15 * statue.index ** 2) * Math.max(1, 1 + (level - 1) / 4)) / 10)
}

// Bonus % at a level: nothing at 0, base at 1, then +perLevel each level after
export function royalStatueBonus(statue, level, royalReverenceLevel = 0) {
  if (level === 0) return 0
  const reverence = 1 + (royalReverenceLevel * ROYAL_REVERENCE_PER_LEVEL) / 100
  return reverence * (statue.base + statue.perLevel * (level - 1))
}

// The game shows these bonuses as multipliers: 200% -> "3.00x"
export function formatStatueMultiplier(bonus) {
  return `${(1 + bonus / 100).toFixed(2)}x`
}

// ============================================================
// STATUE FLAIR
// Spends marbles to boost the EXP of your regular statues (statueMap ids 0-31).
// Source: IdleOn Toolbox — statues[].flairShardIndex, "SF_bonus", "SF_costo"
// Save: RoyalG[22] = flair level per statue, RoyalG[2][78] = Statue Flair unlocked (armory)
// ============================================================

// Which marble (RGshard index) upgrades each statue's flair, by statue id
export const STATUE_FLAIR_MARBLE = [0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 2, 2, 2, 2, 1, 3, 3, 0, 4, 4, 5, 5, 5, 4, 3, 6, 6]

// Marbles needed to go from `level` to `level + 1`
export function statueFlairCost(statueId, level) {
  return 10 * (statueId + 1) * 5 ** level
}

// Statue EXP multiplier at a flair level: 1x, 7x, 15x, 25x, ...
export function statueFlairExpMulti(level) {
  const bonus = 2 * (300 * level + 100 * Math.floor(level / 2) + 200 * Math.floor(level / 3))
  return 1 + bonus / 100
}
