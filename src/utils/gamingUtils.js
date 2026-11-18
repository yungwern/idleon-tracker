import { paletteMap, gamingImportMap, superbitMap, shellRankTotals } from '../data'
import { hasSaveLetter, SAVE_LETTERS } from './saveCodeUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getGemShopPurchases } from './gemShopUtils'

// Gaming (W5), from IdleonToolbox parsers/world-5/gaming.ts. snapshot.gaming comes from extractSnapshot parseGaming.
// Many utils import this file (superbits, palette), so it only reads gaming itself plus a few leaf utils.
// Gaming numbers that read other systems (bit multi, palette luck, King Rat, superbit totals, bits spent
// elsewhere) live in utils/gamingBonusUtils.js, which only the Gaming page imports.

// Superbits by index, e.g. 62 = Bettah Stickahs
export function isSuperbitUnlocked(gaming, index) {
  return hasSaveLetter(gaming?.superbits, index)
}

export const SUPERBITS = {
  bitsPerAchievement: 0,
  msaTotalizer: 7,
  msaBigBits: 20,
  luckySnail: 28,
  snailGenesis: 29,
  snailOmega: 30,
  colourfulLuck: 38,
  snailZenith: 40,
  biggerPalette: 42,
  gamerLuck: 45,
  aKingsRansom: 50,
  proLogFlipper: 56,
  colourierColours: 59,
  royalFlora: 60,
  artisticGamer: 65,
}

// Superbit groups as the game pages them
export const SUPERBIT_GROUPS = [
  { id: 'super', label: 'Super Bits', from: 0, to: 23 },
  { id: 'duper', label: 'Duper Bits', from: 24, to: 47 },
  { id: 'zuper', label: 'Zuper Bits', from: 48, to: Infinity },
]

export function getSuperbitCost(index) {
  const superbit = superbitMap[index]
  return superbit ? superbit.x1 * Math.pow(10, superbit.x2) : 0
}

// ── MSA (worship totem waves) ─────────────────────────────────────────────────
const MSA_SPELUNKING = 27

// Total best wave across every worship totem
export function getTotalTotemWaves(snapshot) {
  return (snapshot?.worship?.totems ?? []).reduce((total, totem) => total + (totem.maxWave || 0), 0)
}

// MSA Spelunking POW %: 2.5 per 10 totem waves past 300, once MSA Totalizer and MSA Spelunking are unlocked
export function getMsaSpelunkingPow(snapshot) {
  const gaming = snapshot?.gaming
  if (!isSuperbitUnlocked(gaming, SUPERBITS.msaTotalizer) || !isSuperbitUnlocked(gaming, MSA_SPELUNKING)) return 0
  return 2.5 * Math.max(0, Math.floor((getTotalTotemWaves(snapshot) - 300) / 10))
}

// MSA Big Bits: +50% bits per 10 total waves, once MSA Totalizer and MSA Big Bits are unlocked
export function getMsaBitsBonus(snapshot) {
  const gaming = snapshot?.gaming
  if (!isSuperbitUnlocked(gaming, SUPERBITS.msaTotalizer) || !isSuperbitUnlocked(gaming, SUPERBITS.msaBigBits)) return 0
  return 50 * Math.floor(getTotalTotemWaves(snapshot) / 10)
}

// ── Formatting ────────────────────────────────────────────────────────────────

// The game's bits notation: every 1e18 is a new bits tier with its own sprite (images/gaming/Bits_<tier>.png),
// and the number shown is the amount inside that tier (game NotateNumber "Bits").
export function getBitsTier(value) {
  let bits = Number(value) || 0
  let tier = 0
  for (let i = 0; i < 5; i++) {
    if (bits > 1e18) {
      bits /= 1e18
      tier++
    }
  }
  return { tier, amount: bits }
}

export function getBitsImage(value) {
  return `images/gaming/Bits_${getBitsTier(value).tier}.png`
}

const BITS_STEPS = [
  [1e4, 1, ''],
  [1e5, 1e3, 'K', 10],
  [1e6, 1e3, 'K', 1],
  [1e7, 1e6, 'M', 100],
  [1e8, 1e6, 'M', 10],
  [1e9, 1e6, 'M', 1],
  [1e10, 1e9, 'B', 100],
  [1e11, 1e9, 'B', 10],
  [1e12, 1e9, 'B', 1],
  [1e13, 1e12, 'T', 100],
  [1e14, 1e12, 'T', 10],
  [1e15, 1e12, 'T', 1],
  [1e16, 1e15, 'Q', 100],
  [1e17, 1e15, 'Q', 10],
  [1e18, 1e15, 'Q', 1],
]

