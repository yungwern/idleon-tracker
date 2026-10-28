import { spelunkingUpgradeMap, spelunkingTunnels, spelunkingChapterMap, spelunkingTunnelRocks, SPELUNKING_ROCK_LETTERS, spelunkingLoreBosses, spelunkingReadLevels, READ_LEVEL_GROWTH, spelunkingReadOdds, amberTiers, spelunkingLoreTomeBonuses, MAX_GRAND_DISCOVERIES, spelunkingElixirMap, MAX_ELIXIR_TYPES, MAX_ELIXIR_SLOTS, MAX_ELIXIR_DUPLICATES } from '../data'
import { compoundingOutpostingMulti } from '../data/royalOutposts'
import { growth } from './mathUtils'
import { getMealBonusByStat } from './cookingUtils'
import { getSushiBonus } from './sushiUtils'
import { getJellyBonus } from './jellyUtils'
import { getAccountTalentBonus, getAccountTalentLevel, getMaxPossibleTalentBonus } from './talentUtils'
import { getSkillLevel, getTotalSkillLevel, isSkillMasteryBonusUnlocked } from './skillUtils'
import { getArtifactBonus } from './sailingUtils'
import { getBubbleBonus } from './alchemyUtils'
import { getPassiveCardBonus, getCardStars, isCardOwned } from './cardUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { isMeritocracyBonusSelected } from './voteUtils'
import { getZenithBonus } from './zenithUtils'
import { getMineheadBonus } from './mineheadUtils'
import { getGlunkoBonus } from './cavernUtils'
import { getActiveCharacter } from './characterUtils'
import { formatBigNumber } from './cogBoardUtils'
import { getWinnerBonusByName } from './summoningUtils'
import { getClamWorkBonus } from './clamWorkUtils'
import { getCrucibleBonus } from './breedingUtils'
import { getMenagerieBoost } from './menagerieUtils'
import { getMeritBonus } from './meritUtils'
import { getGemShopPurchases } from './gemShopUtils'
import { getCompanionBonus } from './companionUtils'
import { getDancingCoralBonus, DANCING_CORAL } from './coralReefUtils'
import { getCropDepotBonus, CROP_DEPOT_BONUSES } from './farmingUtils'
import { getSlabBonus, SLAB_BONUSES } from './lootyUtils'
import { getMsaSpelunkingPow, getPaletteBonus } from './gamingUtils'
import { getStickerBonus } from './researchUtils'
import { getExoticBonus } from './exoticUtils'
import { getButtonBonus } from './buttonUtils'
import { getArcadeBonus } from './arcadeUtils'
import { getLampBonus } from './cavernUtils'
import { getStampBonusByEffect } from './stampUtils'
import { getVialBonusByStat } from './alchemyUtils'
import { getGrimoireBonus } from './grimoireUtils'
import { getArmorSetBonus } from './armorSetUtils'

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

// Grand Discovery chance sources (Toolbox "Spelunk:GrandDiscoveries_FindChance")
const GRAND_DISCOVERY_BASE = 4e-5
const GD_ZENITH = 6
const GD_JELLY = 31
const GD_MINEHEAD = 14 // % per Spelunking LV of the played character
const GD_SUSHI = 21 // % per Spelunking LV of the played character
const GD_GLUNKO = 20
const GRAND_VEIN = 238 // Royal Guardian talent: }x Grand Discovery chance

// Toolkit tools: name, damage multi, and the shop upgrade that adds it (Hammer is always there).
// The game also lists a Scepter (50x) and Mjolnir (250x); how those unlock isn't in Toolbox's data.
const SHOP_TOOLS = [
  { name: 'Hammer', damage: 1, upgrade: null },
  { name: 'Mace', damage: 2, upgrade: 14 },
  { name: 'Mallet', damage: 4, upgrade: 15 },
  { name: 'Flail', damage: 7, upgrade: 16 },
  { name: 'Warhammer', damage: 15, upgrade: 17 },
]

// Upgrades with a known index the page reads directly
export const SPELUNKING_UPGRADES = {
  staminaResurgence: 5,
  overstimMeter: 6,
  grandDiscoveries: 43,
  manicDiscoveries: 55,
  blueAmber: 20,
  elixirTypes: 23,
  elixirSlots: 24,
  elixirDuplicates: 25,
  freeRefills: 26,
  novaCrossover: 39,
  elixirMemorization: 57,
  doublethinkMemory: 58,
  greenAmber: 41,
  redAmber: 51,
  amberBeHere: 52,
  manicMode: 53,
  pinkAmber: 66,
  amberSupplySwap: 67,
  staminaTrackometer: 59,
  amberTrack: 60,
  maximaTrack: 61,
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
  const bonus = spelunkingChapterMap[chapter]?.bonuses?.[i]
  if (!bonus) return 0
  const level = snapshot?.spelunking?.chapterLevels?.[4 * chapter + i] ?? 0
  return getChapterMulti(snapshot, bonus) * growth(bonus.func, level, bonus.x1, bonus.x2)
}

