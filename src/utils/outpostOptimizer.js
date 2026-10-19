// ============================================================
// ROYAL GUARDIAN OUTPOST OPTIMIZER
// Simulates each outpost forward in time with the game's rank EXP formulas
// (ported from IdleOn Toolbox, parsers/class-specific/royalGuardian.ts) to answer:
//   1. How should the unit slots be split between Traders and Surveyors?
//   2. Should the next 12 PTS go into Barracks or Education?
//   3. Which outpost in each world should its Commanders work on?
// "Best" means the most Trade ranks (= PTS) at the end of the horizon.
// ============================================================

import { outpostRankThreshold, MAPS_PER_WORLD } from '../data/royalOutposts'

export const HORIZON_DAYS = 30
const STEP_HOURS = 2
const HORIZON_STEPS = (HORIZON_DAYS * 24) / STEP_HOURS

const TRADE = 0
const INTEL = 1
const COMMAND = 2
const MILITARY = 3

// Unit slot digits are 2 + unit type
const UNIT_TRADER = 1
const UNIT_SURVEYOR = 3
const UNIT_DIGIT_OFFSET = 2

const MAX_UNIT_SLOTS = 6
export const BARRACKS_SLOT_CAP = MAX_UNIT_SLOTS - 1
export const BARRACKS_COST = 12
const LOGISTICS_COST = 2

// Movable unit jobs (RoyalG[6 + 2w])
const JOB_CLEARING = 4
const JOB_COMMAND = 5

// Armory upgrade ids and their bonus per level
const ARMORY = {
  peacetimeMilitia: 17,
  traders: 20, // +20% Trade EXP per level
  surveyors: 22, // +15% Intel EXP per level
  commanders: 24, // +5% Command EXP per level
  knights: 25, // +5% Military EXP per level
  superSupport: 43, // +1% Support Camp boost per level
  greaterEducation: 57,
  tradingRank: 71,
  intelRank: 72, // +10% EXP per Intel rank, per level
  outpostPtsWorld1: 9, // 9-16: +1 PTS per level for every outpost in that world
}
const STRONK_RANK_ORBLET = 6 // +5% rank EXP per level

// Jelly Operator bonuses that touch outposts, keyed by bonus index (active once that many obstructions are beaten)
const JELLY_VALUES = { 1: 35, 3: 5, 15: 4, 32: 3, 43: 3, 48: 3, 52: 3, 61: 3 }
const JELLY_RANK_EXP = 1
const JELLY_PTS_BY_WORLD = [3, 15, 32, 43, 48, 52, 61, 61]

function rankOf(exp, type) {
  let rank = 0
  while (rank < 1000 && exp >= outpostRankThreshold(rank, type)) rank++
  return rank
}

// Free units an outpost gets from its Command rank (game: PassiveUnitsz)
function passiveUnits(commandRank, unitType) {
  return Math.ceil(Math.max(0, commandRank - unitType) / 4)
}

function accountContext(rg) {
  const armory = id => rg?.armory?.[id] ?? 0
  const jelly = index => ((rg?.jellyObstructions ?? 0) > index ? (JELLY_VALUES[index] ?? 0) : 0)
  const stronk = 1 + (5 * (rg?.orbletLevels?.[STRONK_RANK_ORBLET] ?? 0)) / 100

  // game quirk: each bar's EXP is tripled when the map whose INDEX equals the bar type is purified
  const purifiedMaps = new Set((rg?.outposts ?? [])
    .filter(o => (o.rankExp?.[4] ?? 0) >= outpostRankThreshold(0, 4))
    .map(o => o.mapIndex))

  return {
    armory,
    jelly,
    baseRate: [
      (1 + (20 * armory(ARMORY.traders)) / 100) * stronk * (purifiedMaps.has(TRADE) ? 3 : 1),
      (1 + (15 * armory(ARMORY.surveyors)) / 100) * stronk * (purifiedMaps.has(INTEL) ? 3 : 1),
      (1 + (5 * armory(ARMORY.commanders)) / 100) * stronk * (purifiedMaps.has(COMMAND) ? 3 : 1),
      (1 + (5 * armory(ARMORY.knights)) / 100) * stronk * (purifiedMaps.has(MILITARY) ? 3 : 1),
    ],
    intelPerRank: (10 * armory(ARMORY.intelRank)) / 100,
    supportBonus: 200 * (1 + armory(ARMORY.superSupport) / 100),
    jellyExp: 1 + jelly(JELLY_RANK_EXP) / 100,
    peacetimeMilitia: armory(ARMORY.peacetimeMilitia) >= 1,
    educationUnlocked: armory(ARMORY.greaterEducation) >= 1,
  }
}

