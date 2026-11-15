import { poppyUpgrades, poppyTarUpgrades, poppyMegafish, poppyBonuses } from '../data'
import { getUpgradeVaultBonus } from './upgradeVaultUtils'
import { getMeritocracyBonus } from './voteUtils'
import { getFountainBonus } from './cavernUtils'
import { getGambitBonus } from './holeCavernUtils'
import { getCrucibleBonus } from './breedingUtils'
import { getMenagerieBoost } from './menagerieUtils'
import { getJellyBonus } from './jellyUtils'
import { getEventShopBonus } from './eventShopUtils'
import {
  getClickerCompanionMulti,
  getFurryFriendsMulti,
  getClickerBonusValue,
  getMegaOwned,
  formatClickerBonus,
  buildMegaList,
} from './clickerUtils'

// Poppy the Kangaroo Mouse (Clickers), from IdleonToolbox parsers/world-2/kangaroo.ts. snapshot.poppy = parsePoppy.
// Every number matches Toolbox on Eli's save.

const UPG = {
  tastyFishbait: 0,
  quickReeling: 1,
  bonuses: 3,
  fishyDiscount: 4,
  juicyWorm: 5,
  fisherooReset: 6,
  fishingBuddy: 7,
  multihook: 10,
  greatestCatch: 11,
}
const TAR = {
  superYummyBait: 0,
  bluefinFrenzy: 2,
  fishyReductions: 3,
  superTarbait: 4,
  tarrificResets: 5,
  kingWorm: 7,
}
const LAST_MEGA = 11
const VAULT_FISH = 45
const MERITOCRACY_CLICKERS = 12
const FOUNTAIN_POPPY = [1, 18] // Yellow water: Better Poppy
const GAMBIT_CLICKERS = 8
const CRUCIBLE_POPPY = 7
const JELLY_FISH = 20
const JELLY_TAR = 39
const FISHMAXXING = 52 // event shop: 5x fish, 75% off every Poppy upgrade
const MENAGERIE_CHEAPENER = 18 // first upgrade only
const SHINY_BASES = [30, 50, 100, 150, 250, 500]
const BONUS_STEP = 7

const level = (poppy, i) => poppy?.levels?.[i] ?? 0
const tarLevel = (poppy, i) => poppy?.tarLevels?.[i] ?? 0
const mega = (poppy, i) => getMegaOwned(poppy?.megafish ?? 0, i, LAST_MEGA)

// Shiny fish kind i multi: 1 + base × ln(caught) / 100; all six multiplied together for i < 0
function getShinyMulti(poppy, i) {
  if (i < 0) return SHINY_BASES.reduce((product, _, k) => product * getShinyMulti(poppy, k), 1)
  return 1 + SHINY_BASES[i] * Math.log(Math.max(1, poppy?.shinyCaught?.[i] ?? 0)) / 100
}

// Reset bonus i (0 bluefin, 1 shiny, 2 cheaper, 3 boosts the others, 4 tartar)
const RESET_PER_POINT = [0.4, 0.3, 0.15, 0.04, 0.2]
function getResetBonus(poppy, i) {
  const points = poppy?.resetPoints ?? []
  const base = 1 + RESET_PER_POINT[i] * (points[i] ?? 0)
  const boost = i !== 3 && (points[i] ?? 0) > 0 ? 1 + 0.04 * (points[3] ?? 0) : 1
  return base * boost
}

// Megafish 2/4/7/9 add +50% each, the 12th +50% then +25% per extra copy
export function getMegafishBonusMulti(poppy) {
  const extra = mega(poppy, LAST_MEGA)
  const pct = 50 * (mega(poppy, 1) + mega(poppy, 3) + mega(poppy, 6) + mega(poppy, 8))
    + 50 * Math.min(1, extra) + 25 * Math.max(0, extra - 1)
  return 1 + pct / 100
}

const kingWormDiscount = poppy => 1 / (1 + 5 * mega(poppy, 10) * tarLevel(poppy, TAR.kingWorm) / 100)