function getChapterMulti(snapshot, bonus) {
  return bonus.artifactBoost ? 1 + getArtifactBonus(snapshot?.sailing, CHAPTER_ARTIFACT) / 100 : 1
}

const MILESTONE_PERCENTS = [50, 75, 90, 95, 99]

// Every chapter bonus for the Lore tab: level, bonus, and for decay bonuses the cap, % of cap reached
// and the levels that reach 50/75/90/95/99% of it (decay: x1 × L / (L + x2) → L = ceil(p × x2 / (1 - p)))
export function getLoreChapters(snapshot) {
  return spelunkingChapterMap.map((chapter, c) => ({
    title: chapter.title,
    index: c,
    pagesOwned: getChapterPagesOwned(snapshot, c),
    bonuses: chapter.bonuses.map((bonus, i) => {
      const level = snapshot?.spelunking?.chapterLevels?.[4 * c + i] ?? 0
      const multi = getChapterMulti(snapshot, bonus)
      const value = multi * growth(bonus.func, level, bonus.x1, bonus.x2)
      const isMulti = bonus.func === 'decayMulti'
      const isDecay = bonus.func === 'decay' || isMulti
      return {
        ...bonus,
        level,
        value,
        isMulti,
        isDecay,
        // decayMulti starts at 1, so its cap and progress are measured on the part above 1
        cap: isDecay ? multi * (isMulti ? 1 + bonus.x1 : bonus.x1) : null,
        progress: isDecay ? level / (level + bonus.x2) : null,
        perLevel: isDecay ? null : multi * bonus.x1,
        milestones: isDecay
          ? MILESTONE_PERCENTS.map(percent => {
            const milestoneLevel = Math.ceil((percent * bonus.x2) / (100 - percent))
            return {
              percent,
              level: milestoneLevel,
              value: multi * growth(bonus.func, milestoneLevel, bonus.x1, bonus.x2),
              reached: level >= milestoneLevel,
            }
          })
          : null,
      }
    }),
  }))
}

// ── Grand Discoveries ─────────────────────────────────────────────────────────

// Chance (0-1) of a Grand Discovery when destroying a tunnel's final object type, before the 2x-rarer-per-find
// rule (Toolbox grandDiscoveriesChance). Uses the played character's Spelunking LV, no elixirs.
// Who to delve on for Grand Discoveries: the highest-Spelunking-LV character of any class, since the game
// reads the logged-in character's Spelunking LV. Grand Vein is leveled on a Royal Guardian but works for
// whoever delves (highest level across characters, like Toolbox getHighestTalentAcrossCharacters).
export function getBestGrandDiscoveryCharacter(snapshot) {
  const characters = snapshot?.characters ?? []
  let index = -1
  characters.forEach((character, i) => {
    if (index === -1 || getSkillLevel(character, 'spelunking') > getSkillLevel(characters[index], 'spelunking')) index = i
  })
  const percentPerLevel = getMineheadBonus(snapshot?.minehead, GD_MINEHEAD) + getSushiBonus(snapshot?.sushi, GD_SUSHI)
  const multiFor = character => 1 + (getSkillLevel(character, 'spelunking') * percentPerLevel) / 100
  const played = getActiveCharacter(snapshot)
  return {
    index,
    character: characters[index] ?? null,
    level: getSkillLevel(characters[index], 'spelunking'),
    percentPerLevel,
    multi: multiFor(characters[index]),
    played,
    playedLevel: getSkillLevel(played, 'spelunking'),
    playedMulti: multiFor(played),
  }
}

// Royal Guardian Grand Vein (}x Grand Discovery chance) now and at the highest level the account could
// put it (people only fill it before Grand Discovery runs, like Amber Hoard before shopping)
export function getGrandVein(snapshot) {
  const max = getMaxPossibleTalentBonus(snapshot, GRAND_VEIN)
  return {
    level: getAccountTalentLevel(snapshot, GRAND_VEIN).value,
    multi: Math.max(1, getAccountTalentBonus(snapshot, GRAND_VEIN).value),
    maxLevel: max.level,
    maxMulti: Math.max(1, max.value),
  }
}

