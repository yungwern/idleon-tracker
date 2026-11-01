import { breedingMap, BASE_MAX_SHINY_LEVEL, PASSIVE_ORDER } from '../data/breedingMap'
import { getShinyThreshold, getShinyLevel, parseWorldCoords, getMaxShinyLevelFor, getShinyPassiveTotal } from './breedingUtils'
import { getAssumedJewelBonus } from './labUtils'
import { getCropDepotBonus, CROP_DEPOT_BONUSES } from './farmingUtils'
import { getStarSignBonus } from './starSignUtils'
import { getActiveCharacterIndex } from './characterUtils'
import { getWinnerBonusByName } from './summoningUtils'
import { getLampBonus } from './cavernUtils'

// Breeding > Shiny Planner. Shiny rate = Toolbox calcShinyLvMulti (game "Breeding:ShinySpdMulti"):
// progress per day for each shiny pet in the fence. Copies of one species add up evenly, so the fence
// earns the same total however it's split. Each level costs ~1.7x the one before (getShinyThreshold),
// and every level past 20 on any pet is +1 OverLV = +10% shiny rate. So the best fence is always the
// lowest-level species (most important bonus first), swapped out as they level. Eli runs 3 copies per species
// (same speed as 1 each, fewer species to swap), so the plan picks fence slots / 3 species.

const EMERALD_ULTHURITE = 15 // lab jewel: +% shiny rate
const SHINY_UPGRADE = 12 // Breeding[2][12] pet upgrade: +5% shiny rate per level
const SHINY_UPGRADE_PER_LEVEL = 5
const LAMP_SHINY = [0, 1] // The Lamp bonus t, i
const OVER_LEVEL_BONUS = 10 // % shiny rate per OverLV
const RE_IMPORT = 'Re-import your save'
export const SHINY_COPIES_PER_SPECIES = 3

function getPetLevels(breeding) {
  const maxLevel = getMaxShinyLevelFor(breeding)
  return Object.entries(breedingMap).map(([key, pet]) => {
    const { worldIndex, petIndex } = parseWorldCoords(pet.world)
    const counter = breeding?.shinyPetsLevels?.[worldIndex]?.[petIndex] ?? 0
    const level = getShinyLevel(breeding?.shinyPetsLevels, worldIndex, petIndex, maxLevel)
    const maxed = level >= maxLevel
    return {
      key,
      pet,
      level,
      counter,
      maxed,
      // Progress still needed for the next level (thresholds are absolute on the counter)
      remaining: maxed ? null : Math.max(0, getShinyThreshold(Math.max(level, 1) - 1) - counter),
    }
  })
}

export function getShinyOverLevels(breeding) {
  return getPetLevels(breeding).reduce((sum, { level }) => sum + Math.max(0, level - BASE_MAX_SHINY_LEVEL), 0)
}

const overLevelMulti = overLevels => 1 + (OVER_LEVEL_BONUS * overLevels) / 100

// Shiny progress per day for one shiny pet in the fence. Returns { value, missing, parts }.
export function getShinyRate(snapshot) {
  const breeding = snapshot?.breeding
  const missing = []
  const jewel = getAssumedJewelBonus(snapshot, EMERALD_ULTHURITE)
  const depot = getCropDepotBonus(snapshot, CROP_DEPOT_BONUSES.shiny)
  const starSign = getStarSignBonus(snapshot, 'Shiny_Mob_LV_spd', getActiveCharacterIndex(snapshot))
  const upgradeLevels = breeding?.petUpgradeLevels
  if (!upgradeLevels) missing.push(RE_IMPORT)
  missing.push(...jewel.missing, ...depot.missing, ...starSign.missing)

  const overLevels = getShinyOverLevels(breeding)
  const parts = {
    jewel: jewel.value,
    shinyPets: getShinyPassiveTotal(breeding, '+{%_Faster_Shiny_Mob_Lv_Up_Rate'),
    cropDepot: depot.value,
    starSign: starSign.value,
    upgrade: SHINY_UPGRADE_PER_LEVEL * (upgradeLevels?.[SHINY_UPGRADE] ?? 0),
    summoning: getWinnerBonusByName(snapshot, '<x Shiny EXP'),
    lamp: getLampBonus(snapshot, ...LAMP_SHINY),
    overLevels,
  }
  const additive = parts.jewel + parts.shinyPets + parts.cropDepot + parts.starSign + parts.upgrade
  const value = (1 + additive / 100)
    * (1 + parts.summoning / 100)
    * overLevelMulti(overLevels)
    * (1 + parts.lamp / 100)

  return {
    value,
    missing: [...new Set(missing)],
    parts,
  }
}

const passiveRank = pet => {
  const index = PASSIVE_ORDER.indexOf(pet.passive)
  return index === -1 ? PASSIVE_ORDER.length : index
}

