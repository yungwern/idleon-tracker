import {
  summoningBonuses,
  summoningEnemyBonuses,
  summoningEndless,
  summoningStoneBosses,
  summoningColourNames,
  summoningUpgrades,
  summoningEssenceUpgrades,
  summoningDoublerModel,
  summoningDoublerNotes,
  mapEnemyData,
} from '../data'
import { getCharmBonus } from './sneakingUtils'
import { getArtifactBonus } from './sailingUtils'
import { getGemShopPurchases } from './gemShopUtils'
import { getMeritBonus } from './meritUtils'
import { isAchievementComplete } from './achievementUtils'
import { getArmorSetBonus } from './armorSetUtils'
import { isBundleOwned } from './bundleUtils'
import { getEmperorBonus } from './emperorUtils'
import { getAccountTalentBonus } from './talentUtils'
import { getActiveCharacter } from './characterUtils'
import { getSkillLevel } from './skillUtils'
import { getSummoningDoublers } from './cavernUtils'

// Summoning (W6) winner bonuses, from IdleonToolbox parsers/world-6/summoning.ts
// (getLocalWinnerBonus). Battle wins and endless battles add to each bonus; most are then
// boosted by the charm, gem shop, artifact, merit, achievements, armor set, bundle, emperor
// and winner bonus 31.

const WINNER_MULTI_BONUS = 31
const GEM_SHOP_WINNER = 11
const EMPEROR_WINNER = 8

// Raw total per bonus id from battles won (ids under 20) and endless battles
export function getRawWinnerBonuses(summoning) {
  const raw = {}
  for (const enemyId of summoning?.wonBattles ?? []) {
    const enemy = summoningEnemyBonuses[enemyId]
    if (enemy && enemy.bonusId < 20) raw[enemy.bonusId] = (raw[enemy.bonusId] ?? 0) + enemy.bonusQty
  }
  for (let i = 0; i < (summoning?.highestEndless ?? 0); i++) {
    const slot = i % summoningEndless.bonusIds.length
    const bonusId = summoningEndless.bonusIds[slot] - 1
    raw[bonusId] = (raw[bonusId] ?? 0) + summoningEndless.bonusQuantities[slot]
  }
  return raw
}

// The additive % every boosted winner bonus shares (without emperor and bonus 31)
function sharedBoost(snapshot) {
  return getArtifactBonus(snapshot?.sailing, 'The Winz Lantern')
    + Math.min(10, getMeritBonus(snapshot?.merits, 5, 4))
    + (isAchievementComplete(snapshot?.achievements, 373) ? 1 : 0)
    + (isAchievementComplete(snapshot?.achievements, 379) ? 1 : 0)
    + getArmorSetBonus(snapshot?.armorSmithySets, 'GODSHARD_SET')
    + (isBundleOwned(snapshot?.bundles, 'ban_i') ? 50 : 0)
}

// Winner bonus by bonus id, e.g. 10 = '<x Crop EVO' (a %, so the multi is 1 + value / 100)
export function getWinnerBonus(snapshot, bonusId) {
  const raw = getRawWinnerBonuses(snapshot?.summoning)
  const rawValue = raw[bonusId] ?? 0
  if ([20, 22, 24, WINNER_MULTI_BONUS].includes(bonusId)) return rawValue

  const charm = 1 + getCharmBonus(snapshot?.sneaking, 'Crystal Comb') / 100
  const gemShop = 1 + (10 * getGemShopPurchases(snapshot?.gemShop, GEM_SHOP_WINNER)) / 100
  const shared = sharedBoost(snapshot)
  if (bonusId === 19) return 3.5 * rawValue * charm * gemShop * (1 + shared / 100)

  const boost = shared + getEmperorBonus(snapshot, EMPEROR_WINNER) + (raw[WINNER_MULTI_BONUS] ?? 0)
  const scale = bonusId >= 20 && bonusId <= 33 ? 1 : 3.5
  return scale * rawValue * charm * gemShop * (1 + boost / 100)
}

export function getWinnerBonusByName(snapshot, text) {
  const bonusId = summoningBonuses.indexOf(text)
  return bonusId === -1 ? 0 : getWinnerBonus(snapshot, bonusId)
}

// ── Summoning stone bosses (Bosses tab) ──
// From Toolbox parsers/world-6/summoning.ts (summoningStones): each kill makes the next fight 4000x
// tougher, and the colour's stone-boosted upgrades are multiplied by 1 + kills.
const STONE_HP_GROWTH = 4000
const UPCOMING_FIGHTS = 14

