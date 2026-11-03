import {
  lampWishes,
  bellRingBonuses,
  harpStringTypes,
  harpNoteNames,
  monumentBonusText,
  monumentBases,
  jarCollectibles,
  denAmplifiers,
  denAmpMax,
  denRecommendedSetup,
  wellSedimentCapBonus,
  wellSedimentNames,
  monumentHourReqs,
  monumentHourRewards,
  bellMethods,
  gambitBonuses,
  jarTypes,
  gambitTrials,
  templeTorchBonuses,
  fountainUpgrades,
  lairUpgrades,
  lairShapeNames,
} from '../data'
import {
  getMonumentBonus,
  getMonumentMultiplier,
  applyMonumentFountain,
  getGambitPoints,
  getGambitBasePoints,
  getGambitTrialPoints,
  getGambitPointsMulti,
  getSummoningDoublers,
  getFountainBonus,
  getGlunkoBonus,
  getLampBonus,
  getLampResourceBonus,
} from './cavernUtils'
import {
  HOLE_EXTRA,
  LAYER_CAVERNS,
  formatHoleNumber,
  fillHoleText,
  getLayerReq,
  getLayerEfficiency,
  getJarBonus,
  getStudyBonus,
  getWishCost,
  getHoleResourceImage,
  getMajikBonus,
  getUnlockedCaverns,
} from './holeUtils'
import { getMeasurementTotal } from './measureUtils'
import { HARP_GOALS, getHarpBestSetup } from './harpOptimizer'
import { getGemShopPurchases } from './gemShopUtils'
import { getStampBonusByEffect } from './stampUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { isSuperbitUnlocked, getPaletteBonus } from './gamingUtils'
import { getExoticBonus } from './exoticUtils'
import { isMeritocracyBonusSelected } from './voteUtils'
import { getArcadeBonus } from './arcadeUtils'

// The Hole caverns (W5): one section per cavern for components/Hole/CavernTab and its panels.
// Formulas reimplemented from IdleonToolbox parsers/world-5/caverns/*.ts.

const log10 = value => Math.log(Math.max(value, 1)) / 2.30259 // game lavaLog

// Engineer schematic bonus: its default value once built (Toolbox getSchematicBonus default case)
function schematicBuilt(snapshot, t) {
  return Number(snapshot?.caverns?.schematics?.[t]) === 1
}

function schematic(snapshot, t, value) {
  return schematicBuilt(snapshot, t) ? value : 0
}

// ── Gambit bonuses (Toolbox gambit.ts) ──

export function getGambitPointReq(index) {
  return 2e3 + 1e3 * (index + 1) * (1 + index / 5) * 1.26 ** index
}

export function getGambitBonus(snapshot, index) {
  const bonus = gambitBonuses[index]
  const points = getGambitPoints(snapshot)
  if (!bonus || points < getGambitPointReq(index)) return 0
  if (index === 0) return Math.max(1, Math.ceil(Math.log2(Math.max(points, 1)) - 8 + (log10(points) - 1)))
  return bonus.x1 === 1 ? bonus.x0 * log10(points) : bonus.x0
}

// ── The Well (cavern 0) ──

const SEDIMENT_COUNT = 10
const BUCKET_SCHEMATICS = [3, 4, 5, 6, 7, 8, 9, 10, 11] // 2nd ... 10th bucket
const GOLDEN_BUCKET_FOUNTAIN = [0, 15] // Golden Bucket Boost: 1st golden bucket + its fill multi
const SECOND_GOLDEN_SCHEMATIC = 104 // Anotha One
const WELL_GEM_SHOP = 2 // Resource Boost
const WELL_BELL_RING = 0
const WELL_MEASUREMENT = 5
const WELL_JAR = 8
const WELL_GLUNKO = 14

// Bar outline colour tiers (HoleWellBar0-5: brown, silver, gold, blue, red, green). Read off Eli's in-game bars
// (Nov 2026): each colour grows across the outline over 20 expansions, green is full at 114.
export const WELL_BAR_TIERS = ['brown', 'silver', 'gold', 'blue', 'red', 'green']
const WELL_TIER_START = 14
const WELL_TIER_SIZE = 20

export function getWellBarTier(expansions) {
  const progress = (expansions - WELL_TIER_START) / WELL_TIER_SIZE
  if (progress < 0) return { tier: 0, previous: 0, fill: 1 }
  const tier = Math.min(WELL_BAR_TIERS.length - 1, Math.floor(progress) + 1)
  if (tier === WELL_BAR_TIERS.length - 1 && progress >= tier) return { tier, previous: tier, fill: 1 }
  return { tier, previous: tier - 1, fill: progress - (tier - 1) }
}

// game: Holes("OpalCost") for the Well's Gravel trade (Toolbox getOpalCost), Holes[11][9] = opals bought
export function getWellOpalCost(snapshot) {
  const bought = snapshot?.caverns?.extra?.[9] ?? 0
  const base = (1 + 3 * bought + bought ** 2) * (3.5 + bought / 10) ** bought
  if (base >= 1e9) return base
  if (bought === 1) return 6
  if (bought === 2) return 60
  return Math.floor(base)
}

// Per-bucket fill rate before the golden multi (Toolbox getBucketFillRate)
export function getBucketFillRate(snapshot) {
  const caverns = snapshot?.caverns ?? {}
  const extra = caverns.extra ?? []
  const expansions = (caverns.sedimentMulti ?? []).reduce((sum, n) => sum + n, 0)
  const flat = schematic(snapshot, 58, 5 * log10(extra[32] ?? 0))
    + schematic(snapshot, 59, ((extra[33] ?? 0) + (extra[34] ?? 0) + (extra[35] ?? 0) + (extra[36] ?? 0)) / 100 * 10)
  const base = 10 + schematic(snapshot, 1, 5) + schematic(snapshot, 26, 5)
  const stamp = getStampBonusByEffect(snapshot, '+{% more Resources from all Caverns')
  return flat + base
    * (1 + schematic(snapshot, 14, expansions * (20 + getStudyBonus(snapshot, 0))) / 100)
    * (1 + getGemShopPurchases(snapshot?.gemShop, WELL_GEM_SHOP) / 2)
    * (1 + getMonumentBonus(snapshot, 0, 1) / 100)
    * (1 + getLampResourceBonus(snapshot) / 100)
    * (1 + getGambitBonus(snapshot, 3) / 100)
    * Math.max(1, schematic(snapshot, 15, 1.1 ** (extra[1] ?? 0)))
    * (1 + getMeasurementTotal(snapshot, WELL_MEASUREMENT) / 100)
    * (1 + ((caverns.bellRingLevels?.[WELL_BELL_RING] ?? 0) * bellRingBonuses[WELL_BELL_RING].perLevel) / 100)
    * (1 + getJarBonus(snapshot, WELL_JAR) / 100)
    * (1 + (Number(stamp?.value) || 0) / 100)
    * (1 + getGlunkoBonus(snapshot, WELL_GLUNKO) / 100)
}

export function getWell(snapshot) {
  const caverns = snapshot?.caverns ?? {}
  const resources = caverns.holeResources ?? []
  const sediments = Array.from({ length: SEDIMENT_COUNT }, (_, index) => {
    const current = resources[index] ?? 0
    const expansions = caverns.sedimentMulti?.[index] ?? 0
    const max = 100 * 1.5 ** expansions * (1 + (wellSedimentCapBonus[index] ?? 0) / 100)
    return {
      index,
      name: wellSedimentNames[index],
      current,
      max,
      locked: current < 0, // negative = rock layer still to dig through
      expansions,
      ...getWellBarTier(expansions),
    }
  })
  const rockIndex = sediments.findIndex(sediment => sediment.locked)
  const bucketCount = 1 + BUCKET_SCHEMATICS.filter(t => schematicBuilt(snapshot, t)).length
  const goldenBoost = getFountainBonus(caverns, ...GOLDEN_BUCKET_FOUNTAIN)
  const goldenCount = Math.round(Math.min(1, Math.max(0, goldenBoost)) + (schematicBuilt(snapshot, SECOND_GOLDEN_SCHEMATIC) ? 1 : 0))
  const goldenMulti = goldenCount > 0 ? Math.max(1, 1 + goldenBoost / 100) : 1
  const rate = getBucketFillRate(snapshot)
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const sediment = caverns.wellBuckets?.[index] ?? 0
    const golden = index < goldenCount
    return {
      index,
      sediment,
      sedimentName: wellSedimentNames[sediment] ?? `Sediment ${sediment + 1}`,
      rocks: sediment === rockIndex,
      golden,
      rate: golden ? rate * goldenMulti : rate,
    }
  })
  return {
    sediments,
    buckets,
    goldenMulti,
    totalRate: buckets.reduce((sum, bucket) => sum + bucket.rate, 0),
    opalCost: getWellOpalCost(snapshot),
    gravel: Math.max(0, resources[0] ?? 0),
    expandWhenFull: Number(caverns.extra?.[10]) === 1,
    expansions: sediments.reduce((sum, sediment) => sum + sediment.expansions, 0),
  }
}

// ── The Den (cavern 2) ──

const DEN_MULTI_PER_LEVEL = [11, 9, 8, 10, 8, 7, 10, 7] // % score multi per charge, by amp
const DEN_AMP_SCHEMATICS = [16, 17, 18, 19, 20, 21, 22] // each unlocks one more amplifier
const DEN_EVERY_10_SCHEMATIC = 23 // +0.5x score multi per 10 charges

// Each amp's effect at its charge (Toolbox getAmpDebuff), in the units its text uses
function getAmpValue(t, level) {
  switch (t) {
    case 0: return (5e3 + 800 * level) * 1.25 ** level
    case 1: return (6e3 + 4e3 * level) * 1.3 ** level
    case 2: return 5 * level
    case 3: return (1 + level) * 1.05 ** level
    case 4: return (1 + level) * 1.07 ** level
    case 5: return 1 + level
    case 6: return 4 * level
    default: return level / 10
  }
}

export function getDen(snapshot) {
  const caverns = snapshot?.caverns ?? {}
  const levels = denAmplifiers.map((_, t) => Number(caverns.denAmplifiers?.[t]) || 0)
  const charges = levels.reduce((sum, level) => sum + level, 0)
  const multi = 1
    + 0.5 * schematic(snapshot, DEN_EVERY_10_SCHEMATIC, 1) * Math.floor(charges / 10)
    + levels.reduce((sum, level, t) => sum + DEN_MULTI_PER_LEVEL[t] * level, 0) / 100
  const opals = caverns.opalsPerCavern?.[2] ?? 0
  const ampsOwned = 1 + DEN_AMP_SCHEMATICS.filter(t => schematicBuilt(snapshot, t)).length
  return {
    bestScore: caverns.extra?.[HOLE_EXTRA.denBestScore] ?? 0,
    nextOpal: 12 * (150 + (30 + opals) * opals) * 1.5 ** opals,
    multi,
    ampsOwned,
    amps: denAmplifiers.map((amp, t) => {
      const value = getAmpValue(t, levels[t])
      return {
        ...amp,
        index: t,
        level: levels[t],
        max: denAmpMax[t],
        owned: t < ampsOwned,
        text: amp.description.replace('{', formatHoleNumber(value)),
        recommended: denRecommendedSetup[t],
      }
    }),
  }
}