// Bits amount inside its tier, as the game prints it next to the tier sprite: 7.46e109 bits = "74.6Q" + Bits_5
export function formatBits(value) {
  if (!Number.isFinite(Number(value))) return '—'
  const { amount } = getBitsTier(value)
  for (const [limit, unit, suffix, decimals] of BITS_STEPS) {
    if (amount < limit) {
      const scaled = amount / unit
      return suffix ? `${Math.floor(scaled * decimals) / decimals}${suffix}` : String(Math.floor(scaled))
    }
  }
  const power = Math.floor(Math.log10(amount))
  return `${Math.floor(amount / 10 ** power * 100) / 100}e${power}`
}

// Other gaming numbers: under 1,000 up to 2 decimals, under 1M commas, then 1.23M ... 4.5e21
const BIG_STEPS = [[1e9, 1e6, 'M'], [1e12, 1e9, 'B'], [1e15, 1e12, 'T'], [1e18, 1e15, 'Q'], [1e21, 1e18, 'QQ']]

export function formatGamingNumber(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  const abs = Math.abs(number)
  if (abs < 1000) return String(Math.round(number * 100) / 100)
  if (abs < 1e6) return Math.round(number).toLocaleString('en-US')
  for (const [limit, unit, suffix] of BIG_STEPS) {
    if (abs < limit) return `${Math.round(number / unit * 100) / 100}${suffix}`
  }
  const power = Math.floor(Math.log10(abs))
  return `${Math.floor(number / 10 ** power * 100) / 100}e${power}`
}

export function formatGamingMulti(value) {
  return `${formatGamingNumber(value)}x`
}

// Fill a game text: { = the value, } = 1 + value / 100 as a multi. | (a line break in game) becomes a space.
export function fillGamingText(text, value) {
  return (text ?? '')
    .replace(/\{/g, formatGamingNumber(value))
    .replace(/\}/g, formatGamingNumber(1 + value / 100))
    .replace(/\|/g, ' ')
}

// Split a game text on its | line breaks, but only where a sentence ends (the game also breaks mid-sentence)
export function splitGamingLines(text) {
  return (text ?? '').split('|').reduce((lines, part) => {
    const piece = part.trim()
    if (!piece) return lines
    const last = lines[lines.length - 1]
    if (last && !/[.!?]$/.test(last)) lines[lines.length - 1] = `${last} ${piece}`
    else lines.push(piece)
    return lines
  }, [])
}

// ── Imports ───────────────────────────────────────────────────────────────────
export const IMPORTS = {
  sprinkler: 0,
  shovel: 1,
  squirrel: 2,
  shell: 3,
  kitsune: 4,
  bogLog: 5,
  poing: 6,
  snail: 7,
  kingRat: 8,
}

export function getImportLevel(gaming, index) {
  return gaming?.importLevels?.[index] ?? 0
}

// Import minor bonus (the "{" in its minorBonus text)
export function getImportBonus(gaming, index) {
  const level = getImportLevel(gaming, index)
  if (index === IMPORTS.shovel) return Math.floor(10 * (1 + Math.pow((60 * level) / (250 + level), 1.7))) / 10
  if (index === IMPORTS.squirrel) return Math.round(5 * level)
  if (index === IMPORTS.bogLog) return Math.floor(((60 * level) / (100 + level)) * 10) / 10
  return Math.round(level)
}

export function getImportCost(gaming, index) {
  const item = gamingImportMap.find(entry => entry.index === index)
  if (!item) return 0
  return (item.x1 * Math.pow(10, item.x2)) / 4 * Math.pow(1.4, getImportLevel(gaming, index))
}

// Golden Sprinkler gem shop purchases (131): chance a Little Sprinkler use doesn't spend its charge
const GOLDEN_SPRINKLER = 131
const SPRINKLER_SAVE = [0, 0.3, 0.43, 0.53, 0.6]

export function getSprinklerSaveChance(snapshot) {
  return SPRINKLER_SAVE[getGemShopPurchases(snapshot?.gemShop, GOLDEN_SPRINKLER)] ?? 0.6
}

