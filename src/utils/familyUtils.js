import { CLASS_NAMES, CLASS_TALENT_TABS, CLASS_FAMILY_BONUSES } from '../data'
import { growth } from './mathUtils'
import { getActiveCharacterIndex } from './characterUtils'

// Family bonuses, from IdleonToolbox parsers/family.ts (game: DNSM.FamBonusQTYs).
// Every class in a character's line grants its family bonus at that character's level. The game
// walks the characters in save order and a character only replaces a bonus when its own raw value
// beats the stored one. THE_FAMILY_GUY boosts a bonus only when the played character sets it.
// Not ported: the account-wide THE_FAMILY_GUY on the Divine Knight / Siege Breaker bonuses.

const CLASS_ID_BY_NAME = Object.fromEntries(Object.entries(CLASS_NAMES).map(([id, name]) => [name, Number(id)]))
const FAMILY_GUY = { func: 'decay', x1: 40, x2: 100 }

function classFamilyBonus(className, level) {
  const bonus = CLASS_FAMILY_BONUSES[CLASS_ID_BY_NAME[className]]
  if (!bonus || level < bonus.x3) return 0
  return growth(bonus.func, Math.max(0, Math.round(level - bonus.x3)), bonus.x1, bonus.x2)
}

// Family bonuses as the played character sees them, keyed by class name.
// familyGuyLevel: the played character's THE_FAMILY_GUY level without the Elemental Sorcerer
// family bonus (that part is added back from the walk), or 0 if it doesn't have the talent.
export function getFamilyBonuses(snapshot, familyGuyLevel = 0) {
  const activeIndex = getActiveCharacterIndex(snapshot)
  const stored = {}
  ;(snapshot?.characters ?? []).forEach((character, index) => {
    const level = Number(character?.level) || 0
    for (const familyClass of CLASS_TALENT_TABS[character?.class] ?? []) {
      const bonus = classFamilyBonus(familyClass, level)
      if (!(bonus > (stored[familyClass] ?? 0))) continue
      stored[familyClass] = bonus
      if (index !== activeIndex || familyGuyLevel <= 0) continue
      const sorcerer = Math.floor(stored['Elemental Sorcerer'] ?? 0)
      const familyGuy = growth(FAMILY_GUY.func, familyGuyLevel + sorcerer, FAMILY_GUY.x1, FAMILY_GUY.x2)
      stored[familyClass] = bonus * (1 + familyGuy / 100)
    }
  })
  return stored
}