// Chance of a Grand Discovery per rock with none found yet in the tunnel (Toolbox
// "Spelunk:GrandDiscoveries_FindChance"), using the best Spelunker's LV (see above).
// options.maxGrandVein: price in Grand Vein at its max possible level instead of the current one.
export function getGrandDiscoveryChance(snapshot, options = {}) {
  const spelunking = snapshot?.spelunking
  const totals = getSpelunkingTotals(snapshot)
  const spelunkingLevel = getBestGrandDiscoveryCharacter(snapshot).level
  const vein = getGrandVein(snapshot)
  const grandVein = options.maxGrandVein ? vein.maxMulti : vein.multi
  return GRAND_DISCOVERY_BASE
    * (1 + getUpgradeBonus(spelunking, SPELUNKING_UPGRADES.grandDiscoveries, totals) / 100)
    * (1 + getZenithBonus(snapshot?.zenith, GD_ZENITH) / 100)
    * (1 + getChapterBonus(snapshot, 4, 0) / 100)
    * (1 + getJellyBonus(snapshot?.jellyOperator, GD_JELLY) / 100)
    * (1 + (spelunkingLevel * (getMineheadBonus(snapshot?.minehead, GD_MINEHEAD) + getSushiBonus(snapshot?.sushi, GD_SUSHI))) / 100)
    * (1 + getGlunkoBonus(snapshot, GD_GLUNKO) / 100)
    * grandVein
    * (1 + getUpgradeBonus(spelunking, SPELUNKING_UPGRADES.manicDiscoveries, totals) / 100)
    * Math.max(1, getChapterBonus(snapshot, 6, 1))
}

// Best tool in the toolkit (what Min-Maxed Nova Blasts copies)
export function getBestTool(spelunking) {
  return SHOP_TOOLS.reduce((best, tool) => (
    tool.upgrade === null || upgradeLevel(spelunking, tool.upgrade) >= 1 ? tool : best
  ), SHOP_TOOLS[0])
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

// Raw amber → the number the game shows in the current tier. Once a tier is unlocked the game
// only deals in it, so anything worth less than 1 of it shows (and counts) as 0.
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
    case 40: { // best tool's name and damage
      const tool = getBestTool(spelunking)
      text = text.replace(/\$/g, tool.name).replace(/#/g, tool.damage.toString())
      break
    }
    case 43: { // 1 in $ Grand Discovery odds (past 100% the game would print "1 in 0")
      const chance = extras.grandDiscoveryChance
      text = text.replace(/\$/g, chance ? formatNumber(Math.max(1, 1 / chance)) : UNKNOWN)
      if (chance >= 1) text += ` @ Base chance: ${formatNumber(100 * chance)}%, so your first finds in a tunnel are guaranteed.`
      break
    }
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
  const extras = {
    staminaRegen: getStaminaRegenRate(snapshot).value,
    grandDiscoveryChance: getGrandDiscoveryChance(snapshot),
  }
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
    // the "+% Amber" the game shows on the meter (Toolbox getOverstimBonus)
    amberBonus: unlocked ? (30 + getUpgradeBonus(spelunking, SPELUNKING_UPGRADES.overstimMeter, getSpelunkingTotals(snapshot))) * level : 0,
    missing: regen.missing,
  }
}

// Stamina Trackometer (upgrade 59): fills with stamina used in delves, each LV costs 1.5x more
// (Toolbox overstimQtyREQ2 = 1000 × 1.5^LV). Upgrades 59-61 give their bonus per Trackometer LV.
export function getTrackometer(snapshot) {
  const spelunking = snapshot?.spelunking
  const totals = getSpelunkingTotals(snapshot)
  const level = spelunking?.trackometerLevel ?? 0
  return {
    unlocked: upgradeLevel(spelunking, SPELUNKING_UPGRADES.staminaTrackometer) >= 1,
    level,
    progress: spelunking?.trackometerProgress ?? 0,
    required: 1000 * Math.pow(1.5, level),
    expBonus: getUpgradeBonus(spelunking, SPELUNKING_UPGRADES.staminaTrackometer, totals),
    amberBonus: getUpgradeBonus(spelunking, SPELUNKING_UPGRADES.amberTrack, totals),
    maxStaminaBonus: getUpgradeBonus(spelunking, SPELUNKING_UPGRADES.maximaTrack, totals),
  }
}

// Each tunnel's discoveries (found or not) and the odds of its next Grand Discovery
// (each one found makes the next 2x rarer; none after the 10th)
export function getTunnelDiscoveries(snapshot, options = {}) {
  const found = new Set(snapshot?.spelunking?.discoveries ?? [])
  const chance = getGrandDiscoveryChance(snapshot, options)
  return spelunkingTunnels.map((name, i) => {
    const grandFound = snapshot?.spelunking?.grandDiscoveries?.[i] ?? 0
    const tunnel = spelunkingTunnelRocks[i]
    const rocks = (tunnel?.rocks ?? []).map((rock, r) => ({
      name: rock.name.replace(/_/g, ' '),
      image: `CaveRock${SPELUNKING_ROCK_LETTERS[i]}${r}.png`,
      found: found.has(rock.name),
      depth: rock.depth,
      // POW needed to destroy it (Toolbox getDiscoveryPowerReq at its first depth); scaling rocks need more deeper
      powRequired: 100 * (tunnel?.basePow ?? 0) * rock.pow,
      scaling: rock.scaling,
    }))
    return {
      name,
      index: i,
      rocks,
      foundCount: rocks.filter(rock => rock.found).length,
      grandFound,
      nextGrandChance: grandFound >= MAX_GRAND_DISCOVERIES ? 0 : chance / Math.pow(2, grandFound),
    }
  })
}