// ── Monuments (Bravery 3, Justice 9, Wisdom 12) ──

const MONUMENT_SELF_MULTI = 9 // bonus 9 boosts its own monument (only the fountain applies to it)
const MILESTONE_PERCENTS = [50, 75, 90, 95, 99]
const MONUMENT_DECAY = 250 // capped bonuses: LV / (250 + LV) of the cap

// Monument t's 10 bonuses: LV, value and, for the capped ones (base >= 30), the cap and breakpoints
export function getMonumentBonuses(snapshot, t) {
  const caverns = snapshot?.caverns
  return monumentBonusText.slice(10 * t, 10 * t + 10).map((text, i) => {
    const level = Number(caverns?.braveryBonuses?.[10 * t + i]) || 0
    const value = getMonumentBonus(snapshot, t, i)
    const base = monumentBases[10 * t + i] ?? 0
    const capped = base >= 30
    const capMulti = i === MONUMENT_SELF_MULTI ? applyMonumentFountain(1, caverns, t) : getMonumentMultiplier(caverns, t)
    return {
      index: i,
      level,
      value,
      text: fillHoleText(text, value),
      dim: level === 0,
      cap: capped ? base * capMulti : null,
      capText: capped ? fillHoleText(text, base * capMulti) : null,
      progress: capped ? level / (MONUMENT_DECAY + level) : null,
      milestones: capped
        ? MILESTONE_PERCENTS.map(percent => {
          const milestoneLevel = Math.ceil((percent * MONUMENT_DECAY) / (100 - percent))
          return { percent, level: milestoneLevel, reached: level >= milestoneLevel }
        })
        : null,
    }
  })
}

const BRAVERY_STUDY = 3 // min damage as % of max (caps at 32%)
const BRAVERY_DAMAGE_SCHEMATIC = 24
const BRAVERY_MEASUREMENT = 1
const MONUMENT_REWARD_LEGEND = 27
const MONUMENT_REWARD_MERIT = 7
const MONUMENT_INFIMULTI = 31 // superbit

// Reward Multi of monument t (Toolbox getMonumentMultiReward); missing = parts we can't read
export function getMonumentRewardMulti(snapshot, t) {
  const time = snapshot?.caverns?.extra?.[11 + t] ?? 0
  const legend = getLegendTalentBonus(MONUMENT_REWARD_LEGEND, getLegendTalentLevel(snapshot?.legendTalents, MONUMENT_REWARD_LEGEND))
  const days = 2
    + schematic(snapshot, 70, 2)
    + schematic(snapshot, 96, 2)
    + 10 * (isSuperbitUnlocked(snapshot?.gaming, MONUMENT_INFIMULTI) ? 1 : 0)
    + (t === 1 ? 14 * (getStudyBonus(snapshot, 9) > 0 ? 1 : 0) : 0)
    + legend / 24
  const maxLinear = 86400 * days
  const value = (Math.min(time, maxLinear) / 72e3 + ((1 + Math.max(0, time - maxLinear) / 72e3) ** 0.3 - 1))
    * (1 + legend / 100)
  const missing = isMeritocracyBonusSelected(snapshot?.voteBallot, MONUMENT_REWARD_MERIT)
    ? ['Meritocracy reward bonus (winning pick this week)']
    : []
  return { value, missing }
}

export function getBravery(snapshot) {
  const caverns = snapshot?.caverns ?? {}
  const hours = caverns.monuments?.[0] ?? 0
  const unlocked = caverns.monuments?.[1] ?? 0
  const has = i => (unlocked > i ? 1 : 0)
  const damageSteps = Math.floor(hours / 6) * schematic(snapshot, BRAVERY_DAMAGE_SCHEMATIC, 1)
  const max = (25 + 10 * damageSteps) * (1 + getMeasurementTotal(snapshot, BRAVERY_MEASUREMENT) / 100)
  const min = 3 + damageSteps + (getStudyBonus(snapshot, BRAVERY_STUDY) / 100) * max
  const damageText = `${Math.floor(min).toLocaleString()}~${Math.floor(max).toLocaleString()}`
  const nextIndex = monumentHourReqs.findIndex(req => hours < req)
  return {
    hours,
    damage: { min, max },
    swords: Math.round(Math.min(9, 3 + 2 * has(1) + has(3) + has(5) + has(7))),
    rethrows: 5 * has(2) + 10 * has(6),
    retellings: has(4),
    opalChance: Math.min(0.5, 0.5 ** (caverns.opalsPerCavern?.[3] ?? 0) * (1 + getMonumentBonus(snapshot, 0, 5) / 100)),
    reward: getMonumentRewardMulti(snapshot, 0),
    unlocks: monumentHourRewards[0].map((text, i) => ({
      hours: monumentHourReqs[i],
      text: text.replace('{~}', damageText),
      reached: unlocked > i,
    })),
    nextUnlock: nextIndex >= 0 ? { hours: monumentHourReqs[nextIndex], text: monumentHourRewards[0][nextIndex] } : null,
    bonuses: getMonumentBonuses(snapshot, 0),
  }
}

// ── Justice (cavern 9) ── (Toolbox justice.ts)

const JUSTICE_COINS_SCHEMATIC = 61 // + log2(hours) starting coins
const JUSTICE_OPAL_MONUMENT = 5
const JUSTICE_STUDY = 9

export function getJustice(snapshot) {
  const caverns = snapshot?.caverns ?? {}
  const hours = caverns.monuments?.[2] ?? 0
  const unlocked = caverns.monuments?.[3] ?? 0
  const has = i => (unlocked > i ? 1 : 0)
  const coins = Math.round((5 + Math.log2(Math.max(hours, 1)) * schematic(snapshot, JUSTICE_COINS_SCHEMATIC, 1))
    * (0.5 * has(3) + 1.5 * has(6) + 1))
  const nextIndex = monumentHourReqs.findIndex(req => hours < req)
  return {
    hours,
    coins,
    health: Math.round(1 + has(1) + has(4) + 2 * has(7)),
    popularity: Math.round(3 + 7 * has(5)),
    dismissals: Math.round(has(2) + has(4) + 2 * has(7)),
    opalChance: Math.min(0.5, 0.5 ** (caverns.opalsPerCavern?.[9] ?? 0)
      * (1 + getMonumentBonus(snapshot, 1, JUSTICE_OPAL_MONUMENT) / 100)
      * (1 + getStudyBonus(snapshot, JUSTICE_STUDY) / 100)),
    reward: getMonumentRewardMulti(snapshot, 1),
    unlocks: monumentHourRewards[1].map((text, i) => ({
      hours: monumentHourReqs[i],
      text: text.replace('$', coins.toLocaleString()),
      reached: unlocked > i,
    })),
    nextUnlock: nextIndex >= 0 ? { hours: monumentHourReqs[nextIndex], text: monumentHourRewards[1][nextIndex] } : null,
    bonuses: getMonumentBonuses(snapshot, 1),
  }
}

// ── The Bell (cavern 4) ──

export const BELL_ACTIONS = ['Ring', 'Ping', 'Clean', 'Renew']
const BELL_BASE_RATE = 10
const BELL_MONUMENT = 7 // Bravery: Bell Ring & Ping Rate
const BELL_MEASUREMENT = 2
const BELL_JARS = [11, 36]
const BELL_METHOD_SCHEMATIC = 45 // 1.1x method bonuses per 25 method LVs
const BELL_CLEAN_SCHEMATIC = 43

// Which methods boost each bell (Toolbox getBellExpMultipliers)
const BELL_METHODS_FOR = [[0, 2, 4, 5], [3], [1], []]

function getBellMethodBoost(snapshot) {
  if (!schematicBuilt(snapshot, BELL_METHOD_SCHEMATIC)) return 0
  const total = (snapshot?.caverns?.bellImprovements ?? []).reduce((sum, n) => sum + n, 0)
  return Math.max(1, 1.1 ** Math.floor(total / 25))
}

// Improvement method t's bonus (Toolbox getBellMethodQuantity)
function getBellMethodValue(snapshot, t) {
  const level = snapshot?.caverns?.bellImprovements?.[t] ?? 0
  return 2 * level * Math.max(1, getBellMethodBoost(snapshot) * (bellMethods[t]?.boost ?? 0))
}

export function getBellRate(snapshot, t) {
  if (t === 3) return BELL_BASE_RATE
  const methods = 1 + BELL_METHODS_FOR[t].reduce((sum, m) => sum + getBellMethodValue(snapshot, m), 0) / 100
  if (t === 2) return BELL_BASE_RATE * methods
  const shared = (1 + getMonumentBonus(snapshot, 0, BELL_MONUMENT) / 100)
    * (1 + getMeasurementTotal(snapshot, BELL_MEASUREMENT) / 100)
  if (t === 1) return BELL_BASE_RATE * shared * methods
  const jars = BELL_JARS.reduce((product, jar) => product * (1 + getJarBonus(snapshot, jar) / 100), 1)
  return BELL_BASE_RATE * shared * methods * jars
}

// EXP needed for the next use (Toolbox getBellExpReq); count = that bell's use counter
function getBellReq(t, count) {
  if (t === 0) return (5 + 3 * count) * 1.05 ** count
  if (t === 1) return (10 + 10 * count + count ** 2.5) * 1.75 ** count
  if (t === 2) return 100 * 3 ** count
  return 25
}

// Uses banked right now (Toolbox getBellReadyUses): Ring/Ping raise their req each use
function getBellReadyUses(t, exp, count) {
  let req = getBellReq(t, count)
  if (!(req > 0)) return 0
  if (t >= 2) return Math.floor(exp / req)
  let uses = 0
  let left = exp
  let used = count
  while (left >= req && uses < 1000) {
    left -= req
    uses++
    used++
    req = getBellReq(t, used)
  }
  return uses
}

// ── Ring or Ping? ──
// Only the charging bell action fills (HOLE_EXTRA.bellCharging), so the choice is Ring (+1 LV to a random ring
// bonus) or Ping (+1 opal). swapTo = the other one when Ring or Ping is charging and the other is faster.
// Both reqs grow with their use counter (Ring ×1.05 per ring, Ping ×1.75 per ping) and a Renew resets the ring
// counter (Eli: Ring is almost instant right after a Renew). Compare the time one full Ring vs one full Ping takes
// at the current rates; within EVEN_MARGIN either way counts as a toss-up.
const RING = 0
const PING = 1
const EVEN_MARGIN = 0.1
const MAX_RING_SEARCH = 100000

