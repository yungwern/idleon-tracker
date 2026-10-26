import { emperorBonusOrder } from '../data'
import { getTesseractBonus } from './tesseractUtils'
import { getArcadeBonus } from './arcadeUtils'
import { getJellyBonus } from './jellyUtils'

// Emperor Showdown bonuses (W6), from IdleonToolbox parsers/world-6/emperor.ts.
// Beating showdown L adds emperorBonusOrder[(L - 1) % 48]; the 48 repeat every cycle.
const CYCLE = 48
const VICAR_OF_THE_EMPEROR = 48 // tesseract

export function getEmperorBonusMulti(snapshot) {
  return 1 + (getTesseractBonus(snapshot?.tesseract, VICAR_OF_THE_EMPEROR)
    + getArcadeBonus(snapshot, 'Emperor Bonuses')
    + getJellyBonus(snapshot?.jellyOperator, 28)) / 100
}

export function getEmperorBonus(snapshot, bonusIndex) {
  const highest = snapshot?.emperor?.highestShowdown ?? 0
  const cycles = Math.floor(highest / CYCLE)
  const extra = highest % CYCLE
  const base = emperorBonusOrder.reduce((sum, reward, i) => {
    if (reward.index !== bonusIndex) return sum
    return sum + reward.value * (cycles + (i < extra ? 1 : 0))
  }, 0)
  return Math.floor(base * getEmperorBonusMulti(snapshot))
}