// ── Reading pages ─────────────────────────────────────────────────────────────

// Pages of chapter c owned: Spelunking<c> items in storage and every character's inventory
export function getChapterPagesOwned(snapshot, chapter) {
  const key = `Spelunking${chapter}`
  const inStorage = snapshot?.storage?.items?.[key] ?? 0
  return (snapshot?.characters ?? []).reduce((total, character) => {
    const item = character?.inventory?.[key]
    return total + (Array.isArray(item) ? 0 : item?.qty ?? 0)
  }, inStorage)
}

const READ_LEVEL_CHAPTER = [3, 3] // Chapter 4 bonus 4: +% extra Chapter LVs from Pages

// Multiplier on LVs gained per read (Chapter 4's extra Chapter LVs bonus)
export function getReadMulti(snapshot) {
  return 1 + getChapterBonus(snapshot, ...READ_LEVEL_CHAPTER) / 100
}

// Pages needed for a `level` read: the guide's table up to LV 30, then the same curve rounded up
// (gives 5,564,069 for LV 31, the exact read confirmed in game)
export function getReadPages(level) {
  const known = spelunkingReadLevels.find(row => row.level === level)
  if (known) return known.pages
  const last = spelunkingReadLevels[spelunkingReadLevels.length - 1]
  return Math.ceil(last.pages * Math.pow(READ_LEVEL_GROWTH, level - last.level))
}

// LVs a `level` read actually gives with the extra Chapter LVs bonus. `guaranteed` rounds down; the
// fraction of `exact` is the chance of one more LV (confirmed in game: 34.4 gave 34 one read, 35 another).
function readGain(level, multi) {
  const exact = level * multi
  return {
    exact,
    guaranteed: Math.floor(exact + 1e-9),
  }
}

// Read LV for any stack size (continuous: pages between whole LVs still count). Fitted on the guide's
// LV 17-30 and confirmed in game up to ~LV 36; the guide's LV 16 (25,000) sits a little off the curve.
export function getReadLevel(pages) {
  if (!(pages > 0)) return 0
  const last = spelunkingReadLevels[spelunkingReadLevels.length - 1]
  return Math.max(0, last.level + Math.log(pages / last.pages) / Math.log(READ_LEVEL_GROWTH))
}

// What one read of `pages` gives: read LV, LVs with the extra Chapter LVs bonus (rounded down), and the
// chance (0-1) of one more
export function getReadResult(snapshot, pages) {
  const level = getReadLevel(pages)
  const gain = readGain(level, getReadMulti(snapshot))
  return {
    level,
    ...gain,
    chance: gain.exact - gain.guaranteed,
  }
}

// Page reads allowed per day, shared by every chapter: 5, +3 with Rift Skill Mastery bonus 4 for Spelunking
const PAGE_READS_MASTERY = 4
export function getMaxDailyReads(snapshot) {
  return 5 + (isSkillMasteryBonusUnlocked(snapshot, 'spelunking', PAGE_READS_MASTERY) ? 3 : 0)
}

// "34.4M", "500k", "1,250,000" → pages (0 if unreadable)
export function parsePages(text) {
  const match = String(text ?? '').trim().toLowerCase().replace(/,/g, '').match(/^(\d*\.?\d+)\s*([kmb])?$/)
  if (!match) return 0
  const scale = { k: 1e3, m: 1e6, b: 1e9 }[match[2]] ?? 1
  return Math.floor(Number(match[1]) * scale)
}

// Spending `pages` of chapter `chapter` over `reads` reads. An even split always gives the most LVs
// (each read's LVs grow with log(pages), so smaller stacks are worth more per page). Returns the stack
// per read, LVs per read and in total, which bonuses the stack opens up and the LVs each can expect,
// and what one read of everything would give instead.
export function planReads(snapshot, chapter, pages, reads) {
  const count = Math.max(1, Math.floor(reads))
  const perRead = Math.floor(pages / count)
  const read = getReadResult(snapshot, perRead)
  const bonuses = spelunkingChapterMap[chapter]?.bonuses ?? []
  const open = bonuses.filter(bonus => perRead >= bonus.pages).length
  const odds = open > 0 ? getReadOdds(open) : []
  return {
    reads: count,
    perRead,
    read,
    totalExact: read.exact * count,
    totalGuaranteed: read.guaranteed * count,
    belowGuide: perRead > 0 && perRead < spelunkingReadLevels[0].pages,
    bonuses: bonuses.map((bonus, i) => ({
      name: bonus.name,
      pages: bonus.pages,
      open: i < open,
      chance: odds[i] ?? 0,
      expected: ((odds[i] ?? 0) / 100) * read.exact * count,
    })),
    single: getReadResult(snapshot, pages),
  }
}