export function getBellRingOrPing(snapshot) {
  const related = snapshot?.caverns?.bellRelated ?? []
  const ringRate = getBellRate(snapshot, RING)
  const pingRate = getBellRate(snapshot, PING)
  const rings = related[2 * RING + 1] ?? 0
  const pings = related[2 * PING + 1] ?? 0
  const ringHours = ringRate > 0 ? getBellReq(RING, rings) / ringRate : Infinity
  const pingHours = pingRate > 0 ? getBellReq(PING, pings) / pingRate : Infinity
  // The ring count where a Ring starts taking longer than a Ping does now
  let crossover = 0
  while (crossover < MAX_RING_SEARCH && getBellReq(RING, crossover) / ringRate <= pingHours) crossover++
  // How many pings in a row stay faster than the current Ring (pings only get slower: nothing resets them)
  let pingsAhead = 0
  while (pingsAhead < MAX_RING_SEARCH && getBellReq(PING, pings + pingsAhead) / pingRate < ringHours) pingsAhead++
  const ratio = ringHours / pingHours
  const pick = Math.abs(ratio - 1) <= EVEN_MARGIN ? 'Either' : ratio < 1 ? 'Ring' : 'Ping'
  const charging = snapshot?.caverns?.extra?.[HOLE_EXTRA.bellCharging] ?? null
  const chargingName = charging === RING ? 'Ring' : charging === PING ? 'Ping' : null
  return {
    ringHours,
    pingHours,
    nextPingHours: pingRate > 0 ? getBellReq(PING, pings + 1) / pingRate : Infinity,
    rings,
    pings,
    crossover,
    pingsAhead,
    pick,
    charging,
    swapTo: chargingName && pick !== 'Either' && pick !== chargingName ? pick : null,
  }
}

// Method cost owned amounts: coins, Well sediment 3, bits, Harp note 14, particles, rupie 25
function getBellMethodOwned(snapshot, t) {
  const resources = snapshot?.caverns?.holeResources ?? []
  const currencies = snapshot?.currencies
  return [
    currencies?.money,
    Math.max(0, resources[3] ?? 0),
    currencies?.bits,
    Math.max(0, resources[14] ?? 0),
    currencies?.particles,
    Math.max(0, resources[25] ?? 0),
  ][t]
}

const BELL_METHOD_COST_IMAGES = [
  'images/hole/costs/coins.png',
  getHoleResourceImage(3),
  'images/hole/costs/bits.png',
  getHoleResourceImage(14),
  'images/hole/costs/particles.png',
  getHoleResourceImage(25),
]

export function getBell(snapshot) {
  const caverns = snapshot?.caverns ?? {}
  const related = caverns.bellRelated ?? []
  const cleanCount = related[5] ?? 0
  const methodsOwned = Math.min(bellMethods.length, cleanCount + 1)
  return {
    bells: BELL_ACTIONS.map((name, t) => {
      const exp = related[2 * t] ?? 0
      const count = related[2 * t + 1] ?? 0
      return {
        name,
        index: t,
        rate: getBellRate(snapshot, t),
        exp,
        req: getBellReq(t, count),
        readyUses: getBellReadyUses(t, exp, count),
      }
    }),
    rings: related[1] ?? 0,
    pings: related[3] ?? 0,
    methodsOwned,
    newMethodChance: Math.min(
      (0.6 / Math.max(1, 0.8 * cleanCount + 1)) * (1 + (schematic(snapshot, BELL_CLEAN_SCHEMATIC, 25) * (caverns.extra?.[31] ?? 0)) / 100),
      0.9,
    ),
    ringBonuses: bellRingBonuses.map((bonus, i) => {
      const level = caverns.bellRingLevels?.[i] ?? 0
      return { index: i, level, text: fillHoleText(bonus.description, level * bonus.perLevel), dim: level === 0 }
    }),
    methods: bellMethods.map((method, t) => {
      const level = caverns.bellImprovements?.[t] ?? 0
      const growth = t === 0 ? 1.25 : t === 2 ? 1.5 : 1.1
      return {
        index: t,
        level,
        owned: t < methodsOwned,
        text: fillHoleText(method.description, getBellMethodValue(snapshot, t)),
        cost: method.baseCost * growth ** level,
        have: getBellMethodOwned(snapshot, t),
        costImage: BELL_METHOD_COST_IMAGES[t],
      }
    }),
  }
}

// ── The Harp (cavern 5) ── (Toolbox the-harp.ts)
// Strings sit on the harp (Holes[20] = string type per slot); plucking a string makes notes and gives its type EXP.

const HARP_NOTE_COUNT = 10
const HARP_TUNED_NOTE = 21 // Holes[11][21]: the note the harp is tuned to (2 = Bass, matched Eli's screen)
const HARP_NOTES_KNOWN = 20 // Holes[11][20]: notes learned beyond the first
const HARP_POWER_STRING = 2
const HARP_NOTE_STRINGS = [0, 3, 5] // + LV bonus % Harp Note Gain
const HARP_OPAL_STRING = 1
const HARP_EXP_STRING = 4
const HARP_SLOT_MAJIK = 1 // hole majik String Is Strung
const HARP_SLOT_SCHEMATICS = [32, 33, 34, 35, 36]
const HARP_VARIETY_SCHEMATIC = 38 // +30% per unique string type on the harp
const HARP_ALL_SCHEMATIC = 39 // +15%
const HARP_DOMINO_SCHEMATIC = 37 // +20% per string already plucked in the strum
const HARP_HIVE_SCHEMATIC = 41 // 1.1x per Hive layer destroyed
const HARP_MEASUREMENTS = [3, 8]
const HARP_EXP_MEASUREMENT = 6
const HARP_BELL_RING = 2
const HARP_JAR = 20 // Crimson Spade
const HARP_MONUMENT = 1 // Justice: x Harp Note Gain
const HARP_EXP_STUDY = 5
const HARP_EXP_FOUNTAIN = [1, 15]
const MAX_HARP_STRINGS = 15
// What each string type makes: note step (notes / 4^step) or a special readout
const HARP_STRING_OUTPUT = ['note0', 'opal', null, 'note1', 'exp', 'note2']

export function getBellRingBonus(snapshot, t) {
  return (snapshot?.caverns?.bellRingLevels?.[t] ?? 0) * (bellRingBonuses[t]?.perLevel ?? 0)
}

function getHarpStringBonus(snapshot, t) {
  return (harpStringTypes[t]?.perLevel ?? 0) * (snapshot?.caverns?.harpRelated?.[2 * t] ?? 0)
}

// game: StringSlots
export function getHarpStringSlots(snapshot) {
  const majik = getMajikBonus(0, HARP_SLOT_MAJIK, Number(snapshot?.caverns?.holeMajiks?.[HARP_SLOT_MAJIK]) || 0)
  const built = HARP_SLOT_SCHEMATICS.filter(t => schematicBuilt(snapshot, t)).length
  return Math.min(MAX_HARP_STRINGS, Math.round(1 + majik + built))
}

// String EXP for the next LV (Toolbox getStringExpReq)
function getStringExpReq(level) {
  return (4 + level) * 1.15 ** level
}

// Notes one pluck makes at the current power (game HarpNoteProduced), divided by 4^step
function getHarpNotesPerPluck(snapshot, allBonus, power, step, tomePoints) {
  const extra = snapshot?.caverns?.extra ?? []
  const stamp = getStampBonusByEffect(snapshot, '+{% more Resources from all Caverns')
  const noteStrings = HARP_NOTE_STRINGS.reduce((sum, t) => sum + getHarpStringBonus(snapshot, t), 0)
  const measurements = HARP_MEASUREMENTS
    .reduce((product, t) => product * (1 + getMeasurementTotal(snapshot, t, tomePoints) / 100), 1)
  return (power / 100)
    * allBonus
    * Math.max(1, schematic(snapshot, HARP_HIVE_SCHEMATIC, 1) * 1.1 ** (extra[3] ?? 0))
    * (1 + noteStrings / 100)
    * (1 + getHarpStringBonus(snapshot, HARP_OPAL_STRING) / 100)
    * (1 + getLampResourceBonus(snapshot) / 100)
    * (1 + getGambitBonus(snapshot, 3) / 100)
    * (1 + getMonumentBonus(snapshot, 1, HARP_MONUMENT) / 100)
    * measurements
    * (1 + getBellRingBonus(snapshot, HARP_BELL_RING) / 100)
    * (1 + getGemShopPurchases(snapshot?.gemShop, WELL_GEM_SHOP) / 2)
    * (1 + getJarBonus(snapshot, HARP_JAR) / 100)
    * (1 + (Number(stamp?.value) || 0) / 100)
    * (1 + getGlunkoBonus(snapshot, WELL_GLUNKO) / 100)
    / 4 ** step
}

export function getHarp(snapshot, tomePoints) {
  const caverns = snapshot?.caverns ?? {}
  const extra = caverns.extra ?? []
  const related = caverns.harpRelated ?? []
  const power = extra[HOLE_EXTRA.harpPower] ?? 0
  const slots = getHarpStringSlots(snapshot)
  const strings = Array.from({ length: slots }, (_, slot) => Number(caverns.harpStringNotes?.[slot]) || 0)
  const uniqueTypes = new Set(strings).size
  // HarpStringAllBonus for the first string of a strum (Domino Effect adds more for later strings)
  const allBonus = 1 + (schematic(snapshot, HARP_ALL_SCHEMATIC, 15) + schematic(snapshot, HARP_VARIETY_SCHEMATIC, 30) * uniqueTypes) / 100
  const opalChance = Math.min(1, allBonus * (1 - (1 - 0.2 ** ((caverns.opalsPerCavern?.[5] ?? 0) + 1)) ** Math.max(1, power / 100)))
  const expGain = (1 + ((Number(caverns.studyLevels?.[HARP_EXP_STUDY]) || 0) >= 1 ? 1 : 0))
    * (power / 100)
    * allBonus
    * (1 + getHarpStringBonus(snapshot, HARP_EXP_STRING) / 100)
    * (1 + getMeasurementTotal(snapshot, HARP_EXP_MEASUREMENT, tomePoints) / 100)
    * (1 + getGemShopPurchases(snapshot?.gemShop, WELL_GEM_SHOP) / 2)
    * (1 + getFountainBonus(caverns, ...HARP_EXP_FOUNTAIN) / 100)
  const notesKnown = Math.min(HARP_NOTE_COUNT, 1 + (extra[HARP_NOTES_KNOWN] ?? 0))
  const learned = extra[HARP_NOTES_KNOWN] ?? 0
  const tuned = extra[HARP_TUNED_NOTE] ?? 0
  const output = (t) => {
    const kind = HARP_STRING_OUTPUT[t]
    if (kind === 'opal') return `${formatHoleNumber(opalChance * 100)}`
    if (kind === 'exp') return formatHoleNumber(expGain)
    if (kind) return formatHoleNumber(getHarpNotesPerPluck(snapshot, allBonus, power, Number(kind.slice(4)), tomePoints))
    return '?'
  }
  const unlocked = harpStringTypes.map((_, t) => t).filter(t => (related[2 * t] ?? 0) > 0)
  return {
    power,
    // Inputs for utils/harpOptimizer.js (Best setups)
    optimizer: {
      slots,
      unlocked,
      levels: harpStringTypes.map((_, t) => related[2 * t] ?? 0),
      notesKnown,
      built: {
        stringy: schematicBuilt(snapshot, HARP_ALL_SCHEMATIC),
        domino: schematicBuilt(snapshot, HARP_DOMINO_SCHEMATIC),
        variety: schematicBuilt(snapshot, HARP_VARIETY_SCHEMATIC),
      },
    },
    powerRate: 200 * (1 + getHarpStringBonus(snapshot, HARP_POWER_STRING) / 100),
    slots,
    strings,
    uniqueTypes,
    opalChance,
    expGain,
    tuned,
    notesKnown,
    newNoteCost: notesKnown < HARP_NOTE_COUNT ? 150 * (1 + learned) ** 1.5 * 4.5 ** learned : null,
    notes: harpNoteNames.map((name, i) => ({
      index: i,
      name,
      owned: Math.max(0, caverns.holeResources?.[10 + i] ?? 0),
      known: i < notesKnown,
      tuned: i === tuned,
      image: getHoleResourceImage(10 + i),
    })),
    types: harpStringTypes.map((type, t) => {
      const level = related[2 * t] ?? 0
      const exp = related[2 * t + 1] ?? 0
      const req = getStringExpReq(level)
      const bonus = getHarpStringBonus(snapshot, t)
      return {
        index: t,
        letter: type.letter,
        level,
        exp,
        req,
        progress: req > 0 ? Math.min(1, exp / req) : 0,
        unlocked: level > 0,
        onHarp: strings.filter(note => note === t).length,
        image: `images/hole/harp/string_${t}.png`,
        text: type.description
          .replace('{', output(t))
          .replace('|', formatHoleNumber(1 + bonus / 100))
          .replace('}', formatHoleNumber(bonus)),
      }
    }),
  }
}

