export const statueWorlds = [
  {
    world: 'World 1',
    color: '#4ade80',
    statueIds: [0, 1, 2, 3, 4, 5, 6],
    mobs: [
      { name: 'Bored Bean', image: '/images/mobs/Bored_Bean.png' },
      { name: 'Crystal Carrot', image: '/images/mobs/Crystal_Carrot.png' },
    ],
  },
  {
    world: 'World 2',
    color: '#fbbf24',
    statueIds: [7, 9, 10, 11, 12],
    mobs: [
      { name: 'Sandy Pot', image: '/images/mobs/Sandy_Pot.png' },
      { name: 'Crystal Crabal', image: '/images/mobs/Crystal_Crabal.png' },
    ],
    special: [
      { statueId: 8, name: 'Oceanman', image: '/images/skills/catching.png', note: 'Obtained while Catching' },
    ],
  },
  {
    world: 'World 3',
    color: '#38bdf8',
    statueIds: [],
    mobs: [],
    individual: [
      { statueId: 17, mobs: [{ name: 'Dedotated Ram', image: '/images/mobs/Dedotated_Ram.png' }, { name: 'Crystal Cattle', image: '/images/mobs/Crystal_Cattle.png' }] },
      { statueId: 15, mobs: [{ name: 'Penguin', image: '/images/mobs/Penguin.png' }] },
      { statueId: 18, mobs: [{ name: 'Cryosnake', image: '/images/mobs/Cryosnake.png' }] },
      { statueId: 16, mobs: [{ name: 'Quenchie', image: '/images/mobs/Quenchie.png' }] },
    ],
  },
  {
    world: 'World 4',
    color: '#c084fc',
    statueIds: [19, 20, 21],
    mobs: [
      { name: 'Clammie', image: '/images/mobs/Clammie.png' },
      { name: 'Crystal Custard', image: '/images/mobs/Crystal_Custard.png' },
    ],
  },
  {
    world: 'World 5',
    color: '#fb923c',
    statueIds: [22, 23, 24],
    mobs: [
      { name: 'Tremor Wurm', image: '/images/mobs/Tremor_Wurm.png' },
      { name: 'Crystal Capybara', image: '/images/mobs/Crystal_Capybara.png' },
    ],
    individual: [
      { statueId: 28, mobs: [{ name: 'Gloomie Mushroom', image: '/images/mobs/Gloomie_Mushroom.png' }] },
      { statueId: 29, mobs: [{ name: 'Ancient Golem', image: '/images/mobs/Ancient_Golem.png' }] },
    ],
  },
  {
    world: 'World 6',
    color: '#2dd4bf',
    statueIds: [25, 26, 27],
    mobs: [
      { name: 'Minichief Spirit', image: '/images/mobs/Minichief_Spirit.png' },
      { name: 'Crystal Candalight', image: '/images/mobs/Crystal_Candalight.png' },
    ],
  },
  {
    world: 'World 7',
    color: '#22d3ee',
    statueIds: [30, 31],
    mobs: [
      { name: 'Crystal Cuttlefish', image: '/images/mobs/Crystal_Cuttlefish.png' },
    ],
  },
]