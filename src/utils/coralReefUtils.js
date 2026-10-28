import { shrineMap } from '../data'

// Coral Reef (W7) Coral Kid upgrades, from IdleonToolbox parsers/world-7/coralReef.ts.
// snapshot.coralReef.kidUpgradeLevels[index] = upgrade level.

export const CORAL_KID_UPGRADES = {
  divinityLinks: 3, // +1% minor divinity link bonuses per level
}

export function getCoralKidUpgradeBonus(coralReef, index) {
  const level = coralReef?.kidUpgradeLevels?.[index] ?? 0
  if (index === CORAL_KID_UPGRADES.divinityLinks) return Math.round(level)
  return 0
}

// Dancing Coral: shrine building (Tower[18..26]) levels past 200 × the shrine's coral perLevel.
// Pass the tower index, e.g. 19 = Spelunking POW, 20 = Spelunking Amber Gain (a %).
export const DANCING_CORAL = {
  spelunkingPow: 19,
  amberGain: 20,
}

export function getDancingCoralBonus(snapshot, towerIndex) {
  const level = snapshot?.towerLevels?.[towerIndex] ?? 0
  return (shrineMap[towerIndex]?.coral?.perLevel ?? 0) * Math.max(0, level - 200)
}
