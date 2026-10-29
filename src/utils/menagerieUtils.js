import { menagerieBoostPerLevel } from '../data'

// Luminous Menagerie (W7), from IdleonToolbox parsers/world-7/menagerie.ts.
// snapshot.menagerie: unlocks[i] (owned), boostLevels[i].

export function isMenagerieUnlockOwned(menagerie, index) {
  return Boolean(menagerie?.unlocks?.[index])
}

// Boost i as a % (game: MenagerieStuff BoostQTY)
export function getMenagerieBoost(menagerie, index) {
  return (menagerieBoostPerLevel[index] ?? 0) * (menagerie?.boostLevels?.[index] ?? 0)
}

// Silver Jellyfish obol MISC multi (game: MenagerieStuff ObolMISCmulti = 1 + LV / 100). In game it
// "multiplies the MISC bonuses of all obols" = their UQ1/UQ2 unique bonuses (ObolUtils getObolBoardStats).
// missing: the snapshot predates obolMiscLevel, so re-importing the save is needed.
export function getObolMiscMulti(menagerie) {
  const level = menagerie?.obolMiscLevel
  return {
    value: 1 + (Number(level) || 0) / 100,
    level: Number(level) || 0,
    missing: level === undefined,
  }
}
