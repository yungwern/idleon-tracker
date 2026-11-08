import { orionUpgrades, orionBonusPerLevel, orionMegafeathers, orionBonuses } from '../data'
import { getUpgradeVaultBonus } from './upgradeVaultUtils'
import { getMeritocracyBonus } from './voteUtils'
import { getFountainBonus } from './cavernUtils'
import { getGambitBonus } from './holeCavernUtils'
import { getCrucibleBonus } from './breedingUtils'
import { getMenagerieBoost } from './menagerieUtils'
import {
  getClickerCompanionMulti,
  getFurryFriendsMulti,
  getClickerBonusValue,
  getMegaOwned,
  formatClickerNumber,
  formatClickerBonus,
  buildMegaList,
} from './clickerUtils'

// Orion the Horned Owl (Clickers), from IdleonToolbox parsers/world-1/owl.ts. snapshot.orion = parseOrion.
// Every number matches Toolbox on Eli's save.

const UPG = {
  generation: 0,
  bonuses: 1,
  multiplier: 2,
  cheapener: 3,
  restart: 4,
  superProduction: 5,
  shiny: 6,
  superCheapener: 7,
  megaReset: 8,
}
const LAST_MEGA = 9
const VAULT_FEATHERS = 21
const MERITOCRACY_CLICKERS = 12
const FOUNTAIN_ORION = [0, 18] // Blue water: Orion Boost
const GAMBIT_CLICKERS = 8
const CRUCIBLE_ORION = 1
const MENAGERIE_CHEAPENER = 16 // first upgrade only
const BONUS_STEP = 6

const level = (orion, i) => orion?.levels?.[i] ?? 0
const mega = (orion, i) => getMegaOwned(orion?.megafeathers ?? 0, i, LAST_MEGA)

// game: Summoning OwlCost
export function getOrionUpgradeCost(snapshot, i) {
  const orion = snapshot?.orion
  const upgrade = orionUpgrades[i]
  const lv = level(orion, i)
  const cheapener = i < 1 ? 1 / (1 + getMenagerieBoost(snapshot?.menagerie, MENAGERIE_CHEAPENER) / 100) : 1
  const common = (1 / (1 + 10 * level(orion, UPG.cheapener) / 100))
    * (1 / (1 + 20 * level(orion, UPG.superCheapener) / 100))
    * (1 / (1 + mega(orion, 2) * level(orion, UPG.generation) / 100))
    * cheapener
    * upgrade.x1
  if (i === 0) return common * lv * Math.max(1.05, upgrade.x2 - 0.025 * mega(orion, 8)) ** lv
  return common * upgrade.x2 ** lv
}

// Feather Restart multi: (3, or 5 with Megafeather 7) ^ restarts
function getRestartBase(orion) {
  return Math.round(3 + 2 * mega(orion, 6))
}

// game: Summoning2 OwlFeatherRate (per second)
export function getFeatherRate(snapshot) {
  const orion = snapshot?.orion
  const additive = level(orion, UPG.generation)
    + 5 * level(orion, UPG.superProduction)
    + 2 * mega(orion, 4) * level(orion, UPG.cheapener)
    + 4 * mega(orion, 4) * level(orion, UPG.superCheapener)
  return (1 + 9 * mega(orion, 0))
    * (1 + getFountainBonus(snapshot?.caverns, ...FOUNTAIN_ORION) / 100)
    * (1 + 4 * getCrucibleBonus(snapshot, CRUCIBLE_ORION))
    * (1 + getUpgradeVaultBonus(snapshot?.upgradeVault, VAULT_FEATHERS) / 100)
    * (1 + getMeritocracyBonus(snapshot, MERITOCRACY_CLICKERS) / 100)
    * (1 + getGambitBonus(snapshot, GAMBIT_CLICKERS) / 100)
    * additive
    * (1 + 5 * level(orion, UPG.multiplier) / 100)
    * getRestartBase(orion) ** level(orion, UPG.restart)
    * (1 + (orion?.shinyFeathers ?? 0) * level(orion, UPG.shiny) / 100)
}

// Megafeathers 2/4/6/8 add +100% each to the base bonus, the 10th +100% then +50% per extra copy
export function getMegafeatherBonusMulti(orion) {
  const extra = mega(orion, LAST_MEGA)
  const pct = 100 * (mega(orion, 1) + mega(orion, 3) + mega(orion, 5) + mega(orion, 7))
    + 100 * Math.min(1, extra) + 50 * Math.max(0, extra - 1)
  return 1 + pct / 100
}

// Upgrade description with the game's placeholders filled
function describeUpgrade(orion, i) {
  const lv = level(orion, i)
  let text = orionUpgrades[i].desc
    .replace('{', formatClickerNumber(getRestartBase(orion) ** (level(orion, UPG.restart) + 1)))
    .replace('}', formatClickerBonus((orionBonusPerLevel[i] ?? 0) * lv))
    .replace('@', String(Math.floor(1e4 * (1 - 1 / (1 + 10 * lv / 100))) / 100))
  if (i === 0 && mega(orion, 2) === 1) {
    const cut = Math.floor(1e4 * (1 - 1 / (1 + level(orion, 0) / 100))) / 100
    text += `, and lowers all costs by ${cut}%`
  }
  return text
}

export function getOrion(snapshot) {
  const orion = snapshot?.orion
  if (!orion) return null
  const made = orion.feathersMade
  const nextUnlock = orionUpgrades.find(upgrade => made < upgrade.x3)
  const bonusMulti = getMegafeatherBonusMulti(orion) * getFurryFriendsMulti(snapshot) * getClickerCompanionMulti(snapshot)
  const bonusesLevel = level(orion, UPG.bonuses)
  return {
    feathers: orion.feathers,
    feathersMade: made,
    featherRate: getFeatherRate(snapshot),
    nextUnlock: nextUnlock ? nextUnlock.x3 : null,
    shinyFeathers: orion.shinyFeathers,
    megaCount: orion.megafeathers,
    megas: buildMegaList(orionMegafeathers, orion.megafeathers, getMegafeatherBonusMulti(orion)),
    bonusMulti,
    bonuses: orionBonuses.map((bonus, k) => ({
      ...bonus,
      icon: `images/orion/Owlb_${k + 1}.png`,
      value: getClickerBonusValue(bonus.base, bonusMulti, bonusesLevel, k, BONUS_STEP),
    })),
    upgrades: orionUpgrades.map((upgrade, i) => ({
      name: upgrade.name,
      icon: `images/orion/Owl_${i}.png`,
      desc: describeUpgrade(orion, i),
      level: level(orion, i),
      cost: getOrionUpgradeCost(snapshot, i),
      unlocked: made > upgrade.x3,
      unlockAt: upgrade.x3,
    })),
  }
}
