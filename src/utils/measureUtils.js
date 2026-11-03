import { holeMeasurements, holeMajiks } from '../data'
import { SKILLS } from './skillUtils'
import { getDeathNotePoints } from './deathNoteUtils'

// Hole Measurer measurements (W5), from IdleonToolbox parsers/world-5/hole.ts. Kept apart from holeUtils so
// cavernUtils (Gambit points use measurement 13) can read them without a circular import.

const LENGTHMEISTER = 3 // villager majik: all measurements }x (floor(x0 × LV))
const log10 = value => Math.log(Math.max(value, 1)) / 2.30259 // game lavaLog

// Base bonus before the IdleOn stat multi (Toolbox getMeasurementBaseBonus)
export function getMeasurementBaseBonus(snapshot, t) {
  const level = snapshot?.caverns?.measurementLevels?.[t] ?? 0
  const measure = holeMeasurements[t]
  if (!measure) return 0
  const majikLevel = Number(snapshot?.caverns?.villageMajiks?.[LENGTHMEISTER]) || 0
  const lengthmeister = 1 + Math.floor((holeMajiks[1]?.[LENGTHMEISTER]?.x0 ?? 0) * majikLevel) / 100
  const raw = measure.tot ? measure.value * level / (100 + level) : measure.value * level
  return lengthmeister * raw
}

function getAccountLevel(snapshot) {
  return (snapshot?.characters ?? []).reduce((sum, character) => sum + (Number(character?.level) || 0), 0)
}

// Sum of every skill LV on every character (Tome "Account Skills LV")
function getAccountSkillLevels(snapshot) {
  const skillIndexes = Object.values(SKILLS)
  return (snapshot?.characters ?? []).reduce((sum, character) =>
    sum + skillIndexes.reduce((s, index) => s + Math.max(0, Number(character?.skillLevels?.[index]) || 0), 0), 0)
}

// The IdleOn stat each measurement scales with (Toolbox getMeasurementQuantityFound): value = the stat,
// found(value) = the game's "found" number that sets the multi. value null = can't be read.
const MEASURE_STATS = {
  0: { label: 'Gloomie Kills', value: s => s?.caverns?.extra?.[28] ?? 0, found: v => log10(v) },
  1: { label: 'Crops Found', value: s => s?.farming?.cropsFound ?? 0, found: v => v / 14 },
  2: { label: 'Account LV', value: getAccountLevel, found: v => v / 500 },
  3: { label: 'Tome Score', value: (s, tomePoints) => (Number(tomePoints) > 0 ? Number(tomePoints) : null), found: v => v / 2500 },
  4: { label: 'All Skill LV', value: getAccountSkillLevels, found: v => v / 5e3 + Math.max(0, v - 18e3) / 1500 },
  5: { label: 'Nothing yet', value: () => 0, found: () => 0 },
  6: { label: 'Death Note Pts', value: getDeathNotePoints, found: v => v / 125 },
  7: { label: 'Highest DMG', value: s => s?.highestDamage ?? 0, found: v => log10(v) / 2 },
  8: { label: 'Slab Items', value: s => s?.lootedItemCount ?? 0, found: v => v / 150 },
  9: { label: 'Studies Done', value: s => (s?.caverns?.studyLevels ?? []).reduce((sum, n) => sum + (Number(n) || 0), 0), found: v => v / 6 },
  10: { label: 'Golem Kills', value: s => s?.caverns?.extra?.[63] ?? 0, found: v => Math.max(0, log10(v) - 2) },
}

// game: measurement multi from the stat's found number (Toolbox getMeasurementMulti)
function getMeasureMulti(found) {
  return found < 5 ? 1 + (18 * found) / 100 : 1 + (18 * found + 8 * (found - 5)) / 100
}

// { label, value, multi } for one measurement stat; value / multi null when the stat can't be read
export function getMeasurementStat(snapshot, stat, tomePoints) {
  const source = MEASURE_STATS[stat]
  if (!source) return { label: 'Unknown', value: null, multi: null }
  const value = source.value(snapshot, tomePoints)
  return {
    label: source.label,
    value,
    multi: value == null ? null : getMeasureMulti(source.found(value)),
  }
}

// Measurement t's full bonus (Toolbox getMeasurementBonus): base × stat multi; base alone when the stat is unknown
export function getMeasurementTotal(snapshot, t, tomePoints) {
  const stat = getMeasurementStat(snapshot, holeMeasurements[t]?.stat, tomePoints)
  return getMeasurementBaseBonus(snapshot, t) * (stat.multi ?? 1)
}
