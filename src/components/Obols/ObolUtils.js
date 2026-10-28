// ── Obol Utilities ────────────────────────────────────────────────────────────
// Separated from ObolBoard.jsx to avoid Vite HMR Fast Refresh conflicts.
// ObolBoard.jsx must only export React components.

// ── Roll checks ───────────────────────────────────────────────────────────────
// stoneData = the obol's reroll entry (ObolEqMAP_i / ObolEqMAPz1), the change from the obol's base
// stats. Keys seen: STR/AGI/WIS/LUK, Weapon_Power, Defence, Speed, Reach, UQ1txt/UQ1val, UQ2txt/UQ2val.
// An unrolled entry can hold every key at 0 (UQ1txt is then the number 0, not a bonus name).
// Obols only roll their own UQ bonus type (DR obols store it as %_DROP_CHANCE or %_DROP_RATE).
//
// Each mode adds a requirement to the one before it, so only one is ever active:
//   standard — a positive STR/AGI/WIS/LUK, UQ1/UQ2 or Weapon Power roll (Defence never counts)
//   minmax   — a positive UQ1/UQ2 roll
//   bis      — minmax + a positive main stat roll (family board's main stat is STR, see FAMILY_MAIN_STAT)
// Negative rolls: a negative UQ or main stat fails every mode; in bis any negative roll fails.
export const OBOL_CHECK_MODES = [
  {
    id: 'standard',
    label: 'Standard',
    description: 'Flags obols with no positive STR, AGI, WIS, LUK, Weapon Power or unique bonus roll.',
  },
  {
    id: 'minmax',
    label: 'Min/Max',
    description: 'Flags obols without a positive unique bonus roll (Drop Rate, Skill Efficiency...). Stat rolls alone aren\'t enough.',
  },
  {
    id: 'bis',
    label: 'BiS Setup',
    description: 'Min/Max, plus a positive roll on the character\'s main stat and no negative rolls at all. Family obols need a positive STR roll.',
  },
]

export const DEFAULT_OBOL_CHECK_MODE = 'standard'

// localStorage key for the picked mode (hooks/useObolCheckMode)
export const OBOL_CHECK_MODE_KEY = 'obol_check_mode'

export function isObolCheckMode(mode) {
  return OBOL_CHECK_MODES.some(m => m.id === mode)
}

// The family board has no character, so it's checked like a board whose main stat is STR (strongest
// stat, and players are active on their Royal Guardian nearly all the time). Same rules as a character.
export const FAMILY_MAIN_STAT = 'STR'

export function getFamilyMainStat() {
  return FAMILY_MAIN_STAT
}

const BASE_STATS = ['STR', 'AGI', 'WIS', 'LUK']

function rollValue(stoneData, key) {
  const val = stoneData?.[key]
  return typeof val === 'number' ? val : 0
}

// UQ values that are real bonuses (the txt key holds a bonus name)
function uqRolls(stoneData) {
  return ['UQ1', 'UQ2']
    .filter(uq => typeof stoneData?.[`${uq}txt`] === 'string')
    .map(uq => rollValue(stoneData, `${uq}val`))
}

// mainStat: 'STR' | 'AGI' | 'WIS' | 'LUK' (family board: FAMILY_MAIN_STAT). With null, BiS accepts any stat.
export function passesObolCheck(stoneData, mode = DEFAULT_OBOL_CHECK_MODE, mainStat = null) {
  if (!stoneData || typeof stoneData !== 'object') return false
  const checkMode = isObolCheckMode(mode) ? mode : DEFAULT_OBOL_CHECK_MODE
  const uqs = uqRolls(stoneData)
  const stats = BASE_STATS.map(stat => rollValue(stoneData, stat))

  // Negative rolls
  if (uqs.some(val => val < 0)) return false
  if (mainStat && rollValue(stoneData, mainStat) < 0) return false
  if (checkMode === 'bis') {
    const anyNegative = Object.entries(stoneData).some(([key, val]) =>
      key !== 'SuperFunItemDisplayType' && typeof val === 'number' && val < 0
    )
    if (anyNegative) return false
  }

  const hasUq = uqs.some(val => val > 0)
  const hasStat = stats.some(val => val > 0)

  if (checkMode === 'standard') return hasUq || hasStat || rollValue(stoneData, 'Weapon_Power') > 0
  if (!hasUq) return false
  if (checkMode === 'minmax') return true
  return mainStat ? rollValue(stoneData, mainStat) > 0 : hasStat
}

