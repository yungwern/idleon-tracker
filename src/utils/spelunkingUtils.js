import { spelunkingUpgradeMap, spelunkingTunnels, spelunkingChapterMap, spelunkingTunnelDiscoveries, amberTiers, MAX_GRAND_DISCOVERIES } from '../data'
import { compoundingOutpostingMulti } from '../data/royalOutposts'
import { growth } from './mathUtils'
import { getMealBonusByStat } from './cookingUtils'
import { getSushiBonus } from './sushiUtils'
import { getJellyBonus } from './jellyUtils'
import { getAccountTalentBonus, getMaxPossibleTalentBonus } from './talentUtils'
import { getSkillLevel, getTotalSkillLevel, isSkillMasteryBonusUnlocked } from './skillUtils'
import { getArtifactBonus } from './sailingUtils'
import { getBubbleBonus } from './alchemyUtils'
import { getPassiveCardBonus } from './cardUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { isMeritocracyBonusSelected } from './voteUtils'
import { formatBigNumber } from './cogBoardUtils'

// Spelunking (W7), ported from IdleonToolbox parsers/world-7/spelunking.ts.
// Reads snapshot.spelunking (lib/extractSnapshot.js parseSpelunking).

export const UNCAPPED_LEVEL = 99999

const AMBER_HOARD = 235 // Royal Guardian talent: % cheaper shop per total Royal Statue LV
const ROYAL_STATUES_COUNTED = 8 // AMBER_HOARD counts the first 8 Royal Statues
const MEAL_STAT = 'SplkUpg' // Woahtermelon: % lower Spelunk costs
const SUSHI_DISCOUNTS = [6, 27] // the bigger of these two unique sushi bonuses applies
const JELLY_DISCOUNT = 22
const GAME_LN10 = 2.30259 // the game's rounded ln(10), used for "digits" of the Biggest Haul

// Stamina regen sources (Toolbox getStaminaRegenRate)
const BASE_STAMINA_REGEN = 5 // per hour
const STAMINA_MERITOCRACY = 17
const STAMINA_LEGEND_TALENT = 30
const STAMINA_SUSHI = 11
const STAMINA_BUBBLE = 'c30' // FASTER_NRG (Kazam)
const STAMINA_CARD_EFFECT = '+{% Stamina Regen (Passive)'
const STAMINA_RIFT_MASTERY = 5 // Rift Skill Mastery bonus 5 for Spelunking: +10%
const STAMINA_COMPOUNDING = 2 // Royal Guardian Compounding Outposting: Spelunking Stamina Regen
const CHAPTER_ARTIFACT = 'Pointagon' // boosts every chapter bonus marked artifactBoost

// Upgrades with a known index the page reads directly
export const SPELUNKING_UPGRADES = {
  staminaResurgence: 5,
  overstimMeter: 6,
  blueAmber: 20,
  elixirTypes: 23,
  elixirSlots: 24,
  elixirDuplicates: 25,
  greenAmber: 41,
  redAmber: 51,
  amberBeHere: 52,
  manicMode: 53,
  pinkAmber: 66,
  amberSupplySwap: 67,
}

const upgradeLevel = (spelunking, index) => Math.max(0, spelunking?.upgradeLevels?.[index] ?? 0)

const sum = list => (list ?? []).reduce((total, value) => total + Math.max(0, value || 0), 0)

// Base bonus of an upgrade = level × perLevel (the "{" in its description)
export function getUpgradeBaseBonus(spelunking, index) {
  return upgradeLevel(spelunking, index) * (spelunkingUpgradeMap[index]?.perLevel ?? 0)
}

// Account totals the upgrade bonuses scale with
export function getSpelunkingTotals(snapshot) {
  const spelunking = snapshot?.spelunking
  const bestDepths = spelunking?.bestDepths ?? []
  return {
    spelunkingLevels: getTotalSkillLevel(snapshot?.characters, 'spelunking'),
    bestDepths: sum(bestDepths),
    // the game only adds as many manic depths as there are best depths (10)
    manicDepths: sum((spelunking?.bestManicDepths ?? []).slice(0, bestDepths.length)),
    discoveries: spelunking?.discoveries?.length ?? 0,
    // one "digit" per power of ten of each tunnel's Biggest Haul
    haulDigits: (spelunking?.biggestHauls ?? []).reduce((total, haul) => (
      total + Math.ceil(Math.log(Math.max(haul, 1)) / GAME_LN10)
    ), 0),
    grandDiscoveries: sum(spelunking?.grandDiscoveries),
    trackometerLevel: spelunking?.trackometerLevel ?? 0,
    upgradeLevels: sum(spelunking?.upgradeLevels),
  }
}

