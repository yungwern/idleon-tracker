import {
  lampWishes,
  bellRingBonuses,
  harpStringTypes,
  harpNoteNames,
  monumentBonusText,
  monumentBases,
  jarCollectibles,
  glunkoUpgradeValues,
  denAmplifiers,
  denAmpMax,
  denRecommendedSetup,
  wellSedimentCapBonus,
  wellSedimentNames,
  monumentHourReqs,
  monumentHourRewards,
  bellMethods,
  gambitBonuses,
} from '../data'
import {
  getMonumentBonus,
  getMonumentMultiplier,
  applyMonumentFountain,
  getGambitPoints,
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
import { isSuperbitUnlocked } from './gamingUtils'
import { isMeritocracyBonusSelected } from './voteUtils'

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

function formatTime(seconds) {
  const total = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(total / 60)
  return `${minutes}:${String(total % 60).padStart(2, '0')}`
}

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

function monumentDetails(snapshot, t) {
  return {
    stats: [
      { label: 'AFK hours (Respect)', value: formatHoleNumber(snapshot?.caverns?.monuments?.[2 * t] ?? 0) },
    ],
    list: { title: 'Monument bonuses', items: getMonumentBonuses(snapshot, t) },
  }
}

export function getCavernDetails(snapshot, id) {
  const caverns = snapshot?.caverns ?? {}
  const extra = caverns.extra ?? []
  if (LAYER_CAVERNS[id]) return layerDetails(snapshot, id)

  switch (id) {
    // The Well, The Den, Bravery, The Bell, The Harp, The Lamp and Justice have their own panels (components/Hole/*Panel.jsx)
    case 0:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 9:
      return { stats: [] }
    case 12: return monumentDetails(snapshot, 2)
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
    case 10: {
      const levels = (caverns.jarLevels ?? []).slice(0, jarCollectibles.length).map(n => Number(n) || 0)
      return {
        stats: [
          { label: 'Jar types', value: extra[HOLE_EXTRA.jarTypes] ?? 0 },
          { label: 'Collectibles found', value: `${levels.filter(level => level > 0).length} / ${jarCollectibles.length}` },
        ],
        list: {
          title: 'Collectibles',
          items: jarCollectibles.map((jar, i) => ({
            name: jar.name,
            level: levels[i] ?? 0,
            text: fillHoleText(jar.description, getJarBonus(snapshot, i)),
            dim: !levels[i],
          })),
        },
      }
    }
    case 13: {
      const doublers = getSummoningDoublers(snapshot)
      const times = extra.slice(HOLE_EXTRA.gambitTimes, HOLE_EXTRA.gambitTimes + 6)
      return {
        stats: [
          { label: 'Gambit Points', value: formatHoleNumber(getGambitPoints(snapshot)) },
          { label: 'Summoning Doublers', value: `${doublers.placed} / ${doublers.total} placed` },
        ],
        list: {
          title: 'Best trial times',
          items: times.map((time, i) => ({ name: `Trial ${i + 1}`, text: formatTime(time), dim: !time })),
        },
      }
    }
    case 14:
      return {
        stats: [
          { label: 'Layer', value: (extra[HOLE_EXTRA.templeLayer] ?? 0) + 1 },
          { label: 'Torches', value: formatHoleNumber(extra[HOLE_EXTRA.templeTorches] ?? 0) },
        ],
      }
    case 15: {
      const waters = ['Blue', 'Yellow', 'Green'] // Toolbox the-fountain.ts tier mapping
      return {
        stats: waters.map((water, t) => ({
          label: `${water} water upgrade LVs`,
          value: (caverns.fountainLevels?.[t] ?? []).reduce((sum, n) => sum + (Number(n) || 0), 0).toLocaleString(),
        })),
      }
    }
    case 17: {
      const levels = snapshot?.glunko?.upgradeLevels ?? []
      return {
        stats: [
          {
            label: 'Crystal Glunko upgrades bought',
            value: `${levels.filter(level => level > 0).length} / ${glunkoUpgradeValues.length}`,
          },
          { label: 'Total upgrade LVs', value: levels.reduce((sum, n) => sum + (Number(n) || 0), 0).toLocaleString() },
        ],
      }
    }
    default:
      return { stats: [] }
  }
}