// game: Summoning RooCost
export function getPoppyUpgradeCost(snapshot, i) {
  const poppy = snapshot?.poppy
  const upgrade = poppyUpgrades[i]
  const base = i === 0 ? 1 + level(poppy, UPG.tastyFishbait) : 1
  const cheapener = i < 1 ? 1 / (1 + getMenagerieBoost(snapshot?.menagerie, MENAGERIE_CHEAPENER) / 100) : 1
  return base
    * (1 / (1 + 10 * level(poppy, UPG.fishyDiscount) / 100))
    * (1 / (1 + 3 * getEventShopBonus(snapshot?.eventShop, FISHMAXXING)))
    * (1 / (1 + 15 * tarLevel(poppy, TAR.fishyReductions) / 100))
    * kingWormDiscount(poppy)
    * (1 / Math.max(1, getResetBonus(poppy, 2)))
    * cheapener
    * upgrade.x1
    * upgrade.x2 ** level(poppy, i)
}

export function getPoppyTarUpgradeCost(poppy, i) {
  const upgrade = poppyTarUpgrades[i]
  const lv = tarLevel(poppy, i)
  return lv + kingWormDiscount(poppy) * upgrade.x1 * upgrade.x2 ** lv
}

// Seconds per catch (30 s, faster with Quick Reeling)
function getCatchSeconds(poppy) {
  return 30 / (1 + 5 * level(poppy, UPG.quickReeling) / 100)
}

// game: Summoning RooCatchFishQTY (fish per catch)
function getFishPerCatch(snapshot) {
  const poppy = snapshot?.poppy
  const buddy = level(poppy, UPG.fishingBuddy)
  const caught = 10 * level(poppy, UPG.tastyFishbait)
    + 100 * tarLevel(poppy, TAR.superYummyBait)
    + 1e3 * tarLevel(poppy, TAR.kingWorm)
    + 50 * level(poppy, UPG.juicyWorm)
    + 200 * level(poppy, UPG.multihook)
  return (1 + Math.min(5, buddy))
    * Math.max(1, 1 + 0.5 * (buddy - 5) * mega(poppy, 5))
    * getResetBonus(poppy, 0)
    * (1 + getUpgradeVaultBonus(snapshot?.upgradeVault, VAULT_FISH) / 100)
    * (1 + 3 * getCrucibleBonus(snapshot, CRUCIBLE_POPPY))
    * (1 + getGambitBonus(snapshot, GAMBIT_CLICKERS) / 100)
    * (1 + getJellyBonus(snapshot?.jellyOperator, JELLY_FISH) / 100)
    * (1 + getFountainBonus(snapshot?.caverns, ...FOUNTAIN_POPPY) / 100)
    * (1 + getMeritocracyBonus(snapshot, MERITOCRACY_CLICKERS) / 100)
    * (1 + 4 * getEventShopBonus(snapshot?.eventShop, FISHMAXXING))
    * caught
    * getShinyMulti(poppy, -1)
    * (1 + 8 * tarLevel(poppy, TAR.bluefinFrenzy) / 100)
}

// Seconds per tar fish
function getTarSeconds(snapshot) {
  const poppy = snapshot?.poppy
  return (1 / (1 + 0.05 * tarLevel(poppy, TAR.superTarbait)))
    * 1800
    * (1 / Math.max(1, getResetBonus(poppy, 4) * (1 + getJellyBonus(snapshot?.jellyOperator, JELLY_TAR) / 100)))
    * (1 / (1 + 2 * mega(poppy, 4)))
    * (1 / (1 + 2 * mega(poppy, 7)))
}

// Tar Pit upgrades open with Megafish 1 (3), 5 (+3) and 8 (+2)
function getTarUnlocked(poppy) {
  return Math.min(8, Math.round(3 * mega(poppy, 0) + 3 * mega(poppy, 4) + 2 * mega(poppy, 7)))
}

// Fills { ] ~ ? (game: the Poppy panel's upgrade text). Upgrade value row = OptLacc[268 + 29 × list + i] = its LV.
function describe(text, lv, x6) {
  return text
    .replace('{', formatClickerBonus(lv * x6))
    .replace(']', String(Math.round(100 + lv * x6) / 100))
    .replace('~', formatClickerBonus(100 * (1 - 1 / (1 + lv * x6 / 100))))
    .replace('?', formatClickerBonus(x6 * (lv / (40 + lv))))
}

