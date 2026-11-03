import { harpStringTypes } from '../data'

// The Harp > Best setup: which string types to put on the harp, and in what order.
// Per strum every string is plucked once; string k (0 = first plucked) is worth
//   1 + (Stringy 15 + Domino 20 × k + Variety 30 × unique types on the harp) / 100   (Toolbox HarpStringAllBonus)
// A pluck makes notes (C: the tune, F: 1/4 of the tune and both neighbours, A: 1/16 of every known note) and gives its
// own type EXP; a G pluck gives EXP to every type. Harp Power and the other multis are the same for every setup.
//
// Goals:
//   notes: long-run notes. String LVs cost ×1.15 more EXP each, so a type's LV ends up ~ ln(its EXP per strum) / ln 1.15
//     above where it would be anyway; each LV is worth the % its LV bonus adds to notes at the current LV
//     (E: Harp Power, D: × note gain, C/F/A: share of the + note gain pool, G: faster EXP for every type).
//     score = ln(notes per strum) + Σ types (LV worth / ln 1.15) × ln(EXP per strum to that type)
//     At high LVs a LV is worth well under 1%, so notes now win; at low LVs levelling (one of each, more E/G) wins.
//   level: every unlocked type levels as fast as it can, all equal: score = Σ types ln(EXP per strum)
// Brute force over every mix of unlocked types (C(16, 5) mixes for 11 strings), each mix ordered by a pairwise-swap
// search from "most notes last".

const C = 0
const D = 1
const E = 2
const F = 3
const G = 4
const A = 5
const STRINGY = 15
const DOMINO = 20
const VARIETY = 30
const LV_COST_GROWTH = Math.log(1.15)
const NOTE_PULL = { [C]: 1, [F]: 0.75 } // A = notes known / 16

export const HARP_GOALS = [
  { id: 'notes', label: 'Notes' },
  { id: 'level', label: 'Level strings' },
]

function slotMulti(k, unique, built) {
  return 1 + ((built.stringy ? STRINGY : 0) + (built.domino ? DOMINO * k : 0) + (built.variety ? VARIETY * unique : 0)) / 100
}

// What +1 LV of each type is worth, as a fraction of notes (see the header)
export function getHarpLevelWorth(levels) {
  const bonus = t => (harpStringTypes[t]?.perLevel ?? 0) * (levels[t] ?? 0)
  const per = t => harpStringTypes[t]?.perLevel ?? 0
  const notePool = 100 + bonus(C) + bonus(F) + bonus(A)
  const worth = []
  worth[C] = per(C) / notePool
  worth[F] = per(F) / notePool
  worth[A] = per(A) / notePool
  worth[D] = per(D) / (100 + bonus(D))
  worth[E] = per(E) / (100 + bonus(E))
  // G: +EXP for every type → every other type's LVs come faster
  const expWorth = per(G) / (100 + bonus(G)) / LV_COST_GROWTH
  worth[G] = expWorth * [C, D, E, F, A].reduce((sum, t) => sum + worth[t], 0)
  return worth
}

function evaluate(goal, strings, ctx, unique = new Set(strings).size) {
  const exp = ctx.exp.fill(0)
  let gExp = 0
  let notes = 0
  strings.forEach((t, k) => {
    const m = slotMulti(k, unique, ctx.built)
    if (t === G) gExp += m
    else exp[t] += m
    notes += m * (t === A ? ctx.notesKnown / 16 : NOTE_PULL[t] ?? 0)
  })
  let levelScore = 0
  for (const t of ctx.unlocked) {
    const total = exp[t] + gExp
    if (total <= 0) return -Infinity // a type that never levels
    levelScore += (goal === 'notes' ? ctx.worth[t] / LV_COST_GROWTH : 1) * Math.log(total)
  }
  if (goal === 'level') return levelScore
  return notes > 0 ? Math.log(notes) + levelScore : -Infinity
}

// Swaps happen in place (and are undone when they don't help): this runs for every mix
function orderMix(goal, strings, ctx) {
  const order = [...strings].sort((a, b) => (NOTE_PULL[a] ?? (a === A ? 0.5 : 0)) - (NOTE_PULL[b] ?? (b === A ? 0.5 : 0)) || b - a)
  const unique = new Set(order).size
  let score = evaluate(goal, order, ctx, unique)
  let improved = true
  while (improved) {
    improved = false
    for (let i = 0; i < order.length; i++) {
      for (let j = i + 1; j < order.length; j++) {
        if (order[i] === order[j]) continue
        ;[order[i], order[j]] = [order[j], order[i]]
        const nextScore = evaluate(goal, order, ctx, unique)
        if (nextScore > score + 1e-12) {
          score = nextScore
          improved = true
        } else {
          ;[order[i], order[j]] = [order[j], order[i]]
        }
      }
    }
  }
  return { strings: order, score }
}

function forEachMix(types, slots, visit) {
  const strings = []
  const walk = (i, left) => {
    if (i === types.length - 1) {
      visit([...strings, ...Array(left).fill(types[i])])
      return
    }
    for (let n = left; n >= 0; n--) {
      const before = strings.length
      for (let c = 0; c < n; c++) strings.push(types[i])
      walk(i + 1, left - n)
      strings.length = before
    }
  }
  if (types.length) walk(0, slots)
}

// Results are cached (the sidebar badge, the tabs and the card all ask for the same setups every render)
const cache = new Map()
const CACHE_SIZE = 16

// ctx: { slots, unlocked: [t], levels: [LV per type], notesKnown, built: { stringy, domino, variety } }
// Returns { strings (pluck order), current: how the current harp compares (1 = as good), worth: [+1 LV worth] }.
// current = long-run notes ratio for notes, average EXP per type ratio for level.
export function getHarpBestSetup(goal, current, ctx) {
  const key = JSON.stringify([goal, current, ctx])
  if (cache.has(key)) return cache.get(key)
  const result = findHarpBestSetup(goal, current, ctx)
  if (cache.size >= CACHE_SIZE) cache.delete(cache.keys().next().value)
  cache.set(key, result)
  return result
}

function findHarpBestSetup(goal, current, ctx) {
  const full = { ...ctx, worth: getHarpLevelWorth(ctx.levels), exp: Array(harpStringTypes.length).fill(0) }
  let best = null
  forEachMix(ctx.unlocked, ctx.slots, strings => {
    const result = orderMix(goal, strings, full)
    if (!best || result.score > best.score) best = result
  })
  if (!best) return null
  const currentScore = evaluate(goal, current, full)
  const gap = currentScore - best.score
  return {
    strings: best.strings,
    current: Number.isFinite(gap) ? Math.exp(goal === 'level' ? gap / ctx.unlocked.length : gap) : 0,
    worth: full.worth,
  }
}
