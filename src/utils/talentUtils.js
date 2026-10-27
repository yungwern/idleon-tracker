import { talentGrowthMap } from '../data'
import { growth } from './mathUtils'
import { getActiveCharacter, getActiveCharacterIndex } from './characterUtils'
import { isAchievementComplete } from './achievementUtils'
import { getCompanionBonus } from './companionUtils'
import { getGrimoireBonus } from './grimoireUtils'
import { getArmorSetBonus } from './armorSetUtils'
import { getTesseractBonus } from './tesseractUtils'
import { isSuperbitUnlocked } from './gamingUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getZenithBonus } from './zenithUtils'
import { getEquinoxUpgradeBonus, EQUINOX_UPGRADES } from './equinoxUtils'
import { getMinorDivinityBonus, GODS } from './divinityUtils'
import { getFamilyBonuses } from './familyUtils'

// ── Super Talent Utilities ────────────────────────────────────────────────────
// Used by the Overview notification for unspent super talent points.

// One super talent point at level 400, plus one more every 100 levels after that
export function superTalentPoints(level = 0) {
  return Math.max(0, Math.floor((level - 400) / 100) + 1)
}

// Unspent points per talent tab: [{ tab: 1, unspent: 2 }, ...] (only tabs with points left)
export function getUnspentSuperTalents(presets, level = 0) {
  if (!presets) return []
  const total = superTalentPoints(level)
  return presets
    .map((preset, i) => ({
      tab: i + 1,
      unspent: total - (preset.superedTalents?.length ?? 0),
    }))
    .filter(t => t.unspent > 0)
}

// ── Talent Bonuses ────────────────────────────────────────────────────────────
// How the game reads an account-wide talent (Toolbox getHighestTalentAcrossCharacters with the
// played character): every character's own base level, plus the played character's added
// levels (talents 100+ with at least 1 point), plus the super talent bonus if that character
// supered it. The best character counts.

const LIL_BOOST_ACHIEVEMENT = 291 // +1 talent LV
const TALENT_LEVEL_COMPANION = 1
const NINJA_MASTERY_TALENT_TIER = 3 // ninja mastery tier that gives +5 talent LV
const TALENT_GRIMOIRE = 39
const TALENT_TESSERACT = 57 // capped at 5 levels
const TIMMY_TALENTED = 47 // superbit: +1 LV per 100 class LVs above 500
const SUPER_DUPER_TALENTS = 7 // legend talent
const SUPER_DUPERS = 5 // zenith market
const THE_FAMILY_GUY = 144
// Symbols of Beyond (one per class family): 1 + 1 per 20 levels, read off the played character
const SYMBOLS_OF_BEYOND = [149, 374, 539]

// Royal Guardian talents only get added levels up to the Talent Reattainment armory level
const RG_TALENTS = { first: 225, last: 239 }
const TALENT_REATTAINMENT_ARMORY = 55 // +1 cap per level

function capRoyalGuardianLevels(snapshot, id, added) {
  if (id < RG_TALENTS.first || id > RG_TALENTS.last) return added
  return Math.min(added, Number(snapshot?.royalGuardian?.armory?.[TALENT_REATTAINMENT_ARMORY]) || 0)
}

// Talents that never get added levels (Toolbox utility/talentBans.js)
function isBannedFromAddedLevels(id) {
  return (id >= 49 && id <= 59) || SYMBOLS_OF_BEYOND.includes(id) || id === 505 || id > 614
}

