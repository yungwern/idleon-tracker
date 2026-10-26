import { summoningBonuses, summoningEnemyBonuses, summoningEndless } from '../data'
import { getCharmBonus } from './sneakingUtils'
import { getArtifactBonus } from './sailingUtils'
import { getGemShopPurchases } from './gemShopUtils'
import { getMeritBonus } from './meritUtils'
import { isAchievementComplete } from './achievementUtils'
import { getArmorSetBonus } from './armorSetUtils'
import { isBundleOwned } from './bundleUtils'
import { getEmperorBonus } from './emperorUtils'

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