// Is the harp on a best setup? Either goal counts (Notes or Level strings). The order matters (Domino Effect), but
// setups within HARP_SETUP_MATCH of the best count as a match so equal-value swaps (D and E, say) never nag.
export const HARP_SETUP_MATCH = 0.995

export function getHarpSetupCheck(snapshot) {
  const harp = getHarp(snapshot)
  if (!harp.optimizer.unlocked.length || !harp.slots) return null
  const goals = HARP_GOALS.map(goal => ({
    ...goal,
    share: getHarpBestSetup(goal.id, harp.strings, harp.optimizer)?.current ?? 0,
  }))
  const closest = goals.reduce((best, goal) => (goal.share > best.share ? goal : best))
  return { goals, closest, matches: closest.share >= HARP_SETUP_MATCH }
}

// ── The Lamp (cavern 6) ── (Toolbox the-lamp.ts)

const LAMP_UNLOCK_CAVERNS = 6
const LAMP_MEASUREMENT = 4
const LAMP_MAJIK = 2 // hole majik: + daily wishes
const LAMP_BELL_RING = 3
const LAMP_MONUMENT = 7 // Justice: more daily Lamp Wishes
const LAMP_STUDY = 6
const LAMP_UNAVAILABLE = 999 // wishes the game hasn't opened yet cost 999
// wish index → lampBonuses row its {, } and ~ come from
const LAMP_WISH_BONUS_ROW = { 4: 0, 6: 1, 8: 2, 10: 3 }
const LAMP_RESOURCE_WISH_INDEX = 7
// '|' in the game text = the option picked in the wish menu, which the save doesn't keep
const LAMP_WISH_CHOICES = {
  1: 'Pick one to reset: Conjuror PTS invested, all opals invested, Jar collectible enchantment LVs or all Summoning Doublers.',
  3: 'Pick the Bravery, Justice or Wisdom monument.',
}

// Daily wishes (Toolbox getWishPerDay): 0 until 6 caverns are unlocked
export function getLampWishesPerDay(snapshot, tomePoints) {
  if (getUnlockedCaverns(snapshot) < LAMP_UNLOCK_CAVERNS) return 0
  const majik = getMajikBonus(0, LAMP_MAJIK, Number(snapshot?.caverns?.holeMajiks?.[LAMP_MAJIK]) || 0)
  return 1 + (getMeasurementTotal(snapshot, LAMP_MEASUREMENT, tomePoints)
    + majik
    + getBellRingBonus(snapshot, LAMP_BELL_RING)
    + getMonumentBonus(snapshot, 1, LAMP_MONUMENT)
    + 100 * getStudyBonus(snapshot, LAMP_STUDY)) / 100
}

function lampWishText(snapshot, t, description) {
  const row = LAMP_WISH_BONUS_ROW[t]
  let text = description
  if (row != null) {
    const bonus = i => formatHoleNumber(Math.floor(getLampBonus(snapshot, row, i)))
    text = text.replace('{', bonus(0)).replace('}', bonus(1)).replace('~', bonus(2))
  }
  if (t === LAMP_RESOURCE_WISH_INDEX) {
    const resource = getLampResourceBonus(snapshot)
    text = text.replace('#', formatHoleNumber(1 + resource / 100)).replace('$', formatHoleNumber(1 + resource / 400))
  }
  return text
}

// Opal calculator: the next `count` opals from wish 2 (1000000 Opals), each one's cost and on which day the
// running total is covered (0 = with the wishes you have now, 1 = after one more day of wishes, ...).
// Assumes every wish goes to opals.
const LAMP_OPAL_WISH = 2

export function getLampOpalPlan(snapshot, tomePoints, count = 6) {
  const wishes = snapshot?.caverns?.extra?.[HOLE_EXTRA.lampWishes] ?? 0
  const perDay = getLampWishesPerDay(snapshot, tomePoints)
  const bought = Number(snapshot?.caverns?.wishesUsed?.[LAMP_OPAL_WISH]) || 0
  let total = 0
  return Array.from({ length: count }, (_, i) => {
    const cost = getWishCost(bought + i, LAMP_OPAL_WISH)
    total += cost
    const short = total - wishes
    return {
      number: bought + i + 1,
      cost,
      total,
      day: short <= 0 ? 0 : perDay > 0 ? Math.ceil(short / perDay) : null,
    }
  })
}

export function getLamp(snapshot, tomePoints) {
  const caverns = snapshot?.caverns ?? {}
  const wishes = caverns.extra?.[HOLE_EXTRA.lampWishes] ?? 0
  const perDay = getLampWishesPerDay(snapshot, tomePoints)
  // Each More Wishes (wish 0) rank shows one more wish on the Lamp (Eli: 9 ranks → wishes 0-9 visible)
  const moreWishes = Number(caverns.wishesUsed?.[0]) || 0
  return {
    wishes,
    perDay,
    list: lampWishes.map((wish, t) => {
      const uses = Number(caverns.wishesUsed?.[t]) || 0
      const hidden = t > moreWishes
      const unavailable = wish.x1 >= LAMP_UNAVAILABLE
      const cost = unavailable ? null : getWishCost(uses, t)
      const affordable = cost != null && wishes >= cost
      return {
        index: t,
        name: wish.name,
        image: `images/hole/lamp/wish_${t}.png`,
        text: lampWishText(snapshot, t, wish.description),
        choice: LAMP_WISH_CHOICES[t] ?? null,
        uses,
        cost,
        hidden,
        unavailable,
        maxed: !unavailable && cost == null,
        affordable,
        daysToAfford: cost == null || affordable || !(perDay > 0) ? null : (cost - wishes) / perDay,
      }
    }),
  }
}

// ── Generic details for caverns without their own panel yet ──
// { stats: [{ label, value, hint? }], progress?, list?: { title, items: [{ name?, level, text, dim? }] } }

// ── The Grotto (cavern 8): Gloomie schematics, +x% per colony defeated (Toolbox getSchematicBonus 46-48) ──

const GLOOMIE_ICON = 'images/mobs/trimmed/Gloomie_Mushroom.png'
const GLOOMIE_BONUSES = [
  { schematic: 46, name: 'Gloomie Lootie', perColony: 5, text: 'Drop Rate' },
  { schematic: 47, name: 'Gloomie Expie', perColony: 25, text: 'Class EXP gain' },
  { schematic: 48, name: 'Gloomie Opie', perColony: 10, text: 'Villager EXP gain' },
]

export function getGloomieBonuses(snapshot) {
  const colony = snapshot?.caverns?.extra?.[HOLE_EXTRA.grottoColony] ?? 0
  return GLOOMIE_BONUSES.map(bonus => {
    const built = schematicBuilt(snapshot, bonus.schematic)
    return { ...bonus, built, value: built ? bonus.perColony * colony : 0 }
  })
}

// What each layer cavern collects (Toolbox Motherlode_x1 / Bug14_x1 / MotherlodeTREE_x1 / MotherlodeFISH_x1)
const LAYER_ICON = id => `images/hole/layers/${id}.png`

function layerDetails(snapshot, id) {
  const { t, unit, skill } = LAYER_CAVERNS[id]
  const extra = snapshot?.caverns?.extra ?? []
  const progress = extra[2 * t] ?? 0
  const req = getLayerReq(snapshot, t)
  return {
    stats: [
      { label: id === 16 ? 'Depth' : 'Layer', value: (extra[1 + 2 * t] ?? 0) + 1 },
      {
        label: `${unit} remaining`,
        icon: LAYER_ICON(id),
        value: formatHoleNumber(Math.max(0, req - progress)),
        hint: `${formatHoleNumber(progress)} / ${formatHoleNumber(req)} collected (includes the Amethyst Heartstone jar and the four "layer destroyed" studies).`,
      },
      { label: `${skill} Efficiency needed`, value: formatHoleNumber(getLayerEfficiency(snapshot, t)) },
    ],
    progress: req > 0 ? Math.min(1, progress / req) : 0,
  }
}

export function getCavernDetails(snapshot, id) {
  const caverns = snapshot?.caverns ?? {}
  const extra = caverns.extra ?? []
  if (LAYER_CAVERNS[id]) return layerDetails(snapshot, id)

  switch (id) {
    // Caverns with their own panel (components/Hole/*Panel.jsx, CavernTab CAVERN_PANELS)
    case 0:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 9:
    case 10:
    case 12:
    case 13:
    case 14:
    case 15:
    case 17:
      return { stats: [] }
    case 8: {
      const colony = extra[HOLE_EXTRA.grottoColony] ?? 0
      const kills = extra[HOLE_EXTRA.grottoKills] ?? 0
      const req = 5e3 * 3.4 ** colony
      return {
        stats: [
          { label: 'Colony', value: colony + 1 },
          {
            label: 'Gloomie kills',
            icon: GLOOMIE_ICON,
            value: `${formatHoleNumber(kills)} / ${formatHoleNumber(req)}`,
            hint: `${formatHoleNumber(Math.max(0, req - kills))} more to challenge the Monarch.`,
          },
          { label: 'Monarch HP', value: formatHoleNumber(1e11 * 7.5 ** colony) },
          ...getGloomieBonuses(snapshot).map(bonus => ({
            label: bonus.name,
            icon: `images/hole/schematics/${bonus.schematic}.png`,
            value: bonus.built ? `+${formatHoleNumber(bonus.value)}%` : 'Not created',
            hint: bonus.built
              ? `${bonus.text} (+${bonus.perColony}% per colony defeated)`
              : `${bonus.text} once created at the Engineer (+${bonus.perColony}% per colony defeated).`,
          })),
        ],
        progress: Math.min(1, kills / req),
      }
    }
    default:
      return { stats: [] }
  }
}