// Everything about one outpost the simulation needs, read once
function outpostState(o, ctx, supportCount, commanders, militia) {
  const [barracks, logistics, education] = o.upgrades
  const slots = Math.min(MAX_UNIT_SLOTS, 1 + barracks)
  const slotUnits = [...o.units.slice(0, slots)].map(c => Number(c) - UNIT_DIGIT_OFFSET)
  const exp = o.rankExp.slice(0, 4)
  return {
    o,
    barracks,
    logistics,
    education,
    slots,
    slotTraders: slotUnits.filter(u => u === UNIT_TRADER).length,
    slotSurveyors: slotUnits.filter(u => u === UNIT_SURVEYOR).length,
    exp,
    ranks: exp.map((e, type) => rankOf(e, type)),
    // Everything except Education and Intel, which change during the simulation
    flatMulti: (o.glorified ? 2 : 1) * (1 + (ctx.supportBonus * supportCount) / 100) * ctx.jellyExp,
    commanders,
    militia,
  }
}

function barRate(ctx, state, type, education, intelRank) {
  return ctx.baseRate[type]
    * (1 + (10 * education) / 100)
    * state.flatMulti
    * (1 + ctx.intelPerRank * intelRank)
}

// Runs one outpost forward. plan(intelRank) returns [slot Traders, slot Surveyors].
function simulate(ctx, state, { education, plan }) {
  const exp = [...state.exp]
  const ranks = [...state.ranks]
  for (let step = 0; step < HORIZON_STEPS; step++) {
    const [slotT, slotS] = plan(ranks[INTEL])
    const rate = type => barRate(ctx, state, type, education, ranks[INTEL]) * STEP_HOURS
    const gain = [
      (slotT + passiveUnits(ranks[COMMAND], UNIT_TRADER)) * rate(TRADE),
      (slotS + passiveUnits(ranks[COMMAND], UNIT_SURVEYOR)) * rate(INTEL),
      state.commanders * rate(COMMAND),
      0,
    ]
    // Peacetime Militia: idle clearing units feed half the Military rate into the highest bar
    if (ctx.peacetimeMilitia && state.militia > 0) {
      const highest = ranks.reduce((best, r, t) => (r > ranks[best] ? t : best), 0)
      gain[highest] += (rate(MILITARY) / 2) * state.militia
    }
    for (let t = 0; t < 4; t++) {
      exp[t] += gain[t]
      while (exp[t] >= outpostRankThreshold(ranks[t], t)) ranks[t]++
    }
  }
  return { trade: ranks[TRADE], intel: ranks[INTEL], command: ranks[COMMAND] }
}

// Best plan of the form "all Surveyors until Intel X, then all Traders".
// X at or below the current Intel rank means all Traders right away.
// (This beat every fixed Trader/Surveyor split in testing.)
function bestUnitPlan(ctx, state, slots, education) {
  const start = state.ranks[INTEL]
  let best = null
  let sinceBetter = 0
  for (let switchAt = start; switchAt <= start + 60; switchAt++) {
    const result = simulate(ctx, state, {
      education,
      plan: intel => (intel < switchAt ? [0, slots] : [slots, 0]),
    })
    if (!best || result.trade > best.trade) {
      best = { switchAt, ...result }
      sinceBetter = 0
    } else if (++sinceBetter >= 8) {
      break
    }
  }
  return best
}

function outpostPts(ctx, state) {
  const world = Math.floor(state.o.mapIndex / MAPS_PER_WORLD)
  const trade = state.ranks[TRADE]
  const tradingRank = ctx.armory(ARMORY.tradingRank)
  const total = 2
    + ctx.jelly(JELLY_PTS_BY_WORLD[Math.min(7, world)])
    + ctx.armory(ARMORY.outpostPtsWorld1 + world)
    + trade
    + (tradingRank >= 1 ? Math.floor(trade / (11 - tradingRank)) : 0)
    + (state.o.glorified ? 10 : 0)
  const spent = state.barracks * BARRACKS_COST + state.logistics * LOGISTICS_COST + state.education
  return { total, spent, left: Math.max(0, Math.round(total - spent)) }
}

// Next even Command rank: those are the ones that add a free Trader (2, 6, 10...) or Surveyor (4, 8, 12...)
function nextCommandUnit(ctx, state) {
  const rank = state.ranks[COMMAND]
  const target = rank % 2 === 0 ? rank + 2 : rank + 1
  const expNeeded = outpostRankThreshold(target - 1, COMMAND) - state.exp[COMMAND]
  const perCommanderHour = barRate(ctx, state, COMMAND, state.education, state.ranks[INTEL])
  return {
    rank,
    target,
    unit: target % 4 === 2 ? 'Trader' : 'Surveyor',
    hoursPerCommander: expNeeded / perCommanderHour,
  }
}

// Where each world's movable units are posted: Commanders per map and per world, idle Militia per map
function readDeployments(rg, built) {
  const commanders = new Map()
  const militia = new Map()
  const commandersByWorld = new Map()
  ;(rg?.deployments ?? []).forEach(d => {
    if (d.job === JOB_COMMAND) {
      commandersByWorld.set(d.world, (commandersByWorld.get(d.world) ?? 0) + 1)
      if (d.mapIndex >= 0) commanders.set(d.mapIndex, (commanders.get(d.mapIndex) ?? 0) + 1)
    }
    if (d.job === JOB_CLEARING && built.has(d.mapIndex)) {
      militia.set(d.mapIndex, (militia.get(d.mapIndex) ?? 0) + 1)
    }
  })
  return { commanders, militia, commandersByWorld }
}

