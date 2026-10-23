import { grimoireMap } from '../data'

// Writhing Grimoire boosts every upgrade except these (Toolbox calcGrimoireBonus)
const WRITHING_GRIMOIRE = 36
const NOT_BOOSTED = new Set([9, 11, 17, 26, 32, 36, 39, 45])

// Bonus of grimoire upgrade `index` (a % or the {} of a }x upgrade)
export function getGrimoireBonus(grimoire, index) {
  const base = (grimoire?.levels?.[index] ?? 0) * (grimoireMap[index]?.x5 ?? 0)
  if (NOT_BOOSTED.has(index)) return base
  return base * (1 + getGrimoireBonus(grimoire, WRITHING_GRIMOIRE) / 100)
}
