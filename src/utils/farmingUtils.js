import {
  landRankMap,
  exoticMarketMap,
  calcRankBonus,
  getSeedByCropId,
  seedInfo,
} from '../data'
import { getLegendTalentMulti, getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getAccountTalentBonus, getAccountTalentLevel } from './talentUtils'
import { getGrimoireBonus } from './grimoireUtils'
import { getBubbleBonus, getVialBonusByStat } from './alchemyUtils'
import { getPassiveCardBonus } from './cardUtils'
import { getUpgradeVaultBonus } from './upgradeVaultUtils'
import { isAchievementComplete } from './achievementUtils'
import { getKillroyBonus, KILLROY_CROP_EVO } from './killroyUtils'
import { getSkillLevel, isSkillMasteryBonusUnlocked } from './skillUtils'
import { getSushiBonus } from './sushiUtils'
import { isBallotBonusSelected } from './voteUtils'
import { getStampBonusByEffect } from './stampUtils'
import { getMealBonusByStat } from './cookingUtils'
import { getWinnerBonusByName } from './summoningUtils'
import { getTomeBubbleMulti } from './tomeUtils'
import { getLampBonus, getMonumentBonus } from './cavernUtils'
import { getStarSignBonus } from './starSignUtils'
import { getActiveCharacterIndex } from './characterUtils'
import { getButtonBonus } from './buttonUtils'
import { getStickerBonus } from './researchUtils'
import { countClearedMaps, WORLD_6_FIRST_MAP, WORLD_6_MAP_COUNT } from './mapUtils'
import { getExoticBonus } from './exoticUtils'
import { getEmperorBonus } from './emperorUtils'
import { getGemShopPurchases } from './gemShopUtils'

// Farming math, checked against IdleonToolbox parsers/world-6/farming.ts.
// `farming` is snapshot.farming (see parseFarming in lib/extractSnapshot.js).

// ── Images & text ─────────────────────────────────────────────────────────────

export const BEAN_IMG = 'images/farming/FarmCropBean.png'

// Medal seeds (seedId 6) all share one sprite
export function cropImgPath(cropId) {
  const seed = getSeedByCropId(cropId)
  if (!seed) return null
  const imgId = seed.seedId === 6 ? 230 : Math.round(cropId)
  return `images/farming/FarmCrop${imgId}.png`
}

// Big multipliers in scientific notation (3.94e10), small ones as normal numbers
export function formatMulti(value) {
  if (!(value >= 1e6)) return formatDecimal(value, 3)
  const exponent = Math.floor(Math.log10(value))
  return `${(value / 10 ** exponent).toFixed(2)}e${exponent}`
}

// Rounds to `decimals` places and drops trailing zeros (12.50 → "12.5")
export function formatDecimal(value, decimals = 1) {
  return Number((value ?? 0).toFixed(decimals)).toString()
}

// A chance (0-1) as a percent that stays readable when tiny: 0.765%, 0.00229%, 1.67e-18%
export function formatChance(chance) {
  const percent = chance * 100
  if (percent >= 1) return `${formatDecimal(percent, 1)}%`
  if (percent >= 0.001) return `${Number(percent.toPrecision(3))}%`
  return `${percent.toExponential(2)}%`
}

// How many times more of something: 1.06, 4.08, 504, 43,600, 1.31e7
export function formatTimesMore(value) {
  if (value < 100) return formatDecimal(value, 2)
  if (value < 1e6) return Math.round(value).toLocaleString()
  return formatMulti(value)
}

// Seconds as a rough wait: 45 min, 22 h, 27.4 days, 3.1 years, 1,000+ years
export function formatWait(seconds) {
  if (!Number.isFinite(seconds)) return 'never'
  const hours = seconds / 3600
  if (hours < 1) return `${Math.max(1, Math.round(seconds / 60))} min`
  if (hours < 48) return `${formatDecimal(hours, 1)} h`
  const days = hours / 24
  if (days < 365) return `${formatDecimal(days, 1)} days`
  const years = days / 365
  return years < 1000 ? `${formatDecimal(years, 1)} years` : '1,000+ years'
}

// Fills a bonus text's placeholders: { = value, } = multiplier, $ = rounded-up value
export function fillBonusText(text, value) {
  if (!text) return ''
  return text
    .replace('{', formatDecimal(value, 2))
    .replace('}', formatDecimal(1 + value / 100, 2))
    .replace('$', Math.ceil(value).toString())
}


// ── Day / Night Market ────────────────────────────────────────────────────────

// The game floors market costs below this amount
const MARKET_COST_FLOOR_BELOW = 1e8

export const isNightMarket = upgrade => upgrade.index >= 8

// Emperor market discount (bonus 2) × Better Day I/II (exotic 34/35) or Better Night I/II (36/37)
const EMPEROR_MARKET_DISCOUNT = 2

export function marketCostMulti(snapshot, nightMarket) {
  const farming = snapshot?.farming
  const emperor = getEmperorBonus(snapshot, EMPEROR_MARKET_DISCOUNT)
  const [a, b] = nightMarket ? [36, 37] : [34, 35]
  return Math.max(0.001, 1 - emperor / (emperor + 100))
    * Math.max(0.1, 1 - getExoticBonus(farming, a) / 100)
    * Math.max(0.1, 1 - getExoticBonus(farming, b) / 100)
}

// Game: FarmingStuffs("MarketCostQTY")
export function marketLevelCost(upgrade, level, costMulti = 1) {
  const value = upgrade.cost * Math.pow(upgrade.costExponent, level) * costMulti
  return value < MARKET_COST_FLOOR_BELOW ? Math.floor(value) : value
}