// Lowest level first (thresholds are absolute, so a lower level is the cheaper next level), then
// Eli's bonus order (PASSIVE_ORDER, same as the Shiny Levels tab), then world and pet order
function byPriority(a, b) {
  const at = parseWorldCoords(a.pet.world)
  const bt = parseWorldCoords(b.pet.world)
  return a.level - b.level
    || passiveRank(a.pet) - passiveRank(b.pet)
    || at.worldIndex - bt.worldIndex
    || at.petIndex - bt.petIndex
}

// Days of fence time for a pet at its copy count
function daysFor(remaining, rate, copies = SHINY_COPIES_PER_SPECIES) {
  if (remaining === null || !rate || !copies) return null
  return remaining / (rate * copies)
}

// Levels gained over `days` (0.05 day steps). policy(pets) returns { key: copies } for the fence.
// The OverLV part of the rate goes up as levels come in.
function simulate(pets, rate, overLevels, days, policy) {
  const baseRate = rate / overLevelMulti(overLevels)
  const state = pets.map(p => ({ ...p }))
  const step = 0.05
  let over = overLevels
  let gained = 0
  for (let t = 0; t < days; t += step) {
    const fence = policy(state)
    const dayRate = baseRate * overLevelMulti(over)
    state.forEach(p => {
      const copies = fence[p.key] ?? 0
      if (!copies || p.maxed) return
      p.remaining -= dayRate * copies * step
      while (!p.maxed && p.remaining <= 0) {
        p.level += 1
        gained += 1
        if (p.level > BASE_MAX_SHINY_LEVEL) over += 1
        if (p.level >= p.maxLevel) {
          p.maxed = true
          break
        }
        p.remaining += getShinyThreshold(p.level - 1) - getShinyThreshold(p.level - 2)
      }
    })
  }
  return {
    levels: gained,
    overLevels: over,
  }
}

// The plan: which species to fence (SHINY_COPIES_PER_SPECIES copies each, lowest level, then bonus order),
// what to swap, and how the current fence compares over 30 days.
export function getShinyPlan(snapshot, rate) {
  const breeding = snapshot?.breeding
  const maxLevel = getMaxShinyLevelFor(breeding)
  const shinyCounts = breeding?.fenceShiny
  const pets = getPetLevels(breeding).map(p => ({
    ...p,
    maxLevel,
    copies: shinyCounts?.[p.pet.rawName] ?? 0,
  }))

  const fenced = pets.filter(p => p.copies > 0)
  const slots = fenced.reduce((sum, p) => sum + p.copies, 0)
  const candidates = pets.filter(p => !p.maxed).sort(byPriority)
  const speciesCount = Math.max(1, Math.round(slots / SHINY_COPIES_PER_SPECIES))
  const best = candidates.slice(0, speciesCount)
  const bestKeys = new Set(best.map(p => p.key))

  const fence = fenced
    .map(p => {
      const keep = !p.maxed && bestKeys.has(p.key) ? Math.min(p.copies, SHINY_COPIES_PER_SPECIES) : 0
      return {
        ...p,
        days: daysFor(p.remaining, rate),
        keep,
        remove: p.copies - keep,
      }
    })
    .sort((a, b) => b.remove - a.remove || byPriority(a, b))

  const swapIn = best
    .filter(p => p.copies < SHINY_COPIES_PER_SPECIES)
    .map(p => ({
      ...p,
      add: SHINY_COPIES_PER_SPECIES - p.copies,
      days: daysFor(p.remaining, rate),
    }))

  const batchDays = best.length ? daysFor(Math.max(...best.map(p => p.remaining)), rate) : null
  const batchOver = best.reduce((sum, p) => sum + (p.level >= BASE_MAX_SHINY_LEVEL ? 1 : 0), 0)
  const overLevels = getShinyOverLevels(breeding)

  const OUTLOOK_DAYS = 30
  const currentFence = Object.fromEntries(fenced.map(p => [p.key, p.copies]))
  const current = simulate(pets, rate, overLevels, OUTLOOK_DAYS, () => currentFence)
  const planned = simulate(pets, rate, overLevels, OUTLOOK_DAYS, state => Object.fromEntries(
    state.filter(p => !p.maxed).sort(byPriority).slice(0, speciesCount)
      .map(p => [p.key, SHINY_COPIES_PER_SPECIES])
  ))

  return {
    slots,
    speciesCount,
    fence,
    swapIn,
    swapCount: fence.reduce((sum, p) => sum + p.remove, 0) + swapIn.reduce((sum, p) => sum + p.add, 0),
    batchDays,
    overLevels,
    batchOverLevels: overLevels + batchOver,
    outlookDays: OUTLOOK_DAYS,
    current,
    planned,
    missingFence: !shinyCounts,
  }
}

export { overLevelMulti as getShinyOverLevelMulti }
