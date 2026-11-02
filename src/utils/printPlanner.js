import { SKILL_MAIN_STATS, SKILL_SPECIALISTS, VMAN_CLASS, VMAN_ITEM } from '../data/refineryMap'
import { CLASS_TALENT_TABS } from '../data/classes'
import { getRefineryPrintList } from './refineryUtils'
import { getPrinterUnlocks, getPrinterMultis, getPrinterHiddenMultis, getPrinterTotalMulti, getCharacterPrintMulti } from './printerUtils'
import { getClassMainStat } from './characterUtils'

// Printer > Salt Materials: fewest characters that keep the refinery's printable inputs printed, so
// everyone else is free for other prints (Copper Ore for atoms, which also covers Redox Salts' copper). Planner rules:
// - An item needs printing when, with nobody printing it, storage runs out within the chosen window.
// - Slots per item: 1 when the best sample anyone has covers the need, more when it doesn't (the
//   printer multis are huge, so 1 almost always does). An item nobody has sampled assumes 1 slot.
// - The Vman (Voidwalker) always prints Spore Caps (Eli: best at them from portal runs), needed or not.
// - Fewest characters first: ceil(slots / chambers per character). Every set of that many characters
//   is tried, and each set's chambers are filled by an exact best assignment (Hungarian algorithm).
// - Assignment score, in order: class (getPlacementScore: the skill's specialist line, then a non-warrior,
//   because warriors are kept free for Copper Ore / atoms; a warrior only takes a non-mining print
//   when nobody else can), then keeping what's already printing (or already in the library).
//   Wrong-class prints are moved even when they already cover the need (Eli: the tab shows the optimal setup).

// Storage windows the tab offers (hours); Infinity = print every material the refinery uses
export const PRINT_PLAN_WINDOWS = [
  { hours: 24, label: '1 day' },
  { hours: 24 * 7, label: '7 days' },
  { hours: 24 * 30, label: '30 days' },
  { hours: Infinity, label: 'Print everything' },
]

const isBlank = sample => !sample?.item || sample.item === 'Blank'

function getLibrary(printer) {
  return [...(printer?.library ?? []), ...(printer?.extraLibrary ?? [])].filter(sample => !isBlank(sample))
}

// 2 = specialist (class line has the skill's own talents), 1 = main stat matches (or a monster drop,
// which any class kills), 0 = wrong class for the skill
export function getClassFit(className, skill) {
  if (SKILL_MAIN_STATS[skill] === null) return 1
  if ((CLASS_TALENT_TABS[className] ?? []).includes(SKILL_SPECIALISTS[skill]?.tab)) return 2
  return getClassMainStat(className) === SKILL_MAIN_STATS[skill] ? 1 : 0
}

function fitOf(character, skill) {
  return getClassFit(character?.class, skill)
}

function isWarrior(character) {
  return getClassMainStat(character?.class) === 'STR'
}

// How well a character suits printing an item: 5 = specialist line (worth pulling even a warrior off
// Copper, e.g. a Death Bringer on fish), 2 = non-warrior with the skill's main stat (or a monster drop),
// 1 = any other non-warrior, 0 = a warrior off its specialty (kept for Copper unless nobody else can)
export function getPlacementScore(character, skill) {
  const fit = fitOf(character, skill)
  if (fit === 2) return 5
  if (isWarrior(character)) return 0
  return fit === 1 ? 2 : 1
}

function makeSlot(entry, action, character) {
  const fit = fitOf(character, entry.skill)
  return {
    item: entry.item,
    skill: entry.skill,
    action,
    fit,
    classFit: fit > 0,
    warriorOffCopper: fit < 2 && isWarrior(character),
  }
}

// Max-weight assignment on a square matrix (Hungarian algorithm, minimising -weight).
// Returns assignment[row] = column.
function hungarian(weights) {
  const n = weights.length
  const INF = Number.MAX_VALUE
  const u = new Array(n + 1).fill(0)
  const v = new Array(n + 1).fill(0)
  const p = new Array(n + 1).fill(0)
  const way = new Array(n + 1).fill(0)
  for (let i = 1; i <= n; i++) {
    p[0] = i
    let j0 = 0
    const minv = new Array(n + 1).fill(INF)
    const used = new Array(n + 1).fill(false)
    do {
      used[j0] = true
      const i0 = p[j0]
      let delta = INF
      let j1 = 0
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue
        const cur = -weights[i0 - 1][j - 1] - u[i0] - v[j]
        if (cur < minv[j]) {
          minv[j] = cur
          way[j] = j0
        }
        if (minv[j] < delta) {
          delta = minv[j]
          j1 = j
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta
          v[j] -= delta
        } else {
          minv[j] -= delta
        }
      }
      j0 = j1
    } while (p[j0] !== 0)
    do {
      const j1 = way[j0]
      p[j0] = p[j1]
      j0 = j1
    } while (j0)
  }
  const assignment = new Array(n).fill(-1)
  for (let j = 1; j <= n; j++) {
    if (p[j] > 0) assignment[p[j] - 1] = j - 1
  }
  return assignment
}

function combinations(pool, size) {
  const result = []
  const pick = (start, chosen) => {
    if (chosen.length === size) {
      result.push([...chosen])
      return
    }
    for (let i = start; i <= pool.length - (size - chosen.length); i++) {
      chosen.push(pool[i])
      pick(i + 1, chosen)
      chosen.pop()
    }
  }
  pick(0, [])
  return result
}