// ── The Jars (cavern 10) ── (Toolbox the-jars.ts)

const JAR_SHELF_SIZE = 120 // the shelf holds this many jars (Toolbox MAX_JARS)
const JAR_DESTROYED = 40 // Holes[11][40 + type] = jars of that type broken
const RUPIE_SEDIMENT = 20 // Holes[9][20..29] = the 10 coloured rupies
const WHITE_RUPIE = 38 // Holes[11][38]
const DARK_RUPIE = 39 // Holes[11][39]
const GILDED_BONUS = 60 // Holes[11][60] = % rupie value from Gilded Jars
const DOUBLED_COLLECTIBLE = 62 // Holes[11][62] = the collectible picked to be most likely enchanted
const JAR_PRODUCTION_JARS = [1, 15, 24]
const JAR_PRODUCTION_MEASUREMENT = 12
const RUPIE_VALUE_MEASUREMENTS = [10, 14]
const RUPIE_VALUE_MULTI_JARS = [3, 17, 28] // "a whopping }x more"
const RUPIE_VALUE_ADD_JARS = [0, 6, 13, 21, 33] // "+{% more"
const RUPIE_VALUE_GLUNKO = 14
const TALL_JAR_OPAL_JARS = [2, 14, 27]
const NEW_COLLECTIBLE_JARS = [7, 25]
const JAR_JAR_COLLECTIBLE = 32 // superbit: 1.05x new collectible chance per spelunking discovery
const ENCHANT_JARS = [9, 18, 26, 34]
const ENCHANT_STUDY = 10
const ENCHANT_FOUNTAIN = [2, 15]
const BELL_EXTRA_RUPIES = 4
const RUPIES_EVERYWHERE_MAJIK = 3 // hole majik
const RUPIE_STAMP_EFFECT = 'more Resources from all Caverns'

// Rupie kinds in screen order, read from the jar texts (Simple = basic, Great = decent, Epic = elegant, Heirloom =
// master, Artisan = white, Ceremony = dark). Icons = images/hole/jars/rupie_<i>.png (Toolbox HoleJarR<i>)
export const RUPIE_KINDS = ['Basic', 'Basic', 'Basic', 'Decent', 'Decent', 'Decent', 'Elegant', 'Elegant', 'Elegant',
  'Master', 'White', 'Dark']

const jarSum = (snapshot, list) => list.reduce((sum, i) => sum + getJarBonus(snapshot, i), 0)
const jarProduct = (snapshot, list) => list.reduce((product, i) => product * (1 + getJarBonus(snapshot, i) / 100), 1)

// Chances can be tiny (Tall Jar opals): show them without rounding to 0 like the game does
export function formatChance(chance) {
  const percent = 100 * chance
  if (percent === 0) return '0%'
  if (percent >= 0.01) return `${formatHoleNumber(percent)}%`
  return `${percent.toPrecision(3)}%`
}

export function getJarSlots(snapshot) {
  if (schematicBuilt(snapshot, 66)) return 3
  return schematicBuilt(snapshot, 63) ? 2 : 1
}

// Progress per hour in every production slot (game: JarProductionPerHR)
export function getJarProductionPerHour(snapshot, tomePoints) {
  const white = snapshot?.caverns?.extra?.[WHITE_RUPIE] ?? 0
  return 36e3
    * (1 + (jarSum(snapshot, JAR_PRODUCTION_JARS) + getMeasurementTotal(snapshot, JAR_PRODUCTION_MEASUREMENT, tomePoints)) / 100)
    * (1 + (schematic(snapshot, 72, 10) * log10(white)) / 100)
}

// Progress needed to make one jar of type i
export function getJarReq(snapshot, i) {
  const destroyed = snapshot?.caverns?.extra?.[JAR_DESTROYED + Math.max(0, i - 1)] ?? 0
  return (1e3 + 2e3 * i)
    / ((1 + schematic(snapshot, 67, 30) / 100) * (1 + (schematic(snapshot, 74, 5) * log10(destroyed)) / 100))
}

// game: JarRupieValue (the x every rupie found is worth)
export function getRupieValue(snapshot, tomePoints) {
  const caverns = snapshot?.caverns
  const stamp = getStampBonusByEffect(snapshot, RUPIE_STAMP_EFFECT)?.value ?? 0
  const measurements = RUPIE_VALUE_MEASUREMENTS.reduce((sum, t) => sum + getMeasurementTotal(snapshot, t, tomePoints), 0)
  return (1 + schematic(snapshot, 62, 1) + schematic(snapshot, 65, 2) + schematic(snapshot, 68, 4))
    * Math.max(1, 1.5 ** (caverns?.rupieSlug ?? 0))
    * (1 + getLampResourceBonus(snapshot) / 400)
    * (1 + getMonumentBonus(snapshot, 2, 1) / 100)
    * (1 + measurements / 100)
    * Math.max(1, schematic(snapshot, 80, 1) * 1.1 ** (caverns?.extra?.[5] ?? 0))
    * (1 + (caverns?.extra?.[GILDED_BONUS] ?? 0) / 100)
    * jarProduct(snapshot, RUPIE_VALUE_MULTI_JARS)
    * (1 + jarSum(snapshot, RUPIE_VALUE_ADD_JARS) / 100)
    * (1 + stamp / 100)
    * (1 + getGlunkoBonus(snapshot, RUPIE_VALUE_GLUNKO) / 100)
}

// game: JarRupieExtraChance, in %: a broken jar gives floor(1 + chance / 100 + random) rupies
export function getRupieExtraChance(snapshot) {
  const majikLevel = Number(snapshot?.caverns?.holeMajiks?.[RUPIES_EVERYWHERE_MAJIK]) || 0
  return getBellRingBonus(snapshot, BELL_EXTRA_RUPIES)
    + getMajikBonus(0, RUPIES_EVERYWHERE_MAJIK, majikLevel)
    + schematic(snapshot, 64, 50)
}

function getTallJarOpalChance(snapshot) {
  return 0.25 * 0.43 ** (snapshot?.caverns?.opalsPerCavern?.[10] ?? 0) * jarProduct(snapshot, TALL_JAR_OPAL_JARS)
}

function getCollectibleLevels(snapshot) {
  return jarCollectibles.map((_, i) => Number(snapshot?.caverns?.jarLevels?.[i]) || 0)
}

// game: JarNewCollectibleChance (Ornate Jar)
function getNewCollectibleChance(snapshot) {
  const found = getCollectibleLevels(snapshot).filter(level => level >= 1).length
  if (found === 0) return 0.25
  const rupieDigits = schematicBuilt(snapshot, 76)
    ? Array.from({ length: 10 }, (_, i) => Math.ceil(log10(snapshot?.caverns?.holeResources?.[RUPIE_SEDIMENT + i] ?? 0)))
      .reduce((sum, digits) => sum + digits, 0)
    : 0
  const jarJar = isSuperbitUnlocked(snapshot?.gaming, JAR_JAR_COLLECTIBLE)
    ? 1.05 ** (snapshot?.spelunking?.discoveries?.length ?? 0)
    : 0
  const multi = jarProduct(snapshot, NEW_COLLECTIBLE_JARS)
    * Math.max(1, 1.02 ** rupieDigits)
    * (1 + getPaletteBonus(snapshot, 2) / 100)
    * (1 + getExoticBonus(snapshot?.farming, 52) / 100)
    * Math.max(1, jarJar)
  return (0.2 * multi) / ((1 + found ** 1.9) * 1.5 ** Math.max(0, found - 16))
}

// Enhancing levels = every collectible LV past the first (they make enchanting harder)
function getEnhancingLevels(snapshot) {
  return getCollectibleLevels(snapshot).reduce((sum, level) => sum + (level >= 2 ? level - 1 : 0), 0)
}

// Enchanted Jar chance for a T1 jar; each tier up rolls 10x more often (cap 100%)
function getEnchantChance(snapshot) {
  const caverns = snapshot?.caverns
  const levels = getEnhancingLevels(snapshot)
  const base = 0.35 / (1 + (levels ** 1.23 + 1.1 ** levels))
  return base
    * jarProduct(snapshot, ENCHANT_JARS)
    * Math.max(1, schematic(snapshot, 73, 1) * 1.1 ** log10(caverns?.extra?.[DARK_RUPIE] ?? 0))
    * (1 + getStudyBonus(snapshot, ENCHANT_STUDY) / 100)
    * (1 + getFountainBonus(caverns, ...ENCHANT_FOUNTAIN) / 100)
}

// Jar Production Line (schematic 74): type i's req is divided by 1 + 5% × log10(jars broken of type max(0, i - 1)),
// so Simple Jars speed up both Simple and Tall, and every other type speeds up the next one. The bonus grows smoothly;
// each ×10 broken is exactly +5% more. Breaking a tier t jar counts 10^(t-1) (Toolbox getJarInventory quantity).
const PRODUCTION_LINE_SCHEMATIC = 74
const PRODUCTION_LINE_PER_LOG = 5

function getFedTypes(i, typeCount) {
  if (i === 0) return [0, 1]
  return i + 1 < typeCount ? [i + 1] : []
}

function getProductionLine(snapshot, i, types, slots, perHour) {
  if (!schematicBuilt(snapshot, PRODUCTION_LINE_SCHEMATIC)) return null
  const extra = snapshot?.caverns?.extra ?? []
  const broken = extra[JAR_DESTROYED + i] ?? 0
  const feeder = Math.max(0, i - 1)
  const fed = getFedTypes(i, types.length).filter(t => types[t]?.unlocked)
  const next = 10 ** (broken >= 1 ? Math.floor(Math.log10(broken)) + 1 : 0)
  const jarsPerHour = (perHour / types[i].req) * slots
  return {
    // what this type gets from its feeder
    boost: PRODUCTION_LINE_PER_LOG * log10(extra[JAR_DESTROYED + feeder] ?? 0),
    feederName: jarTypes[feeder].name,
    // what breaking more of this type gives the type(s) it feeds
    feeds: fed.map(t => jarTypes[t].name),
    giving: PRODUCTION_LINE_PER_LOG * log10(broken),
    next,
    progress: broken >= 1 ? Math.log10(broken) % 1 : 0, // how far into this ×10, in log space
    toGo: Math.max(0, next - broken),
    hoursToNext: jarsPerHour > 0 ? Math.max(0, next - broken) / jarsPerHour : Infinity,
  }
}

