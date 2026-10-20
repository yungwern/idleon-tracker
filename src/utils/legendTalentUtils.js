import { legendTalentMap } from '../data'

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
// $ only has a value here for Double Aint Enough (2); talents 33, 37 and 39 need
// other account data for it, so they show '?' until that's wired up.
export function formatLegendTalentText(text, index, level) {
  const bonus = getLegendTalentBonus(index, level)
  const dollar = index === 2
    ? round2(2 + bonus / 100)
    : [33, 37, 39].includes(index) ? '?' : round2(bonus)
  return text
    .replace(/\{/g, bonus.toLocaleString())
    .replace(/\}/g, round2(1 + bonus / 100))
    .replace(/\$/g, dollar)
}