// Full bonus of an upgrade (the "$" in its description). Most are level × perLevel, these scale
// with an account total or have their own formula (Toolbox getSpelunkingUpgradeBonus).
export function getUpgradeBonus(spelunking, index, totals) {
  const base = getUpgradeBaseBonus(spelunking, index)
  switch (index) {
    case 0:
      return base * totals.spelunkingLevels
    case 8:
      return base * (1 + totals.spelunkingLevels / 100)
    case 1:
    case 10:
      return base * (1 + (5 * totals.discoveries) / 100)
    case 2:
      return base * (2 + totals.bestDepths / 100)
    case 9:
      return base * (1 + totals.bestDepths / 100)
    case 3:
      return base * (1 + (3 * totals.haulDigits) / 100)
    case 7:
      return 15 + (base / (250 + base)) * 45
    case 19:
      return Math.max(10, 50 - base)
    case 25:
      return 1 + base
    case 38:
      return 20 + base
    case 44:
    case 45:
    case 46:
      return base * totals.grandDiscoveries
    case 54:
    case 55:
    case 56:
      return base * (1 + (5 * totals.manicDepths) / 100)
    case 59:
    case 60:
    case 61:
      return base * totals.trackometerLevel
    default:
      return base
  }
}

// ── Lore Chapters ─────────────────────────────────────────────────────────────

// Bonus of chapter bonus `i` in `chapter` (Toolbox getChapterBonus). Levels are Spelunk[8][4 × chapter + i].
export function getChapterBonus(snapshot, chapter, i) {
  const bonus = spelunkingChapterMap[chapter]?.[i]
  if (!bonus) return 0
  const level = snapshot?.spelunking?.chapterLevels?.[4 * chapter + i] ?? 0
  const artifact = bonus.artifactBoost ? 1 + getArtifactBonus(snapshot?.sailing, CHAPTER_ARTIFACT) / 100 : 1
  return artifact * growth(bonus.func, level, bonus.x1, bonus.x2)
}

// ── Stamina ───────────────────────────────────────────────────────────────────

// Stamina every character regenerates per hour (Toolbox getStaminaRegenRate). Returns { value, missing }.
// The Meritocracy bonus amount isn't ported yet, so a week it's the winning pick is flagged missing.
export function getStaminaRegenRate(snapshot) {
  const spelunking = snapshot?.spelunking
  const totals = getSpelunkingTotals(snapshot)
  const missing = []
  if (isMeritocracyBonusSelected(snapshot?.voteBallot, STAMINA_MERITOCRACY)) {
    missing.push('Meritocracy stamina regen bonus (winning pick this week)')
  }
  const legend = getLegendTalentBonus(STAMINA_LEGEND_TALENT, getLegendTalentLevel(snapshot?.legendTalents, STAMINA_LEGEND_TALENT))
  const rg = snapshot?.royalGuardian
  const compounding = rg?.compoundingUnlocked && rg?.compoundingIndex === STAMINA_COMPOUNDING
    ? compoundingOutpostingMulti(STAMINA_COMPOUNDING, rg?.outposts?.length ?? 0)
    : 1
  const additive = getUpgradeBonus(spelunking, SPELUNKING_UPGRADES.staminaResurgence, totals)
    + getBubbleBonus(snapshot, STAMINA_BUBBLE)
    + getChapterBonus(snapshot, 2, 1)
    + getChapterBonus(snapshot, 5, 2)
    + (isSkillMasteryBonusUnlocked(snapshot, 'spelunking', STAMINA_RIFT_MASTERY) ? 10 : 0)
    + getPassiveCardBonus(STAMINA_CARD_EFFECT, snapshot?.cards)
  return {
    value: BASE_STAMINA_REGEN
      * (1 + legend / 100)
      * compounding
      * (1 + getSushiBonus(snapshot?.sushi, STAMINA_SUSHI) / 100)
      * (1 + additive / 100),
    missing,
  }
}

