import { arcadeShopMap } from '../data'
import { growth } from './mathUtils'
import { isCompanionActive } from './companionUtils'

// Arcade gold ball shop (W2), from IdleonToolbox parsers/world-2/arcade.ts.
const SUPER_LEVEL = 101
const OMEGA_LEVEL = 102
const SPIRIT_REINDEER = 27 // companion: 2x shop bonuses (Toolbox doesn't apply its 2.5x upgrade)

export function getArcadeBonusByIndex(snapshot, index) {
  const upgrade = arcadeShopMap[index]
  if (!upgrade) return 0
  const level = snapshot?.arcade?.levels?.[index] ?? 0
  const tier = level === OMEGA_LEVEL ? 6 : level === SUPER_LEVEL ? 2 : 1
  const reindeer = isCompanionActive(snapshot?.companions, SPIRIT_REINDEER) ? 2 : 1
  return growth(upgrade.func, level, upgrade.x1, upgrade.x2) * tier * reindeer
}

// By effect text without its prefix, e.g. 'Prisma Bonuses' for '+{% Prisma Bonuses'
export function getArcadeBonus(snapshot, effectName) {
  const index = arcadeShopMap.findIndex(upgrade => upgrade.effect.replace(/^[^A-Za-z]*(x )?/, '') === effectName)
  return index === -1 ? 0 : getArcadeBonusByIndex(snapshot, index)
}