// Added levels without the Elemental Sorcerer family bonus (the family walk needs this part)
function getAddedLevelsWithoutFamily(snapshot) {
  const character = getActiveCharacter(snapshot)
  const characterIndex = getActiveCharacterIndex(snapshot)
  const symbolLevel = Math.max(0, ...SYMBOLS_OF_BEYOND.map(id => Number(character?.talentLevels?.[id]) || 0))
  const symbols = symbolLevel > 0 ? growth('intervalAdd', symbolLevel, 1, 20) : 0
  // Arctis is the only bonus the game rounds up into talent levels
  const arctis = Math.ceil(getMinorDivinityBonus(snapshot, characterIndex, GODS.Arctis))
  const ninjaMastery = (snapshot?.sneaking?.ninjaMasteryTier ?? 0) >= NINJA_MASTERY_TALENT_TIER ? 5 : 0
  const superbit = isSuperbitUnlocked(snapshot?.gaming, TIMMY_TALENTED)
    ? Math.max(0, Math.floor(((character?.level ?? 0) - 500) / 100))
    : 0
  return arctis
    + symbols
    + (isAchievementComplete(snapshot?.achievements, LIL_BOOST_ACHIEVEMENT) ? 1 : 0)
    + getCompanionBonus(snapshot?.companions, TALENT_LEVEL_COMPANION)
    + ninjaMastery
    + getEquinoxUpgradeBonus(snapshot?.equinox, EQUINOX_UPGRADES.symbols)
    + getGrimoireBonus(snapshot?.grimoire, TALENT_GRIMOIRE)
    + getArmorSetBonus(snapshot?.armorSmithySets, 'KATTLEKRUK_SET')
    + Math.min(5, getTesseractBonus(snapshot?.tesseract, TALENT_TESSERACT))
    + superbit
}

// Added talent levels for the played character (Toolbox getTalentAddedLevels). Returns
// { value, missing } like the other partial sources; nothing is missing anymore.
export function getAddedTalentLevels(snapshot) {
  const character = getActiveCharacter(snapshot)
  const withoutFamily = getAddedLevelsWithoutFamily(snapshot)
  const familyGuyBase = Number(character?.talentLevels?.[THE_FAMILY_GUY]) || 0
  const familyGuyLevel = familyGuyBase > 0 ? familyGuyBase + withoutFamily : 0
  const family = Math.floor(getFamilyBonuses(snapshot, familyGuyLevel)['Elemental Sorcerer'] ?? 0)
  return {
    value: withoutFamily + family,
    missing: [],
  }
}

export function getSuperTalentBonus(snapshot) {
  const legend = getLegendTalentBonus(SUPER_DUPER_TALENTS, getLegendTalentLevel(snapshot?.legendTalents, SUPER_DUPER_TALENTS))
  return Math.round(50 + legend + getZenithBonus(snapshot?.zenith, SUPER_DUPERS))
}

function isSupered(character, id) {
  return (character?.superTalentPresets ?? []).some(preset => (
    (preset.superedTalents ?? []).some(talent => talent.id === id)
  ))
}

export function getAccountTalentLevel(snapshot, id) {
  const added = getAddedTalentLevels(snapshot)
  const superBonus = getSuperTalentBonus(snapshot)
  const level = Math.max(0, ...(snapshot?.characters ?? []).map(character => {
    const base = Number(character?.talentLevels?.[id]) || 0
    if (id < 100 || base <= 0 || isBannedFromAddedLevels(id)) return base
    return base + capRoyalGuardianLevels(snapshot, id, added.value) + (isSupered(character, id) ? superBonus : 0)
  }))
  return {
    value: level,
    missing: added.missing,
  }
}

// Highest level the account could put a talent at: the best character's max (book) level, plus
// added levels (Royal Guardian talents capped by Talent Reattainment) and the super talent bonus.
// For talents people only fill when they need them (e.g. Amber Hoard before Spelunking shopping).
export function getMaxPossibleTalentLevel(snapshot, id) {
  const maxBook = Math.max(0, ...(snapshot?.characters ?? []).map(character => Number(character?.talentMaxLevels?.[id]) || 0))
  if (maxBook <= 0) return { value: 0, missing: [] }
  const added = isBannedFromAddedLevels(id) ? 0 : capRoyalGuardianLevels(snapshot, id, getAddedTalentLevels(snapshot).value)
  return {
    value: maxBook + added + getSuperTalentBonus(snapshot),
    missing: [],
  }
}

// Bonus at getMaxPossibleTalentLevel. Returns { value, missing }.
export function getMaxPossibleTalentBonus(snapshot, id) {
  const stats = talentGrowthMap[id]
  const level = getMaxPossibleTalentLevel(snapshot, id)
  return {
    value: stats ? growth(stats.func, level.value, stats.x1, stats.x2) : 0,
    level: level.value,
    missing: level.missing,
  }
}

// The talent's bonus at the account level above. Returns { value, missing }.
export function getAccountTalentBonus(snapshot, id) {
  const stats = talentGrowthMap[id]
  const level = getAccountTalentLevel(snapshot, id)
  return {
    value: stats ? growth(stats.func, level.value, stats.x1, stats.x2) : 0,
    missing: level.missing,
  }
}