function buildPlan(snapshot, windowHours, skipItem) {
  const list = getRefineryPrintList(snapshot)
  if (!list) return null
  const characters = snapshot?.characters ?? []
  const printers = snapshot?.printer?.characters ?? []
  const slotsPerCharacter = getPrinterUnlocks(snapshot).secondChamber === false ? 1 : 2
  const accountMulti = getPrinterTotalMulti(getPrinterMultis(snapshot), getPrinterHiddenMultis(snapshot))

  // Print rate of every sample each character holds, after all multis, and what it prints now
  const holders = {}
  characters.forEach((character, index) => {
    const multi = accountMulti * getCharacterPrintMulti(snapshot, index).multi
    const printing = new Set((printers[index]?.printing ?? []).filter(s => !isBlank(s)).map(s => s.item))
    for (const sample of getLibrary(printers[index])) {
      const rate = sample.value * multi
      const entries = holders[sample.item] ?? (holders[sample.item] = [])
      const existing = entries.find(holder => holder.index === index)
      if (existing) existing.rate = Math.max(existing.rate, rate)
      else entries.push({ index, rate, printing: printing.has(sample.item) })
    }
  })
  const holderOf = (item, index) => (holders[item] ?? []).find(holder => holder.index === index)

  const needed = list
    // Hours storage lasts if nobody printed it
    .filter(entry => entry.stored / entry.neededPerHour <= windowHours)
    .map(entry => {
      const best = Math.max(0, ...(holders[entry.item] ?? []).map(holder => holder.rate))
      return {
        ...entry,
        slots: best > 0 ? Math.max(1, Math.ceil(entry.neededPerHour / best)) : 1,
      }
    })

  // The Vman's Spore Cap chamber is fixed; everything else is one assignment row per chamber needed
  const vmanIndex = characters.map(character => character.class).lastIndexOf(VMAN_CLASS)
  const sporeCap = list.find(entry => entry.item === VMAN_ITEM)
  const pinVman = vmanIndex !== -1 && !!sporeCap
  const rows = []
  for (const entry of needed) {
    if (entry.item === skipItem) continue
    const count = entry.slots - (pinVman && entry.item === VMAN_ITEM ? 1 : 0)
    for (let i = 0; i < count; i++) rows.push(entry)
  }

  const chambersFor = index => slotsPerCharacter - (pinVman && index === vmanIndex ? 1 : 0)
  const totalChambers = rows.length + (pinVman ? 1 : 0)
  const characterCount = Math.min(characters.length, Math.ceil(totalChambers / slotsPerCharacter))
  const pool = characters.map((_, index) => index).filter(index => !(pinVman && index === vmanIndex))
  const subsets = combinations(pool, Math.max(0, characterCount - (pinVman ? 1 : 0)))
    .map(subset => (pinVman ? [vmanIndex, ...subset] : subset))

  // Weight of putting an item in a character's chamber: class first, then keeping what's there
  const weightFor = (entry, index) => {
    const holder = holderOf(entry.item, index)
    const continuity = holder?.printing ? 2 : holder ? 1 : 0
    return getPlacementScore(characters[index], entry.skill) * 10 + continuity
  }

  let best = null
  for (const subset of subsets) {
    const columns = subset.flatMap(index => Array.from({ length: chambersFor(index) }, () => index))
    if (columns.length < rows.length) continue
    const size = columns.length
    const weights = Array.from({ length: size }, (_, r) => Array.from({ length: size }, (_, c) => (
      r < rows.length ? weightFor(rows[r], columns[c]) : 0
    )))
    const assignment = hungarian(weights)
    const total = rows.reduce((sum, entry, r) => sum + weights[r][assignment[r]], 0)
    // Ties: leave more warriors free for Copper
    const warriorsUsed = subset.filter(index => isWarrior(characters[index])).length
    if (!best || total > best.total || (total === best.total && warriorsUsed < best.warriorsUsed)) {
      best = { subset, columns, assignment, total, warriorsUsed }
    }
  }

  const plan = (best?.subset ?? []).map(index => {
    const character = characters[index]
    const slots = []
    if (pinVman && index === vmanIndex) {
      const holder = holderOf(VMAN_ITEM, index)
      slots.push({
        ...makeSlot(sporeCap, holder?.printing ? 'keep' : holder ? 'swap' : 'sample', character),
        pinned: true,
      })
    }
    rows.forEach((entry, r) => {
      if (best.columns[best.assignment[r]] !== index) return
      const holder = holderOf(entry.item, index)
      slots.push(makeSlot(entry, holder?.printing ? 'keep' : holder ? 'swap' : 'sample', character))
    })
    return {
      index,
      name: character.name,
      class: character.class,
      slots,
    }
  })

  const used = new Set(plan.map(entry => entry.index))
  const free = characters
    .map((character, index) => ({ index, name: character.name, class: character.class }))
    .filter(character => !used.has(character.index))
    .map(character => ({
      ...character,
      warrior: isWarrior(character),
      hasCopper: getLibrary(printers[character.index]).some(sample => sample.item === 'Copper'),
    }))
  const printingNow = printers.filter(printer => (printer.printing ?? [])
    .some(sample => !isBlank(sample) && list.some(entry => entry.item === sample.item))).length

  return {
    list,
    slotsPerCharacter,
    needed,
    plan,
    free,
    printingNow,
  }
}

// Copper Ore is both a Redox Salts input and what free characters print for atoms (warriors best), so when
// anyone is left free, their Copper prints cover Redox Salts and copper takes no plan slot.
const ATOM_ITEM = 'Copper'

export function getPrintPlan(snapshot, windowHours) {
  const withoutCopper = buildPlan(snapshot, windowHours, ATOM_ITEM)
  if (!withoutCopper) return null
  const copperNeeded = withoutCopper.needed.some(entry => entry.item === ATOM_ITEM)
  if (!copperNeeded) return withoutCopper
  if (withoutCopper.free.length > 0) {
    return {
      ...withoutCopper,
      copperByFree: true,
    }
  }
  return buildPlan(snapshot, windowHours, null)
}