// For each world with Commanders: the outpost that reaches its next free Trader/Surveyor fastest,
// and whether any of that world's Commanders are posted somewhere else.
// Cheap (no simulation), so the sidebar badge can use it too.
// Returns Map(world → { best, commanders, postedAt: Map(mapIndex → count), needsMove })
export function getCommanderAdvice(rg, outposts) {
  const ctx = accountContext(rg)
  const built = new Set(outposts.map(o => o.mapIndex))
  const { commanders, militia, commandersByWorld } = readDeployments(rg, built)
  const rawByMap = new Map((rg?.outposts ?? []).map(o => [o.mapIndex, o]))

  const fastest = new Map()
  outposts.forEach(summaryOutpost => {
    const raw = rawByMap.get(summaryOutpost.mapIndex)
    if (!raw?.units) return
    const state = outpostState(raw, ctx, summaryOutpost.supportedBy.length,
      commanders.get(raw.mapIndex) ?? 0, militia.get(raw.mapIndex) ?? 0)
    const next = nextCommandUnit(ctx, state)
    const current = fastest.get(summaryOutpost.world)
    if (!current || next.hoursPerCommander < current.hoursPerCommander) {
      fastest.set(summaryOutpost.world, { mapIndex: raw.mapIndex, ...next })
    }
  })

  const advice = new Map()
  commandersByWorld.forEach((count, world) => {
    const best = fastest.get(world)
    if (!best) return
    const postedAt = new Map()
    ;(rg?.deployments ?? [])
      .filter(d => d.job === JOB_COMMAND && d.world === world)
      .forEach(d => postedAt.set(d.mapIndex, (postedAt.get(d.mapIndex) ?? 0) + 1))
    advice.set(world, {
      best,
      commanders: count,
      postedAt,
      needsMove: [...postedAt.keys()].some(mapIndex => mapIndex !== best.mapIndex),
    })
  })
  return advice
}

// Returns { byMap: Map(mapIndex → result), commandersByWorld, bestCommandTarget: Map(world → mapIndex), commanderAdvice }
export function optimizeOutposts(rg, outposts) {
  const ctx = accountContext(rg)
  const built = new Set(outposts.map(o => o.mapIndex))

  const { commanders, militia, commandersByWorld } = readDeployments(rg, built)
  const commanderAdvice = getCommanderAdvice(rg, outposts)
  const bestCommandTarget = new Map([...commanderAdvice].map(([world, a]) => [world, a.best.mapIndex]))

  const rawByMap = new Map((rg?.outposts ?? []).map(o => [o.mapIndex, o]))
  const byMap = new Map()

  outposts.forEach(summaryOutpost => {
    const raw = rawByMap.get(summaryOutpost.mapIndex)
    if (!raw?.units) return
    const state = outpostState(raw, ctx, summaryOutpost.supportedBy.length,
      commanders.get(raw.mapIndex) ?? 0, militia.get(raw.mapIndex) ?? 0)

    const plan = bestUnitPlan(ctx, state, state.slots, state.education)
    const current = simulate(ctx, state, {
      education: state.education,
      plan: () => [state.slotTraders, state.slotSurveyors],
    })

    // Next 12 PTS: one Barracks level (only worth it while it still adds a unit slot) vs 12 Education
    let nextPts = 'education'
    if (!ctx.educationUnlocked) {
      nextPts = state.barracks < BARRACKS_SLOT_CAP ? 'barracks' : null
    } else if (state.barracks < BARRACKS_SLOT_CAP) {
      const withBarracks = bestUnitPlan(ctx, state, state.slots + 1, state.education)
      const withEducation = bestUnitPlan(ctx, state, state.slots, state.education + BARRACKS_COST)
      nextPts = withBarracks.trade >= withEducation.trade ? 'barracks' : 'education'
    }

    const result = {
      slots: state.slots,
      slotTraders: state.slotTraders,
      slotSurveyors: state.slotSurveyors,
      intel: state.ranks[INTEL],
      plan,
      allTradersNow: plan.switchAt <= state.ranks[INTEL],
      projectedNow: current.trade,
      projectedBest: plan.trade,
      pts: outpostPts(ctx, state),
      barracks: state.barracks,
      nextPts,
      command: { ...nextCommandUnit(ctx, state), commandersHere: state.commanders },
    }
    byMap.set(raw.mapIndex, result)
  })

  return { byMap, commandersByWorld, bestCommandTarget, commanderAdvice }
}

// "3.5 days" / "18 hours"
export function formatDuration(hours) {
  if (!Number.isFinite(hours)) return 'never'
  if (hours < 48) return `${Math.max(1, Math.round(hours))} hours`
  const days = hours / 24
  return `${days < 10 ? days.toFixed(1) : Math.round(days).toLocaleString()} days`
}