export function getPoppy(snapshot) {
  const poppy = snapshot?.poppy
  if (!poppy) return null
  const catchSeconds = getCatchSeconds(poppy)
  const perCatch = getFishPerCatch(snapshot)
  // Fish bank in seconds, turned into fish the next time Poppy's menu opens
  const pendingFish = Math.floor(poppy.fishBank / catchSeconds) * perCatch
  const tarSeconds = getTarSeconds(snapshot)
  const tarUnlocked = getTarUnlocked(poppy)
  const pendingTar = Math.floor(poppy.tarFishBank / tarSeconds)
  const caught = poppy.fishCaught
  const nextUnlock = poppyUpgrades.find(upgrade => caught < upgrade.x3)
  const bonusMulti = getMegafishBonusMulti(poppy) * getFurryFriendsMulti(snapshot) * getClickerCompanionMulti(snapshot)
  const bonusesLevel = level(poppy, UPG.bonuses)
  const totalFish = poppy.fish + pendingFish
  return {
    fish: totalFish,
    fishCaught: caught,
    fishPerMinute: perCatch * (60 / catchSeconds),
    nextUnlock: nextUnlock ? nextUnlock.x3 : null,
    tarFish: poppy.tarFish + pendingTar,
    tarPerHour: tarUnlocked > 0 ? 3600 / tarSeconds : 0,
    megaCount: poppy.megafish,
    megas: buildMegaList(poppyMegafish, poppy.megafish, getMegafishBonusMulti(poppy)),
    bonusMulti,
    bonuses: poppyBonuses.map((bonus, k) => ({
      ...bonus,
      icon: `images/poppy/Kangaroob_${k + 1}.png`,
      value: getClickerBonusValue(bonus.base, bonusMulti, bonusesLevel, k, BONUS_STEP),
    })),
    upgrades: poppyUpgrades.map((upgrade, i) => ({
      name: upgrade.name,
      icon: `images/poppy/KUpga_${i}.png`,
      desc: describe(upgrade.desc, level(poppy, i), upgrade.x6),
      level: level(poppy, i),
      cost: getPoppyUpgradeCost(snapshot, i),
      unlocked: i === 0 || caught > upgrade.x3,
      unlockAt: upgrade.x3,
    })),
    tarUpgrades: poppyTarUpgrades.map((upgrade, i) => ({
      name: upgrade.name,
      icon: `images/poppy/KUpgb_${i}.png`,
      desc: describe(upgrade.desc, tarLevel(poppy, i), upgrade.x6),
      level: tarLevel(poppy, i),
      cost: getPoppyTarUpgradeCost(poppy, i),
      unlocked: i < tarUnlocked,
      unlockText: i < 3 ? 'Megafish 1' : i < 6 ? 'Megafish 5' : 'Megafish 8',
    })),
  }
}

// ── Reset bonus optimizer (Fisheroo Reset points) ──
// Bonus i = (1 + perPoint × pts) × (1 + 0.04 × red pts); red (3) only boosts the others. Points refund for free,
// so the planner always splits the whole pool. Score = Σ weight × ln(bonus): every point goes to the biggest gain
// (greedy is optimal here: each term is concave and red's ln is shared by all four).
// Goal = most fish (Megafish via Greatest Catch). Weights = how much 1% more of each bonus raises fish gain (in %):
// blue and green 1 (fish caught, upgrade costs), orange = shiny elasticity (the shiny multi grows with ln(caught), so
// diminishing returns), black = what tar adds to fish through the Tar Pit upgrades (× the Super Tarbait loop). Red's
// weight = all four.
const RED = 3
const SHINY_LN_FLOOR = 20 // early in a run counts are tiny; plan for counts the run will reach (~5e8+)

export const POPPY_RESET_BONUSES = [
  { name: 'Bluefin', color: 'blue', text: 'Bluefin fish caught' },
  { name: 'Shiny', color: 'orange', text: 'Shiny fishing speed and luck' },
  { name: 'Cheaper', color: 'green', text: 'Fish upgrades cheaper' },
  { name: 'Boost', color: 'red', text: 'Other reset bonuses higher' },
  { name: 'Tartar', color: 'black', text: 'Tartar fish caught' },
].map((bonus, i) => ({
  ...bonus,
  icon: `images/poppy/RooReset${i}.png`,
  perPoint: RESET_PER_POINT[i],
}))