export function getStoneBossHp(boss, kills) {
  return 2 * boss.baseHp * Math.pow(STONE_HP_GROWTH, kills)
}

export function getSummoningStoneBosses(summoning) {
  const stoneKills = summoning?.stoneKills ?? []
  return summoningStoneBosses.map(boss => {
    const kills = stoneKills[boss.index] ?? 0
    return {
      ...boss,
      kills,
      bonusMulti: kills > 0 ? 1 + kills : 1,
      nextBonusMulti: 2 + kills,
      hp: getStoneBossHp(boss, kills),
      upcoming: Array.from({ length: UPCOMING_FIGHTS }, (_, i) => ({
        kills: kills + i + 1,
        hp: getStoneBossHp(boss, kills + i + 1),
      })),
    }
  })
}

// Boss HP the way the game prints big numbers: 2.04e27 (two decimals, cut off, not rounded)
export function formatStoneHp(value) {
  if (value < 1e7) return Math.round(value).toLocaleString()
  const exponent = Math.floor(Math.log10(value))
  const mantissa = Math.floor((value / Math.pow(10, exponent)) * 100) / 100
  return `${mantissa.toFixed(2)}e${exponent}`
}

// ── Summoning doublers (Doublers tab) ──
// A Gambit doubler on an upgrade multiplies its bonus by 2 + max(0, Absolute Stardom / 100 - 1), plus
// Allstar (78) % on top (Toolbox summoning.ts). Each setup fills doublers in tiers, best gain first:
//   Damage: every damage / spike upgrade, then every mana upgrade, then HP (Eli: HP rarely helps you
//     progress, it only beats nothing), then the essence ranking for anything left.
//   Essence: essence per hour of every unlocked colour + cheaper upgrades (once per colour, every colour
//     pays costs), while a doubler still adds 1%; then the damage tiers.
// Only the summoning-upgrade parts of each formula are modelled: the rest are the same with or without a
// doubler, so they cancel out of every comparison.

const ABSOLUTE_STARDOM = 597
const SUMMONING_UPGRADE_COLOURS = summoningColourNames.length
const MIN_ESSENCE_GAIN = Math.log(1.01)

export const DOUBLER_SETUPS = {
  damage: 'damage',
  essence: 'essence',
}

// Pick tiers, in the order the Damage setup fills them
export const DOUBLER_TIERS = {
  damage: 'damage',
  mana: 'mana',
  health: 'health',
  essence: 'essence',
}

function getDoublerBaseMulti(snapshot) {
  const stardom = getAccountTalentBonus(snapshot, ABSOLUTE_STARDOM).value
  return 2 + Math.max(0, stardom / 100 - 1)
}

// Upgrade bonus before any doubler: level × qty × (1 + kills on its colour's stone boss)
function getUndoubledBonus(summoning, index) {
  const upgrade = summoningUpgrades[index]
  if (!upgrade) return 0
  const level = summoning?.upgradeLevels?.[index] ?? 0
  const kills = summoning?.stoneKills?.[upgrade.colour] ?? 0
  const stoneMulti = upgrade.stoneBoosted && kills > 0 ? 1 + kills : 1
  return level * upgrade.bonusQty * stoneMulti
}

// What one doubler multiplies an upgrade by on this account
export function getDoublerMulti(snapshot, placedIds = getSummoningDoublers(snapshot).placedIds) {
  const base = getDoublerBaseMulti(snapshot)
  const allstarIndex = summoningDoublerModel.allstar
  const allstar = getUndoubledBonus(snapshot?.summoning, allstarIndex) * (placedIds.includes(allstarIndex) ? base : 1)
  return base + allstar / 100
}

// Career wins per essence colour: white = the Pet battles, colour c = battles won against World c mobs
function getCareerWins(summoning) {
  const worldByMob = Object.fromEntries(mapEnemyData.map(entry => [entry.rawName, entry.world]))
  const wins = new Array(SUMMONING_UPGRADE_COLOURS).fill(0)
  for (const enemyId of summoning?.wonBattles ?? []) {
    if (String(enemyId).startsWith('Pet')) wins[0]++
    else if (worldByMob[enemyId] >= 1 && worldByMob[enemyId] < SUMMONING_UPGRADE_COLOURS) wins[worldByMob[enemyId]]++
  }
  return wins
}