export function getJars(snapshot, tomePoints) {
  const caverns = snapshot?.caverns ?? {}
  const extra = caverns.extra ?? []
  const perHour = getJarProductionPerHour(snapshot, tomePoints)
  const rupieValue = getRupieValue(snapshot, tomePoints)
  const slots = getJarSlots(snapshot)
  const typesUnlocked = extra[HOLE_EXTRA.jarTypes] ?? 0
  const chances = {
    1: getTallJarOpalChance(snapshot),
    2: getNewCollectibleChance(snapshot),
    4: getEnchantChance(snapshot),
  }
  const shelf = caverns.jarShelf ?? []
  const types = jarTypes.map((jar, i) => {
    const req = getJarReq(snapshot, i)
    const held = shelf.filter(entry => entry.type === i)
    const tiers = [...new Set(held.map(entry => entry.tier))].sort((a, b) => a - b)
      .map(tier => ({ tier, count: held.filter(entry => entry.tier === tier).length }))
    return {
      ...jar,
      index: i,
      image: `images/hole/jars/jar_${i}.png`,
      effect: chances[i] != null ? jar.effect.replace('{%', formatChance(chances[i])) : jar.effect,
      chance: chances[i] ?? null,
      unlocked: i <= typesUnlocked,
      req,
      perHour: perHour / req,
      hoursToMake: req / perHour,
      destroyed: extra[JAR_DESTROYED + i] ?? 0,
      held: held.length,
      quantity: held.reduce((sum, entry) => sum + 10 ** (entry.tier - 1), 0),
      tiers,
    }
  })
  types.forEach(type => {
    type.line = type.unlocked ? getProductionLine(snapshot, type.index, types, slots, perHour) : null
    // chance jars: one success every 1 / chance breaks (at T1, in one slot); tier t multiplies the chance by 10^(t-1)
    if (type.chance != null && type.chance > 0) {
      type.hoursPerSuccess = type.chance >= 1 ? type.hoursToMake : type.hoursToMake / type.chance
      type.guaranteedTier = type.chance >= 1 ? 1 : Math.ceil(Math.log10(1 / type.chance)) + 1
    }
  })
  // Recommended: the type that reaches its next ×10 soonest (all slots on it), among types that feed an unlocked type
  const recommended = types
    .filter(type => type.line?.feeds.length)
    .sort((a, b) => a.line.hoursToNext - b.line.hoursToNext)[0]
  if (recommended) recommended.recommended = true
  const levels = getCollectibleLevels(snapshot)
  const rupieAmounts = [
    ...Array.from({ length: 10 }, (_, i) => caverns.holeResources?.[RUPIE_SEDIMENT + i] ?? 0),
    extra[WHITE_RUPIE] ?? 0,
    extra[DARK_RUPIE] ?? 0,
  ]
  return {
    perHour,
    rupieValue,
    productionLine: schematicBuilt(snapshot, PRODUCTION_LINE_SCHEMATIC),
    recommended: recommended ?? null,
    rupieExtraChance: getRupieExtraChance(snapshot),
    slots,
    shelfSize: JAR_SHELF_SIZE,
    held: shelf.length,
    quantity: types.reduce((sum, type) => sum + type.quantity, 0),
    enhancingLevels: getEnhancingLevels(snapshot),
    destroyed: types.reduce((sum, type) => sum + type.destroyed, 0),
    enchantTiers: Array.from({ length: 4 }, (_, t) => ({ tier: t + 1, chance: Math.min(1, chances[4] * 10 ** t) })),
    rupies: rupieAmounts.map((amount, i) => ({
      index: i,
      amount,
      kind: RUPIE_KINDS[i],
      image: `images/hole/jars/rupie_${i}.png`,
    })),
    producing: Array.from({ length: slots }, (_, i) => {
      const type = caverns.jarProgress?.[i] ?? 0
      const progress = caverns.jarProgress?.[i + 3] ?? 0
      const req = types[type]?.req ?? 0
      return {
        slot: i,
        type: types[type],
        progress,
        req,
        hoursLeft: perHour > 0 ? Math.max(0, req - progress) / perHour : Infinity,
      }
    }),
    types,
    collectibles: jarCollectibles.map((collectible, i) => {
      const bonus = getJarBonus(snapshot, i)
      return {
        index: i,
        name: collectible.name,
        level: levels[i],
        image: `images/hole/jars/collectible_${i}.png`,
        text: fillHoleText(collectible.description.replace('$', ` ${formatHoleNumber(rupieValue)}x`), bonus),
        doubled: extra[DOUBLED_COLLECTIBLE] === i,
      }
    }),
  }
}

// ── Wisdom (cavern 12) ── (Toolbox wisdom.ts)

const WISDOM_STUDY = 12 // + starting attempts
const WISDOM_OPAL_MONUMENT = 5
const WISDOM_LIST_ATTEMPTS = 30 // the in-game hour list always says "Start with 30 Attempts" (game: WisdomAttempts(1))
const WISDOM_SECONDS_PER_MATCH = 12.6

export function getWisdom(snapshot) {
  const caverns = snapshot?.caverns ?? {}
  const hours = caverns.monuments?.[4] ?? 0
  const unlocked = caverns.monuments?.[5] ?? 0
  const has = i => (unlocked > i ? 1 : 0)
  const nextIndex = monumentHourReqs.findIndex(req => hours < req)
  return {
    hours,
    attempts: Math.round(5 + getStudyBonus(snapshot, WISDOM_STUDY) + 4 * has(4) + Math.floor(2 * log10(hours))),
    attemptsPerClear: Math.round(2 * has(1) + has(6)),
    secondsPerMatch: WISDOM_SECONDS_PER_MATCH,
    instaMatches: Math.round(4 * has(3) + 5 * has(7)),
    opalChance: Math.min(0.5, 0.5 ** (caverns.opalsPerCavern?.[12] ?? 0)
      * (1 + getMonumentBonus(snapshot, 2, WISDOM_OPAL_MONUMENT) / 100)),
    reward: getMonumentRewardMulti(snapshot, 2),
    unlocks: monumentHourRewards[2].map((text, i) => ({
      hours: monumentHourReqs[i],
      text: text.replace('#', WISDOM_LIST_ATTEMPTS),
      reached: unlocked > i,
    })),
    nextUnlock: nextIndex >= 0 ? { hours: monumentHourReqs[nextIndex], text: monumentHourRewards[2][nextIndex] } : null,
    bonuses: getMonumentBonuses(snapshot, 2),
  }
}

// ── Gambit (cavern 13) ── (Toolbox gambit.ts)

// Like the game: 23min 58.6sec
export function formatGambitTime(seconds) {
  const total = Math.max(0, seconds)
  const minutes = Math.floor(total / 60)
  const rest = (Math.floor((total - 60 * minutes) * 10 + 1e-6) / 10).toFixed(1) // the game cuts, never rounds up
  return minutes > 0 ? `${minutes}min ${rest}sec` : `${rest}sec`
}

function gambitBonusText(name, bonus, doublersLeft) {
  return name
    .replace('{', formatHoleNumber(Math.floor(bonus)))
    .replace('}', `${formatHoleNumber(1 + Math.floor(bonus) / 100)}x`)
    .replace('$', doublersLeft)
}

// How a Gambit bonus grows with points. x1 = 1 bonuses never cap: they gain x0 per 10x points (log10, Toolbox
// getLocalGambitBonus). Two have real breakpoints: Summoning Doublers (ceil(log2 + log10 - 9), one more each step) and
// Opals (one per power of 10). progress = how far you are to the next breakpoint, in log space (like the points grow).
const GAMBIT_DOUBLERS_BONUS = 0
const GAMBIT_OPAL_BONUS = 1
const GAME_LN10 = 2.30259

function getGambitGrowth(bonus, index, points) {
  if (bonus.x1 !== 1) return null
  const lnPoints = Math.log(Math.max(points, 1))
  if (index === GAMBIT_DOUBLERS_BONUS) {
    const perLn = 1 / Math.LN2 + 1 / GAME_LN10
    const step = lnPoints * perLn - 9
    const current = Math.ceil(step)
    return {
      label: '+1 doubler at each breakpoint',
      next: { points: Math.exp((current + 9) / perLn), progress: 1 - (current - step), what: `${current + 1} doublers` },
    }
  }
  if (index === GAMBIT_OPAL_BONUS) {
    const power = lnPoints / GAME_LN10
    return {
      label: '+1 opal per power of 10',
      next: { points: 10 ** (Math.floor(power) + 1), progress: power - Math.floor(power), what: 'next opal' },
    }
  }
  const multi = bonus.name.includes('}')
  return { label: multi ? `+${formatHoleNumber(bonus.x0 / 100)}x per 10x points` : `+${bonus.x0}% per 10x points`, next: null }
}

export function getGambit(snapshot) {
  const times = snapshot?.caverns?.gambitTimes ?? []
  const points = getGambitPoints(snapshot)
  const doublers = getSummoningDoublers(snapshot)
  const doublersLeft = Math.max(0, doublers.total - doublers.placed)
  const bonuses = gambitBonuses.map((bonus, i) => {
    const req = getGambitPointReq(i)
    const value = getGambitBonus(snapshot, i)
    return {
      index: i,
      req,
      unlocked: points >= req,
      text: gambitBonusText(bonus.name, value, doublersLeft),
      growth: getGambitGrowth(bonus, i, points),
      description: bonus.description?.replace('$', doublersLeft) ?? null,
    }
  })
  return {
    basePoints: getGambitBasePoints(snapshot),
    multi: getGambitPointsMulti(snapshot),
    points,
    totalTime: gambitTrials.reduce((sum, _, i) => sum + (times[i] ?? 0), 0),
    doublers,
    trials: gambitTrials.map((trial, i) => ({
      ...trial,
      index: i,
      image: `images/hole/gambit/gambit_${i}.png`,
      time: times[i] ?? 0,
      basePoints: getGambitTrialPoints(times[i] ?? 0, i),
      pointsPerSecond: i === 0 ? 100 : 200,
    })),
    bonuses,
    nextBonus: bonuses.find(bonus => !bonus.unlocked) ?? null,
  }
}

// ── The Temple (cavern 14) ── (Toolbox the-temple.ts)

const TEMPLE_ILLUMINATE = 57 // Holes[11][57] = Illuminate LV
const TEMPLE_AMPLIFY = 59 // Holes[11][59] = Amplify LV
const TEMPLE_BELL_DOUBLE_TORCH = 5
const TEMPLE_STUDY = 14
const TEMPLE_TORCH_SCHEMATIC = 77 // Roaring Flame: +25% extra torch chance

function getTorchCost(extra, t) {
  if (t === 0) return 3 * 1.075 ** (extra[TEMPLE_ILLUMINATE] ?? 0) + (extra[TEMPLE_ILLUMINATE] ?? 0)
  if (t === 1) return Math.max(5, (extra[HOLE_EXTRA.templeTorches] ?? 0) / 4)
  return 10 * 1.1 ** (extra[TEMPLE_AMPLIFY] ?? 0) + 2 * (extra[TEMPLE_AMPLIFY] ?? 0)
}

// game: TempleTorchBonuses
function getTorchBonus(extra, t) {
  if (t === 0) return 1 + (10 * (extra[TEMPLE_ILLUMINATE] ?? 0)) / 100
  if (t === 1) {
    return 0.05 * getTorchBonus(extra, 0) * 0.7 ** (extra[HOLE_EXTRA.templeLayer] ?? 0)
      * Math.log2(Math.max(5, (extra[HOLE_EXTRA.templeTorches] ?? 0) / 4))
  }
  return 5 * (extra[TEMPLE_AMPLIFY] ?? 0)
}

