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