// Seconds of progress since the save, so timers keep moving while the page is open
export function secondsSinceSave(snapshot, now = Date.now()) {
  const savedAt = snapshot?.resets?.savedAt
  return savedAt ? Math.max(0, now / 1000 - savedAt) : 0
}

// Dirty Shovel: nuggets waiting = floor((hours since the last dig)^0.44)
export function getGoldNuggets(seconds) {
  return Math.floor(Math.pow(Math.max(0, seconds) / 3600, 0.44))
}

// Seconds of waiting until the next nugget (inverse of getGoldNuggets)
export function getSecondsToNextNugget(seconds) {
  const next = getGoldNuggets(seconds) + 1
  return Math.max(0, Math.pow(next, 1 / 0.44) * 3600 - seconds)
}

// Autumn Squirrel: acorns waiting = floor((hours × (1 + squirrel LV / 100))^0.85)
export function getAcorns(seconds, squirrelLevel) {
  return Math.floor(Math.pow(Math.max(0, seconds) * (1 + squirrelLevel / 100) / 3600, 0.85))
}

// Dirty Shovel roll range: the best a dig can land is 1 / 1e-5^0.64 x the shovel bonus, × Metal Detector
const NUGGET_ROLL_RANGE = 1 / Math.pow(1e-5, 0.64)

export function getNuggetRolls(gaming, metalDetectorBonus) {
  const detector = 1 + (metalDetectorBonus * (gaming?.nuggetsSinceUpgrade ?? 0)) / 100
  const max = getImportBonus(gaming, IMPORTS.shovel) * NUGGET_ROLL_RANGE * detector
  return { min: max / 1584.89, max }
}

// Acorn shop (bought with acorns at the squirrel). Upgrade 3 needs the Squirrel Triad superbit.
const ACORN_SHOP_TEXTS = ['All plants give {x bits', 'All plants grow {% faster', 'Boosts Palette Luck by +{%']

export function getAcornShop(gaming) {
  const levels = [gaming?.squirrel?.[2] ?? 0, gaming?.squirrel?.[3] ?? 0, gaming?.acornShopPalette ?? 0]
  return levels.map((level, index) => {
    const bonus = index === 0
      ? 1 + (8 * level) / (250 + level)
      : index === 1 ? Math.pow(3 * level, 0.8) : Math.pow(level, 0.8)
    return {
      index,
      level,
      bonus,
      text: ACORN_SHOP_TEXTS[index].replace('{', formatGamingNumber(Math.floor(bonus * 10) / 10)),
      cost: index === 2 ? 4 + level + 3 * Math.max(0, level - 5) : 1 + level + 2 * Math.max(0, level - 5),
    }
  })
}

// Bog Log: the log is ready once its timer passes 80,000 s
export const BOG_LOG_READY_SECONDS = 80000

export function getLogGameMulti(bestRound) {
  return Math.max(1, Math.pow(1.2, (bestRound || 1) - 1))
}

// POiNG: 1 + sqrt(highscore) / 100, the bit multi caps it at 25x
export function getPoingMulti(highscore) {
  return Math.max(1 + Math.pow(highscore || 0, 0.5) / 100, 1)
}

// Elegant Seashell progress. rank = GamingSprout[28][2] (the game shows rank + 1), evolved = [28][1].
// Rank totals only go to 45 (shellRankTotals), so past that next is null.
export function getShellProgress(gaming) {
  const rank = gaming?.shellRank ?? 0
  const evolved = gaming?.plantsEvolved ?? 0
  const from = shellRankTotals[rank] ?? null
  const to = shellRankTotals[rank + 1] ?? null
  if (from === null || to === null) return { rank: rank + 1, evolved, next: null }
  return {
    rank: rank + 1,
    evolved,
    next: to,
    needed: Math.max(0, to - evolved),
    progress: Math.max(0, Math.min(1, (evolved - from) / (to - from))),
  }
}

// Little Sprinkler water drops (Toolbox getDropsAmount): GamingSprout[25][1] scaled by the sprinkler's LV
export function getSprinklerDrops(gaming) {
  const timer = gaming?.sprinklerTimer ?? 0
  return Math.floor(Math.pow(timer * (1 + getImportLevel(gaming, IMPORTS.sprinkler) / 100) / 3600, 0.75))
}

