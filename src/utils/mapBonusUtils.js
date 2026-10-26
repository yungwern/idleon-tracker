import { getAccountTalentBonus } from './talentUtils'
import { getTesseractBonus } from './tesseractUtils'

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

// Max map bonus %: 100 * (Overwhelming Energy - 1) + min(10, Beyond All Limits).
// Overwhelming Energy (talent 589) is read account-wide with the played character's added levels.
const OVERWHELMING_ENERGY = 589
const BEYOND_ALL_LIMITS = 58 // tesseract

export function getMapBonusCap(snapshot) {
  const overwhelmingEnergy = Math.max(1, getAccountTalentBonus(snapshot, OVERWHELMING_ENERGY).value)
  return 100 * (overwhelmingEnergy - 1) + Math.min(10, getTesseractBonus(snapshot?.tesseract, BEYOND_ALL_LIMITS))
}

// Capped map bonus % (cap from getMapBonusCap)
export function getCappedMapMulti(kills, cap) {
  return Math.min(getMapMulti(kills), cap)
}
