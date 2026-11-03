import { premiumHats, HAT_RACK_MULTI_SOURCES } from '../data'
import { getCompanionBonus } from './companionUtils'
import { getEventShopBonus } from './eventShopUtils'
import { getMineheadBonus } from './mineheadUtils'
import { getSushiBonus } from './sushiUtils'
import { sumCollectionBonuses } from './collectionUtils'

// Hat Rack (W3 Gallery), from IdleonToolbox parsers/world-3/hatRack.ts.
// Multi = 1 + (hats on the rack + Wild Boar + 10 × event shop 30 + Minehead 21 + Sushi 36) / 100.

function getSourceValue(snapshot, source) {
  if (source.key === 'companion') return getCompanionBonus(snapshot?.companions, source.index)
  if (source.key === 'eventShop') return getEventShopBonus(snapshot?.eventShop, source.index) * source.perPurchase
  if (source.key === 'minehead') return getMineheadBonus(snapshot?.minehead, source.index)
  if (source.key === 'sushi') return getSushiBonus(snapshot?.sushi, source.index)
  return 0
}

// { value, parts: [{ label, value }] }: parts are the % points each source adds
export function getHatRackMulti(snapshot) {
  const hatCount = snapshot?.hatRack?.hats?.length ?? 0
  const parts = [
    {
      label: `${hatCount} hats on the rack (+1% each)`,
      value: hatCount,
    },
    ...HAT_RACK_MULTI_SOURCES.map(source => ({
      label: source.label,
      value: getSourceValue(snapshot, source),
    })),
  ]
  const total = parts.reduce((sum, part) => sum + part.value, 0)
  return {
    value: 1 + total / 100,
    parts,
  }
}

// Every rack-eligible hat with owned + share (the multi while owned), and the rack's total bonuses
export function getHatRack(snapshot) {
  const stored = new Set(snapshot?.hatRack?.hats ?? [])
  const multi = getHatRackMulti(snapshot)
  const hats = premiumHats.map(hat => ({
    ...hat,
    owned: stored.has(hat.rawName),
    share: multi.value,
  }))
  const owned = hats.filter(hat => hat.owned)
  return {
    hats,
    ownedCount: owned.length,
    multi,
    bonuses: sumCollectionBonuses(owned.map(item => ({ item, share: multi.value }))),
  }
}