// Chance (%) that an object drops amber (Toolbox getAmberDropChance): Amber on the Rocks + Amber Be
// Here, 10x rarer with Amber Supply Swap, capped at 80%
export function getAmberDropChance(spelunking, totals) {
  const bonus = index => getUpgradeBonus(spelunking, index, totals)
  const swap = bonus(SPELUNKING_UPGRADES.amberSupplySwap)
  return 100 * Math.min(0.8, (1 / (1 + 9 * swap)) * ((bonus(7) + bonus(SPELUNKING_UPGRADES.amberBeHere)) / 100))
}

// ── Costs ─────────────────────────────────────────────────────────────────────

// Account-wide shop discount multiplier (Toolbox getSpelunkingCostDiscount):
// Woahtermelon meal (doubled once the first character hits Spelunking LV 50), unique sushi + jelly,
// and Royal Guardian AMBER_HOARD × total LV of the first 8 Royal Statues.
// options.maxAmberHoard: price AMBER_HOARD at the highest level the account could reach (max book level +
// added + super levels) instead of its current level, since people only fill it before shopping.
export function getSpelunkingCostDiscount(snapshot, options = {}) {
  const meal = getMealBonusByStat(snapshot, MEAL_STAT)
  const firstCharacterLevel = getSkillLevel(snapshot?.characters?.[0], 'spelunking')
  const mealLevelMulti = Math.max(1, Math.min(2, 1 + Math.floor(firstCharacterLevel / 50)))
  const mealDiscount = 1 / (1 + (meal.value * mealLevelMulti) / 100)

  const sushi = Math.max(...SUSHI_DISCOUNTS.map(index => getSushiBonus(snapshot?.sushi, index)))
    + getJellyBonus(snapshot?.jellyOperator, JELLY_DISCOUNT)
  const sushiDiscount = Math.max(0.1, 1 - sushi / 100)

  const statueLevels = (snapshot?.royalGuardian?.statueLevels ?? []).slice(0, ROYAL_STATUES_COUNTED)
  const statueTotal = Math.round(statueLevels.reduce((total, level) => total + (Number(level) || 0), 0))
  const talent = options.maxAmberHoard
    ? getMaxPossibleTalentBonus(snapshot, AMBER_HOARD)
    : getAccountTalentBonus(snapshot, AMBER_HOARD)
  const talentDiscount = 1 / (1 + Math.max(0, talent.value * statueTotal) / 100)

  return {
    value: talentDiscount * mealDiscount * sushiDiscount,
    missing: [...new Set([...meal.missing, ...talent.missing])],
  }
}

// Raw amber cost of buying `level` → `level + 1` of an upgrade (Toolbox getSpelunkingUpgradeCost)
export function getUpgradeCost(index, level, discount) {
  const upgrade = spelunkingUpgradeMap[index]
  let base = discount
    * (10 + level)
    * upgrade.costBase
    * Math.pow(9.5, upgrade.column)
    * Math.pow(6.3, upgrade.row)
  // two late cost tiers stack
  if (index >= 52) base *= 1e7
  if (index >= 66) base *= 1e9
  return 0.25 * base * Math.pow(upgrade.costGrowth, level) + Math.pow(level, 2) + 5 * level
}

// Raw amber cost from the current level to max, or null for upgrades with no cap
export function getUpgradeCostToMax(index, level, discount) {
  const maxLevel = spelunkingUpgradeMap[index]?.maxLevel ?? 0
  if (maxLevel >= UNCAPPED_LEVEL) return null
  let total = 0
  for (let next = level; next < maxLevel; next++) {
    total += getUpgradeCost(index, next, discount)
  }
  return Number.isFinite(total) ? total : null
}

// ── Amber ─────────────────────────────────────────────────────────────────────

// Current amber tier (Blue / Green / Red / Pink Amber contracts change what 1 amber is worth)
export function getAmberTier(spelunking) {
  for (let i = amberTiers.length - 1; i > 0; i--) {
    if (upgradeLevel(spelunking, amberTiers[i].unlockedBy) >= 1) return { ...amberTiers[i], index: i }
  }
  return { ...amberTiers[0], index: 0 }
}

