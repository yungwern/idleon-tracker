import { sushiUniqueBonuses } from '../data'

// Bonus from discovering unique sushi `index` (W7 Sushi Station). Active once more
// than `index` unique sushi have been discovered.
export function getSushiBonus(sushi, index) {
  return (sushi?.uniqueSushi ?? 0) > index ? sushiUniqueBonuses[index] ?? 0 : 0
}
