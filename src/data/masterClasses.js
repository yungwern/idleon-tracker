import { DB_MOB_PROGRESSION, WW_MOB_PROGRESSION, AC_MOB_PROGRESSION } from './mobsMap'

// ============================================================
// MASTER CLASSES
// The character for each class is found automatically by class name (see MasterClasses.jsx)
// inventoryKey  — the item key to look up in that character's inventory
// headerItem    — item key to display on the dropdown bar (uses itemMap)
// accountWide   — count an item across every character's inventory plus storage
// Header currency is always counted account-wide. Weapons (variant: 'weapon') show one
// group per character of that class, since gear belongs to a specific character.
// imageFolder   — folder under public/images/ for this class's images (header item, weapons,
//                 mob progression currency). A section can set its own to override it.
// ============================================================

export const MASTERCLASSES = [
  {
    id: 'death-bringer',
    name: 'Death Bringer',
    color: '#f87171',
    imageFolder: 'masterclass/death bringer',
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
    imageFolder: 'masterclass/wind walker',
    headerItem: 'Quest96',
    sections: [
      {
        id: 'exalted-stamps',
        title: 'Exalted Stamps',
        sectionType: 'exalted-stamps',
      },
      {
        id: 'weapons',
        title: 'Weapons & Gear',
        inventoryKey: ['EquipmentBowsTempest0', 'EquipmentBowsTempest1', 'EquipmentBowsTempest2', 'EquipmentBowsTempest3', 'EquipmentBowsTempest4', 'EquipmentRingsTempest4', 'EquipmentRingsTempest6', 'EquipmentRingsTempest7'],
        variant: 'weapon',
      },
      {
        id: 'mob-progression',
        title: 'Mob Progression',
        sectionType: 'mob-progression',
        rows: WW_MOB_PROGRESSION,
      },
    ],
  },
  {
    id: 'arcane-cultist',
    name: 'Arcane Cultist',
    color: '#65a30d',
    imageFolder: 'masterclass/arcane cultist',
    headerItem: 'Quest101',
    sections: [
      {
        id: 'prisma-bubbles',
        title: 'Prisma Bubbles',
        sectionType: 'prisma-bubbles',
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
      {
        id: 'mob-progression',
        title: 'Mob Progression',
        sectionType: 'mob-progression',
        rows: AC_MOB_PROGRESSION,
      },
    ],
  },
  {
    id: 'royal-guardian',
    name: 'Royal Guardian',
    color: '#fbbf24',
    imageFolder: 'masterclass/royal guardian',
    headerItem: 'Orblet',
    sections: [
      {
        id: 'marbles',
        title: 'Marbles',
        sectionType: 'royal-statues',
      },
      {
        id: 'outposts',
        title: 'Outposts',
        text: 'Coming soon.', // TODO: Royal Guardian outposts
      },
      {
        id: 'resources',
        title: 'Resources',
        text: 'Coming soon.', // TODO: Royal Guardian resources (RGres images are ready)
      },
    ],
  },
]
