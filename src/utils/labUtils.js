import { labBonusMap, labJewelMap } from '../data'
import { getMainframeConnections } from './mainframeUtils'

// Lab (W4) mainframe bonuses and jewels, from IdleonToolbox parsers/world-4/lab.ts. On/off comes from
// mainframeUtils getMainframeConnections (prism chain + connection ranges). While that is being worked
// out (it reads meals, which read the Black Diamond Rhinestone jewel) it returns null, and owned jewels /
// every bonus count as on, which is also the old "assumed connected" behaviour.

const PURE_OPAL_NAVETTE = 19 // jewel: adds its bonus / 100 to Spelunker Obol
const SPELUNKER_OBOL = 8 // bonus: multiplies every jewel but Pure Opal Navette

// Mainframe bonus indexes (labBonusMap) other systems read
export const LAB_BONUSES = {
  wiredIn: 1, // 2x printing for uploaded players
  gildedCyclicalTubing: 2, // 3x refinery cycle speed
  shrineWorldTour: 5, // a shrine in town counts on every map of its world
  certifiedStampBook: 7, // 2x combat and skill stamps
  myFirstChemistrySet: 10, // 2x vials
  slabSovereignty: 15, // +25% slab bonuses (+ Pure Opal Rhinestone)
  depotStudiesPhd: 17, // +30% crop depot bonuses (+ Pure Opal Rhombol)
}

// Bonuses given as a %: base (bonusOn) + the jewel that adds to it (game MainframeBonus(100 + jewel))
const MAINFRAME_JEWEL_BOOST = {
  15: 18,
  17: 20,
}

// Game MainframeBonus(100 + n) doubles these jewels while every partner jewel is active
const JEWEL_SET_PARTNERS = {
  0: [1, 2],
  3: [4, 5, 6],
  10: [7, 8, 9],
  12: [11, 13, 14, 15],
}

export function isLabBonusOn(snapshot, index) {
  const connections = getMainframeConnections(snapshot)
  return connections ? !!connections.bonuses[index] : true
}

export function isLabJewelOn(snapshot, index) {
  const connections = getMainframeConnections(snapshot)
  if (connections) return !!connections.jewels[index]
  return !!snapshot?.labJewels?.owned?.[index]
}

function getSpelunkerObolMulti(snapshot) {
  if (!isLabBonusOn(snapshot, SPELUNKER_OBOL)) return labBonusMap[SPELUNKER_OBOL].bonusOff
  const opal = isLabJewelOn(snapshot, PURE_OPAL_NAVETTE) ? labJewelMap[PURE_OPAL_NAVETTE].bonus : 0
  return labBonusMap[SPELUNKER_OBOL].bonusOn + opal / 100
}

export function getSpelunkerObolMultiplier(snapshot) {
  return getSpelunkerObolMulti(snapshot)
}

// A jewel's bonus as if it were on: × Spelunker Obol (not Pure Opal Navette), doubled while its whole
// colour set is on (Mainframe tab shows this for every jewel)
export function getLabJewelValue(snapshot, jewel) {
  const multi = jewel.index === PURE_OPAL_NAVETTE ? 1 : getSpelunkerObolMulti(snapshot)
  const partners = JEWEL_SET_PARTNERS[jewel.index] ?? []
  const setComplete = partners.length > 0 && isLabJewelOn(snapshot, jewel.index)
    && partners.every(partner => isLabJewelOn(snapshot, partner))
  return jewel.bonus * multi * (setComplete ? 2 : 1)
}

// A jewel's bonus, 0 while it's off. Returns { value, missing } like the other partial sources.
export function getLabJewelBonus(snapshot, index) {
  const jewel = labJewelMap[index]
  if (!jewel || !isLabJewelOn(snapshot, index)) return { value: 0, missing: [] }
  return {
    value: getLabJewelValue(snapshot, jewel),
    missing: [],
  }
}

// A mainframe bonus (pass a LAB_BONUSES value): bonusOn while connected, else bonusOff, plus its jewel
// for the % bonuses (Slab Sovereignty, Depot Studies). Returns { value, missing }.
export function getLabBonus(snapshot, index) {
  const bonus = labBonusMap[index]
  if (!bonus) return { value: 0, missing: [] }
  if (!isLabBonusOn(snapshot, index)) return { value: bonus.bonusOff, missing: [] }
  const jewel = MAINFRAME_JEWEL_BOOST[index] === undefined ? 0 : getLabJewelBonus(snapshot, MAINFRAME_JEWEL_BOOST[index]).value
  return {
    value: bonus.bonusOn + jewel,
    missing: [],
  }
}

// Jewel effect text with its value: '1.}x' → '1.75x', '}' → the value
export function formatLabJewelEffect(jewel, value) {
  const rounded = Math.round(value * 100) / 100
  if (jewel.effect.includes('1.}')) return jewel.effect.replace(/1\.}/g, `${(1 + value / 100).toFixed(2)}`)
  return jewel.effect.replace(/}/g, rounded.toLocaleString())
}