// Reset bonus multi for a points split (same as the game's, without the save)
export function getResetBonusFor(points, i) {
  const base = 1 + RESET_PER_POINT[i] * (points[i] ?? 0)
  const boost = i !== RED && (points[i] ?? 0) > 0 ? 1 + 0.04 * (points[RED] ?? 0) : 1
  return base * boost
}

// How much 1% more shiny speed raises the total shiny multi (in %): Σ (base / 100) / (1 + base × ln n / 100)
export function getShinyElasticity(shinyCaught) {
  return SHINY_BASES.reduce((sum, base, i) => {
    const ln = Math.max(SHINY_LN_FLOOR, Math.log(Math.max(1, shinyCaught?.[i] ?? 0)))
    return sum + (base / 100) / (1 + base * ln / 100)
  }, 0)
}

// How much 1% more tar raises fish gain (in %), through the Tar Pit upgrades that boost fish. Doubling tar buys
// ln 2 / ln x2 more LVs of each, so each upgrade adds (ln gain per LV) / ln x2.
function getTarFishElasticity(poppy) {
  const unlocked = getTarUnlocked(poppy)
  const lv = i => (i < unlocked ? tarLevel(poppy, i) : null)
  const growth = i => Math.log(poppyTarUpgrades[i].x2)
  const catchTotal = 10 * level(poppy, UPG.tastyFishbait)
    + 100 * tarLevel(poppy, TAR.superYummyBait)
    + 1e3 * tarLevel(poppy, TAR.kingWorm)
    + 50 * level(poppy, UPG.juicyWorm)
    + 200 * level(poppy, UPG.multihook)
  let sum = 0
  if (lv(TAR.superYummyBait) !== null && catchTotal > 0) sum += (100 / catchTotal) / growth(TAR.superYummyBait)
  if (lv(TAR.bluefinFrenzy) !== null) sum += (0.08 / (1 + 0.08 * lv(TAR.bluefinFrenzy))) / growth(TAR.bluefinFrenzy)
  if (lv(TAR.fishyReductions) !== null) sum += (0.15 / (1 + 0.15 * lv(TAR.fishyReductions))) / growth(TAR.fishyReductions)
  if (lv(TAR.kingWorm) !== null) {
    const discount = 0.05 * mega(poppy, 10)
    const perLv = (catchTotal > 0 ? 1e3 / catchTotal : 0) + discount / (1 + discount * lv(TAR.kingWorm))
    sum += perLv / growth(TAR.kingWorm)
  }
  return sum
}

// Super Tarbait makes tar faster, so more tar also buys more tar: 1% more tar gain ends up as 1 / (1 - s)% more tar,
// s = (ln gain per Super Tarbait LV) / ln x2
function getTarSelfAmplifier(poppy) {
  if (getTarUnlocked(poppy) <= TAR.superTarbait) return 1
  const lv = tarLevel(poppy, TAR.superTarbait)
  const self = (0.05 / (1 + 0.05 * lv)) / Math.log(poppyTarUpgrades[TAR.superTarbait].x2)
  return 1 / (1 - Math.min(0.5, self))
}

export function getResetWeights(poppy) {
  const shiny = getShinyElasticity(poppy?.shinyCaught)
  const tar = getTarUnlocked(poppy) > 0 ? getTarFishElasticity(poppy) * getTarSelfAmplifier(poppy) : 0
  return [1, shiny, 1, 0, tar]
}

// Best split of `total` points for weights [blue, orange, green, -, black]
export function optimizeResetPoints(total, weights) {
  const redWeight = weights.reduce((sum, w) => sum + w, 0)
  const all = [...weights]
  all[RED] = redWeight
  const points = [0, 0, 0, 0, 0]
  const gain = i => all[i] * Math.log1p(RESET_PER_POINT[i] / (1 + RESET_PER_POINT[i] * points[i]))
  for (let n = 0; n < total; n++) {
    let best = -1
    let bestGain = 0
    for (let i = 0; i < points.length; i++) {
      const g = gain(i)
      if (g > bestGain) {
        best = i
        bestGain = g
      }
    }
    if (best < 0) break
    points[best]++
  }
  return points
}

// Fish gain multi of a split: bluefin × cheaper × shiny speed ^ its elasticity × tar ^ its elasticity
function fishPower(points, weights) {
  return points.reduce((product, _, i) => (i === RED ? product : product * getResetBonusFor(points, i) ** weights[i]), 1)
}

