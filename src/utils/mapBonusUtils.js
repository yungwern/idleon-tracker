// ── Arcane Cultist Map Bonus Utilities ────────────────────────────────────────
// Formulas from IdleonToolbox parsers/class-specific/tesseract.ts

const lavaLog = (num) => Math.log(Math.max(num, 1)) / 2.30259
const lavaLog2 = (num) => Math.log(Math.max(num, 1)) / Math.log(2)

// Map bonus % from kills (same formula for DR, EXP and AFK)
export function getMapMulti(kills) {
  return (
    (2 * Math.max(0, lavaLog(kills) - 3.5) + Math.max(0, lavaLog2(kills) - 12)) *
    (lavaLog(kills) / 2.5) +
    (Math.min(2, kills / 1e3) + Math.max(5 * (lavaLog(kills) - 5), 0))
  )
}

// Max map bonus %: 100 * (Overwhelming Energy - 1) + min(10, Beyond All Limits)
// Overwhelming Energy is decayMulti(1, 500): 1 + level / (level + 500)
export function getMapBonusCap(capInfo) {
  if (!capInfo) return Infinity
  const level = capInfo.overwhelmingEnergy ?? 0
  const overwhelmingEnergy = 1 + level / (level + 500)
  return 100 * (overwhelmingEnergy - 1) + Math.min(10, capInfo.beyondAllLimits ?? 0)
}

// Capped map bonus %
export function getCappedMapMulti(kills, capInfo) {
  return Math.min(getMapMulti(kills), getMapBonusCap(capInfo))
}