// ── Immortal Snail ────────────────────────────────────────────────────────────
// holeBonus = schematic 53 (+% snail success). Success goes below 0 past LV 48: the game shows it negative
// (that's how the snail is held at LV 49 for now), so it isn't clamped at 0 here.
export function getSnailSuccessChance(level, encouragement, holeBonus = 0) {
  const chance = level > 24
    ? (1 - 0.6 * Math.pow(level - 24, 0.16))
      * (1 + holeBonus / 100)
      * (1 + (50 * encouragement) / (3 + encouragement) / 100)
    : (1 - 0.1 * Math.pow(level, 0.71))
      * (1 + holeBonus / 100)
      * (1 + (110 * encouragement) / (25 + encouragement) / 100)
  return Math.min(1, chance)
}

// Chance a failed attempt also sends the snail back to LV 0 (the game rolls it only when the upgrade fails)
export function getSnailResetChance(level, encouragement) {
  const chance = level > 24
    ? (Math.pow(level - 24, 0.19) - 0.9) / (1 + (60 * encouragement) / (3 + encouragement) / 100)
    : (Math.pow(level + 1, 0.07) - 1) / (1 + (300 * encouragement) / (100 + encouragement) / 100)
  return Math.max(0, Math.min(1, chance))
}

export function getSnailMaxLevel(gaming) {
  return 25
    + 10 * (isSuperbitUnlocked(gaming, SUPERBITS.snailGenesis) ? 1 : 0)
    + 5 * (isSuperbitUnlocked(gaming, SUPERBITS.snailOmega) ? 1 : 0)
    + 10 * (isSuperbitUnlocked(gaming, SUPERBITS.snailZenith) ? 1 : 0)
}

// One row per encouragement: what a single upgrade attempt does at the snail's current LV
// success can be negative (shown as the game does); the other odds use it as 0 then.
export function getSnailOdds(level, encouragement, holeBonus = 0) {
  const raw = getSnailSuccessChance(level, encouragement, holeBonus)
  const success = Math.max(0, raw)
  const resetOnFail = getSnailResetChance(level, encouragement)
  const reset = (1 - success) * resetOnFail
  return {
    encouragement,
    successShown: raw,
    success,
    reset,
    stay: Math.max(0, 1 - success - reset),
    // Of the attempts that change something, the share that level up instead of resetting
    winBeforeReset: success + reset > 0 ? success / (success + reset) : 0,
    attempts: success > 0 ? 1 / success : Infinity,
  }
}

// Least encouragement for a success chance (null when out of reach)
export function getEncouragementFor(level, target, holeBonus = 0, maxEncouragement = 1000) {
  if (getSnailSuccessChance(level, maxEncouragement, holeBonus) < target) return null
  let low = 0
  let high = maxEncouragement
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (getSnailSuccessChance(level, mid, holeBonus) >= target) high = mid
    else low = mid + 1
  }
  return low
}

// ── Log Book + crowns ─────────────────────────────────────────────────────────
// 10 rows of 10 plants. Gaming[11] holds one save letter per row = plants found in it.
export const LOG_BOOK_ROWS = 10
export const LOG_BOOK_PER_ROW = 10

export function getLogBook(gaming) {
  const found = String(gaming?.logBook ?? '')
  const crowns = new Set(gaming?.crowns ?? [])
  return Array.from({ length: LOG_BOOK_ROWS }, (_, row) => {
    const owned = Math.max(0, SAVE_LETTERS.indexOf(found.charAt(row)))
    return Array.from({ length: LOG_BOOK_PER_ROW }, (_, slot) => ({
      row,
      slot,
      image: `images/gaming/plants/GamingPlant${SAVE_LETTERS[row + 1]}${slot}.png`,
      found: slot < owned,
      crowned: crowns.has(`${row}${SAVE_LETTERS[slot]}`),
    }))
  })
}

export function countLogBook(gaming) {
  return getLogBook(gaming).flat().filter(plant => plant.found).length
}

// ── Fertilizer ────────────────────────────────────────────────────────────────
const SPROUT_CAPACITY_GEM_SHOP = 133

export function getSproutValue(gaming) {
  const level = gaming?.fertilizerLevels?.[0] ?? 0
  return (1 + 4 * level) * Math.pow(1.065, level)
}

export function getSproutCapacity(snapshot) {
  const level = snapshot?.gaming?.fertilizerLevels?.[2] ?? 0
  return Math.round(Math.min(24, 3 + level + getGemShopPurchases(snapshot?.gemShop, SPROUT_CAPACITY_GEM_SHOP)))
}

