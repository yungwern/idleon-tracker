import { holeVillagers } from '../data'
import {
  getVillagerExpModel,
  getVillagerExpRate,
  getVillagerExpReq,
  getLeastOpals,
  getOpalSources,
} from './holeUtils'

// Villagers > Opal Planner: where to put every opal (invested + unspent; the game lets you reset them).
// Our own model, built on the game's EXP formula (holeUtils getVillagerExpRate). Only two opal effects
// depend on the split: Opal Enthusiasm (+x% per 10 opals in that villager) and Equal Spread (+x% per
// 5 opals in the emptiest unlocked villager, for everyone). Every other multi scales all villagers
// alike, so it changes the times but never which split wins.
//
// Two goals:
// - Focus (endgame: Bolaia, Eli): the most EXP / hr for one villager. The others only matter through
//   Equal Spread, so they all hold the same m opals and the focus gets the rest; m is searched exactly.
// - Targets (early game): reach a LV on chosen villagers as soon as possible (the slowest one sets the
//   time). For each m, binary search the finish time; each target gets the fewest opals that make it.
//   One split for the whole run: resetting costs, so it doesn't plan re-splits along the way.

const ES_STEP = 5 // Equal Spread counts whole 5s

export function getOpalPool(snapshot) {
  const sources = getOpalSources(snapshot)
  return Math.max(sources.invested, sources.invested + sources.unspent)
}

// EXP still needed to reach `target` LV from the villager's current LV and EXP
export function getExpToLevel(snapshot, t, target) {
  const level = snapshot?.caverns?.villagerLevels?.[t] ?? 0
  let need = -(snapshot?.caverns?.villagerExp?.[t] ?? 0)
  for (let l = level; l < target; l++) need += getVillagerExpReq(l, t)
  return Math.max(0, need)
}

function buildResult(snapshot, model, opals) {
  const least = getLeastOpals(opals, model.unlocked)
  return holeVillagers.map((villager, t) => ({
    id: t,
    opals: opals[t],
    rate: model.unlocked[t] ? getVillagerExpRate(model, t, opals[t], least) : 0,
  }))
}

function currentOpals(snapshot) {
  return holeVillagers.map(villager => snapshot?.caverns?.opalsInvested?.[villager.id] ?? 0)
}

// Most EXP / hr for villager `focus`
export function getFocusPlan(snapshot, tomePoints, focus) {
  const model = getVillagerExpModel(snapshot, tomePoints)
  const pool = getOpalPool(snapshot)
  const others = holeVillagers.filter((v, t) => model.unlocked[t] && t !== focus).map(v => v.id)
  let best = null
  // m beyond a multiple of 5 is wasted, and the focus never holds fewer than the others
  for (let m = 0; m * (others.length + 1) <= pool; m += ES_STEP) {
    const focusOpals = pool - m * others.length
    const rate = getVillagerExpRate(model, focus, focusOpals, m)
    if (!best || rate > best.rate) best = { m, rate }
  }
  const opals = holeVillagers.map((v, t) => (!model.unlocked[t] ? 0 : t === focus ? pool - best.m * others.length : best.m))
  return {
    model,
    pool,
    equalSpreadOpals: best.m,
    plan: buildResult(snapshot, model, opals),
    current: buildResult(snapshot, model, currentOpals(snapshot)),
  }
}

// Fewest opals (≥ m) giving villager t at least `rate`, or Infinity past the pool
function opalsForRate(model, t, rate, m, pool) {
  if (getVillagerExpRate(model, t, pool, m) < rate) return Infinity
  let lo = m
  let hi = pool
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (getVillagerExpRate(model, t, mid, m) >= rate) hi = mid
    else lo = mid + 1
  }
  return lo
}

// targets: { [villagerId]: target LV }. Returns null when no target is above the current LV.
export function getTargetPlan(snapshot, tomePoints, targets) {
  const model = getVillagerExpModel(snapshot, tomePoints)
  const pool = getOpalPool(snapshot)
  const needs = Object.entries(targets)
    .map(([t, level]) => ({ t: Number(t), need: getExpToLevel(snapshot, Number(t), level) }))
    .filter(({ t, need }) => model.unlocked[t] && need > 0)
  if (needs.length === 0) return null
  const unlockedCount = model.unlocked.filter(Boolean).length
  const fillers = unlockedCount - needs.length // unlocked villagers without a target hold just m

  let best = null
  for (let m = 0; m * unlockedCount <= pool; m += ES_STEP) {
    const counts = T => needs.map(({ t, need }) => opalsForRate(model, t, need / T, m, pool))
    const fits = T => counts(T).reduce((sum, n) => sum + n, 0) + fillers * m <= pool
    // Hours: from "everything in one villager" up to absurdly long
    let lo = Math.log(1e-6)
    let hi = Math.log(1e30)
    if (!fits(Math.exp(hi))) continue
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2
      if (fits(Math.exp(mid))) hi = mid
      else lo = mid
    }
    const hours = Math.exp(hi)
    if (!best || hours < best.hours) best = { m, hours, counts: counts(hours) }
  }
  if (!best) return null

  const opals = holeVillagers.map((v, t) => (model.unlocked[t] ? best.m : 0))
  needs.forEach(({ t }, k) => { opals[t] = best.counts[k] })
  // Leftovers (rounding) go one at a time to whichever target finishes last
  let left = pool - opals.reduce((sum, n) => sum + n, 0)
  const hoursOf = (t, need) => need / getVillagerExpRate(model, t, opals[t], getLeastOpals(opals, model.unlocked))
  while (left > 0) {
    const slowest = needs.reduce((a, b) => (hoursOf(a.t, a.need) >= hoursOf(b.t, b.need) ? a : b))
    opals[slowest.t]++
    left--
  }

  const withHours = (result, ops) => {
    const least = getLeastOpals(ops, model.unlocked)
    return result.map(row => {
      const need = needs.find(n => n.t === row.id)?.need
      return {
        ...row,
        target: targets[row.id] ?? null,
        hours: need ? need / getVillagerExpRate(model, row.id, ops[row.id], least) : null,
      }
    })
  }
  const now = currentOpals(snapshot)
  const plan = withHours(buildResult(snapshot, model, opals), opals)
  const current = withHours(buildResult(snapshot, model, now), now)
  const longest = rows => Math.max(...rows.map(row => row.hours ?? 0))
  return {
    model,
    pool,
    equalSpreadOpals: best.m,
    plan,
    current,
    hours: longest(plan),
    currentHours: longest(current),
  }
}
