import { mineheadOpponentBonuses } from '../data'

// Minehead (W7) opponent bonuses, from IdleonToolbox parsers/world-7/minehead.ts getMineheadBonusQTY.
// Bonus i is active once more than i opponents are beaten.
export function getMineheadBonus(minehead, index) {
  return (minehead?.opponentsBeaten ?? 0) > index ? mineheadOpponentBonuses[index] ?? 0 : 0
}
