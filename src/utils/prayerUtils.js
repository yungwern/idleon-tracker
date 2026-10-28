import { prayerMap } from '../data/prayerMap.js'

// Bonus and curse of an equipped prayer at its account level (PrayOwned).
// Same formula as Toolbox getPrayerBonusAndCurse: x * (1 + (level - 1) / 10), rounded.
export function getPrayerValues(prayerId, level) {
  const prayer = prayerMap[prayerId]
  if (!prayer || !level) return { bonus: null, curse: null }
  const scale = 1 + (level - 1) / 10
  return {
    bonus: Math.round(prayer.x1 * scale),
    curse: Math.round(prayer.x2 * scale),
  }
}

// Fills the game's '{' placeholder; without a value it shows '?' so the text still reads
export function formatPrayerText(text, value) {
  return text.replace('{', value ?? '?')
}

// Utility prayers (Shiny Snitch, Tachion of the Titans) always go at the back of the row
const UTILITY_PRAYERS = [3, 5]

// Equipped prayer ids in a fixed order (by id, utility prayers last) so every character card lines up the same way
export function sortPrayers(prayerIds) {
  const isUtility = id => UTILITY_PRAYERS.includes(id)
  return [...(prayerIds ?? [])].sort((a, b) => isUtility(a) - isUtility(b) || a - b)
}
