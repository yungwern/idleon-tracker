import { buttonBonusMap } from '../data'
import { getCompanionBonus } from './companionUtils'
import { getResearchGridBonus } from './researchUtils'

// The Button (W7), from IdleonToolbox parsers/world-7/button.ts. Presses fill the bonuses
// in order, 5 per bonus, then loop; every press adds its bonus's bonusPerPress × multi.
const BUTTON_COMPANION = 147
const BETTER_BUTTON = 125 // research grid square

export function getButtonMulti(snapshot) {
  return (1 + getCompanionBonus(snapshot?.companions, BUTTON_COMPANION) / 100)
    * (1 + getResearchGridBonus(snapshot, BETTER_BUTTON) / 100)
}

// Bonus i as a % (}x bonuses are 1 + value / 100)
export function getButtonBonus(snapshot, index) {
  const presses = snapshot?.button?.presses ?? 0
  const count = buttonBonusMap.length
  const groups = Math.floor(presses / 5)
  const fullCycles = Math.floor(groups / count)
  const pressesHere = 5 * (fullCycles + (index < groups % count ? 1 : 0))
    + (index === groups % count ? presses % 5 : 0)
  return pressesHere * (buttonBonusMap[index]?.bonusPerPress ?? 0) * getButtonMulti(snapshot)
}