function isColourUnlocked(summoning, colour) {
  if (colour === 0) return true
  const { summoning: unlockUpgrade, knowledge } = summoningEssenceUpgrades[colour]
  const unlockIndex = unlockUpgrade ?? knowledge
  return (summoning?.upgradeLevels?.[unlockIndex] ?? 0) >= 1
}

function getDoublerContext(snapshot) {
  const summoning = snapshot?.summoning
  const careerWins = getCareerWins(summoning)
  const highestEndless = summoning?.highestEndless ?? 0
  const totalWins = careerWins.reduce((sum, wins) => sum + wins, 0) + highestEndless
  const totalLevels = (summoning?.upgradeLevels ?? []).reduce((sum, level) => sum + level, 0)
  const doublers = getSummoningDoublers(snapshot)
  return {
    summoning,
    doublers,
    multi: getDoublerMulti(snapshot, doublers.placedIds),
    highestEndless,
    hundreds: Math.floor(totalLevels / 100),
    summoningLevel: getSkillLevel(getActiveCharacter(snapshot), 'summoning'),
    winsByColour: careerWins.map((wins, colour) => colour === 0 ? totalWins : wins),
    colours: summoningEssenceUpgrades.map((_, colour) => colour).filter(colour => isColourUnlocked(summoning, colour)),
    base: summoningUpgrades.map((_, index) => getUndoubledBonus(summoning, index)),
  }
}

// Every stat the planner tracks, for one set of doubled upgrade indexes
function getDoublerStats(context, doubled) {
  const value = index => context.base[index] * (doubled.has(index) ? context.multi : 1)
  const sum = indexes => indexes.reduce((total, index) => total + value(index), 0)
  const percent = amount => 1 + amount / 100
  const product = indexes => indexes.reduce((total, index) => total * percent(value(index)), 1)
  const army = ({ flat, multi, group, endless, perHundred }) => (1 + sum(flat))
    * product(multi)
    * percent(sum(group) + value(endless) * context.highestEndless)
    * percent(value(perHundred) * context.hundreds)

  const { damage: damageModel, health: healthModel, mana, spikes, jeweledCards, infiniteEssence, costCuts, costLaundering } = summoningDoublerModel
  const damage = army(damageModel)
  const infinite = percent(value(infiniteEssence) * context.highestEndless)
  const essence = {}
  for (const colour of context.colours) {
    const { knowledge, victories, summoning } = summoningEssenceUpgrades[colour]
    essence[colour] = percent(value(knowledge) * context.summoningLevel)
      * percent(context.winsByColour[colour] * value(victories))
      * (summoning === undefined ? 1 : percent(value(summoning)))
      * infinite
  }
  return {
    damage,
    spikes: (value(spikes.flat) + value(spikes.ofDamage) / 100 * damage) * percent(value(spikes.multi)),
    jeweled: 1 + Math.min(100, value(jeweledCards)) / 100,
    manaRegen: percent(sum(mana.regen)) * product(mana.regenMulti),
    startingMana: percent(value(mana.starting)),
    health: army(healthModel),
    essence,
    costDivisor: product(costCuts) * percent(value(costLaundering) * context.hundreds),
  }
}

const TIER_STATS = {
  [DOUBLER_TIERS.damage]: ['damage', 'spikes', 'jeweled'],
  [DOUBLER_TIERS.mana]: ['manaRegen', 'startingMana'],
  [DOUBLER_TIERS.health]: ['health'],
}

function getTierScore(tier, stats) {
  if (tier === DOUBLER_TIERS.essence) {
    const colours = Object.values(stats.essence)
    return colours.reduce((sum, multi) => sum + Math.log(multi), 0) + colours.length * Math.log(stats.costDivisor)
  }
  return TIER_STATS[tier].reduce((sum, stat) => sum + Math.log(Math.max(stats[stat], 1e-300)), 0)
}

// Upgrade indexes in each tier the account owns (LV 1+)
function getTierCandidates(context, tier) {
  const { damage, health, mana, spikes, jeweledCards, infiniteEssence, costCuts, costLaundering } = summoningDoublerModel
  const army = model => [...model.flat, ...model.multi, ...model.group, model.endless, model.perHundred]
  const byTier = {
    [DOUBLER_TIERS.damage]: [...army(damage), spikes.flat, spikes.ofDamage, spikes.multi, jeweledCards],
    [DOUBLER_TIERS.mana]: [...mana.regen, ...mana.regenMulti, mana.starting],
    [DOUBLER_TIERS.health]: army(health),
    [DOUBLER_TIERS.essence]: [
      ...context.colours.flatMap(colour => {
        const { knowledge, victories, summoning } = summoningEssenceUpgrades[colour]
        return [knowledge, victories, summoning].filter(index => index !== undefined)
      }),
      infiniteEssence,
      ...costCuts,
      costLaundering,
    ],
  }
  return byTier[tier].filter(index => context.base[index] > 0)
}

