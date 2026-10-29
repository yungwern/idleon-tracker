import { exoticMarketMap, calcExoticBonus, exoticCap } from '../data'
import { getMenagerieBoost } from './menagerieUtils'
import { getEventShopBonus } from './eventShopUtils'

// Exotic Market (W6 Farming). snapshot.farming.exoticLevels[i] = level of exotic i,
// snapshot.farming.organicExotics = exotics with an organic label (2x bonus).

export function isOrganicExotic(farming, index) {
  return (farming?.organicExotics ?? []).includes(index)
}

export function getExoticBonus(farming, index) {
  return calcExoticBonus(exoticMarketMap[index], farming?.exoticLevels?.[index] ?? 0, isOrganicExotic(farming, index))
}

// Organic Labels (game: MenagerieStuff OrganicLabelOwned, Toolbox menagerie.ts):
// owned = Menagerie boost 6 + 5 × event shop 61; each placed label is an index in Spelunk[50].
export function getOrganicLabels(snapshot) {
  const owned = Math.round(getMenagerieBoost(snapshot?.menagerie, 6) + 5 * getEventShopBonus(snapshot?.eventShop, 61))
  const placed = (snapshot?.farming?.organicExotics ?? []).length
  return {
    owned,
    placed,
    left: Math.max(0, owned - placed),
  }
}

export const EXOTIC_MILESTONES = [50, 75, 90, 95, 99]

// % of cap breakpoints for a capped (type 1) exotic. Bonus = max × LV / (1000 + LV), so the
// LV for a value v is 1000v / (max − v). max is the doubled base for organic upgrades, which can
// sit above the cap (Freexotic). reachedAfterBuy = not reached yet, but levelsToBuy more gets there.
export function getExoticMilestones(upgrade, level, organic, levelsToBuy = 0) {
  if (upgrade.type !== 1) return []
  const max = upgrade.baseValue * (organic ? 2 : 1)
  const cap = exoticCap(upgrade, organic)
  return EXOTIC_MILESTONES.map(percent => {
    const value = cap * percent / 100
    const needed = Math.ceil(1000 * value / (max - value) - 1e-9)
    return {
      percent,
      level: needed,
      reached: level >= needed,
      reachedAfterBuy: level < needed && level + levelsToBuy >= needed,
    }
  })
}
