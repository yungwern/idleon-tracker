// ============================================================
// MASTER CLASSES
// charIndex     — which character's inventory to check
// inventoryKey  — the item key to look up in that character's inventory
// headerItem    — item key to display on the dropdown bar (uses itemMap)
// ============================================================

export const MASTERCLASSES = [
  {
    id: 'blood-berserker',
    name: 'Blood Berserker',
    color: '#f87171',
    icon: '/images/class icons/bloodberserker.png',
    charIndex: 0,
    headerItem: 'Quest97',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        text: 'General info about Blood Berserker goes here.',
      },
      {
        id: 'notes',
        title: 'Tips & Notes',
        text: 'Tips specific to Blood Berserker go here.',
      },
    ],
  },
  {
    id: 'beast-master',
    name: 'Beast Master',
    color: '#059669',
    icon: '/images/class icons/beastmaster.png',
    charIndex: 3,
    headerItem: 'Quest96',
    sections: [
      {
        id: 'weapons',
        title: 'Weapons & Gear',
        inventoryKey: ['EquipmentBowsTempest0', 'EquipmentBowsTempest1', 'EquipmentBowsTempest2', 'EquipmentBowsTempest3', 'EquipmentBowsTempest4', 'EquipmentRingsTempest4', 'EquipmentRingsTempest6', 'EquipmentRingsTempest7'],
        variant: 'weapon',
      },
      {
        id: 'best farms',
        title: 'Best Farms',
        text: 'Information about the best farming locations for Beast Master goes here.',
      },
      {
        id: 'exalted-stamps',
        title: 'Exalted Stamps',
        sectionType: 'exalted-stamps',
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
        id: 'weapons',
        title: 'Weapons & Gear',
        inventoryKey: ['EquipmentWandsArc0', 'EquipmentRingsArc0'],
        variant: 'weapon',
      },
      {
        id: 'best farms',
        title: 'Best Farms',
        text: 'Information about the best farming locations for Arcane Cultist goes here.',
      },
      {
        id: 'prisma-bubbles',
        title: 'Prisma Bubbles',
        sectionType: 'prisma-bubbles',
      }
    ],
  },
]