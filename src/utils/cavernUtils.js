import { lampBonuses, monumentBases, holeMajikBonuses, fountainBonusPerLevel, glunkoUpgradeValues } from '../data'
import { getZenithBonus } from './zenithUtils'
import { getTesseractBonus } from './tesseractUtils'
import { getEventShopBonus } from './eventShopUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getMeasurementTotal } from './measureUtils'

// Caverns (W5 Hole) bonuses, from IdleonToolbox parsers/world-5/caverns
// (the-lamp.ts, bravery.ts, the-fountain.ts). snapshot.caverns holds the Holes save data.

const LAMP_BOOST = 2 // zenith market
const MONUMENTAL_VIBES = 0 // hole majik (cosmo) upgrade
const MONUMENT_MULTI = 9 // the monument bonus that boosts its own monument
const FOUNTAIN_MONUMENT_BOOST = 13 // fountain upgrade per water type

// The Lamp: lampBonuses[t][i] × wishes used on wish min(11, 4 + 2t), × Lamp Boost (zenith)
export function getLampBonus(snapshot, t, i) {
  const wishes = snapshot?.caverns?.wishesUsed?.[Math.min(11, Math.round(4 + 2 * t))] ?? 0
  return (lampBonuses[t]?.[i] ?? 0) * wishes * (1 + getZenithBonus(snapshot?.zenith, LAMP_BOOST) / 100)
}

// Infinite Resources wish (7): +25% Well and Harp resources per use (Toolbox getLampBonus t = 99)
const LAMP_RESOURCE_WISH = 7
const LAMP_RESOURCE_PER_USE = 25

export function getLampResourceBonus(snapshot) {
  const uses = Number(snapshot?.caverns?.wishesUsed?.[LAMP_RESOURCE_WISH]) || 0
  return LAMP_RESOURCE_PER_USE * uses * (1 + getZenithBonus(snapshot?.zenith, LAMP_BOOST) / 100)
}

// Fountain upgrade i of water type t (Toolbox getFountainBonusTotal)
export function getFountainBonus(caverns, t, i) {
  const level = caverns?.fountainLevels?.[t]?.[i] ?? 0
  const marble = caverns?.fountainMarbles?.[t]?.[i] ?? 0
  const marbleMulti = marble === 0 ? 1 : 1.5 + 0.5 * marble
  return Math.round(level * (fountainBonusPerLevel[t]?.[i] ?? 0) * marbleMulti)
}

// Monuments 0-2 (Bravery, Justice, Wisdom) are boosted by their fountain upgrade
export function applyMonumentFountain(base, caverns, t) {
  const withFountain = t <= 2 ? base * (1 + getFountainBonus(caverns, t, FOUNTAIN_MONUMENT_BOOST) / 100) : base
  return Math.max(1, withFountain)
}

export function getMonumentMultiplier(caverns, t) {
  const cosmo = Math.floor((holeMajikBonuses[MONUMENTAL_VIBES] ?? 0) * (caverns?.holeMajiks?.[MONUMENTAL_VIBES] ?? 0))
  const base = 1 + getMonumentBonus({ caverns }, t, MONUMENT_MULTI) / 100 + cosmo / 100
  return applyMonumentFountain(base, caverns, t)
}

// Monument bonus 10t + i (t: 0 Bravery, 1 Justice, 2 Wisdom)
export function getMonumentBonus(snapshot, t, i) {
  const caverns = snapshot?.caverns
  const multi = i === MONUMENT_MULTI
    ? applyMonumentFountain(1, caverns, t)
    : getMonumentMultiplier(caverns, t)
  const base = monumentBases[Math.round(10 * t + i)] ?? 0
  const level = caverns?.braveryBonuses?.[Math.round(10 * t + i)] ?? 0
  if (base < 30) return level * base * multi
  return 0.1 * Math.ceil((level / (250 + level)) * 10 * base * multi)
}

