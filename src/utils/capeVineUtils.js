import { premiumCapes, CAPE_VINE_SHARE, GOLDEN_VINE_SHARE, GOLDEN_VINE_PACK, GOLDEN_VINE_LEVEL_STEP, CAPE_VINE_EVENT_SHOP, CAPE_VINE_EVENT_SHOP_BONUS } from '../data'
import { sumCollectionBonuses } from './collectionUtils'
import { getEventShopBonus } from './eventShopUtils'

// The Cape Vine (W4), added in the Nov 1 2026 update; Toolbox has no parser for it yet.
// snapshot.capeVine.capes = Spelunk[54], the capes on the vine in vine order. Golden Vine slots come first
// (Eli's vine: his strongest capes lead the list), so the first `count` capes give their full bonus
// and the rest give 25% (fits every in-game total; the game text says 20%), all × the Cape Vine Bonus Multi.
// Only UQ lines count (base stats don't, see capeVineMap.js). Matches Eli's in-game screen.
// Any cape the save names that premiumCapes doesn't know still shows up.

// Golden Vines (Eli): 3 from the paid pack (owning Lovely Balloon) + 1 per 500 levels of the highest
// character. Counts every vine that character can claim (6 on Eli's save: pack + Lv 500/1000/1500).
export function getGoldenVines(snapshot) {
  const highestLevel = Math.max(0, ...(snapshot?.characters ?? []).map(character => Number(character.level) || 0))
  const pack = snapshot?.capeVine?.lovelyBalloon ? GOLDEN_VINE_PACK : 0
  const fromLevels = Math.floor(highestLevel / GOLDEN_VINE_LEVEL_STEP)
  const nextLevel = (fromLevels + 1) * GOLDEN_VINE_LEVEL_STEP
  return {
    count: pack + fromLevels,
    pack,
    fromLevels,
    highestLevel,
    nextLevel,
    levelsToNext: nextLevel - highestLevel,
  }
}

// { value, parts: [{ label, value }] }: parts are the % points each source adds
export function getCapeVineMulti(snapshot) {
  const capeCount = snapshot?.capeVine?.capes?.length ?? 0
  const parts = [
    {
      label: `${capeCount} capes on the vine (+1% each)`,
      value: capeCount,
    },
    {
      label: 'Event Shop (assumed, same as Hat Rack)',
      value: getEventShopBonus(snapshot?.eventShop, CAPE_VINE_EVENT_SHOP) * CAPE_VINE_EVENT_SHOP_BONUS,
    },
  ]
  const total = parts.reduce((sum, part) => sum + part.value, 0)
  return {
    value: 1 + total / 100,
    parts,
  }
}

export function getCapeVine(snapshot) {
  const goldenVines = getGoldenVines(snapshot)
  const multi = getCapeVineMulti(snapshot)
  const stored = snapshot?.capeVine?.capes ?? []
  const slotOf = new Map(stored.map((rawName, slot) => [rawName, slot]))
  const known = new Set(premiumCapes.map(cape => cape.rawName))
  const extra = stored
    .filter(rawName => !known.has(rawName))
    .map(rawName => ({
      rawName,
      name: 'Unknown Cape',
      stats: {},
      uq: [],
      unknown: true,
    }))

  const capes = [...premiumCapes, ...extra].map(cape => {
    const slot = slotOf.get(cape.rawName)
    const owned = slot !== undefined
    const golden = owned && slot < goldenVines.count
    return {
      ...cape,
      owned,
      slot: owned ? slot : null,
      golden,
      share: (golden ? GOLDEN_VINE_SHARE : CAPE_VINE_SHARE) * multi.value,
    }
  })
  const owned = capes.filter(cape => cape.owned)

  return {
    capes,
    ownedCount: owned.length,
    goldenVines,
    multi,
    goldenUsed: owned.filter(cape => cape.golden).length,
    bonuses: sumCollectionBonuses(owned.map(item => ({ item, share: item.share })), { includeStats: false }),
  }
}