function torchBonusText(t, bonus) {
  if (t === 0) return formatHoleNumber(Math.round(100 * bonus) / 100)
  if (t === 1) return formatChance(Math.min(1, bonus)).replace('%', '')
  return formatHoleNumber(Math.round(bonus))
}

export function getTemple(snapshot) {
  const extra = snapshot?.caverns?.extra ?? []
  const torches = extra[HOLE_EXTRA.templeTorches] ?? 0
  return {
    sanctum: (extra[HOLE_EXTRA.templeLayer] ?? 0) + 1,
    torches,
    // in %: each torch pickup gives floor(1 + chance / 100 + random) torches
    extraTorchChance: getBellRingBonus(snapshot, TEMPLE_BELL_DOUBLE_TORCH)
      + getStudyBonus(snapshot, TEMPLE_STUDY)
      + schematic(snapshot, TEMPLE_TORCH_SCHEMATIC, 25),
    buys: templeTorchBonuses.map((buy, t) => {
      const cost = getTorchCost(extra, t)
      const bonus = getTorchBonus(extra, t)
      return {
        ...buy,
        index: t,
        level: buy.level != null ? (extra[buy.level] ?? 0) : null,
        cost,
        affordable: torches >= cost,
        bonus,
        text: buy.description.replace('{', torchBonusText(t, bonus)),
        // big number + its unit, and the rest of the line ("28.5x" / "chance for Search")
        value: `${torchBonusText(t, bonus)}${buy.description.split('{')[1][0]}`,
        label: buy.description.split('{')[1].slice(1).trim(),
      }
    }),
  }
}

// ── The Fountain (cavern 15) ── (Toolbox the-fountain.ts)
// Three waters (Blue, Yellow, Green), 20 upgrades each. Coins pile up on the ground spaces while the coin bar fills;
// currencies live at Holes[9][30..38].

export const FOUNTAIN_WATERS = ['Blue', 'Yellow', 'Green']
export const FOUNTAIN_CURRENCIES = ['Bronze', 'Silver', 'Gold', 'Dollar', 'Credit', 'Treasury', 'Moolah', 'Shilling', 'Greane']
export const FOUNTAIN_COIN_ICON = currency => `images/hole/fountain/coin_${currency}.png`
export const FOUNTAIN_UPGRADE_ICON = (t, i) => `images/hole/fountain/upg_${t}_${i}.png`

const FOUNTAIN_CURRENCY_SLOT = 30 // Holes[9][30 + currency]
const FOUNTAIN_MARBLE_SLOT = 81 // Holes[11][81] = marble owned
const FOUNTAIN_DESIRED_SLOT = 82 // Holes[11][82] = desired currency (Greatest Desire), -1 = none
const FOUNTAIN_BAR_REQ = [7200, 36000, 90000] // coin, marble, rubber ducky bars
const FOUNTAIN_EARLY_UNLOCKS = [2, 14] // Blue upgrades that open once their prereq is LV 1, not 10
const FOUNTAIN_UNLOCK_LV = 10
const FOUNTAIN_SPEED_ARCADE = 'Fountain Speed'
const FOUNTAIN_COSMO_MAJIK = 4 // hole majik: currency, marble and stack size
const FOUNTAIN_MARBLE_STUDY = 15
const FOUNTAIN_MEASUREMENT = 16
const FOUNTAIN_BELL_RING = 6
const FOUNTAIN_TRENCH_SCHEMATIC = 94 // 1.1x currency per Trench depth
const FOUNTAIN_STACK_SCHEMATIC = 97 // +3 stack size
const FOUNTAIN_LAIR_UPGRADE = 14 // Cavernicus: resources from all caverns
const TRENCH_DEPTH = 7 // Holes[11][7]
const MAX_SPACES = 16
const MAX_STACK = 50
const LUCKY_BASE = 25 // % per LUCKY coin, + Skilluck
// Well/Harp/Jar resource whose POW 10 boosts each water's currencies (Mythril, Sharp Notes, Red Rupies)
const TRANSIENCE_SEDIMENT = [3, 16, 20]
// Each currency: its finder upgrade (water, 2/3/4) and the Stackin' upgrade that multiplies it
const CURRENCY_TERMS = [
  { water: 0, finder: 2, stack: [0, 2] },
  { water: 0, finder: 3, stack: [0, 5] },
  { water: 0, finder: 4, stack: [0, 6] },
  { water: 1, finder: 2, stack: [0, 7] },
  { water: 1, finder: 3, stack: [1, 5] },
  { water: 1, finder: 4, stack: [1, 6] },
  { water: 2, finder: 2, stack: [1, 7] },
  { water: 2, finder: 3, stack: [2, 5] },
  { water: 2, finder: 4, stack: [2, 6] },
]

function fountainUpgradeCost(upgrade, level) {
  return upgrade.baseCost === 1
    ? (level + 1) * upgrade.costMulti ** level
    : upgrade.baseCost * upgrade.costMulti ** level
}

function fountainCosmo(snapshot) {
  return getMajikBonus(0, FOUNTAIN_COSMO_MAJIK, snapshot?.caverns?.holeMajiks?.[FOUNTAIN_COSMO_MAJIK] ?? 0)
}

export function getFountainBarSpeed(snapshot, t) {
  if (t !== 0) return 1
  const caverns = snapshot?.caverns
  return (1 + getFountainBonus(caverns, 0, 9) / 100) * (1 + getArcadeBonus(snapshot, FOUNTAIN_SPEED_ARCADE) / 100)
}

export function getFountainActiveMulti(snapshot) {
  const bonus = getFountainBonus(snapshot?.caverns, 0, 12)
  return 1 + Math.min(4, 4 * bonus) + bonus / 100
}

export function getFountainSpaces(snapshot) {
  return Math.min(MAX_SPACES, 1 + getFountainBonus(snapshot?.caverns, 0, 10))
}

export function getFountainStackSize(snapshot) {
  return Math.min(MAX_STACK, 3 + schematic(snapshot, FOUNTAIN_STACK_SCHEMATIC, 3)
    + getFountainBonus(snapshot?.caverns, 0, 11) + fountainCosmo(snapshot))
}

// Fount_CurrencyBaseValue: what one coin of this currency is worth before the total currency multi
export function getFountainCurrencyBase(snapshot, currency) {
  const caverns = snapshot?.caverns
  const { water, finder, stack: [stackWater, stackIndex] } = CURRENCY_TERMS[currency]
  const sediment = log10(caverns?.holeResources?.[TRANSIENCE_SEDIMENT[water]] ?? 0)
  return 1 + getFountainBonus(caverns, water, finder)
    * (1 + getFountainBonus(caverns, stackWater, stackIndex) / 100)
    * (1 + sediment * getFountainBonus(caverns, water, 19) / 100)
}

// Fount_CurrencyALLmulti: Green water currencies only get its square root
export function getFountainCurrencyMulti(snapshot, tomePoints) {
  const caverns = snapshot?.caverns
  const f = (t, i) => getFountainBonus(caverns, t, i)
  const trench = Math.max(1, schematic(snapshot, FOUNTAIN_TRENCH_SCHEMATIC, 1) * 1.1 ** (caverns?.extra?.[TRENCH_DEPTH] ?? 0))
  return (1 + f(0, 0) / 100)
    * (1 + getGlunkoBonus(snapshot, FOUNTAIN_LAIR_UPGRADE) / 100)
    * (1 + (f(0, 1) + f(1, 1) + f(2, 1) + f(1, 12)) / 100)
    * trench
    * (1 + f(1, 0) / 100)
    * (1 + f(2, 0) / 100)
    * (1 + 25 * fountainCosmo(snapshot) / 100)
    * (1 + getLampResourceBonus(snapshot) / 400)
    * (1 + getMeasurementTotal(snapshot, FOUNTAIN_MEASUREMENT, tomePoints) / 100)
    * (1 + getBellRingBonus(snapshot, FOUNTAIN_BELL_RING) / 100)
}

function fountainDuckChance(snapshot) {
  const caverns = snapshot?.caverns
  return (1 / 3)
    * (1 + (getFountainBonus(caverns, 2, 12) + getFountainBonus(caverns, 2, 10)) / 100)
    * 0.2 ** (caverns?.fountainDucks ?? 0)
}

function fountainMarblePerFill(snapshot) {
  return 100 * (1 + getFountainBonus(snapshot?.caverns, 1, 10) / 100)
    * (1 + getStudyBonus(snapshot, FOUNTAIN_MARBLE_STUDY) / 100)
    * (1 + 10 * fountainCosmo(snapshot) / 100)
}

// Like the game's fountain timers: 5h 42m 1s
export function formatFountainTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '—'
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor(total / 60) % 60
  const s = total % 60
  return h > 0 ? `${h.toLocaleString('en-US')}h ${m}m ${s}s` : `${m}m ${s}s`
}

