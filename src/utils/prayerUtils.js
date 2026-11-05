import { prayerMap } from '../data/prayerMap.js'
import { isSuperbitUnlocked } from './gamingUtils.js'

// Unrounded bonus and curse at an account level: x * (1 + (level - 1) / 10)
function getRawPrayerValues(prayerId, level) {
  const prayer = prayerMap[prayerId]
  if (!prayer || !level) return { bonus: 0, curse: 0 }
  const scale = 1 + (level - 1) / 10
  return {
    bonus: prayer.x1 * scale,
    curse: prayer.x2 * scale,
  }
}

// Bonus and curse of an equipped prayer at its account level (PrayOwned).
// Same formula as Toolbox getPrayerBonusAndCurse: x * (1 + (level - 1) / 10), rounded.
export function getPrayerValues(prayerId, level) {
  if (!prayerMap[prayerId] || !level) return { bonus: null, curse: null }
  const { bonus, curse } = getRawPrayerValues(prayerId, level)
  return {
    bonus: Math.round(bonus),
    curse: Math.round(curse),
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

// ── No-prayer superbits ──────────────────────────────────────────────────────
// Gaming superbits 9 No more Praying, 39 Prayers Begone, 53 Prayers Aint Meta: with NO prayer equipped,
// a character gets 1/5 of every levelled prayer's bonus per superbit and no curses (game _customBlock_prayersReal,
// Toolbox getPrayerBonusAndCurse). Only 9 or 39 switch it on; Tachion of the Titans (5) never counts.
const NO_PRAYER_SUPERBITS = [9, 39, 53]
const NO_PRAYER_EXCLUDED = 5

// Share of every prayer's bonus a character with no prayers gets (0, 0.2, 0.4 or 0.6)
export function getNoPrayerMulti(snapshot) {
  const gaming = snapshot?.gaming
  const [first, second, third] = NO_PRAYER_SUPERBITS.map(index => isSuperbitUnlocked(gaming, index))
  if (!first && !second) return 0
  return 0.2 * (first + second + third)
}

// What a prayer gives a character with this set of equipped prayer ids:
// equipped → full bonus and curse; no prayers + superbits → share of the bonus, no curse; else nothing.
export function getEffectivePrayer(snapshot, prayerIds, prayerId) {
  const level = snapshot?.worship?.prayerLevels?.[prayerId] ?? 0
  const equipped = prayerIds ?? []
  if (equipped.length === 0) {
    const multi = getNoPrayerMulti(snapshot)
    if (multi <= 0 || prayerId === NO_PRAYER_EXCLUDED || level < 0.5) return { bonus: 0, curse: 0 }
    return {
      bonus: Math.round(multi * getRawPrayerValues(prayerId, level).bonus),
      curse: 0,
    }
  }
  if (!equipped.includes(prayerId)) return { bonus: 0, curse: 0 }
  const { bonus, curse } = getPrayerValues(prayerId, level)
  return {
    bonus: bonus ?? 0,
    curse: curse ?? 0,
  }
}

export const NO_PRAYER_SUPERBIT_NAMES = {
  9: 'No More Praying',
  39: 'Prayers Begone',
  53: 'Prayers Ain\'t Meta',
}

// What emptying this character's prayer bar would change, with the no-prayer superbits:
//   gains   = levelled prayers not equipped now, at the superbit share
//   cleared = curses of the equipped prayers, which go away
//   reduced = equipped prayers dropping from full bonus to the superbit share
//   lost    = equipped prayers that give nothing without being equipped (Tachion of the Titans)
// Returns null when the superbits that switch this on (9 or 39) aren't unlocked.
export function getNoPrayerComparison(snapshot, prayerIds) {
  const multi = getNoPrayerMulti(snapshot)
  if (multi <= 0) return null
  const levels = snapshot?.worship?.prayerLevels ?? []
  const equipped = prayerIds ?? []
  const superbits = NO_PRAYER_SUPERBITS.map(index => ({
    index,
    name: NO_PRAYER_SUPERBIT_NAMES[index],
    unlocked: isSuperbitUnlocked(snapshot?.gaming, index),
  }))
  const gains = []
  const cleared = []
  const reduced = []
  const lost = []
  Object.keys(prayerMap).map(Number).forEach(id => {
    if ((levels[id] ?? 0) <= 0) return
    const none = getEffectivePrayer(snapshot, [], id)
    if (!equipped.includes(id)) {
      if (none.bonus > 0) gains.push({ id, bonus: none.bonus })
      return
    }
    const full = getPrayerValues(id, levels[id])
    cleared.push({ id, curse: full.curse })
    if (none.bonus > 0) reduced.push({ id, from: full.bonus, to: none.bonus })
    else lost.push({ id, bonus: full.bonus })
  })
  return {
    multi,
    fifths: Math.round(multi * 5),
    superbits,
    gains,
    cleared,
    reduced,
    lost,
  }
}
