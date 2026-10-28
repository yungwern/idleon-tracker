import { breedingMap, breedingBuffMap, BASE_MAX_SHINY_LEVEL, CRUCIBLE_WAVES } from '../data/breedingMap'
import { isMenagerieUnlockOwned } from './menagerieUtils'

// Breeding (W4) shiny pet math, from IdleonToolbox parsers/world-4/breeding.ts.
// snapshot.breeding.shinyPetsLevels[world][pet] = shiny progress counter.

// Progress needed to pass shiny level index + 1
export function getShinyThreshold(index) {
  return Math.floor((1 + Math.pow(index + 1, 1.6)) * Math.pow(1.7, index + 1))
}

// '[0][4]' → { worldIndex: 0, petIndex: 4 }
export function parseWorldCoords(worldStr) {
  const matches = [...worldStr.matchAll(/\[(\d+)\]/g)]
  return { worldIndex: parseInt(matches[0][1]), petIndex: parseInt(matches[1][1]) }
}

export function getShinyLevel(shinyPetsLevels, worldIndex, petIndex, maxShinyLevel) {
  const counter = shinyPetsLevels?.[worldIndex]?.[petIndex]
  const level = new Array(maxShinyLevel - 1).fill(1).reduce((sum, _, index) =>
    counter > getShinyThreshold(index) ? index + 2 : sum, 0)
  return counter === 0 ? 0 : level === 0 ? 1 : level
}

// Max shiny level: the base 20 plus every active buff (breedingBuffMap keys on snapshot.breeding)
export function getMaxShinyLevelFor(breeding) {
  return Object.entries(breedingBuffMap).reduce((max, [key, buff]) => (
    max + (breeding?.[key] ? buff.maxShinyBonus : 0)
  ), BASE_MAX_SHINY_LEVEL)
}

// Total of one shiny passive across every pet: round(baseValue × shiny level) each
// (Toolbox getShinyBonus). `passive` is the raw text, e.g. '+{%_Bonuses_from_All_Meals'.
export function getShinyPassiveTotal(breeding, passive) {
  const maxShinyLevel = getMaxShinyLevelFor(breeding)
  return Object.values(breedingMap).reduce((sum, pet) => {
    if (pet.passive !== passive) return sum
    const { worldIndex, petIndex } = parseWorldCoords(pet.world)
    const level = getShinyLevel(breeding?.shinyPetsLevels, worldIndex, petIndex, maxShinyLevel)
    return sum + Math.round(pet.baseValue * level)
  }, 0)
}

// ── Pet Arena Crucible ────────────────────────────────────────────────────────
const CRUCIBLE_UNLOCK = 8 // Menagerie unlock that opens the Crucible

// Crucible bonuses earned: how many CRUCIBLE_WAVES the best wave (snapshot.crucibleBestWave) has passed
export function getCrucibleBonusCount(snapshot) {
  if (!isMenagerieUnlockOwned(snapshot?.menagerie, CRUCIBLE_UNLOCK)) return 0
  const best = snapshot?.crucibleBestWave ?? 0
  const index = CRUCIBLE_WAVES.findIndex(wave => best < wave)
  return index === -1 ? CRUCIBLE_WAVES.length : index
}

// Crucible bonus i: 1 once earned, else 0 (game: Breeding PetArenaCrucBonus)
export function getCrucibleBonus(snapshot, index) {
  return getCrucibleBonusCount(snapshot) > index ? 1 : 0
}