function fountainText(snapshot, tomePoints, t, i, bonus, values) {
  const caverns = snapshot?.caverns
  const f = (water, index) => getFountainBonus(caverns, water, index)
  const multi = value => `${formatHoleNumber(value)}x`
  let text = fountainUpgrades[t][i].description
  const swap = (mark, value) => { text = text.replaceAll(mark, value) }
  if (i >= 2 && i <= 4) {
    const currency = [i - 2, i + 1, i + 4][t]
    swap('$', formatHoleNumber(getFountainCurrencyBase(snapshot, currency)))
    swap('^', multi(t === 2 ? Math.sqrt(values.currencyMulti) : values.currencyMulti))
  }
  if (i === 19) {
    const sediment = log10(caverns?.holeResources?.[TRANSIENCE_SEDIMENT[t]] ?? 0)
    swap('$', formatHoleNumber(1 + sediment * f(t, 19) / 100))
  }
  if (t === 0) {
    if (i === 8) swap('$', formatHoleNumber(100 * (0.1 + f(0, 8) / (100 + f(0, 8)) * 0.5)))
    if (i === 9) {
      swap('$', formatFountainTime(values.coinBar.timeToFull))
      swap('#', formatFountainTime(values.coinBar.fullCycle))
    }
    if (i === 10 || i === 11) {
      swap('$', String(i === 10 ? values.spaces : values.stackSize))
      swap('#', String(values.spaces * values.stackSize))
    }
    if (i === 12) swap('$', formatHoleNumber(getFountainActiveMulti(snapshot)))
  }
  if (t === 1) {
    if (i === 8) swap('$', Math.round(300 / (1 + f(1, 8) / 100)).toLocaleString('en-US'))
    if (i === 9) swap('$', formatHoleNumber(5 + f(1, 9) / 100))
    if (i === 10) swap('$', Math.round(fountainMarblePerFill(snapshot)).toLocaleString('en-US'))
  }
  if (t === 2) {
    if (i === 8) swap('$', Math.round(1000 / (1 + (f(2, 8) + f(2, 10)) / 100)).toLocaleString('en-US'))
    if (i === 9) swap('$', formatHoleNumber(LUCKY_BASE + f(2, 9)))
    if (i === 11) swap('$', formatHoleNumber((1 + f(2, 11) / 100) ** (caverns?.fountainDucks ?? 0)))
    if (i === 12) swap('$', Math.round(1 / fountainDuckChance(snapshot)).toLocaleString('en-US'))
  }
  return text
    .replaceAll('{', formatHoleNumber(bonus))
    .replaceAll('}', formatHoleNumber(1 + bonus / 100))
    .replace(/[$#^]/g, '?')
}

function fountainBar(snapshot, t, name, text) {
  const progress = snapshot?.caverns?.fountainBars?.[t] ?? 0
  const req = FOUNTAIN_BAR_REQ[t]
  const speed = Math.max(getFountainBarSpeed(snapshot, t), 1e-9) // per second
  return {
    t,
    name,
    text,
    progress,
    req,
    speed,
    timeToFull: Math.max(0, req - progress) / speed,
    fullCycle: req / speed,
  }
}

export function getFountain(snapshot, tomePoints) {
  const caverns = snapshot?.caverns ?? {}
  const levels = caverns.fountainLevels ?? []
  const marbles = caverns.fountainMarbles ?? []
  const currencyMulti = getFountainCurrencyMulti(snapshot, tomePoints)
  const spaces = getFountainSpaces(snapshot)
  const stackSize = getFountainStackSize(snapshot)
  const duckChance = fountainDuckChance(snapshot)
  const luckyPer = LUCKY_BASE + getFountainBonus(caverns, 2, 9)
  const desired = Number(caverns.extra?.[FOUNTAIN_DESIRED_SLOT] ?? -1)
  const ground = (caverns.fountainSpaces ?? []).slice(0, spaces)

  const coinBar = fountainBar(snapshot, 0, 'Coin Fill', 'When full, a new coin appears on the ground.')
  const bars = [
    { ...coinBar, activeMulti: getFountainActiveMulti(snapshot) },
    getFountainBonus(caverns, 1, 10) >= 1 && {
      ...fountainBar(snapshot, 1, 'Marble Fill', 'When full, makes marble for Marbleizing upgrades.'),
      makes: fountainMarblePerFill(snapshot),
    },
    getFountainBonus(caverns, 2, 12) >= 1 && {
      ...fountainBar(snapshot, 2, 'Rubber Ducky Bar', 'When full, has a chance to give +1 Rubber Ducky stack.'),
      duckChance,
    },
  ].filter(Boolean)

  const currencies = FOUNTAIN_CURRENCIES.map((name, currency) => ({
    currency,
    name,
    icon: FOUNTAIN_COIN_ICON(currency),
    owned: Math.max(0, Number(caverns.holeResources?.[FOUNTAIN_CURRENCY_SLOT + currency]) || 0),
    baseValue: getFountainCurrencyBase(snapshot, currency),
    lucky: Math.max(0, caverns.fountainLucky?.[currency] ?? 0),
    onGround: ground.reduce((sum, space) => sum + space.filter(type => type === currency).length, 0),
    desired: desired === currency,
    water: Math.floor(currency / 3),
  }))

  const values = { currencyMulti, spaces, stackSize, coinBar }
  // Green water needs Yellow Water bought, and so on (Toolbox watersOwned)
  const watersOwned = Math.min(2, [0, 1, 2].reduce((sum, t) => sum + Math.min(1, levels[t]?.[0] ?? 0), 0))
  const waters = fountainUpgrades.map((list, t) => {
    const depthOf = (i, seen = new Set()) => {
      const prereq = list[i].prereq
      if (prereq === -1 || seen.has(i)) return 0
      seen.add(i)
      return depthOf(prereq, seen) + 1
    }
    const upgrades = list.map((upgrade, i) => {
      const level = Number(levels[t]?.[i]) || 0
      const marbleTier = Number(marbles[t]?.[i]) || 0
      const bonus = getFountainBonus(caverns, t, i)
      const prereqLevel = upgrade.prereq === -1 ? 0 : Number(levels[t]?.[upgrade.prereq]) || 0
      const needs = t === 0 && FOUNTAIN_EARLY_UNLOCKS.includes(i) ? 1 : FOUNTAIN_UNLOCK_LV
      const cost = fountainUpgradeCost(upgrade, level)
      const owned = currencies[upgrade.currency]?.owned ?? 0
      return {
        index: i,
        name: upgrade.name,
        icon: FOUNTAIN_UPGRADE_ICON(t, i),
        level,
        marbleTier,
        marbleMulti: marbleTier === 0 ? 1 : 1.5 + 0.5 * marbleTier,
        bonus,
        text: fountainText(snapshot, tomePoints, t, i, bonus, values),
        currency: upgrade.currency,
        cost,
        affordable: owned >= cost,
        unlocked: upgrade.prereq === -1 || prereqLevel >= needs,
        prereq: upgrade.prereq === -1
          ? null
          : { name: list[upgrade.prereq].name, level: prereqLevel, needs },
        depth: depthOf(i),
        opens: list.flatMap(other => (other.prereq === i ? [other.name] : [])),
      }
    })
    const tiers = []
    upgrades.forEach(upgrade => { (tiers[upgrade.depth] ??= []).push(upgrade) })
    return {
      t,
      name: FOUNTAIN_WATERS[t],
      unlocked: t <= watersOwned,
      totalLevels: upgrades.reduce((sum, upgrade) => sum + upgrade.level, 0),
      tiers: tiers.filter(Boolean),
    }
  })

  return {
    currencies,
    currencyMulti,
    marble: Number(caverns.extra?.[FOUNTAIN_MARBLE_SLOT]) || 0,
    spaces,
    stackSize,
    coinsOnGround: ground.reduce((sum, space) => sum + space.length, 0),
    ducks: caverns.fountainDucks ?? 0,
    duckChance,
    luckyPer,
    bars,
    waters,
  }
}

// ── The Lair / Crystal Glunko Cove (cavern 17) ── (Toolbox crystal-glunko-cove.ts)
// 24 upgrades in two tabs: Crystal (t 0-11, Gooey shapes) and Jeweled (t 12-23, Quartz shapes). In-game each tab is
// 2 rows of 6: column k holds upgrades 2k (top) and 2k + 1 (bottom), both paid in the same shape.

export const LAIR_SHAPE_ICON = shape => `images/hole/lair/shape_${shape}.png`
export const LAIR_TABS = [
  { key: 'crystal', label: 'Crystal Upgrades', first: 0 },
  { key: 'jeweled', label: 'Jeweled Upgrades', first: 12 },
]

const LAIR_DISCOUNT_UPGRADE = 7 // Active Drops
const LAIR_DAILY_STUDY = 17 // 15% off the first few upgrades bought each day
const LAIR_DAILY_DISCOUNT = 0.85
const LAIR_DR_UPGRADES = { flat: [1, 17, 21], droplier: 3, dropliPlus: 12, killionaire: 4, blueCollector: 10, purpCollector: 22, richGetRich: 18 }
const LAIR_AFK_UPGRADES = [8, 13]
const LAIR_AFK_BASE = 10
const LAIR_MULTIKILL_TIER = 6
const LAIR_MULTIKILL_BASE = 15
const LAIR_RESPAWN = 2
const LAIR_DOUBLE_SHAPE_SCHEMATICS = [101, 103, 105] // +10% double shape chance each

// Sum of digit counts of the 6 shapes in a group (Cglunko_Bdig / Pdig)
function shapeDigits(shapes, first) {
  return shapes.slice(first, first + 6).reduce((sum, owned) => sum + Math.ceil(log10(owned)), 0)
}

export function getLairUpgradeCost(snapshot, t) {
  const glunko = snapshot?.glunko ?? {}
  const level = glunko.upgradeLevels?.[t] ?? 0
  let cost = (lairUpgrades[t].costBase ** level + level) / (1 + getGlunkoBonus(snapshot, LAIR_DISCOUNT_UPGRADE) / 100)
  if (t % 2 === 1) cost *= 5
  if (Math.round(glunko.boughtToday ?? 0) < getStudyBonus(snapshot, LAIR_DAILY_STUDY)) cost *= LAIR_DAILY_DISCOUNT
  return cost < 1e6 ? Math.floor(Math.max(1, cost)) : cost
}

function lairText(description, bonus) {
  return description
    .replaceAll('{', formatHoleNumber(bonus))
    .replaceAll('}', formatHoleNumber(1 + bonus / 100))
    .replaceAll('$', String(Math.floor(1e4 * (1 - 1 / (1 + bonus / 100))) / 100))
}

export function getLair(snapshot) {
  const glunko = snapshot?.glunko ?? {}
  const shapes = glunko.shapes ?? []
  const b = t => getGlunkoBonus(snapshot, t)
  const blueDigits = shapeDigits(shapes, 0)
  const purpDigits = shapeDigits(shapes, 6)
  const killDigits = Math.ceil(log10(glunko.kills ?? 0))
  const drDigits = Math.ceil(log10(glunko.normalDropRate ?? 0))
  const u = LAIR_DR_UPGRADES
  const dropRate = (1 + u.flat.reduce((sum, t) => sum + b(t), 0) / 100)
    * (1 + b(u.droplier) / 100)
    * (1 + b(u.dropliPlus) / 100)
    * (1 + b(u.blueCollector) * blueDigits / 100)
    * (1 + b(u.purpCollector) * purpDigits / 100)
    * (1 + b(u.killionaire) * killDigits / 100)
    * (1 + b(u.richGetRich) * drDigits / 100)
  const doubleShape = Math.min(300, LAIR_DOUBLE_SHAPE_SCHEMATICS.reduce((sum, t) => sum + schematic(snapshot, t, 10), 0))

  const upgrades = lairUpgrades.map((upgrade, t) => {
    const level = glunko.upgradeLevels?.[t] ?? 0
    const bonus = b(t)
    const shape = Math.floor((t % 12) / 2) + 6 * Math.floor(t / 12)
    const cost = getLairUpgradeCost(snapshot, t)
    const owned = shapes[shape] ?? 0
    return {
      t,
      name: upgrade.name,
      level,
      bonus,
      text: lairText(upgrade.description, bonus),
      shape,
      shapeName: lairShapeNames[shape],
      cost,
      unlocked: owned > 0,
      affordable: owned > 0 && owned >= cost,
    }
  })

  return {
    dropRate,
    afkGains: LAIR_AFK_BASE + LAIR_AFK_UPGRADES.reduce((sum, t) => sum + b(t), 0),
    multikillPerTier: b(LAIR_MULTIKILL_TIER),
    multikillBase: b(LAIR_MULTIKILL_BASE),
    respawn: b(LAIR_RESPAWN),
    doubleShape,
    blueDigits,
    purpDigits,
    killDigits,
    drDigits,
    dailyDiscount: Math.round(glunko.boughtToday ?? 0) < getStudyBonus(snapshot, LAIR_DAILY_STUDY),
    shapes: lairShapeNames.map((name, i) => ({ index: i, name, icon: LAIR_SHAPE_ICON(i), owned: shapes[i] ?? 0 })),
    upgrades,
  }
}
