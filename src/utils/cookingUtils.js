import { mealMap } from '../data/mealMap'
import { getShinyPassiveTotal } from './breedingUtils'

// ── Ribbons ───────────────────────────────────────────────────────────────────
// Highest ribbon rank in the game (CookingR('RibbonsMaxLV'))
export const RIBBON_MAX_RANK = 25

// Base meal multiplier for a ribbon rank, from the game's RibbonBonus formula
// (Toolbox parsers/world-4/cooking.ts → getRibbonBonus). Leaves out the account
// bonuses that also scale it (Emperor set, Equinox cloud, jelly), so this is the
// value every account shares.
export const ribbonMulti = (rank) => {
  const r = rank ?? 0
  return 1 + Math.floor(5 * r + Math.floor(r / 2) * (4 + 6.5 * Math.floor(r / 5))) / 100
}

// CSS color class for a ribbon rank's number (styles in Cooking.css)
export const ribbonTierClass = (rank) => {
  if (rank <= 4) return 'ribbon-white'
  if (rank <= 9) return 'ribbon-bronze'
  if (rank <= 14) return 'ribbon-silver'
  if (rank <= 19) return 'ribbon-gold'
  if (rank <= 24) return 'ribbon-diamond'
  return 'ribbon-prismatic'
}

// ── Cooking Mastery ───────────────────────────────────────────────────────────
// Meal bonus multiplier from a meal's yellow Mastery node (game: BonusMultiCook).
// Caps toward 2x, so early points are worth far more than late ones.
export const masteryNodeMulti = (level) => {
  const l = level ?? 0
  return 1 + l / (l + 5)
}

// ── Meal Bonuses ──────────────────────────────────────────────────────────────
// A meal's bonus as the game applies it (Toolbox getMealBonus):
// level × baseStat × (1 + (jewel + shiny pets) / 100) × winner bonus × companion × ribbon × mastery node.
// `snapshot` is the whole save snapshot. Returns { value, missing }.
const MEAL_SHINY_PASSIVE = '+{%_Bonuses_from_All_Meals'

export function getMealBonus(snapshot, index) {
  const meal = mealMap[index]
  const cooking = snapshot?.cooking
  const level = cooking?.mealLevels?.[index] ?? 0
  const base = level * (meal?.baseStat ?? 0)
  if (!base) return { value: 0, missing: [] }
  const shiny = getShinyPassiveTotal(snapshot?.breeding, MEAL_SHINY_PASSIVE)
  const ribbon = ribbonMulti(cooking?.mealRibbons?.[index] ?? 0)
  const node = masteryNodeMulti(cooking?.masteryNodes?.[index] ?? 0)
  return {
    value: base * (1 + shiny / 100) * ribbon * node,
    missing: [
      'Black Diamond Rhinestone (lab jewel)',
      'Summoning winner bonus',
      'Wickerlight Spirit (companion)',
      'Ribbon: Emperor set, Equinox cloud, Jelly Operator',
    ],
  }
}

// Sum of every meal with the given stat (e.g. 'zCropEvo')
export function getMealBonusByStat(snapshot, stat) {
  return mealMap.reduce((total, meal, index) => {
    if (meal.stat !== stat) return total
    const { value, missing } = getMealBonus(snapshot, index)
    return {
      value: total.value + value,
      missing: [...new Set([...total.missing, ...missing])],
    }
  }, { value: 0, missing: [] })
}
