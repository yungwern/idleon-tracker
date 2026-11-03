// ============================================================
// THE CAPE VINE (W4, Catherine; added in the Nov 1 2026 update)
// Every cape, in game ID order. From IdleonToolbox items.json (rawName EquipmentCape*).
// stats = base stats, uq = the cape's UQ bonus lines. Capes on the vine give 20% of these,
// or 100% in a Golden Vine slot (utils/capeVineUtils.js). Worn capes give nothing.
// Sprites: public/images/premium gear/capes/<rawName>.png
// ============================================================

// Share of a cape's full bonus while on the vine. The game text says 20%, but all 15 totals on Eli's in-game
// Cape Vine screen only match 25% for normal vine slots (100% golden), × the Cape Vine Bonus Multi, rounded up.
export const CAPE_VINE_SHARE = 0.25
export const GOLDEN_VINE_SHARE = 1

// Cape Vine Bonus Multi = 1 + (capes on the vine + 10 per source below) / 100. In-game text: +1% per cape.
// Eli's vine shows 1.28x with 18 capes; the other +10% is assumed to be the same event shop purchase that
// gives the Hat Rack +10% (King of the Rack, event shop 30). Unconfirmed.
export const CAPE_VINE_EVENT_SHOP = 30
export const CAPE_VINE_EVENT_SHOP_BONUS = 10

// Golden Vines (Eli): 3 from the paid pack (owning Lovely Balloon = bought it) + 1 per 500 levels of the
// account's highest character (Lv 500, 1000, 1500...)
export const LOVELY_BALLOON = 'EquipmentCape23'
export const GOLDEN_VINE_PACK = 3
export const GOLDEN_VINE_LEVEL_STEP = 500

// Capes give only their UQ ("Misc") lines on the vine. The base-stat rows on the in-game Cape Vine screen
// match the Hat Rack's totals (WP 38, STR 138...), not the capes, so base stats aren't counted here.

// Lava Wings (EquipmentCape1) is left out: the game developer's own cape, nobody else can get it

