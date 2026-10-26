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
