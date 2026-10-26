import { exoticMarketMap, calcExoticBonus } from '../data'

// Exotic Market (W6 Farming). snapshot.farming.exoticLevels[i] = level of exotic i,
// snapshot.farming.organicExotics = exotics with an organic label (2x bonus).

export function isOrganicExotic(farming, index) {
  return (farming?.organicExotics ?? []).includes(index)
}

export function getExoticBonus(farming, index) {
  return calcExoticBonus(exoticMarketMap[index], farming?.exoticLevels?.[index] ?? 0, isOrganicExotic(farming, index))
}
