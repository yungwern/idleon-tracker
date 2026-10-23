// Killroy permanent shop bonuses by the game's KillroyBonuses index (Toolbox getKillRoyShopBonus).
// snapshot.killroy.shopLevels[i] = level of bonus i.
const SHOP_BONUSES = [
  lv => 1 + lv / (300 + lv),
  lv => 1 + (lv / (300 + lv)) * 9, // 1: Crop Evolution Chance (x multi)
  lv => 1 + (lv / (300 + lv)) * 2,
  lv => (lv / (200 + lv)) * 10,
  lv => 1 + (lv / (200 + lv)) * 1.3,
  lv => 1 + (lv / (150 + lv)) * 0.8,
  lv => (lv / (250 + lv)) * 25,
  lv => 1 + (lv / (200 + lv)) * 2,
]

export const KILLROY_CROP_EVO = 1

export function getKillroyBonus(killroy, index) {
  return SHOP_BONUSES[index]?.(killroy?.shopLevels?.[index] ?? 0) ?? 1
}
