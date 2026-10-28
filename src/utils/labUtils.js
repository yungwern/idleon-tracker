// Lab (W4) mainframe bonuses, from IdleonToolbox parsers/world-4/lab.ts. Which nodes and jewels
// are connected depends on every character's position and line width, which isn't ported, so
// owned jewels and the mainframe bonuses are assumed connected (true on endgame accounts; checked
// against Toolbox on Eli's save, where every bonus and jewel is connected).

const ASSUMED = 'Lab mainframe (assumed connected)'

const JEWEL_BONUS = { 16: 16, 18: 20, 19: 10, 20: 10 } // jewel index → base bonus (shared-data jewels)
const PURE_OPAL_NAVETTE = 19 // jewel: adds its bonus / 100 to Spelunker Obol
const SPELUNKER_OBOL = 1.5 // lab bonus 8: multiplies every jewel but Pure Opal Navette

export const LAB_BONUSES = {
  certifiedStampBook: 2, // lab bonus 7: 2x combat and skill stamps
  myFirstChemistrySet: 2, // lab bonus 10: 2x vials
  slabSovereignty: 15, // lab bonus 15: +25% slab bonuses (+ Pure Opal Rhinestone)
  depotStudiesPhd: 17, // lab bonus 17: +30% crop depot bonuses (+ Pure Opal Rhombol)
}

// Mainframe bonuses given as a % (by lab bonus index): base % and the jewel that adds to it
const MAINFRAME_PERCENT = {
  15: { base: 25, jewel: 18 },
  17: { base: 30, jewel: 20 },
}

// A mainframe bonus's multiplier (pass a LAB_BONUSES value). Returns { value, missing }.
export function getAssumedLabBonus(multiplier) {
  return {
    value: multiplier,
    missing: [ASSUMED],
  }
}

function getSpelunkerObolMulti(snapshot) {
  const opal = snapshot?.labJewels?.owned?.[PURE_OPAL_NAVETTE] ? JEWEL_BONUS[PURE_OPAL_NAVETTE] : 0
  return SPELUNKER_OBOL + opal / 100
}

// Returns { value, missing } like the other partial sources
export function getAssumedJewelBonus(snapshot, index) {
  if (!snapshot?.labJewels?.owned?.[index]) return { value: 0, missing: [] }
  const multi = index === PURE_OPAL_NAVETTE ? 1 : getSpelunkerObolMulti(snapshot)
  return {
    value: (JEWEL_BONUS[index] ?? 0) * multi,
    missing: [ASSUMED],
  }
}

// A % mainframe bonus (pass LAB_BONUSES.slabSovereignty / depotStudiesPhd): base + its jewel.
// Returns { value, missing }.
export function getAssumedMainframeBonus(snapshot, index) {
  const bonus = MAINFRAME_PERCENT[index]
  if (!bonus) return { value: 0, missing: [] }
  const jewel = getAssumedJewelBonus(snapshot, bonus.jewel)
  return {
    value: bonus.base + jewel.value,
    missing: [ASSUMED],
  }
}
