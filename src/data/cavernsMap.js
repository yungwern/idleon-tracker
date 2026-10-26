// ============================================================
// CAVERNS (W5 Hole)
// From IdleonToolbox (parsers/world-5/caverns, holesInfo.json, shared-data).
// ============================================================

// The Lamp wish bonuses: lampBonuses[t][i] × wishes used on wish min(11, 4 + 2t) (Holes[21])
export const lampBonuses = [
  [25, 10, 8],
  [15, 40, 10],
  [20, 35, 12],
  [5, 1, 1],
  [2, 2, 2],
]

// Bravery Monument: bonus 10t + i scales with Holes[15][10t + i] using this base
// (holesInfo[37]); under 30 it's linear, 30+ it's a decay toward the base
export const monumentBases = [2, 4, 10, 1, 8, 2, 1, 1, 50, 250, 2, 4, 500, 1, 5, 2, 1, 300, 50, 250, 2, 3, 2, 1, 4, 2, 100, 35, 50, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

// Cosmo (hole majik) upgrades: bonus = floor(x0 × Holes[4][i]) for t = 0
export const holeMajikBonuses = [25, 1, 30, 35, 1, 10, 10, 10, 10]

// Fountain upgrades per water type t: bonus = level × bonusPerLevel × marble multi
// (Holes[31][t][i] = level, Holes[32][t][i] = marbleize tier)
export const fountainBonusPerLevel = [
  [1, 10, 1, 1, 1, 5, 5, 5, 1, 2, 1, 1, 10, 1, 1, 5, 1, 3, 5, 1],
  [2, 20, 1, 1, 1, 5, 5, 1, 1, 10, 5, 5, 10, 1, 3, 2, 1, 3, 5, 1],
  [3, 30, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 2, 1],
]
