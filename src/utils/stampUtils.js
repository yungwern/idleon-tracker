import { stampMap, exoticMarketMap, calcExoticBonus } from '../data'
import { growth } from './mathUtils'
import { getCharmBonus } from './sneakingUtils'
import { getUpgradeVaultBonus } from './upgradeVaultUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getSushiBonus } from './sushiUtils'
import { getArmorSetBonus } from './armorSetUtils'
import { getJellyBonus } from './jellyUtils'

// Stamp bonus math (W1), ported from IdleonToolbox parsers/world-1/stamps.ts.
// Returns { value, missing } like the alchemy utils.

const TREE_BY_PREFIX = { _: 0, a: 1, b: 2 }
const BASE_STAT = /Base (Damage|HP|Accuracy|Defence)/

// Exalted stamps get 1 + this / 100 (Toolbox getExaltedStampBonus)
export function getExaltedStampMulti(snapshot) {
  const exotic = calcExoticBonus(exoticMarketMap[49], snapshot?.farming?.exoticLevels?.[49] ?? 0)
  const legend = getLegendTalentBonus(36, getLegendTalentLevel(snapshot?.legendTalents, 36))
  const charm = getCharmBonus(snapshot?.sneaking, 'Jellypick')
  const sushi = getSushiBonus(snapshot?.sushi, 17)
  const emperorSet = getArmorSetBonus(snapshot?.armorSmithySets, 'EMPEROR_SET')
  // The game divides only the jelly term by 100
  const jelly = getJellyBonus(snapshot?.jellyOperator, 50) / 100
  return {
    value: 1 + (100 + exotic + legend + charm + sushi + emperorSet + jelly) / 100,
    missing: ['Atom', 'Compass', 'Event shop', 'Palette', 'Exalted fragment'],
  }
}

// Bonus of one stamp by its rawName (e.g. 'StampB48')
export function getStampBonus(snapshot, rawName) {
  const stamp = stampMap[rawName]
  if (!stamp?.func) return { value: 0, missing: [] }
  const prefix = stamp.compassIndex[0]
  const tree = TREE_BY_PREFIX[prefix]
  const index = stamp.compassIndex.slice(1)
  const level = snapshot?.stamps?.levels?.[tree]?.[index] ?? 0
  const missing = []

  // Skill stamps above a character's skill level are reduced unless Level Exemption is
  // owned; that needs a character, so these are read without the reduction.
  if (stamp.skillIndex > 0) missing.push('Skill level reduction')
  if (stamp.effect?.includes('Efficiency')) missing.push('Toilet Paper Postage')

  const charm = tree !== 2 ? getCharmBonus(snapshot?.sneaking, 'Liqorice Rolle') : 0
  const vault = BASE_STAT.test(stamp.effect ?? '') ? getUpgradeVaultBonus(snapshot?.upgradeVault, 16) : 0
  let exalted = 1
  if ((snapshot?.exaltedStamps ?? []).includes(stamp.compassIndex)) {
    const multi = getExaltedStampMulti(snapshot)
    exalted = multi.value
    missing.push(...multi.missing.map(part => `Exalted: ${part}`))
  }
  return {
    value: growth(stamp.func, level, stamp.x1, stamp.x2) * (1 + charm / 100) * (1 + vault / 100) * exalted,
    missing,
  }
}

// Sum of every stamp whose effect mentions `effectText` (Toolbox getStampsBonusByEffect)
export function getStampBonusByEffect(snapshot, effectText) {
  return Object.entries(stampMap).reduce((total, [rawName, stamp]) => {
    if (!stamp.effect?.includes(effectText)) return total
    const { value, missing } = getStampBonus(snapshot, rawName)
    return {
      value: total.value + value,
      missing: [...new Set([...total.missing, ...missing])],
    }
  }, { value: 0, missing: [] })
}
