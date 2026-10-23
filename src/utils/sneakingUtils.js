import { pristineCharmMap } from '../data'

// Pristine Charm bonus by name: its value once unlocked, else 0 (Toolbox getCharmBonus).
// For }x charms the multiplier is 1 + value / 100.
export function getCharmBonus(sneaking, name) {
  const index = pristineCharmMap.findIndex(charm => charm.name === name)
  return index !== -1 && sneaking?.pristineCharms?.[index] ? pristineCharmMap[index].value : 0
}
