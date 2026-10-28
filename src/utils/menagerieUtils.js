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
