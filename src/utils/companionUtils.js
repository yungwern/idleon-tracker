import { companionMap } from '../data'

// Companions, from IdleonToolbox parsers/misc.ts getCompanions.
// snapshot.companions.owned[index] = Pet Mart+ level of the best copy (-1 = Pet Bonus Token only).

export function isCompanionActive(companions, index) {
  return companions?.owned?.[index] !== undefined
}

// The companion's bonus number (upgradedBonus once a copy is Pet Mart+ level 1+), or 0
export function getCompanionBonus(companions, index) {
  const level = companions?.owned?.[index]
  if (level === undefined) return 0
  const companion = companionMap[index]
  return level >= 1 ? companion?.upgradedBonus ?? 0 : companion?.bonus ?? 0
}
