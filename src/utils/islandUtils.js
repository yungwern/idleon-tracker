import {
  islandMap,
  ISLAND_COST_STEPS,
  ISLAND_PATH,
  BOTTLES_BASE_PER_DAY,
  BOTTLE_GAIN_PER_LEVEL,
  BOTTLE_PER_OMAR_QUEST,
  BOTTLE_BUNDLE,
  OMAR_QUESTS,
  ISLAND_BRIBES,
  TRASH_BRIBE_SET,
  trashShopMap,
  randoShopMap,
  RANDO_TALENT,
  CRYSTAL_MAX_DAYS,
  shimmerShopMap,
  SHIMMER_MAX_MULTI,
  fractalBonusMap,
  stampMap,
  NOTHING_TROPHY,
} from '../data'
import { isBundleOwned } from './bundleUtils'
import { getArtifactBonus } from './sailingUtils'

// World 2 Islands, ported from IdleonToolbox parsers/world-2/islands.ts.
// `islands` = snapshot.islands (parseIslands in lib/extractSnapshot.js).

export function isIslandUnlocked(islands, islandId) {
  const island = islandMap.find(entry => entry.id === islandId)
  return !!island && (islands?.unlocked ?? '').includes(island.saveLetter)
}

export function getUnlockedIslandCount(islands) {
  return islandMap.filter(island => isIslandUnlocked(islands, island.id)).length
}

// Bottle cost of a still-locked island once `unlockedCount` islands are open
export function getIslandUnlockCost(islandId, unlockedCount) {
  const island = islandMap.find(entry => entry.id === islandId)
  if (!island) return 0
  return unlockedCount === 0
    ? island.preUnlockCost
    : island.baseCost + ISLAND_COST_STEPS[Math.min(unlockedCount, ISLAND_COST_STEPS.length - 1)]
}

// Bottles per day = floor(4 × (1 + % / 100)). Returns { value, percent, parts: [{ label, value }] }
export function getBottlesPerDay(snapshot) {
  const islands = snapshot?.islands
  const bottleService = islands?.trashBribes?.[TRASH_BRIBE_SET.findIndex(bribe => bribe.index === ISLAND_BRIBES.bottleService)]
  const parts = [
    { label: `Bottle Gain upgrade (LV ${islands?.bottleGainLevel ?? 0})`, value: BOTTLE_GAIN_PER_LEVEL * (islands?.bottleGainLevel ?? 0) },
    { label: `Omar quests (${islands?.omarQuests ?? 0}/${OMAR_QUESTS.length})`, value: BOTTLE_PER_OMAR_QUEST * (islands?.omarQuests ?? 0) },
    { label: 'Bottle Service bribe', value: bottleService ? ISLAND_BRIBES.bottleServiceBonus : 0 },
    { label: 'Explorer bundle', value: isBundleOwned(snapshot?.bundles, BOTTLE_BUNDLE.name) ? BOTTLE_BUNDLE.bonus : 0 },
  ]
  const percent = parts.reduce((sum, part) => sum + part.value, 0)
  return {
    value: Math.floor(BOTTLES_BASE_PER_DAY * (1 + percent / 100)),
    percent,
    parts,
  }
}

// Locked islands in the guide's order, each with its cost at that point and when the bottles get there
export function getBottlePlan(snapshot) {
  const islands = snapshot?.islands
  const perDay = getBottlesPerDay(snapshot).value
  let unlocked = getUnlockedIslandCount(islands)
  let cumulative = 0
  return ISLAND_PATH
    .filter(id => !isIslandUnlocked(islands, id))
    .map(id => {
      const cost = getIslandUnlockCost(id, unlocked)
      unlocked += 1
      cumulative += cost
      const short = Math.max(0, cumulative - (islands?.bottles ?? 0))
      return {
        island: islandMap.find(entry => entry.id === id),
        cost,
        cumulative,
        affordable: short === 0,
        days: perDay > 0 ? Math.ceil(short / perDay) : null,
      }
    })
}

// ── Trash Island ─────────────────────────────────────────────────────────────

// Garbage that washes up per day at a Garbage Gain level. Toolbox calls this an estimate: the
// game adds random amounts on top.
export function getGarbagePerDay(level) {
  return Math.round(3 * 1.25 * Math.floor(1.52 + level / 5))
}