// How long to make a chapter's pages last. Every day uses all daily reads with equal stacks, which always
// gets the most LVs; spreading over more days means smaller stacks (more LVs in total, fewer per day).
export const READ_SPREADS = [
  { days: 1, label: 'Today' },
  { days: 3, label: '3 days' },
  { days: 7, label: '1 week' },
  { days: 14, label: '2 weeks' },
  { days: 30, label: '1 month' },
]

// `readsPerDay` = how many of the day's reads (shared by every chapter) go to this chapter.
// Stacks are kept at the guide's smallest read (25,000) or more: fewer reads if the pages run short.
export function planSpread(snapshot, chapter, pages, days, readsPerDay) {
  const dailyReads = Math.max(1, Math.min(getMaxDailyReads(snapshot), readsPerDay ?? Infinity))
  const minStack = spelunkingReadLevels[0].pages
  const wanted = dailyReads * days
  const reads = Math.max(1, Math.min(wanted, Math.floor(pages / minStack)))
  const plan = planReads(snapshot, chapter, pages, reads)
  return {
    ...plan,
    days,
    dailyReads,
    capped: reads < wanted,
    tooFew: pages < minStack,
    perDay: plan.read.exact * Math.min(dailyReads, reads),
  }
}

// Pages for each whole read LV from 16 up to `maxLevel` (past the guide's LV 30 they're `extended`)
export function getReadLevelTable(snapshot, maxLevel = 35) {
  const multi = getReadMulti(snapshot)
  const first = spelunkingReadLevels[0].level
  return Array.from({ length: Math.max(0, maxLevel - first + 1) }, (_, i) => {
    const level = first + i
    return {
      level,
      pages: getReadPages(level),
      ...readGain(level, multi),
      extended: level > spelunkingReadLevels[spelunkingReadLevels.length - 1].level,
    }
  })
}



// Chance (%) bonus i is boosted when a read unlocks `unlocked` of the chapter's bonuses
export function getReadOdds(unlocked) {
  return spelunkingReadOdds[Math.max(1, Math.min(spelunkingReadOdds.length, unlocked)) - 1]
}

// ── Lore display helpers (shared by the Lore sub-tabs) ─────────────────────────

// 548335627 → "548M", 25000 → "25,000"
export function formatPages(value) {
  return value >= 1e6 ? formatBigNumber(value) : Math.round(value ?? 0).toLocaleString('en-US')
}

// Chapter bonus name without its number: "}x_Total|Spelunking_POW" → "Total Spelunking POW"
export function loreBonusName(name) {
  return name.replace(/\|/g, ' ').replace(/^\+?[{}](%|x)?\s*/, '')
}

// ── Red Jellyfish ─────────────────────────────────────────────────────────────

// Toolbox "MenagerieStuff:RedJellyReadingMulti": floor(days rested ^ 0.74), at least 1
export function getRedJellyReadingMulti(daysRested) {
  return Math.floor(Math.max(1, Math.pow(Math.max(0, daysRested), 0.74)))
}

// The Red Jellyfish's READ: one normal read per chapter of every page it has tracked for that chapter
// (pages aren't spent). Checked against Eli's before/after saves: each chapter matched getReadResult. It
// also gives a small +1-3 to each chapter's first bonus, which isn't counted here. Whether the reading
// multi scales LVs is untested (only seen at 1x), so `multiTotal` assumes it does.
export function getRedJellyRead(snapshot) {
  const jelly = snapshot?.spelunking?.redJelly
  const daysRested = jelly?.daysRested ?? 0
  const multi = getRedJellyReadingMulti(daysRested)
  const chapters = spelunkingChapterMap.map((chapter, c) => {
    const pages = jelly?.trackedPages?.[c] ?? 0
    const read = getReadResult(snapshot, pages)
    const open = chapter.bonuses.filter(bonus => pages >= bonus.pages).length
    const odds = open > 0 ? getReadOdds(open) : []
    return {
      index: c,
      title: chapter.title,
      pages,
      read,
      bonuses: chapter.bonuses.map((bonus, i) => ({
        name: bonus.name,
        pages: bonus.pages,
        open: i < open,
        chance: odds[i] ?? 0,
      })),
    }
  })
  const total = chapters.reduce((sum, chapter) => sum + chapter.read.exact, 0)
  return {
    unlocked: jelly?.unlocked ?? false,
    daysRested,
    ready: daysRested >= 1,
    multi,
    chapters,
    total,
    multiTotal: total * multi,
    tracked: chapters.filter(chapter => chapter.pages > 0).length,
  }
}

