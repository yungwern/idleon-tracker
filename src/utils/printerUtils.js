import { printerBuffMap, printerMultiMap, printerHiddenMultiMap, GOLD_RELIC_FORMS, PRINTER_MULTI_SOURCES, PRINTER_CHARACTER_MULTIS, PRINTER_BASE_LIBRARY_SLOTS } from '../data/printerMap'
import { getGemShopPurchases } from './gemShopUtils'
import { getAccountTalentBonus } from './talentUtils'
import { getEventShopBonus } from './eventShopUtils'
import { isCompanionActive } from './companionUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { SKILLS, isSkillMasteryBonusUnlocked } from './skillUtils'
import { getCharmBonus } from './sneakingUtils'
import { getBallotBonus } from './voteUtils'
import { isMajorGodActive, GODS } from './divinityUtils'
import { isLabBonusOn, LAB_BONUSES } from './labUtils'
import { isInLabTube } from './mainframeUtils'

// Gem shop printer unlocks. null = the save has no gem shop data (older import)
export function getPrinterUnlocks(snapshot) {
  if (!snapshot?.gemShop) {
    return {
      secondChamber: null,
      sampleSpaces: null,
      librarySlots: null,
    }
  }
  const sampleSpaces = Number(getGemShopPurchases(snapshot.gemShop, printerBuffMap.sampleSpaces.gemIndex)) || 0
  return {
    secondChamber: Number(getGemShopPurchases(snapshot.gemShop, printerBuffMap.crystalPrinter.gemIndex)) > 0,
    sampleSpaces,
    librarySlots: PRINTER_BASE_LIBRARY_SLOTS + sampleSpaces,
  }
}

// The five in-game printer "MULTI" lines (Toolbox getPrinterMulti). Each entry: the printerMultiMap
// data plus { multi, days, perDay }. Returns [] when the save has no printer multi data (older import).
export function getPrinterMultis(snapshot) {
  const printer = snapshot?.printer
  if (printer?.orbKills === undefined) return []
  const src = PRINTER_MULTI_SOURCES
  const kingBonus = getAccountTalentBonus(snapshot, src.kingTalentId).value
  const wiringPerDay = src.supremeWiringPerDay * getEventShopBonus(snapshot.eventShop, src.supremeWiringEventShop)
  const molePerDay = isCompanionActive(snapshot.companions, src.biggoleMoleCompanion) ? 1 : 0
  const moonPerDay = printer.moonOfPrintLevel * src.moonOfPrintPerLevel
  const legendLevel = getLegendTalentLevel(snapshot.legendTalents, src.printerLegendTalent)
  const legendPerDay = getLegendTalentBonus(src.printerLegendTalent, legendLevel)

  const values = {
    kingOfTheRemembered: {
      multi: 1 + kingBonus * Math.log10(Math.max(printer.orbKills, 1)) / 100,
      perKillPower: kingBonus,
      orbKills: printer.orbKills,
    },
    supremeWiring: {
      multi: 1 + wiringPerDay * printer.eventShopDays / 100,
      perDay: wiringPerDay,
      days: printer.eventShopDays,
    },
    biggoleMole: {
      multi: 1 + molePerDay * printer.companionDays / 100,
      perDay: molePerDay,
      days: printer.companionDays,
    },
    moonOfPrint: {
      multi: 1 + moonPerDay * printer.compassDays / 100,
      perDay: moonPerDay,
      days: printer.compassDays,
    },
    yetAnotherPrinterMulti: {
      multi: 1 + legendPerDay * printer.legendTalentDays / 100,
      perDay: legendPerDay,
      days: printer.legendTalentDays,
    },
  }
  return printerMultiMap.map(entry => ({
    ...entry,
    ...values[entry.key],
  }))
}

// Skills 1-18 (Mining to Summoning) count for the printer's Skill Mastery bonus (Toolbox
// getSkillMasteryBonusByIndex(…, 3)). The game adds its base 7 even before rift 15.
const SKILL_MASTERY_SKILLS = Object.keys(SKILLS).filter(skill => SKILLS[skill] >= 1 && SKILLS[skill] <= 18)

// Printer multis that apply but aren't on the in-game screen. Same shape as getPrinterMultis;
export function getPrinterHiddenMultis(snapshot) {
  const printer = snapshot?.printer
  if (printer?.daysSinceSample === undefined) return []
  const src = PRINTER_MULTI_SOURCES
  const relicForm = GOLD_RELIC_FORMS[snapshot.sailing?.artifactForms?.[src.goldRelicArtifact] ?? 0] ?? null
  const relicDays = relicForm ? Math.min(printer.daysSinceSample, relicForm.maxDays) : 0
  const masteredSkills = SKILL_MASTERY_SKILLS
    .filter(skill => isSkillMasteryBonusUnlocked(snapshot, skill, src.skillMasteryRank)).length
  const skillMastery = src.skillMasteryBase + masteredSkills
  const lolly = getCharmBonus(snapshot.sneaking, src.lollyFlowerCharm)
  const vote = getBallotBonus(snapshot, src.voteBonus)

  const values = {
    goldRelic: {
      multi: 1 + (relicForm?.perDay ?? 0) * relicDays / 100,
      perDay: relicForm?.perDay ?? 0,
      days: printer.daysSinceSample,
      maxDays: relicForm?.maxDays ?? null,
    },
    skillMastery: {
      multi: 1 + (skillMastery + lolly) / 100,
      detail: `Skill Mastery +${skillMastery}% (${masteredSkills} / ${SKILL_MASTERY_SKILLS.length} skills) · Lolly Flower +${lolly}%`,
    },
    vote: {
      multi: 1 + vote / 100,
      detail: vote > 0 ? `Winning this week: +${Math.round(vote)}%` : 'Not winning this week',
    },
  }
  return printerHiddenMultiMap.map(entry => ({
    ...entry,
    ...values[entry.key],
  }))
}

// Product of every printer multi. Yet Another Printer Multi used to be shown but never applied;
// the game fixed that in the Nov 1 2026 update, so it counts now.
export function getPrinterTotalMulti(multis, hiddenMultis) {
  return [...multis, ...hiddenMultis]
    .reduce((product, multi) => product * multi.multi, 1)
}

// Per-character printer multis: Wired In (lab bonus, while connected) for characters in a lab tube (AFK in
// the lab or with Arctis's major bonus), and Harriep's major bonus. Returns { wiredIn, harriep, multi }.
export function getCharacterPrintMulti(snapshot, characterIndex) {
  const wiredIn = isLabBonusOn(snapshot, LAB_BONUSES.wiredIn) && isInLabTube(snapshot, characterIndex)
  const harriep = isMajorGodActive(snapshot, characterIndex, GODS.Harriep)
  return {
    wiredIn,
    harriep,
    multi: (wiredIn ? PRINTER_CHARACTER_MULTIS.wiredIn : 1) * (harriep ? PRINTER_CHARACTER_MULTIS.harriep : 1),
  }
}

// Per hour each printing item comes out at: every character's printing samples × the account
// printer multi × that character's own multis
export function getPrintedPerHour(snapshot) {
  const multi = getPrinterTotalMulti(getPrinterMultis(snapshot), getPrinterHiddenMultis(snapshot))
  const printed = {}
  ;(snapshot?.printer?.characters ?? []).forEach((character, index) => {
    const characterMulti = getCharacterPrintMulti(snapshot, index).multi
    for (const sample of character.printing ?? []) {
      if (!sample?.item || sample.item === 'Blank') continue
      printed[sample.item] = (printed[sample.item] ?? 0) + sample.value * multi * characterMulti
    }
  })
  return printed
}