// Which crop a Day Market level costs. Land Plots skips ahead every 3rd/4th level.
export function marketCropId(upgrade, level) {
  const { index, cropId, cropIdIncrement } = upgrade
  const steps = index === 0
    ? level + 2 * Math.floor(level / 3) + Math.floor(level / 4)
    : level
  return Math.floor(cropId + cropIdIncrement * steps)
}

// Upcoming costs from the current level, as [{ cropId, cost }].
// Day Market: levels grouped by crop, up to 4 crops (several levels often share one crop).
// Night Market: the next 4 levels one by one, all paid in magic beans (cropId null).
export function marketUpcomingCosts(upgrade, level, costMulti = 1) {
  const costs = []

  if (isNightMarket(upgrade)) {
    for (let lv = level; lv < upgrade.maxLvl && costs.length < 4; lv++) {
      costs.push({
        cropId: null,
        cost: marketLevelCost(upgrade, lv, costMulti),
      })
    }
    return costs
  }

  const byCrop = new Map()
  for (let lv = level; lv < upgrade.maxLvl; lv++) {
    const cropId = marketCropId(upgrade, lv)
    if (!byCrop.has(cropId) && byCrop.size === 4) break
    byCrop.set(cropId, (byCrop.get(cropId) ?? 0) + marketLevelCost(upgrade, lv, costMulti))
  }
  byCrop.forEach((cost, cropId) => costs.push({
    cropId,
    cost,
  }))
  return costs
}

// ── Exotic Market ─────────────────────────────────────────────────────────────

const WEEK_SECONDS = 604800

// The game's seeded LavaRand
function lavaHash(e) {
  let a = 5381
  e = Math.imul(e, -0x3361d2af)
  a ^= e = Math.imul((e << 15) | (e >>> 17), 0x1b873593)
  a = Math.imul((a << 13) | (a >>> 19), 5) + -0x19ab949c | 0
  a = Math.imul(a ^ (a >> 16), -0x7a143595)
  return (a = Math.imul(a ^ (a >> 13), -0x3d4d51cb)) ^ (a >> 16)
}

function lavaRand(seed) {
  let s1 = seed || 1
  let s2 = lavaHash(seed) || 1
  s1 = 36969 * (65535 & s1) + (s1 >> 16)
  s2 = 18000 * (65535 & s2) + (s2 >> 16)
  return (1073741823 & (s1 << 16) + s2) % 10007 / 10007
}

// The 8 exotic upgrade indices (0–59) on sale during the week containing `unixSeconds`
export function getExoticRotation(unixSeconds) {
  const seed = Math.round(100 * Math.floor(unixSeconds / WEEK_SECONDS))
  const selected = []
  for (let i = 0; i < 8; i++) {
    let attempts = 0
    let index
    do {
      index = Math.floor(Math.max(0, Math.min(59, 60 * lavaRand(seed + i + attempts * 1000))))
      attempts++
    } while (selected.includes(index))
    selected.push(index)
  }
  return selected
}

export function rotationTimeLeft(unixSeconds) {
  const secondsLeft = Math.floor(WEEK_SECONDS - (unixSeconds % WEEK_SECONDS))
  const d = Math.floor(secondsLeft / 86400)
  const h = Math.floor((secondsLeft % 86400) / 3600)
  const m = Math.floor((secondsLeft % 3600) / 60)
  return `${d}d ${h}h ${m}m`
}

// Legend talent "Buy One Get One Free": }x more LVs when buying Exotic Market upgrades
export const BUY_ONE_GET_ONE_TALENT = 8

// How many exotic levels a crop stack buys, after Better Exotic (exotic 38)
// and the Buy One Get One Free legend talent.
export function exoticLevelsFromCrops(cropQty, farming, legendTalentLevel) {
  const betterExotic = getExoticBonus(farming, 38)
  const totalMulti = (1 + betterExotic / 100) * getLegendTalentMulti(BUY_ONE_GET_ONE_TALENT, legendTalentLevel)
  const baseQty = cropQty / totalMulti
  if (baseQty <= 1) return 0
  return Math.floor(Math.log10(baseQty) * 10.36 + 1)
}

// ── Land Rank Database ────────────────────────────────────────────────────────
// Scoring and optimizer ported from Toolbox getLandRankGoalScore /
// getOptimizedLandRankUpgrades. Not modeled: the vote ballot bonus (vote 29)
// and the grimoire part of the 5th column max level, which the snapshot doesn't parse.

// Each Overgrowth doubles a crop's value, capped at 1e9x, which OG 30 (2^30) passes
export const OG_MAX = 30

// 5th column: linear, level-capped, boosts character stats instead of farming
export const SEED_RANKS = [4, 9, 14, 19]

// 0 and 1 scale with the plot's own rank, 2 with the previous plot's rank
export const PER_PLOT_RANKS = new Set([0, 1, 2])

// Upgrades grouped by the farming stat they boost
export const LAND_RANK_GOALS = {
  evolution: {
    label: 'Crop Evolution',
    upgrades: [0, 3, 10, 15],
  },
  cropValue: {
    label: 'Crop Value',
    upgrades: [1, 8, 17],
  },
  rankExp: {
    label: 'Rank EXP',
    upgrades: [2, 6, 13],
  },
  overgrowth: {
    label: 'Overgrowth',
    upgrades: [7, 11, 18],
  },
  farmingExp: {
    label: 'Farming EXP',
    upgrades: [5, 12, 16],
  },
}

const GOAL_OF_UPGRADE = Object.fromEntries(
  Object.entries(LAND_RANK_GOALS).flatMap(([goal, { upgrades }]) => upgrades.map(i => [i, goal]))
)

// Multiplier on every Land Rank Database bonus: Dank Ranks (Death Bringer talent 207, with the
// played character's added levels) × Plump Database (exotic 14)
const DANK_RANKS_TALENT = 207