// Fertilizer cost by upgrade (0 value, 1 speed, 2 capacity). Sprout Value's cost growth comes from the server
// (gaming.fertilizerCostExp, serverVars GamingFertCostExpA); without it the cost uses the lowest growth (1.13).
export function getFertilizerCost(gaming, index) {
  const level = gaming?.fertilizerLevels?.[index] ?? 0
  if (index === 0) {
    const base = 1 + (3 * level + Math.pow(level, 2))
    const costExp = gaming?.fertilizerCostExp ?? 130
    const growth = Math.min(1.25, Math.max(1.13, 1 + costExp / 1e3))
      + Math.max(0, Math.min(0.15, (0.18 * (level - 50)) / (level + 100)))
    return base * Math.pow(growth, level)
  }
  if (index === 1) return (2 + (5 * level + Math.pow(level, 2))) * Math.pow(1.22, level)
  if (level < 11) return (25 * (level + 1) + Math.pow(level + 1, 3)) * Math.pow(5 + 3.7 * level, level)
  return 9999 * Math.pow(10, 39 + 2 * level)
}

// Sprout growth chance per cycle from the evolution level (Gaming[7])
export function getSproutGrowChance(gaming) {
  const level = gaming?.evolutionLevel ?? 0
  return 0.13 + (0.11 * level) / (150 + level)
}

// ── Mutations ─────────────────────────────────────────────────────────────────
export function getMutationCost(gaming) {
  const level = gaming?.evolutionLevel ?? 0
  return (25 + (10 * (level + 1) + Math.pow(level + 1, 2))) * Math.pow(1.3, level)
}

// Chance (%) to research a new species, unrounded. voteMulti = 1 + Bonus Ballot 21 / 100.
export function getNewMutationChanceExact(unlocked, dna, voteMulti = 1) {
  return 100 * (unlocked === 0
    ? Math.min(0.8, ((7 * dna) / (100 + dna)) * voteMulti)
    : Math.min(0.99, ((42 * dna) / (100 + dna)) * Math.pow(0.31, unlocked) * voteMulti))
}

// The same chance as the game prints it (rounded down to 0.1%)
export function getNewMutationChance(unlocked, dna, voteMulti = 1) {
  return Math.floor(10 * getNewMutationChanceExact(unlocked, dna, voteMulti)) / 10
}

// ── King Rat ──────────────────────────────────────────────────────────────────
// Bit multi from crowns: 1.13^crowns + 100% each for the first 10, 50% each after
export function getRatBitMulti(crowns) {
  return Math.max(1, Math.pow(1.13, crowns) + (100 * Math.min(10, crowns) + 50 * Math.max(0, crowns - 10)) / 100)
}

// King Rat shop upgrade t (0 Extra tokens, 1 Palette multi, 2 Extra crowns): LV in ratShop[t + 1]
export const RAT_SHOP = [
  { name: 'Extra Tokens', perLevel: 5, text: '+{% King Tokens' },
  { name: 'Palette Multi', perLevel: 3, text: '+{% Palette Luck' },
  { name: 'Extra Crowns', perLevel: 2, text: '+{% Crown chance' },
]

export function getRatShop(gaming) {
  return RAT_SHOP.map((upgrade, t) => {
    const level = gaming?.ratShop?.[t + 1] ?? 0
    return {
      ...upgrade,
      index: t,
      level,
      bonus: upgrade.perLevel * level,
      cost: 2 * (Math.pow(1.15, level) + level),
    }
  })
}

// ── Palette ───────────────────────────────────────────────────────────────────
// Superbits that double one colour (superbit index → palette index); Colourier Colours (59)
// raises the doubling to 2.5x
const PALETTE_DOUBLERS = { 49: 25, 51: 13, 52: 31, 54: 18, 58: 3, 61: 12 }
const PICASSO_GAMING = 10 // legend talent: }x all palette bonuses
const PALETTE_LORE_BOSS = 8 // spelunking lore boss: 1.5x all palette bonuses

export function getPaletteDoubler(index) {
  const superbit = Object.keys(PALETTE_DOUBLERS).find(sb => PALETTE_DOUBLERS[sb] === index)
  return superbit === undefined ? null : Number(superbit)
}

export function getBlackStarMulti(stars) {
  return Math.max(1, 1 + stars + Math.floor(stars / 2))
}

