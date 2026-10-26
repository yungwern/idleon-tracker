import { starSignMap } from '../data'
import { isRiftBonusUnlocked } from './riftUtils'
import { getShinyPassiveTotal } from './breedingUtils'
import { getTesseractBonus } from './tesseractUtils'
import { getSkillLevel } from './skillUtils'
import { isMeritocracyBonusSelected } from './voteUtils'

// Star sign bonuses, from IdleonToolbox parsers/starSigns.ts getStarSignBonus.
// Counted for a character: its equipped signs plus every unlocked sign within Infinite Stars.

const SILKRODE_NANOCHIP = 'ConsoleChip15'
const ASTROLOGY_CULTISM = 40 // tesseract: raises Seraph Cosmos' 1.10x base
const SERAPH_MERITOCRACY = 22

// Infinite Stars (rift): 5 + shiny pet passives, once unlocked
export function getInfiniteStarsCount(snapshot) {
  if (!isRiftBonusUnlocked(snapshot?.rift, 'infiniteStars')) return 0
  return 5 + getShinyPassiveTotal(snapshot?.breeding, '+{_Infinite_Star_Signs')
}

// Total of every counted star sign bonus whose effect matches `effect` (e.g. 'Crop_Evo')
// for the character at `characterIndex`. Returns { value, missing }.
export function getStarSignBonus(snapshot, effect, characterIndex) {
  const character = snapshot?.characters?.[characterIndex]
  const unlocked = new Set(snapshot?.starSigns?.unlocked ?? [])
  const equipped = new Set(character?.starSigns ?? [])
  const infiniteStars = getInfiniteStarsCount(snapshot)
  const hasChip = (snapshot?.labChips?.characters?.[characterIndex] ?? []).includes(SILKRODE_NANOCHIP)
  const query = effect.toLowerCase()

  let total = 0
  starSignMap.forEach((sign, index) => {
    const isInfinite = index < infiniteStars && unlocked.has(sign.name)
    if (!equipped.has(index) && !isInfinite) return
    sign.bonuses.forEach(({ effect: signEffect, bonus }) => {
      if (!signEffect.toLowerCase().includes(query) || (isInfinite && bonus < 0)) return
      total += bonus
    })
  })

  if (hasChip && infiniteStars < 1 && total > 0) total *= 2
  const missing = []
  if (unlocked.has('Seraph_Cosmos') && total > 0) {
    const summoningLevel = getSkillLevel(character, 'summoning')
    const chipMulti = hasChip && infiniteStars >= 1 ? 2 : 1
    const astrology = Math.min(getTesseractBonus(snapshot?.tesseract, ASTROLOGY_CULTISM), 10)
    const seraph = Math.min(5, Math.pow(1.1 + astrology / 100, Math.ceil((summoningLevel + 1) / 20)))
    if (isMeritocracyBonusSelected(snapshot?.voteBallot, SERAPH_MERITOCRACY)) missing.push('Meritocracy')
    total *= chipMulti * seraph
  }
  return { value: total, missing }
}