export function getRankMulti(snapshot) {
  const exoticMulti = 1 + getExoticBonus(snapshot?.farming, 14) / 100
  return Math.max(1, getAccountTalentBonus(snapshot, DANK_RANKS_TALENT).value) * exoticMulti
}

// 5th column max LV: 1 + grimoire 9 + Datadigging (exotic 15) + Extended Database (legend 3)
const DATABASE_EXPANSION_GRIMOIRE = 9
const EXTENDED_DATABASE_TALENT = 3

export function getSeedRankMaxLevel(snapshot) {
  const farming = snapshot?.farming
  const max = Math.round(1
    + getGrimoireBonus(snapshot?.grimoire, DATABASE_EXPANSION_GRIMOIRE)
    + Math.ceil(getExoticBonus(farming, 15))
    + getLegendTalentBonus(EXTENDED_DATABASE_TALENT, getLegendTalentLevel(snapshot?.legendTalents, EXTENDED_DATABASE_TALENT)))
  const owned = Math.max(0, ...SEED_RANKS.map(i => farming?.upgradesLevels?.[i] ?? 0))
  return Math.max(max, owned)
}

// The plots each goal sums over (Toolbox getOptimizedLandRankUpgrades): growing plots,
// or every plot between harvests. Soil EXP Boost reads the plot physically before each one.
function getPlotContext(farming) {
  const ranks = farming?.farmingRanks ?? []
  const plots = farming?.plots?.length
    ? farming.plots
    : ranks.map((_, index) => ({ index, seedType: 0 }))
  const growing = plots.filter(p => p.seedType !== -1)
  const scored = growing.length ? growing : plots
  const { constant, cap } = cropValueParts(farming)
  return {
    plotRanks: scored.map(p => ranks[p.index] ?? 0),
    plotPrevRanks: scored.map(p => ranks[Math.max(0, p.index - 1)] ?? 0),
    cropValueConstant: constant,
    cropValueCap: cap,
  }
}

// Everything in a plot's crop multiplier that land ranks don't touch (game: CropsBonusValue)
function cropValueParts(farming) {
  const market = farming?.marketLevels ?? []
  const counts = farming?.gmoCropCounts ?? {}
  const superGmo = 1 + (market[15] ?? 0) * 0.5 * (counts[100000] ?? 0) / 100
  const valueGmo = superGmo * (1 + (market[14] ?? 0) * 0.02 * (counts[10000] ?? 0) / 100)
  // Product Doubler (market 5): +3% per level, every full 100% is another 1x
  const productDoubler = Math.max(1, Math.floor(1 + (market[5] ?? 0) * 3 / 100))
  return {
    constant: productDoubler * Math.max(1, valueGmo),
    cap: 1e4 * (1 + (getExoticBonus(farming, 23) + getExoticBonus(farming, 24) + getExoticBonus(farming, 25)) / 100),
  }
}

// A goal's score in log space, so goals can be added together (Toolbox getLandRankGoalScore).
// `b(i)` = bonus of upgrade i at the levels being scored.
function goalScore(goal, b, ctx) {
  const { plotRanks, plotPrevRanks, cropValueConstant, cropValueCap } = ctx
  const sumPlots = fn => Math.log(plotRanks.reduce((sum, rank, i) => sum + fn(rank, i), 0))
  if (goal === 'evolution') {
    if (!plotRanks.length) return 0
    const shared = (1 + b(3) / 100) * (1 + b(10) / 100) * (1 + b(15) / 100)
    return sumPlots(rank => shared * (1 + b(0) * rank / 100))
  }
  if (goal === 'cropValue') {
    // Past the cap a plot gains nothing, so capped value is what gets scored
    if (!plotRanks.length) return 0
    const shared = cropValueConstant * (1 + (b(8) + b(17)) / 100)
    return sumPlots(rank => Math.min(cropValueCap, shared * (1 + b(1) * rank / 100)))
  }
  if (goal === 'rankExp') {
    if (!plotRanks.length) return 0
    const shared = 1 + (b(6) + b(13)) / 100
    return sumPlots((_, i) => shared * (1 + b(2) * plotPrevRanks[i] / 100))
  }
  if (goal === 'overgrowth') return Math.log(1 + (b(7) + b(11) + b(18)) / 100)
  if (goal === 'farmingExp') return Math.log(1 + (b(5) + b(12) + b(16)) / 100)
  return 0
}

const bonusesAt = (levels, rankMulti) => i => calcRankBonus(landRankMap[i], levels[i] ?? 0, rankMulti)

// Lowest and highest Overgrowth on your planted plots, from the save
function getOgRange(farming) {
  const plots = (farming?.plots ?? []).filter(p => p.seedType !== -1)
  const ogs = plots.map(p => p.currentOG ?? 0)
  return {
    lowestOg: ogs.length ? Math.min(...ogs) : 0,
    highestOg: ogs.length ? Math.max(...ogs) : 0,
  }
}

// Stat chips under the Land Rank Database
export function getLandRankTotals(farming, rankMulti) {
  const b = bonusesAt(farming?.upgradesLevels ?? [], rankMulti)
  const ctx = getPlotContext(farming)
  const plotCount = ctx.plotRanks.length
  const shared = ctx.cropValueConstant * (1 + (b(8) + b(17)) / 100)
  const plotValues = ctx.plotRanks.map(rank => Math.round(shared * (1 + b(1) * rank / 100)))
  return {
    // Average land rank evolution multi per scored plot
    cropEvolution: plotCount ? Math.exp(goalScore('evolution', b, ctx)) / plotCount : 1,
    cappedPlots: plotValues.filter(v => v >= ctx.cropValueCap).length,
    plotCount,
    lowestCropValue: plotCount ? Math.min(...plotValues) : 0,
    cropValueCap: ctx.cropValueCap,
    ...getOgRange(farming),
  }
}