// Reading multi after resting `days`, for the "read every day" note (multi is always below the days waited)
export function getRedJellyRestTable(dayList = [1, 3, 5, 7, 14, 30]) {
  return dayList.map(days => ({
    days,
    multi: getRedJellyReadingMulti(days),
  }))
}

// ── POW & Amber gain ──────────────────────────────────────────────────────────

const LORE_TOME_GRIMOIRE = 17
const LORE_TOME_ARMOR_SET = 'TROLL_SET'
export const LORE_TOME_BONUSES = {
  amber: 4,
}

// Tome lore bonus i as a % (game: Thingies LoreEpiBon). Needs the Tome points the player typed in.
export function getLoreTomeBonus(snapshot, index, tomePoints) {
  const bonus = spelunkingLoreTomeBonuses[index]
  if (!bonus || (snapshot?.spelunking?.loreBonusesUnlocked ?? 0) <= index) return 0
  const multi = 1 + (getGrimoireBonus(snapshot?.grimoire, LORE_TOME_GRIMOIRE)
    + getArmorSetBonus(snapshot?.armorSmithySets, LORE_TOME_ARMOR_SET)) / 100
  const p = Math.pow(Math.floor(Math.max(0, (Number(tomePoints) || 0) - bonus.tome) / 100), 0.7)
  return multi * bonus.base * (p / (25 + p))
}

const SPELUNK_TUTORIAL_POW = 2 // POW is locked to 2 until the Spelunking tutorial (OptLacc[478]) passes step 8
const POW_GEM_SHOP = 43 // 2x POW per purchase
const POW_COMPANION = 143 // Boomy Mine
const POW_MENAGERIE_BOOST = 22
const POW_CLAM_WORK = 11
const POW_CRUCIBLE = [3, 8] // 30x and 50x (added together)
const POW_MERIT = [6, 0] // W7 merit: +15% POW multi per level
const POW_EXOTIC = 42
const POW_CARD_EFFECT = '+{% Spelunk POW (Passive)'
const POW_CARD_CAP = 30
const POW_STICKER = 6
const POW_PALETTE = 13
const POW_SUSHI = 20
const POW_JELLIES = [38, 21]
const POW_BUTTON = 6
const POW_TOOLS = [14, 15, 16, 17]

// Total Spelunking POW (Toolbox getPower): Learning the POW × every POW multi. Returns { value, missing }.
// Leaves out the per-delve rock counters, which are 1 outside a delve.
export function getSpelunkingPow(snapshot) {
  const spelunking = snapshot?.spelunking
  const totals = getSpelunkingTotals(snapshot)
  const upg = index => getUpgradeBonus(spelunking, index, totals)
  const farming = snapshot?.farming
  const depot = getCropDepotBonus(snapshot, CROP_DEPOT_BONUSES.spelunky)
  const slab = getSlabBonus(snapshot, SLAB_BONUSES.spelunkingPow)
  const meal = getMealBonusByStat(snapshot, 'SplkPOW')
  const chapters = [[1, 2], [4, 2], [5, 0], [6, 2]]
    .reduce((total, [chapter, i]) => total * Math.max(1, getChapterBonus(snapshot, chapter, i)), 1)
  const card = Math.min(getPassiveCardBonus(POW_CARD_EFFECT, snapshot?.cards), POW_CARD_CAP)

  const multi = (1 + getWinnerBonusByName(snapshot, '<x Spelunk POW') / 100)
    * (1 + getClamWorkBonus(snapshot, POW_CLAM_WORK))
    * (30 * getCrucibleBonus(snapshot, POW_CRUCIBLE[0]) + 50 * getCrucibleBonus(snapshot, POW_CRUCIBLE[1]) + 1)
    * (1 + getMenagerieBoost(snapshot?.menagerie, POW_MENAGERIE_BOOST) / 100)
    * (1 + getMeritBonus(snapshot?.merits, ...POW_MERIT) / 100)
    * Math.max(1, Math.pow(2, getGemShopPurchases(snapshot?.gemShop, POW_GEM_SHOP)))
    * chapters
    * Math.max(1, getCompanionBonus(snapshot?.companions, POW_COMPANION))
    * (1 + upg(1) / 100)
    * (1 + getDancingCoralBonus(snapshot, DANCING_CORAL.spelunkingPow) / 100)
    * (1 + (depot.value + slab.value + getMsaSpelunkingPow(snapshot) + meal.value) / 100)
    * (1 + upg(2) / 100)
    * (1 + (snapshot?.research?.spelunkingPow ?? 0) / 100)
    * (1 + upg(3) / 100)
    * (1 + getStickerBonus(snapshot, POW_STICKER) / 100)
    * (1 + getPaletteBonus(snapshot, POW_PALETTE) / 100)
    * (1 + upg(46) / 100)
    * (1 + upg(54) / 100)
    * (1 + (getExoticBonus(farming, POW_EXOTIC) + card) / 100)
    * (1 + POW_TOOLS.reduce((total, index) => total + upg(index), 0) / 100)
    * (1 + getSushiBonus(snapshot?.sushi, POW_SUSHI) / 100)
    * POW_JELLIES.reduce((total, index) => total * (1 + getJellyBonus(snapshot?.jellyOperator, index) / 100), 1)
    * (1 + getButtonBonus(snapshot, POW_BUTTON) / 100)

  const inTutorial = (spelunking?.tutorialStep ?? Infinity) < 8
  return {
    value: inTutorial ? SPELUNK_TUTORIAL_POW : (1 + upg(0)) * multi,
    missing: [...new Set([...depot.missing, ...slab.missing, ...meal.missing])],
  }
}

