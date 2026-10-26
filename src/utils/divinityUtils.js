import { godMap } from '../data'
import { isCompanionActive, isKingDootActive } from './companionUtils'
import { getSkillLevel } from './skillUtils'
import { getBubbleBonus } from './alchemyUtils'
import { getCoralKidUpgradeBonus, CORAL_KID_UPGRADES } from './coralReefUtils'
import { getResearchGridBonus } from './researchUtils'

// Divinity (W5) minor link bonuses, from IdleonToolbox parsers/world-5/divinity.ts.
// snapshot.divinity.linkedGods[i] = god slot character i is linked to; slots index godMap.

const ALL_BUBBLES_COMPANION = 4 // companion: every bubble counts as equipped
const BIG_P = 'c21' // active bubble: multiplies minor link bonuses
const POLYTHEISM = 505 // Elemental Sorcerer talent: a second link, slot = level % 10
const POCKET_DIVINITY_MAJIK = 0 // IdleOn majik 0: Pocket Divinity spots
const ARCTIS_GRID_SQUARE = 173 // research grid: Arctis for everyone

export const GODS = Object.fromEntries(godMap.map((god, slot) => [god.name, slot]))

function isPocketGod(snapshot, slot) {
  const spots = Math.floor(snapshot?.caverns?.idleonMajiks?.[POCKET_DIVINITY_MAJIK] ?? 0)
  const pocket = snapshot?.caverns?.pocketGods ?? []
  return (pocket[0] === slot && spots > 0) || (pocket[1] === slot && spots > 1)
}

function isGrantedToEveryone(snapshot, slot) {
  return isKingDootActive(snapshot)
    || isPocketGod(snapshot, slot)
    || (slot === GODS.Arctis && getResearchGridBonus(snapshot, ARCTIS_GRID_SQUARE) >= 1)
}

// The character's own link, or its Polytheism link once that god is unlocked
function isLinked(snapshot, characterIndex, slot) {
  const character = snapshot?.characters?.[characterIndex]
  if (snapshot?.divinity?.linkedGods?.[characterIndex] === slot) return true
  const polytheism = Number(character?.talentLevels?.[POLYTHEISM]) || 0
  return polytheism > 0
    && polytheism % 10 === slot
    && (snapshot?.divinity?.unlockedGods ?? 0) > slot
}

function getBigPMulti(snapshot, character) {
  const equipped = isCompanionActive(snapshot?.companions, ALL_BUBBLES_COMPANION)
    || (character?.equippedBubbles ?? []).includes(BIG_P)
  return equipped ? Math.max(1, getBubbleBonus(snapshot, BIG_P)) : 1
}

// The game reads the multiplier column by godIndex rather than by slot, so a god's multiplier
// is the one stored on the row its godIndex points to (Arctis reads Nobisect's 15).
function minorMultiplier(slot) {
  return godMap[godMap[slot]?.godIndex]?.minorBonusMultiplier ?? 0
}

// A god's minor link bonus for one character (0 when it isn't linked)
export function getMinorDivinityBonus(snapshot, characterIndex, slot) {
  if (!isGrantedToEveryone(snapshot, slot) && !isLinked(snapshot, characterIndex, slot)) return 0
  const character = snapshot?.characters?.[characterIndex]
  const divinityLevel = getSkillLevel(character, 'divinity')
  if (divinityLevel <= 0) return 0
  const coral = getCoralKidUpgradeBonus(snapshot?.coralReef, CORAL_KID_UPGRADES.divinityLinks)
  return getBigPMulti(snapshot, character)
    * (1 + coral / 100)
    * (divinityLevel / (60 + divinityLevel))
    * minorMultiplier(slot)
}