// Adds points one at a time to whichever unlocked upgrade of `goals` raises the summed
// goal score most. Every upgrade costs 1 point and is concave, so greedy is optimal.
// Returns the points it couldn't use (locked, or no gain left).
function greedyAllocate(goals, points, levels, rankMulti, ctx, totalRankPoints) {
  const b = bonusesAt(levels, rankMulti)
  const current = Object.fromEntries(goals.map(g => [g, goalScore(g, b, ctx)]))
  const candidates = goals
    .flatMap(g => LAND_RANK_GOALS[g].upgrades)
    .filter(i => totalRankPoints >= landRankMap[i].unlockAt)
  let left = points
  while (left > 0) {
    let best = null
    for (const i of candidates) {
      const goal = GOAL_OF_UPGRADE[i]
      levels[i]++
      const score = goalScore(goal, b, ctx)
      levels[i]--
      const gain = score - current[goal]
      if (!best || gain > best.gain) best = { i, goal, score, gain }
    }
    if (!best || best.gain <= 0) break
    levels[best.i]++
    current[best.goal] = best.score
    left--
  }
  return left
}

// Plans where plot rank points should go. Points can only come back out of the database
// by resetting all of them, so there are two modes:
// - spend (default): only the unspent points, added on top of the current levels
// - fullReset: every point from scratch
// Either way: seed ranks (5th column) up to `seedLevel` first, then the points reserved for
// Farming EXP, then everything else to whatever raises Crop Evolution × Crop Value × Rank EXP
// × Overgrowth the most (Toolbox's "all" goal, which also stops buying crop value once every
// plot is capped). Returns { levels, leftover } with levels indexed like landRankMap.
export function optimizeLandRanks(farming, rankMulti, { seedLevel, farmExpPoints, fullReset = false }) {
  const totalRankPoints = farming?.totalRankPoints ?? 0
  const currentLevels = farming?.upgradesLevels ?? []
  const ctx = getPlotContext(farming)
  const levels = landRankMap.map((_, i) => (fullReset ? 0 : currentLevels[i] ?? 0))
  const spent = levels.reduce((sum, level) => sum + level, 0)
  let left = Math.max(0, totalRankPoints - spent)

  for (const i of SEED_RANKS) {
    if (totalRankPoints < landRankMap[i].unlockAt) continue
    const add = Math.min(Math.max(0, seedLevel - levels[i]), left)
    levels[i] += add
    left -= add
  }

  const farmExpPool = Math.min(Math.max(0, farmExpPoints), left)
  left -= farmExpPool
  left += greedyAllocate(['farmingExp'], farmExpPool, levels, rankMulti, ctx, totalRankPoints)
  left = greedyAllocate(['evolution', 'cropValue', 'rankExp', 'overgrowth'], left, levels, rankMulti, ctx, totalRankPoints)

  return {
    levels,
    leftover: left,
  }
}

// % change per goal going from `before` to `after` levels
export function compareLandRankPlans(farming, rankMulti, before, after) {
  const ctx = getPlotContext(farming)
  const scoreBefore = bonusesAt(before, rankMulti)
  const scoreAfter = bonusesAt(after, rankMulti)
  return Object.keys(LAND_RANK_GOALS).map(goal => ({
    goal,
    label: LAND_RANK_GOALS[goal].label,
    change: 100 * (Math.exp(goalScore(goal, scoreAfter, ctx) - goalScore(goal, scoreBefore, ctx)) - 1),
  }))
}

// ── Crop Evolution Multi ──────────────────────────────────────────────────────
// Every multiplier in the game's crop evolution chance (Toolbox getCropEvolution), each
// read from its own system's utils. Sources not ported yet count as 1x and are marked
// 'missing'; 'input' ones wait on a value the player types in (the save doesn't hold it) and
// also count as 1x until then; 'partial' ones are missing some inner boosts (listed in `missing`).

const sproutlucks = [0, 1, 2, 3]
const geneologies = [
  { exotic: 4, above: 50 },
  { exotic: 5, above: 100 },
  { exotic: 6, above: 150 },
  { exotic: 7, above: 200 },
  { exotic: 8, above: 250 },
]
const MASS_IRRIGATION_TALENT = 205
const CROPIUS_MAPPER_BUBBLE = 'c25'
const CROP_CHAPTER_BUBBLE = '_29'
const CROP_EVO_VIAL_STAT = '6FarmEvo'
const CROP_EVO_CARD_EFFECT = '+{% Farming EVO Multi (Passive)'
const CROP_EVO_VAULT_UPGRADE = 78
const SACRIFICE_OF_HARVEST_GRIMOIRE = 14
const LIL_OVERGROWTH_ACHIEVEMENT = 355
const CROP_EVO_SUSHI = 35
const CROP_EVO_BALLOT = 29
const CROP_EVO_STAMP_EFFECT = 'Crop Evolution Chance'
// The game's crop evo formula reads Button slot 5, even though the name list labels slot 7
// "Crop Evo" (same as Toolbox; checked against the in-game Crop Evolution Multi)
const CROP_EVO_BUTTON = 5
const CROP_EVO_STICKER = 4

function source(id, label, system, multi, extra = {}) {
  return {
    id,
    label,
    system,
    multi,
    status: extra.status ?? 'exact',
    missing: extra.missing ?? [],
    note: extra.note,
  }
}

const needsInput = (id, label, system, note) => source(id, label, system, 1, {
  status: 'input',
  note,
})

// Status for a { value, missing } result: partial while any inner boost isn't read
const statusOf = ({ missing }) => ({
  status: missing.length ? 'partial' : 'exact',
  missing,
})