// Garbage waiting on the beach after `days` unclaimed days (one pickup caps at 100)
export function getGarbageWaiting(days, level) {
  if (!(days > 0)) return 0
  const dayBonus = days < 14 ? 0.25 + days : Math.sqrt(8 * days)
  return Math.min(100, Math.round(3 * dayBonus * Math.floor(1.01 + 0.5 + Math.min(days, 70) / 100 + level / 5)))
}

function isStarTalentOwned(snapshot, talentId) {
  return (snapshot?.characters ?? []).some(character => Number(character.talentMaxLevels?.[talentId]) > 0)
}

function isStampOwned(snapshot, rawName) {
  const compassIndex = stampMap[rawName]?.compassIndex
  if (!compassIndex) return false
  const tree = { _: 0, a: 1, b: 2 }[compassIndex[0]]
  return (snapshot?.stamps?.levels?.[tree]?.[compassIndex.slice(1)] ?? 0) > 0
}

// The Garbage Tuna's bribe set counts as bought once any of its bribes is bought
export function isTrashBribeSetOwned(islands) {
  return (islands?.trashBribes ?? []).some(Boolean)
}

function getRepeatCost(item, level) {
  return Math.round(item.cost * Math.pow(item.growth, level))
}

// Every Garbage Tuna item: { ...item, cost, owned (true/false, null for repeatables), level }
export function getTrashShop(snapshot) {
  const islands = snapshot?.islands
  return trashShopMap.map(item => {
    if (item.kind === 'garbageGain' || item.kind === 'bottleGain') {
      const level = item.kind === 'garbageGain' ? islands?.garbageGainLevel ?? 0 : islands?.bottleGainLevel ?? 0
      return { ...item, cost: getRepeatCost(item, level), owned: null, level }
    }
    const owned = item.kind === 'stamp' ? isStampOwned(snapshot, item.stamp)
      : item.kind === 'bribes' ? isTrashBribeSetOwned(islands)
        : item.kind === 'talent' ? isStarTalentOwned(snapshot, item.talentId)
          : item.kind === 'nametag' ? !!islands?.trashNametag
            : false
    return { ...item, owned, level: null }
  })
}

const REPEATABLE_KINDS = ['garbageGain', 'bottleGain']
const MAX_GAIN_FIRST = 10

// Walks purchases day by day: `gainFirst` Garbage Gain levels, then every one-time item (bribe set first, then
// cheapest), then always the cheapest repeatable. Garbage Gain levels raise garbage per day as they're bought.
function simulateTrashOrder(snapshot, gainFirst, steps) {
  const islands = snapshot?.islands
  const garbage = islands?.garbage ?? 0
  const levels = {
    garbageGain: islands?.garbageGainLevel ?? 0,
    bottleGain: islands?.bottleGainLevel ?? 0,
  }
  const oneTime = getTrashShop(snapshot)
    .filter(item => item.owned === false)
    .sort((a, b) => (a.kind === 'bribes' ? -1 : b.kind === 'bribes' ? 1 : a.cost - b.cost))
  const repeatable = kind => {
    const item = trashShopMap.find(entry => entry.kind === kind)
    return { ...item, cost: getRepeatCost(item, levels[kind]), level: levels[kind] }
  }
  const order = []
  let perDay = getGarbagePerDay(levels.garbageGain)
  let banked = garbage
  let day = 0
  let cumulative = 0
  const buy = (item, phase) => {
    const wait = Math.ceil(Math.max(0, item.cost - banked) / perDay)
    day += wait
    banked += wait * perDay - item.cost
    cumulative += item.cost
    order.push({
      item,
      phase,
      cost: item.cost,
      cumulative,
      affordable: cumulative <= garbage,
      days: day,
    })
    if (REPEATABLE_KINDS.includes(item.kind)) {
      levels[item.kind] += 1
      perDay = getGarbagePerDay(levels.garbageGain)
    }
  }
  for (let i = 0; i < gainFirst; i++) buy(repeatable('garbageGain'), 'items')
  oneTime.forEach(item => buy(item, 'items'))
  const allItemsDay = oneTime.length ? day : null
  while (order.length < Math.max(steps, gainFirst + oneTime.length)) {
    const options = REPEATABLE_KINDS.map(repeatable)
    buy(options.reduce((best, item) => (item.cost < best.cost ? item : best)), 'upgrades')
  }
  return { order, allItemsDay, itemsLeft: oneTime.length, gainFirst }
}

