// Equinox clouds (W3): +1 to their bonus once the challenge is complete
export const EQUINOX_CLOUDS = {
  researchGrid1: 71,
  researchGrid2: 72,
  ribbonMulti: 73,
  researchGrid3: 76,
}

export function getCloudBonus(equinox, index) {
  return (equinox?.completedClouds ?? []).includes(index) ? 1 : 0
}

// Equinox (Dream) upgrades: bonus = level × bonusPerLevel (Toolbox parseEquinoxUpgrades).
// snapshot.equinox.upgradeLevels[index] = the upgrade's level.
export const EQUINOX_UPGRADES = {
  symbols: {
    index: 10, // Equinox Symbols: +1 talent LV per level
    bonusPerLevel: 1,
  },
}

export function getEquinoxUpgradeBonus(equinox, upgrade) {
  return (equinox?.upgradeLevels?.[upgrade.index] ?? 0) * upgrade.bonusPerLevel
}