// tomePoints: total Tome points typed in by the player (not in the save).
export function getCropEvolutionBreakdown(snapshot, rankMulti, { tomePoints } = {}) {
  const farming = snapshot?.farming ?? {}
  const market = farming.marketLevels ?? []
  const characters = snapshot?.characters ?? []
  // Character-dependent sources use the character the save was taken on, like the game
  const activeIndex = getActiveCharacterIndex(snapshot)
  const activeCharacter = characters[activeIndex]
  const farmingLevel = getSkillLevel(activeCharacter, 'farming')
  const starSign = getStarSignBonus(snapshot, 'Crop_Evo', activeIndex)
  const massIrrigation = getAccountTalentBonus(snapshot, MASS_IRRIGATION_TALENT)

  // Market: Biology Boost (+15%/LV) and Evolution GMO (compounds per crop with 200+ stock)
  const counts = farming.gmoCropCounts ?? {}
  const superGmo = 1 + (market[15] ?? 0) * 0.5 * (counts[100000] ?? 0) / 100
  const evolutionGmo = superGmo * Math.pow(1 + (market[9] ?? 0) * 0.8 / 100, counts[200] ?? 0)

  // Land ranks: the shared multiplicative total, plus Evolution Boost × the plot's rank
  const b = bonusesAt(farming.upgradesLevels ?? [], rankMulti)
  const ranks = farming.farmingRanks ?? []
  const avgRank = ranks.length ? ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length : 0
  const voteSelected = isBallotBonusSelected(snapshot?.voteBallot, CROP_EVO_BALLOT)

  const cropius = getBubbleBonus(snapshot, CROPIUS_MAPPER_BUBBLE)
  const cropChapter = getBubbleBonus(snapshot, CROP_CHAPTER_BUBBLE)
  const tomeMulti = getTomeBubbleMulti(tomePoints)
  const hasTomePoints = Number(tomePoints) > 0
  const clearedW6Maps = countClearedMaps(characters, WORLD_6_FIRST_MAP, WORLD_6_MAP_COUNT)
  const vial = getVialBonusByStat(snapshot, CROP_EVO_VIAL_STAT)
  const stamp = getStampBonusByEffect(snapshot, CROP_EVO_STAMP_EFFECT)
  const meal = getMealBonusByStat(snapshot, 'zCropEvo')
  const summoningMeal = getMealBonusByStat(snapshot, 'zCropEvoSumm')
  // Nyanborgir: x1 at Summoning LV 0-48, x2 from 49, x3 from 99...
  const summoningLevel = getSkillLevel(activeCharacter, 'summoning')
  const summoningMealMulti = Math.ceil((summoningLevel + 1) / 50)
  const geneology = geneologies.reduce((sum, { exotic, above }) => (
    sum + Math.max(0, farmingLevel - above) * getExoticBonus(farming, exotic)
  ), 0)

  const sources = [
    source('biology', 'Biology Boost', 'Farming market', 1 + (market[4] ?? 0) * 15 / 100),
    source('gmo', 'Evolution GMO', 'Farming market', Math.max(1, evolutionGmo), {
      note: `${counts[200] ?? 0} crops with 200+ stock`,
    }),
    source('winner', 'Summoning winner bonus', 'Summoning', 1 + getWinnerBonusByName(snapshot, '<x Crop EVO') / 100),
    source('lamp', 'The Lamp', 'Caverns (W5)', 1 + getLampBonus(snapshot, 2, 0) / 100),
    hasTomePoints
      ? source('cropChapter', 'Crop Chapter (bubble)', 'Alchemy', 1 + cropChapter * tomeMulti / 100, {
        note: `${Number(tomePoints).toLocaleString()} Tome points (x${tomeMulti})`,
      })
      : needsInput('cropChapter', 'Crop Chapter (bubble)', 'Alchemy', 'Enter your Tome points above (the save doesn\'t store them)'),
    source('cropius', 'Cropius Mapper (bubble)', 'Alchemy', 1 + cropius * clearedW6Maps / 100, {
      note: `${clearedW6Maps} World 6 maps cleared across characters`,
    }),
    source('vial', 'Flavorgil (vial)', 'Alchemy', 1 + vial.value / 100, statusOf(vial)),
    source('card', 'Jellofish card', 'Cards', 1 + getPassiveCardBonus(CROP_EVO_CARD_EFFECT, snapshot?.cards) / 100),
    source('meal', 'Bill Jack Pep (meal)', 'Cooking', 1 + meal.value / 100, statusOf(meal)),
    source('summoningMeal', 'Nyanborgir (meal)', 'Cooking', 1 + summoningMeal.value * summoningMealMulti / 100, {
      ...statusOf(summoningMeal),
      note: `x${summoningMealMulti} at Summoning LV ${summoningLevel}`,
    }),
    source('vault', 'Croppius Evolvius (vault)', 'Upgrade Vault', 1 + getUpgradeVaultBonus(snapshot?.upgradeVault, CROP_EVO_VAULT_UPGRADE) / 100),
    source('monument', 'Wisdom Monument', 'Caverns (W5)', 1 + getMonumentBonus(snapshot, 2, 4) / 100),
    source('stamp', 'Crop Evo Stamp', 'Stamps', 1 + stamp.value / 100, statusOf(stamp)),
    source('grimoire', 'Sacrifice of Harvest (grimoire)', 'Grimoire', 1 + getGrimoireBonus(snapshot?.grimoire, SACRIFICE_OF_HARVEST_GRIMOIRE) / 100),
    source('achievement', "Lil' Overgrowth (achievement)", 'Achievements', isAchievementComplete(snapshot?.achievements, LIL_OVERGROWTH_ACHIEVEMENT) ? 1.05 : 1),
    source('killroy', 'Killroy shop', 'Killroy', Math.max(1, getKillroyBonus(snapshot?.killroy, KILLROY_CROP_EVO))),
    source('mastery', 'Farming skill mastery', 'Rift', isSkillMasteryBonusUnlocked(snapshot, 'farming', 1) ? 1.15 : 1),
    source('starSign', 'Crop Evo star signs', 'Star signs', 1 + starSign.value * farmingLevel / 100, statusOf(starSign)),
    source('landRankTotal', 'Land rank total', 'Farming land ranks', Math.max(1, (1 + b(3) / 100) * (1 + b(10) / 100) * (1 + b(15) / 100))),
    source('massIrrigation', 'Mass Irrigation (talent)', 'Talents', Math.max(1, massIrrigation.value), {
      note: `LV ${getAccountTalentLevel(snapshot, MASS_IRRIGATION_TALENT).value}`,
    }),
    source('landRankPlot', 'Evolution Boost × plot rank', 'Farming land ranks', 1 + b(0) * avgRank / 100, {
      status: voteSelected ? 'partial' : 'exact',
      missing: voteSelected ? ['Vote ballot bonus'] : [],
      note: 'Average plot rank',
    }),
    ...sproutlucks.map(i => source(`sproutluck${i}`, exoticMarketMap[i].label, 'Exotic market', 1 + getExoticBonus(farming, i) / 100)),
    source('button', 'The Button', 'Button (W7)', 1 + getButtonBonus(snapshot, CROP_EVO_BUTTON) / 100),
    source('sticker', 'Crop Evo sticker', 'Research (W7)', 1 + getStickerBonus(snapshot, CROP_EVO_STICKER) / 100),
    source('geneology', 'Geneology I-V', 'Exotic market', 1 + geneology / 100, {
      note: `Farming LV ${farmingLevel}`,
    }),
    source('sushi', 'Sushi Station', 'Sushi (W7)', 1 + getSushiBonus(snapshot?.sushi, CROP_EVO_SUSHI) / 100),
  ]

  return {
    sources,
    total: sources.reduce((product, s) => product * s.multi, 1),
    // Evolution Boost % per plot rank and the average rank the total uses, so callers can
    // swap in one plot's own rank (getCropPushOutlook)
    perRankBonus: b(0),
    avgRank,
  }
}

