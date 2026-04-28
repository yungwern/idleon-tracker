// ============================================================
// MASTER CLASSES
// ============================================================

export const MASTERCLASSES = [
  {
    id: 'blood-berserker',
    name: 'Blood Berserker',
    color: '#f87171',
    icon: '/images/class icons/bloodberserker.png',
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
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        text: 'General info about Beast Master goes here.',
      },
      {
        id: 'weapons',
        title: 'Weapons & Gear',
        items: [
          { name: 'Example Weapon', note: 'Drop from: ???', icon: '🏹' },
        ],
      },
      {
        id: 'notes',
        title: 'Tips & Notes',
        text: 'Tips specific to Beast Master go here.',
      },
    ],
  },
  {
    id: 'bubonic-conjuror',
    name: 'Bubonic Conjuror',
    color: '#65a30d',
    icon: '/images/class icons/bubonicconjuror.png',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        text: 'General info about Bubonic Conjuror goes here.',
      },
      {
        id: 'weapons',
        title: 'Weapons & Gear',
        items: [
          { name: 'Example Weapon', note: 'Drop from: ???', icon: '⚗️' },
        ],
      },
      {
        id: 'notes',
        title: 'Tips & Notes',
        text: 'Tips specific to Bubonic Conjuror go here.',
      },
    ],
  },
]