const AMBER_CARD = 'w7a7' // Litterfish: counted twice, min(5 × LV, 40) + min(10 × LV, 100)
const AMBER_EXOTIC = 43
const AMBER_SUSHI = 28
const AMBER_RIFT_MASTERY = 6 // Rift Skill Mastery bonus 6 for Spelunking: 1.5x amber
const AMBER_STAMP = 'Spelunking Amber gain'

// Amber gain multi (Toolbox getAmberGain). Returns { value, missing }; the Tome lore bonus needs
// tomePoints (typed in by the player), and is flagged missing without it.
export function getAmberGain(snapshot, { tomePoints } = {}) {
  const spelunking = snapshot?.spelunking
  const totals = getSpelunkingTotals(snapshot)
  const upg = index => getUpgradeBonus(spelunking, index, totals)
  const depot = getCropDepotBonus(snapshot, CROP_DEPOT_BONUSES.spelunky)
  const stamp = getStampBonusByEffect(snapshot, AMBER_STAMP)
  const vial = getVialBonusByStat(snapshot, '7amber')
  const meal = getMealBonusByStat(snapshot, 'SplkAmb')
  const cardLevel = isCardOwned(AMBER_CARD, snapshot?.cards) ? getCardStars(AMBER_CARD, snapshot?.cards) + 1 : 0
  const card = Math.min(5 * cardLevel, 40) + Math.min(10 * cardLevel, 100)
  const overstim = (30 + upg(SPELUNKING_UPGRADES.overstimMeter)) * getOverstim(snapshot).level
  const rift = isSkillMasteryBonusUnlocked(snapshot, 'spelunking', AMBER_RIFT_MASTERY) ? 1 : 0
  const hasTome = Number(tomePoints) > 0
  const lore = hasTome ? getLoreTomeBonus(snapshot, LORE_TOME_BONUSES.amber, tomePoints) : 0
  const chapters = [[1, 3], [5, 1], [4, 1]]
    .reduce((total, [chapter, i]) => total * Math.max(1, getChapterBonus(snapshot, chapter, i)), 1)

  const value = (1 + getArcadeBonus(snapshot, 'Spelunking Amber') / 100)
    * (1 + (depot.value + getLampBonus(snapshot, 3, 0) + stamp.value + vial.value + meal.value) / 100)
    * (1 + getDancingCoralBonus(snapshot, DANCING_CORAL.amberGain) / 100)
    * (1 + card / 100)
    * (1 + getWinnerBonusByName(snapshot, '<x Amber Gain') / 100)
    * (1 + (getUpgradeBaseBonus(spelunking, 7) + upg(20) + upg(41) + upg(51)) / 100)
    * (1 + (upg(SPELUNKING_UPGRADES.overstimMeter) * overstim) / 100)
    * (1 + (50 * rift) / 100)
    * (1 + upg(44) / 100)
    * (1 + upg(8) / 100)
    * (1 + lore / 100)
    * chapters
    * (1 + getExoticBonus(snapshot?.farming, AMBER_EXOTIC) / 100)
    * (1 + upg(9) / 100)
    * (1 + upg(10) / 100)
    * (1 + upg(21) / 150)
    * (1 + getSushiBonus(snapshot?.sushi, AMBER_SUSHI) / 100)
    * (1 + 14 * upg(SPELUNKING_UPGRADES.amberSupplySwap))
    * (1 + upg(60) / 100)

  return {
    value,
    missing: [...new Set([
      ...depot.missing,
      ...stamp.missing,
      ...vial.missing,
      ...meal.missing,
      ...(hasTome || (spelunking?.loreBonusesUnlocked ?? 0) <= LORE_TOME_BONUSES.amber ? [] : ['Tome points (Amber lore bonus)']),
    ])],
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
    maxDiscoveries: spelunkingTunnelRocks.reduce((total, tunnel) => total + tunnel.rocks.length, 0),
    overstim: getOverstim(snapshot),
    trackometer: getTrackometer(snapshot),
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
      biggestHaul: spelunking?.biggestHauls?.[i] ?? 0,
      loreBoss: spelunkingLoreBosses[i] ?? null,
    })),
    tunnelDiscoveries: getTunnelDiscoveries(snapshot),
  }
}