// ── Next Crop Outlook ─────────────────────────────────────────────────────────
// How long until the next undiscovered crop, if every plot is planted with its seed.
// Each growth cycle, every plot rolls once to evolve one tier up its seed's chain (Toolbox
// getCropEvolution): chance = 30% × decay^tier × the plot's evo multi, capped at 100%.
// A fresh plant starts at tier 0, so even certain steps take one growth each.

export const LAST_CROP_ID = seedInfo[seedInfo.length - 1].cropIdMax
export const TOTAL_CROPS = LAST_CROP_ID + 1
// The game fills every seed's base chance with Basic's (Toolbox: SeedInfo[0][5])
const EVO_BASE_CHANCE = seedInfo[0].nextCropChance
const MEDAL_SEED = 6
const MEDAL_GROWTH_SECONDS = 25200 // Medal growth ignores growth speed
const HORIZON_CYCLES = 5000
const SPEED_GMO_STOCK = 1000
const GROWTH_EXOTIC = 30 // Gogogrow

// Growth speed multiplier (Toolbox updateFarming): Speed GMO × (Nutritious Soil + vial + exotic) × summoning
export function getGrowthRate(snapshot) {
  const farming = snapshot?.farming
  const market = farming?.marketLevels ?? []
  const counts = farming?.gmoCropCounts ?? {}
  const superGmo = 1 + (market[15] ?? 0) * 0.5 * (counts[100000] ?? 0) / 100
  const speedGmo = superGmo * (1 + (market[10] ?? 0) * 0.3 * (counts[SPEED_GMO_STOCK] ?? 0) / 100)
  const soil = market[2] ?? 0
  const vial = getVialBonusByStat(snapshot, '6FarmSpd').value
  const summoning = getWinnerBonusByName(snapshot, '<x Farming SPD')
  return Math.max(1, speedGmo)
    * (1 + (soil + vial + getExoticBonus(farming, GROWTH_EXOTIC)) / 100)
    * (1 + summoning / 100)
}

// Real seconds per growth cycle for a seed
export function getGrowthSeconds(snapshot, seedType) {
  if (seedType === MEDAL_SEED) return MEDAL_GROWTH_SECONDS
  return 14400 * Math.pow(1.5, seedType) / getGrowthRate(snapshot)
}

const stepChance = (seed, tier, multi) => Math.min(1, EVO_BASE_CHANCE * Math.pow(seed.nextCropDecay, tier) * multi)

// Crop ids not in the depot yet, lowest first (never past the last crop)
export function getUndiscoveredCrops(farming) {
  const depot = farming?.cropDepot ?? {}
  const missing = []
  for (let id = 0; id <= LAST_CROP_ID; id++) {
    if (!depot[String(id)]) missing.push(id)
  }
  return missing
}

// Steps one plot's tier distribution forward a growth at a time (one roll per growth) and calls
// onCycle(cycle, dist) after each, where dist[tier] = chance the plot sits at that tier.
function walkPlot(seed, startTier, multi, maxTier, cycles, onCycle) {
  let dist = new Float64Array(maxTier + 1)
  dist[Math.min(startTier, maxTier)] = 1
  const chances = Array.from({ length: maxTier }, (_, tier) => stepChance(seed, tier, multi))
  for (let cycle = 1; cycle <= cycles; cycle++) {
    const next = new Float64Array(maxTier + 1)
    next[maxTier] = dist[maxTier]
    for (let tier = 0; tier < maxTier; tier++) {
      const moved = dist[tier] * chances[tier]
      next[tier] += dist[tier] - moved
      next[tier + 1] += moved
    }
    dist = next
    onCycle(cycle, dist)
  }
}