// Crystal Glunko Cove upgrade t: level × value (Toolbox getCglunkoBonus)
export function getGlunkoBonus(snapshot, t) {
  return (snapshot?.glunko?.upgradeLevels?.[t] ?? 0) * (glunkoUpgradeValues[t] ?? 0)
}

// ── The Gambit: summoning doublers ──
// From Toolbox parsers/world-5/caverns/gambit.ts. Points come from the best time on each of the 6 trials,
// times a points multi; the first gambit bonus is the doubler count, plus 10 from event shop 15.
// The multi includes Measurement 13 (Gambit Points, scaled by Death Note points: measureUtils).
const GAMBIT_STUDY = 13
const GAMBIT_MEASUREMENT = 13
const GAMBIT_STUDY_PER_LEVEL = 5
const GAMBIT_SCHEMATIC = 78
const GAMBIT_SCHEMATIC_BONUS = 10
const GAMBIT_JARS = [23, 30] // +1% gambit points per level each (holesInfo[67])
const JAR_LEGEND_TALENT = 29
const GAMBIT_TESSERACT = 47
const GAMBIT_MONUMENT_T = 2
const GAMBIT_MONUMENT_I = 7
const EVENT_SHOP_DOUBLERS = 15
const EVENT_SHOP_DOUBLER_COUNT = 10
const GAME_LN10 = 2.30259

function gameLog10(value) {
  return Math.log(Math.max(value, 1)) / GAME_LN10
}

export function getGambitPointsMulti(snapshot) {
  const caverns = snapshot?.caverns
  const jarMulti = 1 + getLegendTalentBonus(JAR_LEGEND_TALENT, getLegendTalentLevel(snapshot?.legendTalents, JAR_LEGEND_TALENT)) / 100
  const jars = GAMBIT_JARS.reduce((sum, i) => sum + (Number(caverns?.jarLevels?.[i]) || 0) * jarMulti, 0)
  const study = (Number(caverns?.studyLevels?.[GAMBIT_STUDY]) || 0) * GAMBIT_STUDY_PER_LEVEL
  const schematic = Number(caverns?.schematics?.[GAMBIT_SCHEMATIC]) ? GAMBIT_SCHEMATIC_BONUS : 0
  return 1 + (getMeasurementTotal(snapshot, GAMBIT_MEASUREMENT)
    + study
    + schematic
    + getMonumentBonus(snapshot, GAMBIT_MONUMENT_T, GAMBIT_MONUMENT_I)
    + jars
    + getTesseractBonus(snapshot?.tesseract, GAMBIT_TESSERACT)) / 100
}

// Base points of one trial's best time (seconds): +3 per 10 s and +10 per minute survived, × 100 (King's Gambit) or 200
export function getGambitTrialPoints(time, t) {
  const score = time + 3 * Math.floor(time / 10) + 10 * Math.floor(time / 60)
  return (t === 0 ? 100 : 200) * score
}

// "Base Points from Survival Time" on the in-game screen
export function getGambitBasePoints(snapshot) {
  const times = snapshot?.caverns?.gambitTimes ?? []
  return times.reduce((sum, time, t) => sum + getGambitTrialPoints(time, t), 0)
}

export function getGambitPoints(snapshot) {
  return getGambitBasePoints(snapshot) * getGambitPointsMulti(snapshot)
}

// { total, placed, placedIds }: placedIds = summoning upgrade indexes holding a doubler
export function getSummoningDoublers(snapshot) {
  const points = getGambitPoints(snapshot)
  const fromPoints = points < 3000
    ? 0
    : Math.max(1, Math.ceil(Math.log2(Math.max(points, 1)) - 8 + (gameLog10(points) - 1)))
  const placedIds = (snapshot?.caverns?.gambitDoublers ?? []).filter(id => id >= 0)
  const total = fromPoints + EVENT_SHOP_DOUBLER_COUNT * getEventShopBonus(snapshot?.eventShop, EVENT_SHOP_DOUBLERS)
  return {
    total: Math.max(total, placedIds.length),
    placed: placedIds.length,
    placedIds,
  }
}