// Bonus of palette colour `index` (game: GamingStatType PaletteBonus). stars overrides its Black Stars.
export function getPaletteBonus(snapshot, index, stars = snapshot?.gaming?.paletteBlackStars?.[index] ?? 0) {
  const gaming = snapshot?.gaming
  const colour = paletteMap[index]
  const level = gaming?.paletteLevels?.[index] ?? 0
  if (!colour || level <= 0) return 0
  let bonus = colour.type === 1
    ? (level / (level + 25)) * colour.multi
    : level * colour.multi
  const doubler = getPaletteDoubler(index)
  if (doubler !== null && isSuperbitUnlocked(gaming, doubler)) {
    bonus *= 2 + 0.5 * (isSuperbitUnlocked(gaming, SUPERBITS.colourierColours) ? 1 : 0)
  }
  const legend = getLegendTalentBonus(PICASSO_GAMING, getLegendTalentLevel(snapshot?.legendTalents, PICASSO_GAMING))
  const loreBoss = snapshot?.spelunking?.loreBossesDefeated?.[PALETTE_LORE_BOSS] ? 1 : 0
  return bonus * (1 + legend / 100) * (1 + 0.5 * loreBoss) * getBlackStarMulti(stars)
}

// Palette text with its bonus filled in: { = value, } = 1 + value / 100 multi, # = value to 2 decimals
export function fillPaletteText(text, bonus) {
  return (text ?? '')
    .replace(/\{/g, formatGamingNumber(bonus))
    .replace(/#/g, String(Math.floor(100 * bonus) / 100))
    .replace(/\}/g, formatGamingNumber(1 + bonus / 100))
}

// Total palette LV (Palette final bonus)
export function getPaletteTotalLevels(gaming) {
  return Math.round((gaming?.paletteLevels ?? []).reduce((sum, level) => sum + (level || 0), 0))
}

// Hex neighbours per palette slot (the game's AdjacentHex blocks): a locked colour can only be rolled
// (and only shows unlock odds) when it touches an owned one
const PALETTE_ADJACENCY = [
  [1, 7, 8], [0, 2, 8, 9], [1, 3, 9, 10], [2, 4, 10, 11], [3, 5, 11, 12], [4, 6, 12, 13], [5, 13, 14],
  [0, 8, 15], [0, 1, 7, 9, 15, 16], [1, 2, 8, 10, 16, 17], [2, 3, 9, 11, 17, 18], [3, 4, 10, 12, 18, 19],
  [4, 5, 11, 13, 19, 20], [5, 6, 12, 14, 20, 21], [6, 13, 21],
  [7, 8, 16, 22, 23], [8, 9, 15, 17, 23, 24], [9, 10, 16, 18, 24, 25], [10, 11, 17, 19, 25, 26],
  [11, 12, 18, 20, 26, 27], [12, 13, 19, 21, 27, 28], [13, 14, 20, 28, 29],
  [15, 23, 30], [15, 16, 22, 24, 30, 31], [16, 17, 23, 25, 31, 32], [17, 18, 24, 26, 32, 33],
  [18, 19, 25, 27, 33, 34], [19, 20, 26, 28, 34, 35], [20, 21, 27, 29, 35, 36], [21, 28, 36],
  [22, 23, 31], [23, 24, 30, 32], [24, 25, 31, 33], [25, 26, 32, 34], [26, 27, 33, 35], [27, 28, 34, 36], [28, 29, 35],
]

// Chance a roll on colour `index` gives it a LV (or unlocks it), with Palette Luck `luck`. null = can't be rolled yet.
export function getPaletteChance(gaming, index, luck) {
  const levels = gaming?.paletteLevels ?? []
  const colour = paletteMap[index]
  if (!colour) return null
  const level = levels[index] ?? 0
  if (level >= 1) return luck / (colour.oddsBase * Math.pow(colour.oddsGrowth, level))
  const reachable = levels.some((owned, i) => owned > 0 && PALETTE_ADJACENCY[i]?.includes(index))
  return reachable ? luck / colour.unlockOdds : null
}

// Board position of each hex (the game's palette screen layout), in px at a 64 px hex
export const PALETTE_HEX_POSITIONS = Array.from({ length: paletteMap.length }, (_, s) => {
  const row = Math.floor((s + 0.5) / 7.5)
  return {
    x: 80 + (row % 2) * -33 + 66 * Math.ceil(s - Math.floor(7.5 * row)),
    y: 91 + 56 * row,
  }
})

// Timer text: 2d 4h / 3h 12m / 45m 10s / 9s
export function formatGamingDuration(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s % 60}s`
  return `${s}s`
}