// One plot's evo multi: the breakdown total uses the average plot rank, so swap in this plot's
function plotMulti(evo, rank) {
  const avgTerm = 1 + evo.perRankBonus * evo.avgRank / 100
  return evo.total / avgTerm * (1 + evo.perRankBonus * rank / 100)
}

// Unlocked plots grouped by (rank, starting tier), planted with `seed`: plots already growing it
// keep their tier, the rest start fresh
function plotGroups(farming, seed) {
  const ranks = farming?.farmingRanks ?? []
  const groups = new Map()
  ;(farming?.plots ?? []).filter(plot => !plot.isLocked).forEach(plot => {
    const rank = ranks[plot.index] ?? 0
    const start = plot.seedType === seed.seedId ? plot.cropType : 0
    const key = `${rank}|${start}`
    const group = groups.get(key) ?? { rank, start, size: 0 }
    group.size++
    groups.set(key, group)
  })
  return [...groups.values()]
}

// Insta grows: each finishes one plot's growth on the spot, so it's one extra evolution roll.
// FarmUpg[19] = banked; the Instagrow Generator (gem shop 139) adds 2 a day per purchase.
// Mass Irrigation (talent 205) makes an insta grow also grow every plot above and below it, so one
// insta grow covers a whole column: one plot per row of 9 (4 on a full 36-plot farm).
const INSTAGROW_GENERATOR = 139
const INSTAGROWS_PER_PURCHASE = 2
const PLOTS_PER_ROW = 9

export function getInstaGrows(snapshot) {
  const plotCount = snapshot?.farming?.plots?.length ?? 0
  const columnSize = getAccountTalentLevel(snapshot, MASS_IRRIGATION_TALENT).value > 0
    ? Math.max(1, Math.ceil(plotCount / PLOTS_PER_ROW))
    : 1
  return {
    banked: Math.max(0, Math.floor(snapshot?.farming?.instaGrow ?? 0)),
    daily: INSTAGROWS_PER_PURCHASE * getGemShopPurchases(snapshot?.gemShop, INSTAGROW_GENERATOR),
    // Plots each insta grow rolls for
    plotsPerInsta: columnSize,
  }
}

// reach[t][n] = chance one plot of the group has reached tiers[t] after n rolls
function reachByRolls(seed, group, evo, tiers, rolls) {
  const maxTier = Math.max(...tiers)
  const reach = tiers.map(() => new Float64Array(rolls + 1))
  tiers.forEach((tier, t) => {
    reach[t][0] = Math.min(group.start, maxTier) >= tier ? 1 : 0
  })
  walkPlot(seed, group.start, plotMulti(evo, group.rank), maxTier, rolls, (roll, dist) => {
    let reached = 0
    let t = tiers.length - 1
    // Sum dist from the top down, reading off each target tier on the way
    for (let tier = maxTier; tier >= 0 && t >= 0; tier--) {
      reached += dist[tier]
      while (t >= 0 && tiers[t] === tier) {
        reach[t][roll] = Math.min(1, reached)
        t--
      }
    }
  })
  return reach
}

// Smallest n with values[n] at or above the target, or null
function firstAtLeast(values, target) {
  for (let n = 0; n < values.length; n++) {
    if (values[n] >= target) return n
  }
  return null
}