// Poppy Reset Planner tab: current split, best split and the all-in shiny split
export function getPoppyResetPlan(snapshot) {
  const poppy = snapshot?.poppy
  if (!poppy) return null
  const current = POPPY_RESET_BONUSES.map((_, i) => poppy.resetPoints?.[i] ?? 0)
  const unspent = poppy.unspentResetPoints ?? 0
  const total = current.reduce((sum, pts) => sum + pts, unspent)
  const weights = getResetWeights(poppy)
  const best = optimizeResetPoints(total, weights)
  const shinyOnly = optimizeResetPoints(total, [0, 1, 0, 0, 0])
  const buyOnly = optimizeResetPoints(total, [0, 0, 1, 0, 0])
  const rows = POPPY_RESET_BONUSES.map((bonus, i) => ({
    ...bonus,
    current: current[i],
    best: best[i],
    shiny: shinyOnly[i],
    buy: buyOnly[i],
    currentMulti: getResetBonusFor(current, i),
    bestMulti: getResetBonusFor(best, i),
    shinyMulti: getResetBonusFor(shinyOnly, i),
    buyMulti: getResetBonusFor(buyOnly, i),
  }))
  return {
    total,
    unspent,
    rows,
    fishGain: fishPower(best, weights) / fishPower(current, weights),
    shinySpeedUp: getResetBonusFor(shinyOnly, 1) / getResetBonusFor(best, 1),
    buyDiscount: getResetBonusFor(buyOnly, 2) / getResetBonusFor(best, 2),
    purchases: getBigPurchases(snapshot, best, buyOnly),
  }
}

// Notices (utils/poppyNotices.js): is Greatest Catch / Fisheroo Reset affordable with the big purchase split?
export function getAffordableBigPurchases(snapshot) {
  const poppy = snapshot?.poppy
  if (!poppy) return { greatestCatch: false, fisherooReset: false }
  const total = (poppy.resetPoints ?? []).reduce((sum, pts) => sum + pts, poppy.unspentResetPoints ?? 0)
  const buySnapshot = {
    ...snapshot,
    poppy: { ...poppy, resetPoints: optimizeResetPoints(total, [0, 0, 1, 0, 0]), unspentResetPoints: 0 },
  }
  const now = getPoppy(snapshot)
  const affordable = i => now.upgrades[i].unlocked && now.fish >= getPoppyUpgradeCost(buySnapshot, i)
  return {
    greatestCatch: affordable(UPG.greatestCatch),
    fisherooReset: affordable(UPG.fisherooReset),
  }
}

// Greatest Catch (next Megafish) and Fisheroo Reset: cost with the best split and with the all-in green (buy) split,
// fish on hand, and minutes until affordable at the best split's fish rate (no upgrades bought meanwhile)
function getBigPurchases(snapshot, best, buy) {
  const withPoints = points => ({ ...snapshot, poppy: { ...snapshot.poppy, resetPoints: points, unspentResetPoints: 0 } })
  const bestSnapshot = withPoints(best)
  const buySnapshot = withPoints(buy)
  const now = getPoppy(snapshot)
  const fishPerMinute = getPoppy(bestSnapshot).fishPerMinute
  return [UPG.greatestCatch, UPG.fisherooReset].map(i => {
    const upgrade = now.upgrades[i]
    const bestCost = getPoppyUpgradeCost(bestSnapshot, i)
    const buyCost = getPoppyUpgradeCost(buySnapshot, i)
    const minutes = cost => (now.fish >= cost ? 0 : (cost - now.fish) / fishPerMinute)
    return {
      name: upgrade.name,
      icon: upgrade.icon,
      unlocked: upgrade.unlocked,
      fish: now.fish,
      bestCost,
      buyCost,
      bestMinutes: minutes(bestCost),
      buyMinutes: minutes(buyCost),
    }
  })
}

// Shiny multi breakdown (Overview tab). Icons images/poppy/RooFishS<i>.png
export function getPoppyShinies(snapshot) {
  const poppy = snapshot?.poppy
  if (!poppy) return null
  return {
    total: getShinyMulti(poppy, -1),
    kinds: SHINY_BASES.map((base, i) => ({
      base,
      icon: `images/poppy/RooFishS${i}.png`,
      caught: poppy.shinyCaught?.[i] ?? 0,
      multi: getShinyMulti(poppy, i),
    })),
  }
}