// Buy order: every one-time item as fast as possible, then always the cheapest upgrade (Eli). Tries buying
// 0-10 Garbage Gain levels before the items and keeps whichever finishes the items soonest (ties: fewer levels).
// Returns { order: [{ item, phase: 'items' | 'upgrades', cost, cumulative, affordable, days }], allItemsDay, itemsLeft, gainFirst }
export function getTrashBuyOrder(snapshot, steps = 8) {
  let best = simulateTrashOrder(snapshot, 0, steps)
  if (!best.itemsLeft) return best
  for (let gainFirst = 1; gainFirst <= MAX_GAIN_FIRST; gainFirst++) {
    const plan = simulateTrashOrder(snapshot, gainFirst, steps)
    if (plan.allItemsDay < best.allItemsDay) best = plan
  }
  return best
}

// ── Rando Island ─────────────────────────────────────────────────────────────

export function getRandoShop(snapshot) {
  const islands = snapshot?.islands
  const upgrades = randoShopMap.map(item => {
    const level = islands?.randoLevels?.[item.optIndex] ?? 0
    return {
      ...item,
      level,
      bonus: level * item.per,
      cost: getRepeatCost(item, level),
    }
  })
  return {
    upgrades,
    talent: { ...RANDO_TALENT, owned: isStarTalentOwned(snapshot, RANDO_TALENT.id) },
  }
}

// Cheapest bottle buy on Rando Island (book only while not owned)
export function getCheapestRandoCost(snapshot) {
  const { upgrades, talent } = getRandoShop(snapshot)
  const costs = upgrades.map(item => item.cost)
  if (!talent.owned) costs.push(talent.cost)
  return Math.min(...costs)
}

// ── Crystal Island ───────────────────────────────────────────────────────────

export function getCrystalMobs(days) {
  if (!(days > 0)) return 0
  return Math.ceil(days < CRYSTAL_MAX_DAYS ? 1 + 2 * days : Math.sqrt(16 * days))
}

// ── Shimmer Island ───────────────────────────────────────────────────────────

// Shim Lantern: shimmer bonuses × (1 + artifact bonus), max 4x
export function getShimmerMulti(snapshot) {
  return Math.max(1, Math.min(SHIMMER_MAX_MULTI, 1 + getArtifactBonus(snapshot?.sailing, 'The Shim Lantern')))
}

export function getShimmerShop(snapshot) {
  const islands = snapshot?.islands
  const multi = getShimmerMulti(snapshot)
  return shimmerShopMap.map((item, i) => {
    const level = islands?.shimmerLevels?.[i] ?? 0
    return {
      ...item,
      level,
      bonus: level * multi,
      cost: 1 + Math.floor(level / item.divider),
    }
  })
}

// ── Fractal Island ───────────────────────────────────────────────────────────

export function getFractalMilestones(islands) {
  const hours = islands?.fractalHours ?? 0
  return fractalBonusMap.map((bonus, i) => {
    const previous = i === 0 ? 0 : fractalBonusMap[i - 1].hours
    return {
      ...bonus,
      reached: hours >= bonus.hours,
      hoursLeft: Math.max(0, bonus.hours - hours),
      // Progress within this step (from the previous milestone)
      progress: Math.max(0, Math.min(1, (hours - previous) / (bonus.hours - previous))),
    }
  })
}

// Master of Nothing odds: chance an account would have it by now = 1 - (1 - p)^hours rolled.
// Returns { owned, hoursRolled, chanceByNow, halfwayHours (50% of accounts have it) }
export function getNothingTrophyOdds(snapshot) {
  const hours = snapshot?.islands?.fractalHours ?? 0
  const hoursRolled = Math.max(0, hours - NOTHING_TROPHY.startHours)
  const missChance = 1 - NOTHING_TROPHY.chancePerHour
  return {
    owned: (snapshot?.droppedTrophies ?? []).includes(NOTHING_TROPHY.rawName),
    hoursRolled,
    chanceByNow: 1 - Math.pow(missChance, hoursRolled),
    halfwayHours: Math.ceil(Math.log(0.5) / Math.log(missChance)) + NOTHING_TROPHY.startHours,
  }
}