export const premiumCapes = [
  {
    rawName: 'EquipmentCape0',
    name: 'Angel Wings',
    stats: { weaponPower: 5, luk: 5, defence: 10 },
    uq: [{ txt: '%_ALL_AFK_GAIN', val: 11 }],
  },
  {
    rawName: 'EquipmentCape2',
    name: 'Easter Egg Backpack',
    stats: { str: 5, agi: 5, wis: 5, defence: 10 },
    uq: [{ txt: '%_TOTAL_DAMAGE', val: 10 }],
  },
  {
    rawName: 'EquipmentCape3',
    name: 'Radiant Amarok Backstabber',
    stats: { defence: 50 },
    uq: [{ txt: '%_DEFENCE', val: 10 }],
  },
  {
    rawName: 'EquipmentCape4',
    name: 'Gilded Efaunt Dislodged Tusks',
    stats: { str: 15, agi: 15, wis: 15 },
    uq: [{ txt: '%_SKILL_EFFICIENCY', val: 10 }],
  },
  {
    rawName: 'EquipmentCape5',
    name: 'Blighted Chizoar Shard Cape',
    stats: { weaponPower: 3 },
    uq: [{ txt: '%_TOTAL_DAMAGE', val: 8 }],
  },
  {
    rawName: 'EquipmentCape6',
    name: 'Cascading Scaled Cape of Krieg',
    stats: { weaponPower: 1, str: 10, agi: 10, wis: 10, luk: 10 },
    uq: [{ txt: '%_ALL_STATS', val: 6 }],
  },
  {
    rawName: 'EquipmentCape7',
    name: 'Molten Cloak',
    stats: { weaponPower: 6, defence: 5 },
    uq: [{ txt: '%_DROP_RATE', val: 30 }],
  },
  {
    rawName: 'EquipmentCape8',
    name: 'Giant Rose',
    stats: { weaponPower: 2, defence: 10 },
    uq: [{ txt: '%_ALL_AFK_GAIN', val: 7 }],
  },
  {
    rawName: 'EquipmentCape9',
    name: 'Giant Violet',
    stats: { weaponPower: 4, defence: 10 },
    uq: [{ txt: '%_ALL_STATS', val: 10 }],
  },
  {
    rawName: 'EquipmentCape10',
    name: 'Giant Starflower',
    stats: { weaponPower: 6, defence: 10 },
    uq: [{ txt: '%_ALL_AFK_GAIN', val: 13 }],
  },
  {
    rawName: 'EquipmentCape11',
    name: 'Riftwalker Wings',
    stats: { weaponPower: 25, str: 30, agi: 30, wis: 30, luk: 30, defence: 60 },
    uq: [{ txt: '%_TOTAL_DAMAGE', val: 20 }, { txt: '%_ALL_AFK_GAIN', val: 4 }],
  },
  {
    rawName: 'EquipmentCape12',
    name: 'Blooming Vine',
    stats: { weaponPower: 15, str: 12, agi: 12, wis: 12, luk: 12, defence: 30 },
    uq: [{ txt: '%_XP_FROM_MONSTERS', val: 50 }, { txt: '%_SKILL_EXP', val: 50 }],
  },
  {
    rawName: 'EquipmentCape13',
    name: 'Eternal Flames of The Divine',
    stats: { weaponPower: 5, str: 11, agi: 11, wis: 11, luk: 11, defence: 25 },
    uq: [{ txt: '%_SKILL_EXP', val: 40 }, { txt: '%_ALL_AFK_GAIN', val: 3 }],
  },
  {
    rawName: 'EquipmentCape14',
    name: 'Phoenix Wings',
    stats: { weaponPower: 30, str: 40, agi: 40, wis: 40, luk: 40 },
    uq: [{ txt: '%_DAMAGE_MULTI', val: 50 }, { txt: '%_MONEY', val: 60 }],
  },
  {
    rawName: 'EquipmentCape15',
    name: 'Giant Nightshade',
    stats: { weaponPower: 5, str: 2, agi: 2, wis: 2 },
    uq: [{ txt: '%_XP_FROM_MONSTERS', val: 15 }],
  },
  {
    rawName: 'EquipmentCape16',
    name: 'Timeless Watch',
    stats: { weaponPower: 20, str: 50, agi: 50, wis: 50, luk: 50 },
    uq: [{ txt: '%_ALL_AFK_GAIN', val: 40 }],
  },
  {
    rawName: 'EquipmentCape17',
    name: 'Gilded Emperor Wings',
    stats: { weaponPower: 8, str: 15, agi: 15, wis: 15, luk: 15 },
    uq: [{ txt: '%_CLASS_EXP_MULTI', val: 25 }, { txt: '%_DROP_RATE', val: 10 }],
  },
  {
    rawName: 'EquipmentCape18',
    name: 'Chains of the Gilded Vaultguard',
    stats: { weaponPower: 30, str: 10, agi: 10, wis: 10, luk: 30, defence: 25 },
    uq: [{ txt: '%_CLASS_EXP_MULTI', val: 100 }, { txt: '%_DROP_RATE_MULTI', val: 40 }],
  },
  {
    rawName: 'EquipmentCape19',
    name: 'Dragonroll Mantlepiece',
    stats: { weaponPower: 30, luk: 50, defence: 10 },
    uq: [{ txt: '%_MORE_KILLS', val: 100 }, { txt: '%_BIGGER_DAMAGE', val: 100 }],
  },
  {
    rawName: 'EquipmentCape20',
    name: 'Beeg Egg',
    stats: { weaponPower: 30 },
    uq: [{ txt: '%_BIGGER_DAMAGE', val: 300 }, { txt: '%_AFK_GAINS_MULTI', val: 10 }],
  },
  {
    rawName: 'EquipmentCape21',
    name: 'Crystal Crescent',
    stats: { weaponPower: 30 },
    uq: [{ txt: '%_CLASS_EXP_MULTI', val: 200 }],
  },
  {
    rawName: 'EquipmentCape22',
    name: 'Bladed Rucksack',
    stats: { weaponPower: 50 },
    uq: [{ txt: '%_BIGGER_DAMAGE', val: 500 }],
  },
  // Newer than Toolbox's item data (Eli's in-game tooltip): 20 Weapon Power, +250% Drop Rate (additive, not the multi).
  // Comes with the paid pack that also gives 3 Golden Vines. Sprite: add capes/EquipmentCape23.png.
  {
    rawName: 'EquipmentCape23',
    name: 'Lovely Balloon',
    stats: { weaponPower: 20 },
    uq: [{ txt: '%_DROP_RATE', val: 250 }],
  },
]
