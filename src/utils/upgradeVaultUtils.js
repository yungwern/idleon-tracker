import { upgradeVaultMap } from '../data'

// Upgrades that ignore the vault mastery multipliers (Toolbox calcUpgradeVaultBonus)
const SIMPLE = new Set([1, 6, 7, 8, 9, 13, 32, 33, 36, 40, 42, 43, 44, 49, 51, 52, 53, 57, 61, 64, 70, 73, 74, 76, 79, 85, 86, 88, 89])

// Vault Mastery I/II/III boost the upgrades in their block: 0-31, 33-60, 62-88
const masteryFor = index => (index < 32 ? 32 : index < 61 ? 61 : 89)

const level = (vault, index) => vault?.levels?.[index] ?? 0

// Bonus of vault upgrade `index` (a % or the {} of a }x upgrade)
export function getUpgradeVaultBonus(vault, index) {
  const base = level(vault, index) * (upgradeVaultMap[index]?.x5 ?? 0)
  if (SIMPLE.has(index)) return base
  if (index === 0) {
    const lv = level(vault, 0)
    return (base + Math.max(0, lv - 25) + Math.max(0, lv - 50) + Math.max(0, lv - 100))
      * (1 + getUpgradeVaultBonus(vault, 32) / 100)
  }
  if (index === 60) {
    const lv = level(vault, 60)
    const extra = Math.max(0, lv - 25) + Math.max(0, lv - 50) + 2 * Math.max(0, lv - 100)
      + 3 * Math.max(0, lv - 200) + 5 * Math.max(0, lv - 300) + 7 * Math.max(0, lv - 400)
      + 10 * Math.max(0, lv - 450)
    return (base + extra) * (1 + Math.floor(lv / 25) / 5) * (1 + getUpgradeVaultBonus(vault, 61) / 100)
  }
  if (index > 88) return 0
  return base * (1 + getUpgradeVaultBonus(vault, masteryFor(index)) / 100)
}
