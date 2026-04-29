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
        inventoryKey: 'Quest96',
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
        id: 'overview',
        title: 'Overview',
        text: 'General info about Arcane Cultist goes here.',
      },
      {
        id: 'weapons',
        title: 'Weapons & Gear',
        inventoryKey: 'Quest101',
      },
      {
        id: 'notes',
        title: 'Tips & Notes',
        text: 'Tips specific to Arcane Cultist go here.',
      },
    ],
  },
]