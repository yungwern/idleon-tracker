import { DB_MOB_PROGRESSION, WW_MOB_PROGRESSION, AC_MOB_PROGRESSION } from './mobsMap'

// ============================================================
// MASTER CLASSES
// charIndex     — which character's inventory to check
// inventoryKey  — the item key to look up in that character's inventory
// headerItem    — item key to display on the dropdown bar (uses itemMap)
// ============================================================

export const MASTERCLASSES = [
  {
    id: 'death-bringer',
    name: 'Death Bringer',
    color: '#f87171',
    icon: '/images/class icons/deathbringer.png',
    charIndex: 0,
    headerItem: 'Quest97',
    sections: [
      {
        id: 'mob-progression',
        title: 'Mob Progression',
        sectionType: 'mob-progression',
        rows: DB_MOB_PROGRESSION,
      },
    ],
  },
  {
    id: 'wind-walker',
    name: 'Wind Walker',
    color: '#059669',
    icon: '/images/class icons/windwalker.png',
    charIndex: 3,
    headerItem: 'Quest96',
    sections: [
      {
        id: 'exalted-stamps',
        title: 'Exalted Stamps',
        sectionType: 'exalted-stamps',
      },
      {
        id: 'mob-progression',
        title: 'Mob Progression',
        sectionType: 'mob-progression',
        rows: WW_MOB_PROGRESSION,
      },
      {
        id: 'weapons',
        title: 'Weapons & Gear',
        inventoryKey: ['EquipmentBowsTempest0', 'EquipmentBowsTempest1', 'EquipmentBowsTempest2', 'EquipmentBowsTempest3', 'EquipmentBowsTempest4', 'EquipmentRingsTempest4', 'EquipmentRingsTempest6', 'EquipmentRingsTempest7'],
        variant: 'weapon',
      },
    ],
  },
  {
    id: 'arcane-cultist',
    name: 'Arcane Cultist',
    color: '#65a30d',
    icon: '/images/class icons/arcanecultist.png',
    charIndex: 2,
    headerItem: 'Quest101',
    sections: [
      {
        id: 'prisma-bubbles',
        title: 'Prisma Bubbles',
        sectionType: 'prisma-bubbles',
      },
      {
        id: 'mob-progression',
        title: 'Mob Progression',
        sectionType: 'mob-progression',
        rows: AC_MOB_PROGRESSION,
      },
      {
        id: 'map-bonuses',
        title: 'Map Bonuses',
        sectionType: 'map-bonuses',
      },
      {
        id: 'weapons',
        title: 'Weapons & Gear',
        inventoryKey: ['EquipmentWandsArc0', 'EquipmentRingsArc0'],
        variant: 'weapon',
      },
    ],
  },
]