// Raw amber → the number the game shows in the current tier
export function formatAmber(raw, tier) {
  const value = (raw ?? 0) / (tier?.worth ?? 1)
  if (!Number.isFinite(value)) return '∞'
  return value < 1e6 ? formatNumber(value) : formatBigNumber(value)
}

// ── Descriptions ──────────────────────────────────────────────────────────────

function formatNumber(value) {
  if (!Number.isFinite(value)) return '∞'
  if (Math.abs(value) >= 1e9) return formatBigNumber(value)
  return Math.round(value).toLocaleString('en-US')
}

const formatMulti = value => (Math.round(value * 100) / 100).toString()

// Values some descriptions show that need math we don't do yet (stamina regen, drop chances...)
const UNKNOWN = '?'

// Fill the description's placeholders (Toolbox replacePlaceholders). Returns one string per line.
// A line after the first that still needs an unknown value is dropped instead of showing "?".
export function getUpgradeDescription(snapshot, index, baseBonus, bonus, totals, extras = {}) {
  const spelunking = snapshot?.spelunking
  let text = spelunkingUpgradeMap[index]?.description ?? ''
  text = text.replace(/\{/g, formatNumber(baseBonus))
  text = text.replace(/\}/g, formatMulti(1 + bonus / 100))

  switch (index) {
    case 1:
    case 10:
      text = text.replace(/\^/g, formatNumber(totals.discoveries))
      break
    case 2:
    case 9:
      text = text.replace(/\^/g, formatNumber(totals.bestDepths))
      break
    case 3:
      text = text.replace(/\^/g, formatNumber(totals.haulDigits))
      break
    case 8:
      text = text.replace(/\^/g, formatNumber(totals.spelunkingLevels))
      break
    case 54:
    case 55:
    case 56:
      text = text.replace(/\^/g, formatNumber(totals.manicDepths))
      break
    case 5: // current regen rate
      text = text.replace(/\$/g, extras.staminaRegen ? (Math.round(10 * extras.staminaRegen) / 10).toString() : UNKNOWN)
      break
    case 40: // best tool's name and damage
    case 43: // 1 in $ Grand Discovery odds
      text = text.replace(/[$#]/g, UNKNOWN)
      break
    case 6: // Overstim: % bonus amber per Overstim LV
      text = text.replace(/\$/g, formatNumber(30 + bonus))
      break
    case 7: // ~ = amber drop chance
      text = text.replace(/~/g, (Math.floor(10 * getAmberDropChance(spelunking, totals)) / 10).toString())
      break
    case 21: // multiplier at depth 7
      text = text.replace(/\$/g, formatMulti(1 + (7 * bonus) / 100))
      break
    case 25:
      text = text.replace(/\$/g, formatNumber(baseBonus))
      break
    case 27: { // exalted stamp fragments: 1 in 60 × 8^found, better with this upgrade
      const found = spelunking?.exaltedFragments ?? 0
      const odds = (60 * Math.pow(8, found)) / (1 + bonus / 100)
      text = text.replace(/\$/g, formatNumber(odds)).replace(/#/g, formatNumber(found))
      break
    }
    case 28: { // prisma bubbles: 1 in 100 × 1.5^found
      const found = spelunking?.prismaFragments ?? 0
      const odds = (100 * Math.pow(1.5, found)) / (1 + bonus / 100)
      text = text.replace(/\$/g, formatNumber(odds)).replace(/#/g, formatNumber(found))
      break
    }
    default:
      break
  }
  text = text.replace(/\$/g, formatNumber(bonus))

  return text
    .split('@')
    .map(line => line.trim())
    .filter((line, i) => line && (i === 0 || !line.includes(UNKNOWN)))
}

// ── Page data ─────────────────────────────────────────────────────────────────

// Every shop upgrade with its level, bonuses, description lines and costs
export function getSpelunkingUpgrades(snapshot, options = {}) {
  const spelunking = snapshot?.spelunking
  const totals = getSpelunkingTotals(snapshot)
  const discount = getSpelunkingCostDiscount(snapshot, options).value
  const extras = { staminaRegen: getStaminaRegenRate(snapshot).value }
  const amber = spelunking?.amber ?? 0

  return spelunkingUpgradeMap.map((upgrade, index) => {
    const level = upgradeLevel(spelunking, index)
    const baseBonus = getUpgradeBaseBonus(spelunking, index)
    const bonus = getUpgradeBonus(spelunking, index, totals)
    const maxed = level >= upgrade.maxLevel
    const cost = maxed ? null : getUpgradeCost(index, level, discount)
    const unlocked = index === upgrade.requires || upgradeLevel(spelunking, upgrade.requires) >= 1
    return {
      ...upgrade,
      index,
      level,
      capped: upgrade.maxLevel < UNCAPPED_LEVEL,
      maxed,
      unlocked,
      baseBonus,
      bonus,
      lines: getUpgradeDescription(snapshot, index, baseBonus, bonus, totals, extras),
      cost,
      costToMax: maxed ? 0 : getUpgradeCostToMax(index, level, discount),
      affordable: cost !== null && unlocked && amber >= cost,
    }
  })
}

// Overstim meter: the save only spends banked progress while Spelunking is open, so replay it
// to get the level the game will show (Toolbox overstimEffectiveLevel). Each LV costs 1.3x more.
export function getOverstim(snapshot) {
  const spelunking = snapshot?.spelunking
  let level = spelunking?.overstimLevel ?? 0
  let progress = spelunking?.overstimProgress ?? 0
  let required = 100 * Math.pow(1.3, level)
  for (let i = 0; i < 1000 && progress >= required; i++) {
    progress -= required
    level += 1
    required = 100 * Math.pow(1.3, level)
  }
  // Every character's regen feeds the meter once they're at max stamina (Toolbox overstimRate)
  const regen = getStaminaRegenRate(snapshot)
  const unlocked = upgradeLevel(spelunking, SPELUNKING_UPGRADES.overstimMeter) >= 1
  const ratePerHour = unlocked
    ? (snapshot?.characters?.length ?? 0) * regen.value * (1 + getChapterBonus(snapshot, 2, 2) / 100)
    : 0
  return {
    level,
    progress,
    required,
    ratePerHour,
    hoursToNext: ratePerHour > 0 ? (required - progress) / ratePerHour : null,
    missing: regen.missing,
  }
}

// Headline numbers for the Spelunking overview strip
export function getSpelunkingSummary(snapshot) {
  const spelunking = snapshot?.spelunking
  const totals = getSpelunkingTotals(snapshot)
  // the save keeps 15 tunnel slots, only spelunkingTunnels.length exist
  const tunnels = Math.min(spelunking?.bestDepths?.length ?? 0, spelunkingTunnels.length)
  return {
    totals,
    amberTier: getAmberTier(spelunking),
    amber: spelunking?.amber ?? 0,
    tunnelsCleared: (spelunking?.loreBossesDefeated ?? []).slice(0, tunnels).filter(Boolean).length,
    tunnels,
    maxGrandDiscoveries: tunnels * MAX_GRAND_DISCOVERIES,
    maxDiscoveries: spelunkingTunnelDiscoveries.reduce((total, count) => total + count, 0),
    overstim: getOverstim(snapshot),
    manicUnlocked: upgradeLevel(spelunking, SPELUNKING_UPGRADES.manicMode) >= 1,
    manicMode: spelunking?.manicMode ?? false,
    elixirTypes: getUpgradeBaseBonus(spelunking, SPELUNKING_UPGRADES.elixirTypes),
    elixirSlots: 1 + getUpgradeBaseBonus(spelunking, SPELUNKING_UPGRADES.elixirSlots),
    elixirDuplicates: getUpgradeBaseBonus(spelunking, SPELUNKING_UPGRADES.elixirDuplicates),
    tunnelList: spelunkingTunnels.map((name, i) => ({
      name,
      cleared: spelunking?.loreBossesDefeated?.[i] ?? false,
      bestDepth: spelunking?.bestDepths?.[i] ?? 0,
      bestManicDepth: spelunking?.bestManicDepths?.[i] ?? 0,
      grandDiscoveries: spelunking?.grandDiscoveries?.[i] ?? 0,
    })),
  }
}