// Outlook for the next `count` undiscovered crops (stops at the last crop), assuming every unlocked
// plot is planted with the crop's seed. evo = getCropEvolutionBreakdown(). With insta grows, they all
// go into one plot, or one column with Mass Irrigation (the best-ranked plots stand in for its
// ranks): it climbs fastest, and once it's one tier below, every insta grow is another roll for
// each of its plots. Each crop:
//   chance          best plot's odds per roll of evolving into it
//   multiNeeded     x more evo multi for a sure roll (1 if already sure)
//   climbCycles     sure growths from a fresh plant before the first uncertain roll
//   lastRollCycles  growths until any plot evolves, once every plot is one tier below
//   medianCycles    growths until a 50% chance, without insta grows
//   instaMedianCycles  the same, spending insta grows (0 = right away with the banked ones)
//   instaFor50/90   insta grows on that plot/column for a 50% / 90% chance right away (rough when huge)
//   focusPlots      plots each insta grow rolls for (4 with Mass Irrigation on a full farm)
export function getCropPushOutlook(snapshot, evo, { count = 10 } = {}) {
  const farming = snapshot?.farming
  const insta = getInstaGrows(snapshot)
  const targets = getUndiscoveredCrops(farming).slice(0, count)
  const bySeed = new Map()
  targets.forEach(cropId => {
    const seed = getSeedByCropId(cropId)
    bySeed.set(seed, [...(bySeed.get(seed) ?? []), cropId])
  })

  return [...bySeed.entries()].flatMap(([seed, cropIds]) => {
    const groups = plotGroups(farming, seed)
    const plotCount = groups.reduce((sum, group) => sum + group.size, 0)
    const growthSeconds = getGrowthSeconds(snapshot, seed.seedId)
    const instaPerGrowth = insta.daily * growthSeconds / 86400
    const tiers = cropIds.map(cropId => cropId - seed.cropIdMin)
    // The insta grow plot: the best-ranked, furthest along
    const focus = groups.reduce((best, group, g) => {
      const top = groups[best]
      return group.rank > top.rank || (group.rank === top.rank && group.start > top.start) ? g : best
    }, 0)
    // Rolls to walk: the horizon's natural growths, plus every insta grow it could add for the insta plot
    const rolls = HORIZON_CYCLES + insta.banked + Math.ceil(instaPerGrowth * HORIZON_CYCLES)
    const reaches = groups.map((group, g) => reachByRolls(seed, group, evo, tiers, g === focus ? rolls : HORIZON_CYCLES))
    const bestMulti = plotMulti(evo, groups[focus]?.rank ?? 0)
    // Plots the insta grows land on, and how many plots of each group are left rolling naturally
    const focusPlots = Math.min(insta.plotsPerInsta, plotCount)
    let toTake = focusPlots
    const restSizes = groups.map(group => group.size)
    ;[focus, ...groups.keys()].forEach(g => {
      const taken = Math.min(toTake, restSizes[g])
      restSizes[g] -= taken
      toTake -= taken
    })
    // Insta grows banked by the time of growth c: the bank plus every daily grant so far
    const instaBy = cycle => insta.banked + insta.daily * Math.floor(cycle * growthSeconds / 86400)
    let climbCycles = 0
    while (climbCycles < seed.cropIdMax - seed.cropIdMin && stepChance(seed, climbCycles, bestMulti) >= 1) climbCycles++

    return cropIds.map((cropId, t) => {
      const tier = tiers[t]
      const chance = tier > 0 ? stepChance(seed, tier - 1, bestMulti) : 1
      const base = tier > 0 ? EVO_BASE_CHANCE * Math.pow(seed.nextCropDecay, tier - 1) : 1
      const lastRollRate = groups.reduce((sum, group) => (
        sum + group.size * (tier > 0 ? stepChance(seed, tier - 1, plotMulti(evo, group.rank)) : 1)
      ), 0)
      const lastRollCycles = lastRollRate > 0 ? 1 / Math.min(1, lastRollRate) : Infinity

      // Chance nobody has it yet after `cycle` natural growths (focusRolls for the insta plots)
      const focusReach = reaches[focus]?.[t] ?? new Float64Array(1)
      const notYet = (cycle, focusRolls) => groups.reduce((product, group, g) => (
        product * Math.pow(1 - reaches[g][t][cycle], restSizes[g])
      ), Math.pow(1 - focusReach[Math.min(focusReach.length - 1, focusRolls)], focusPlots))
      let medianCycles = null
      let instaMedianCycles = null
      for (let cycle = 0; cycle <= HORIZON_CYCLES; cycle++) {
        if (medianCycles === null && notYet(cycle, cycle) <= 0.5) medianCycles = cycle
        if (instaMedianCycles === null && notYet(cycle, cycle + instaBy(cycle)) <= 0.5) instaMedianCycles = cycle
        if (medianCycles !== null && instaMedianCycles !== null) break
      }
      // Past the horizon: the climb plus the typical wait for the last roll
      const climb = Math.min(climbCycles, tier)
      medianCycles ??= climb + Math.LN2 * lastRollCycles
      instaMedianCycles ??= climb + Math.LN2 / Math.min(1, lastRollRate + instaPerGrowth * focusPlots * chance)

      // Insta grows for the focus plots to have a 50% / 90% chance between them
      const anyFocus = Float64Array.from(focusReach, reach => 1 - Math.pow(1 - reach, focusPlots))
      // Past the walked rolls: the climb plus the last roll's typical odds (rough)
      const focusStart = groups[focus]?.start ?? 0
      const beyond = target => Math.ceil(Math.max(0, climb - Math.min(focusStart, climb)) - Math.log(1 - target) / (focusPlots * chance))
      const for50 = firstAtLeast(anyFocus, 0.5) ?? beyond(0.5)
      const for90 = firstAtLeast(anyFocus, 0.9) ?? beyond(0.9)
      return {
        cropId,
        seed,
        tier,
        chance,
        multiNeeded: chance >= 1 ? 1 : 1 / (base * bestMulti),
        climbCycles: climb,
        lastRollCycles,
        medianCycles,
        instaMedianCycles: insta.banked + insta.daily > 0 ? instaMedianCycles : medianCycles,
        instaFor50: for50,
        instaFor90: for90,
        growthSeconds,
        plotCount,
        focusPlots,
      }
    })
  })
}

// Whether pushing for a crop is worth it now: sure (every roll lands), ready (your banked insta
// grows give a 50%+ shot on one plot, or the last roll takes under a day), slow (under a week), or wait
export const PUSH_VERDICTS = {
  sure: { label: 'Guaranteed', hint: 'Every roll lands, so it only takes the climb.' },
  ready: { label: 'Ready to push', hint: 'Your banked insta grows (or a last roll under a day) make it likely now.' },
  slow: { label: 'Slow push', hint: 'The last roll takes days. Doable, but more evo multi or insta grows would speed it up a lot.' },
  wait: { label: 'Build evo multi first', hint: 'The last roll takes over a week. Beans and evo bonuses are worth more right now.' },
}

export function getPushVerdict(outlook, instaGrows) {
  if (outlook.chance >= 1) return 'sure'
  if ((instaGrows?.banked ?? 0) >= outlook.instaFor50) return 'ready'
  const lastRollSeconds = outlook.lastRollCycles * outlook.growthSeconds
  if (lastRollSeconds <= 86400) return 'ready'
  if (lastRollSeconds <= 7 * 86400) return 'slow'
  return 'wait'
}

// How many times more evo multi the last roll needs so every plot together expects to land it
// within `seconds` (1 when it already does)
export function multiNeededWithin(outlook, seconds) {
  const { chance, growthSeconds, plotCount, multiNeeded } = outlook
  if (chance >= 1 || !plotCount) return 1
  const cycles = Math.max(1, seconds / growthSeconds)
  const target = Math.min(1, 1 / (cycles * plotCount))
  return Math.max(1, Math.min(multiNeeded, target / chance))
}
