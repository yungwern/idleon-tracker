import {
  legendTalentMap,
  LEGEND_TALENT_ORDER,
  LEGEND_TALENT_ROWS,
  LEGEND_TALENT_MAX_LEVEL_GROUPS,
} from '../data'
import { isMenagerieUnlockOwned } from './menagerieUtils'
import { getClamWorkBonus } from './clamWorkUtils'
import { getCompanionBonus } from './companionUtils'
import { getGemShopPurchases } from './gemShopUtils'
import { getArtifactBonus } from './sailingUtils'
import { getEventShopBonus } from './eventShopUtils'
import { getSushiBonus } from './sushiUtils'

// Legend talent math, ported from IdleonToolbox parsers/world-7/legendTalents.ts.
// `legendTalents` is snapshot.legendTalents: levels by talent index (Spelunk[18]).

export function getLegendTalentLevel(legendTalents, index) {
  return legendTalents?.[index] ?? 0
}

// Game: "LegendPTS_bonus" = round(perLevel × level)
export function getLegendTalentBonus(index, level) {
  const talent = legendTalentMap[index]
  return talent ? Math.round(talent.perLevel * level) : 0
}

// For "}x" talents: 1 + bonus / 100
export function getLegendTalentMulti(index, level) {
  return 1 + getLegendTalentBonus(index, level) / 100
}

const round2 = value => Math.round(value * 100) / 100

// Fills the { } $ placeholders in a talent's bonus or description text.
// $ only has a value here for Double Aint Enough (2); talents 33, 37 and 39 need other account data,
// so they show '?' unless the caller passes it in as `dollar` (the Legend Talents page passes all three:
// see getLegendTalentDollars). dollar = null drops the sentence holding the $ (no save to fill it from).
export function formatLegendTalentText(text, index, level, dollar) {
  const bonus = getLegendTalentBonus(index, level)
  const dollarValue = typeof dollar === 'number' ? round2(dollar) : dollar ?? (index === 2
    ? round2(2 + bonus / 100)
    : [33, 37, 39].includes(index) ? '?' : round2(bonus))
  const filled = dollar === null
    ? text.replace(/[^.!?]*\$[^.!?]*[.!?]?\s*/g, '').trim()
    : text
  return filled
    .replace(/\{/g, bonus.toLocaleString())
    .replace(/\}/g, round2(1 + bonus / 100))
    .replace(/\$/g, dollarValue)
}

// Max LV (game: "Thingies:LegendTalent_MaxLV") = base + Fever grid square LV + Menagerie unlock 19 (+3).
// fever / menagerie are null when that source can't raise this talent.
export function getLegendTalentMaxLevel(snapshot, index) {
  const base = legendTalentMap[index]?.maxLevel ?? 0
  const feverGroup = LEGEND_TALENT_MAX_LEVEL_GROUPS.find(group => group.gridSquare != null && group.talents.includes(index))
  const menagerieGroup = LEGEND_TALENT_MAX_LEVEL_GROUPS.find(group => group.menagerieUnlock != null && group.talents.includes(index))
  const fever = feverGroup
    ? {
      color: feverGroup.color,
      level: Number(snapshot?.research?.gridLevels?.[feverGroup.gridSquare]) || 0,
    }
    : null
  const menagerie = menagerieGroup
    ? {
      owned: isMenagerieUnlockOwned(snapshot?.menagerie, menagerieGroup.menagerieUnlock),
      bonus: menagerieGroup.bonus,
    }
    : null
  return {
    value: base + (fever?.level ?? 0) + (menagerie?.owned ? menagerie.bonus : 0),
    base,
    fever,
    menagerie,
  }
}

// Points spent = sum of every talent's LV
export function getLegendPointsSpent(legendTalents) {
  return Math.round((legendTalents ?? []).reduce((sum, level) => sum + (Number(level) || 0), 0))
}

const POINTS_COMPANION = 37 // "{10 Legend Talent PTS"
const POINTS_GEM_SHOP = 42
const POINTS_EVENT_SHOP = 32
const POINTS_SUSHI = 19

// Points earned: 1 per character per 100 class LVs past 400, plus account sources.
// breakdown only lists sources that give something.
export function getLegendPointsOwned(snapshot) {
  const levels = (snapshot?.characters ?? [])
    .reduce((sum, character) => sum + Math.max(0, Math.floor(((Number(character?.level) || 0) - 400) / 100)), 0)
  const sources = [
    { label: 'Class LVs (1 per 100 past LV 400, per character)', value: levels },
    { label: 'Clam Work', value: getClamWorkBonus(snapshot, 1) + getClamWorkBonus(snapshot, 4) },
    { label: 'Companion', value: 10 * getCompanionBonus(snapshot?.companions, POINTS_COMPANION) },
    { label: 'Gem Shop', value: getGemShopPurchases(snapshot?.gemShop, POINTS_GEM_SHOP) },
    { label: 'Obsidian artifact', value: Math.min(6, Math.round(getArtifactBonus(snapshot?.sailing, 'Obsidian'))) },
    { label: 'Event Shop', value: 2 * getEventShopBonus(snapshot?.eventShop, POINTS_EVENT_SHOP) },
    { label: 'Sushi Station', value: getSushiBonus(snapshot?.sushi, POINTS_SUSHI) },
  ]
  return {
    value: Math.round(sources.reduce((sum, source) => sum + source.value, 0)),
    breakdown: sources.filter(source => source.value > 0),
  }
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

// Every talent in in-game grid order, ready to show. dollars = { talentIndex: value } for the $ placeholders
// that need other account data (getLegendTalentDollars in the page). snapshot can be null (no save):
// levels are 0, max LV is the base, and texts show the bonus at base max LV.
export function getLegendTalentList(snapshot, dollars = {}) {
  return LEGEND_TALENT_ORDER.map((index, position) => {
    const talent = legendTalentMap[index]
    const level = getLegendTalentLevel(snapshot?.legendTalents, index)
    const maxLevel = getLegendTalentMaxLevel(snapshot, index)
    const textLevel = snapshot ? level : maxLevel.value
    const row = Math.floor(position / 10)
    return {
      index,
      position,
      name: talent.name,
      img: talent.img,
      row: LEGEND_TALENT_ROWS[row],
      spot: position % 10 + 1,
      numeral: ROMAN[position % 10],
      level,
      maxLevel,
      bonus: formatLegendTalentText(talent.bonus, index, textLevel, dollars[index]),
      description: formatLegendTalentText(talent.description, index, textLevel, dollars[index]),
    }
  })
}
