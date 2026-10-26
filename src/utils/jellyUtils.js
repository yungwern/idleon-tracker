import { jellyObstructions } from '../data'

// Jelly Operator (W7) obstruction bonuses, from IdleonToolbox parsers/world-7/jellyOperator.ts.
// Bonus i is active once more than i obstructions are defeated.
export function getJellyBonus(jellyOperator, index) {
  return (jellyOperator?.obstructionsDefeated ?? 0) > index ? jellyObstructions[index]?.value ?? 0 : 0
}