// Readable "what this doubler did": every tracked stat it moved by 0.5%+
function describeGain(before, after) {
  const changes = []
  const add = (label, from, to, invert = false) => {
    const ratio = to / from
    if (Math.abs(ratio - 1) < 0.005) return
    changes.push({
      label,
      ratio,
      invert,
    })
  }
  add('Damage', before.damage, after.damage)
  add('Spike damage', before.spikes, after.spikes)
  add('Jeweled cards', before.jeweled, after.jeweled)
  add('Mana regen', before.manaRegen, after.manaRegen)
  add('Starting mana', before.startingMana, after.startingMana)
  add('Health', before.health, after.health)
  const colours = Object.keys(after.essence)
  const essenceRatios = colours.map(colour => after.essence[colour] / before.essence[colour])
  const changedColours = colours.filter((_, i) => Math.abs(essenceRatios[i] - 1) >= 0.005)
  if (changedColours.length > 1 && changedColours.length === colours.length) {
    add('All essence', 1, essenceRatios[0])
  } else {
    for (const colour of changedColours) {
      add(`${summoningColourNames[colour]} essence`, before.essence[colour], after.essence[colour])
    }
  }
  add('Upgrade costs', before.costDivisor, after.costDivisor, true)
  return changes
}

const SETUP_TIERS = {
  [DOUBLER_SETUPS.damage]: [
    { tier: DOUBLER_TIERS.damage },
    { tier: DOUBLER_TIERS.mana },
    { tier: DOUBLER_TIERS.health },
    { tier: DOUBLER_TIERS.essence },
  ],
  [DOUBLER_SETUPS.essence]: [
    { tier: DOUBLER_TIERS.essence, minGain: MIN_ESSENCE_GAIN },
    { tier: DOUBLER_TIERS.damage },
    { tier: DOUBLER_TIERS.mana },
    { tier: DOUBLER_TIERS.health },
  ],
}

function planSetup(context, setup) {
  const doubled = new Set()
  const picks = []
  for (const { tier, minGain = -Infinity } of SETUP_TIERS[setup]) {
    const candidates = getTierCandidates(context, tier)
    while (doubled.size < context.doublers.total) {
      const before = getDoublerStats(context, doubled)
      const beforeScore = getTierScore(tier, before)
      let best = null
      for (const index of candidates) {
        if (doubled.has(index)) continue
        doubled.add(index)
        const gain = getTierScore(tier, getDoublerStats(context, doubled)) - beforeScore
        doubled.delete(index)
        if (!best || gain > best.gain) best = { index, gain }
      }
      if (!best || best.gain < minGain) break
      doubled.add(best.index)
      picks.push({
        index: best.index,
        name: summoningUpgrades[best.index].name,
        colour: summoningUpgrades[best.index].colour,
        tier,
        note: summoningDoublerNotes[best.index] ?? null,
        placed: context.doublers.placedIds.includes(best.index),
        changes: describeGain(before, getDoublerStats(context, doubled)),
      })
    }
  }

  const planned = new Set(picks.map(pick => pick.index))
  const takeOff = context.doublers.placedIds
    .filter(index => !planned.has(index))
    .map(index => ({
      index,
      name: summoningUpgrades[index]?.name ?? `Upgrade ${index}`,
      colour: summoningUpgrades[index]?.colour ?? 0,
    }))
  return {
    setup,
    picks,
    putOn: picks.filter(pick => !pick.placed),
    takeOff,
  }
}

// Both setups for the Doublers tab. null without summoning upgrade levels (re-import needed).
export function getDoublerPlans(snapshot) {
  if (!snapshot?.summoning?.upgradeLevels || !snapshot?.caverns?.gambitDoublers) return null
  const context = getDoublerContext(snapshot)
  return {
    total: context.doublers.total,
    placed: context.doublers.placed,
    multi: context.multi,
    damage: planSetup(context, DOUBLER_SETUPS.damage),
    essence: planSetup(context, DOUBLER_SETUPS.essence),
  }
}