// What a roll still needs to pass the mode, for tooltip hints. Requirements already broken by a
// negative roll (UQ or main stat) aren't listed, since that roll shows in red.
// Returns [{ need: 'any' | 'uq' | 'mainStat' | 'anyStat', stat? }]
export function getObolRollNeeds(stoneData, mode = DEFAULT_OBOL_CHECK_MODE, mainStat = null) {
  const sd = stoneData && typeof stoneData === 'object' ? stoneData : {}
  const checkMode = isObolCheckMode(mode) ? mode : DEFAULT_OBOL_CHECK_MODE
  const uqs = uqRolls(sd)
  const hasUq = uqs.some(val => val > 0)
  const negativeUq = uqs.some(val => val < 0)
  const hasStat = BASE_STATS.some(stat => rollValue(sd, stat) > 0)
  const needs = []

  if (checkMode === 'standard') {
    if (!hasUq && !hasStat && !(rollValue(sd, 'Weapon_Power') > 0) && !negativeUq) needs.push({ need: 'any' })
    return needs
  }
  if (!hasUq && !negativeUq) needs.push({ need: 'uq' })
  if (checkMode === 'bis') {
    if (mainStat) {
      if (rollValue(sd, mainStat) === 0) needs.push({ need: 'mainStat', stat: mainStat })
    } else if (!hasStat) {
      needs.push({ need: 'anyStat' })
    }
  }
  return needs
}

// Equipped obols that fail the check, grouped by obol: [{ rawName, count }]
export function getFailedObols(obols = [], mode = DEFAULT_OBOL_CHECK_MODE, mainStat = null) {
  const counts = {}
  obols.forEach(({ rawName, stoneData }) => {
    if (!rawName || rawName === 'Blank') return
    if (!passesObolCheck(stoneData, mode, mainStat)) {
      counts[rawName] = (counts[rawName] ?? 0) + 1
    }
  })
  return Object.entries(counts).map(([rawName, count]) => ({ rawName, count }))
}

// Notification title, e.g. "2 obols have no bonus stat" / "2 obols fail the Min/Max check"
export function getObolNoticeTitle(count, mode = DEFAULT_OBOL_CHECK_MODE) {
  const checkMode = isObolCheckMode(mode) ? mode : DEFAULT_OBOL_CHECK_MODE
  const obols = count === 1 ? 'obol' : 'obols'
  if (checkMode === 'standard') return `${count} ${obols} ${count === 1 ? 'has' : 'have'} no bonus stat`
  const label = OBOL_CHECK_MODES.find(m => m.id === checkMode).label
  return `${count} ${obols} ${count === 1 ? 'fails' : 'fail'} the ${label} check`
}

// Every character obol slot is unlocked by this character level.
// Below it, empty slots may just be locked, so they aren't flagged.
export const ALL_OBOL_SLOTS_LEVEL = 250

// Obol problems for one character, used by the Overview notifications.
//   noBonus    — equipped obols that fail the roll check, grouped by obol: [{ rawName, count }]
//   emptySlots — number of empty slots (only counted once all slots are unlocked)
export function getObolNotices(obols = [], level = 0, mode = DEFAULT_OBOL_CHECK_MODE, mainStat = null) {
  const emptySlots = obols.filter(({ rawName }) => !rawName || rawName === 'Blank').length
  return {
    noBonus: getFailedObols(obols, mode, mainStat),
    emptySlots: level >= ALL_OBOL_SLOTS_LEVEL ? emptySlots : 0,
  }
}