// ── Elixirs ───────────────────────────────────────────────────────────────────

// Lore chapter 4 (No Escape) bonus #3: chance to not use up an elixir
const ELIXIR_KEEP_CHAPTER = 3
const ELIXIR_KEEP_BONUS = 2
const MAX_ELIXIR_MEMORIZED = 5

const countOf = (list, value) => list.filter(item => item === value).length

// Elixir belt limits, use odds, and every elixir with its owned / equipped / memorized state.
// Types = New Brand of Elixir LV (elixir i is owned when i < types). Slots = 1 + Elixir Slot LV.
// Max copies of one elixir = 1 + Duplicate Elixirs LV (the "$" in its shop text).
// equipped / memorized are null on a save imported before they were parsed.
export function getElixirBelt(snapshot) {
  const spelunking = snapshot?.spelunking
  const types = getUpgradeBaseBonus(spelunking, SPELUNKING_UPGRADES.elixirTypes)
  const equipped = spelunking?.equippedElixirs ? spelunking.equippedElixirs.filter(id => id >= 0) : null
  const memorized = spelunking?.memorizedElixirs ? spelunking.memorizedElixirs.filter(id => id >= 0) : null
  return {
    types,
    maxTypes: MAX_ELIXIR_TYPES,
    slots: 1 + getUpgradeBaseBonus(spelunking, SPELUNKING_UPGRADES.elixirSlots),
    maxSlots: MAX_ELIXIR_SLOTS,
    maxCopies: 1 + getUpgradeBaseBonus(spelunking, SPELUNKING_UPGRADES.elixirDuplicates),
    maxCopiesCap: 1 + MAX_ELIXIR_DUPLICATES,
    memorizeSlots: getUpgradeBaseBonus(spelunking, SPELUNKING_UPGRADES.elixirMemorization),
    maxMemorizeSlots: MAX_ELIXIR_MEMORIZED,
    freeRefillChance: getUpgradeBaseBonus(spelunking, SPELUNKING_UPGRADES.freeRefills),
    keepChance: getChapterBonus(snapshot, ELIXIR_KEEP_CHAPTER, ELIXIR_KEEP_BONUS),
    doublethinkChance: getUpgradeBaseBonus(spelunking, SPELUNKING_UPGRADES.doublethinkMemory),
    novaChance: getUpgradeBaseBonus(spelunking, SPELUNKING_UPGRADES.novaCrossover),
    equipped,
    memorized,
    elixirs: spelunkingElixirMap.map((elixir, index) => ({
      ...elixir,
      index,
      text: elixir.description.replace('{', elixir.bonus),
      owned: index < types,
      equippedCount: equipped ? countOf(equipped, index) : 0,
      memorized: memorized ? memorized.includes(index) : false,
    })),
  }
}

// Can this setup be used with the belt as it is, and is it what's equipped (or memorized) right now?
export function checkElixirSetup(belt, setup) {
  const ids = setup.elixirs
  const issues = []
  const locked = [...new Set(ids)].filter(id => id >= belt.types)
  if (locked.length > 0) {
    issues.push(`Locked: ${locked.map(id => spelunkingElixirMap[id]?.name).join(', ')}`)
  }
  if (setup.memorized) {
    if (belt.memorizeSlots < ids.length) {
      issues.push(`Needs ${ids.length} memorize slots (you have ${belt.memorizeSlots})`)
    }
  } else {
    if (belt.slots < ids.length) {
      issues.push(`Needs ${ids.length} belt slots (you have ${belt.slots})`)
    }
    const copies = Math.max(...ids.map(id => countOf(ids, id)))
    if (belt.maxCopies < copies) {
      issues.push(`Needs ${copies} of the same elixir (you can equip ${belt.maxCopies})`)
    }
  }
  const current = setup.memorized ? belt.memorized : belt.equipped
  const sorted = list => [...list].sort((a, b) => a - b).join(',')
  return {
    fits: issues.length === 0,
    issues,
    active: current ? sorted(current) === sorted(ids) : null,
  }
}
