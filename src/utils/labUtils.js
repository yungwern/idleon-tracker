// Lab (W4) mainframe bonuses, from IdleonToolbox parsers/world-4/lab.ts. Which nodes and jewels
// are connected depends on every character's position and line width, which isn't ported, so
// owned jewels and the mainframe bonuses are assumed connected (true on endgame accounts; checked
// against Toolbox on Eli's save, where every bonus and jewel is connected).

const ASSUMED = 'Lab mainframe (assumed connected)'

const JEWEL_BONUS = { 16: 16, 19: 10 } // jewel index → base bonus (shared-data jewels)
const PURE_OPAL_NAVETTE = 19 // jewel: adds its bonus / 100 to Spelunker Obol
const SPELUNKER_OBOL = 1.5 // lab bonus 8: multiplies every jewel but Pure Opal Navette

export const LAB_BONUSES = {
  certifiedStampBook: 2, // lab bonus 7: 2x combat and skill stamps
  myFirstChemistrySet: 2, // lab bonus 10: 2x vials
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
