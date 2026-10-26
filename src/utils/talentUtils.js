import { talentGrowthMap } from '../data'
import { growth } from './mathUtils'
import { getActiveCharacter } from './characterUtils'
import { isAchievementComplete } from './achievementUtils'
import { getCompanionBonus } from './companionUtils'
import { getGrimoireBonus } from './grimoireUtils'
import { getArmorSetBonus } from './armorSetUtils'
import { getTesseractBonus } from './tesseractUtils'
import { isSuperbitUnlocked } from './gamingUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getZenithBonus } from './zenithUtils'

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
const NINJA_MASTERY_OPTION = 232 // OptLacc: ninja mastery tier
const TALENT_GRIMOIRE = 39
const TALENT_TESSERACT = 57 // capped at 5 levels
const TIMMY_TALENTED = 47 // superbit: +1 LV per 100 class LVs above 500
const SUPER_DUPER_TALENTS = 7 // legend talent
const SUPER_DUPERS = 5 // zenith market

// Added talent levels for the played character. Not ported: Arctis (divinity), Symbols of
// Beyond, family bonus and Equinox Symbols.
export function getAddedTalentLevels(snapshot) {
  const character = getActiveCharacter(snapshot)
  const ninjaMastery = (snapshot?.ninjaMasteryTier ?? 0) >= 3 ? 5 : 0
  const superbit = isSuperbitUnlocked(snapshot?.gaming, TIMMY_TALENTED)
    ? Math.max(0, Math.floor(((character?.level ?? 0) - 500) / 100))
    : 0
  const value = (isAchievementComplete(snapshot?.achievements, LIL_BOOST_ACHIEVEMENT) ? 1 : 0)
    + getCompanionBonus(snapshot?.companions, TALENT_LEVEL_COMPANION)
    + ninjaMastery
    + getGrimoireBonus(snapshot?.grimoire, TALENT_GRIMOIRE)
    + getArmorSetBonus(snapshot?.armorSmithySets, 'KATTLEKRUK_SET')
    + Math.min(5, getTesseractBonus(snapshot?.tesseract, TALENT_TESSERACT))
    + superbit
  return {
    value,
    missing: ['Arctis (divinity)', 'Symbols of Beyond', 'Family bonus', 'Equinox Symbols'],
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
    if (id < 100 || base <= 0) return base
    return base + added.value + (isSupered(character, id) ? superBonus : 0)
  }))
  return {
    value: level,
    missing: added.missing,
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

// Best base level across characters, without added levels
export function getHighestTalentLevel(talents, id) {
  return talents?.highestBaseLevels?.[id] ?? 0
}
