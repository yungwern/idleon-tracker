export const statueMap = {
  0:  'Power',
  1:  'Speed',
  2:  'Mining',
  3:  'Feasty',
  4:  'Health',
  5:  'Kachow',
  6:  'Lumberbob',
  7:  'Thicc Skin',
  8:  'Oceanman',
  9:  'Ol Reliable',
  10: 'Exp',
  11: 'Anvil',
  12: 'Cauldron',
  13: 'Beholder',
  14: 'Bullseye',
  15: 'Box',
  16: 'Twosoul',
  17: 'EhExPee',
  18: 'Seesaw',
  19: 'Pecunia',
  20: 'Mutton',
  21: 'Egg',
  22: 'Battleaxe',
  23: 'Spiral',
  24: 'Boat',
  25: 'Compost',
  26: 'Stealth',
  27: 'Essence',
  28: 'Villager',
  29: 'Dragon',
  30: 'Spelunky',
  31: 'Coral',
}

export const statueWorlds = [
  {
    world: 'World 1',
    statueIds: [0, 1, 2, 3, 4, 14],
    // Non-statue icons shown alongside the statues (no level tracking)
    extras: [
      { name: 'Zenith Cluster', image: 'images/statues/Quest110.png' },
    ],
    mobs: [
      { name: 'Bored Bean', image: 'images/mobs/Bored_Bean.png' },
    ],
  },
  {
    world: 'World 2',
    statueIds: [7, 9, 10, 11, 12, 13, 8],
    mobs: [
      { name: 'Tyson', image: 'images/mobs/Tyson.png' },
    ],
  },
  {
    world: 'World 3',
    individual: [
      { statueId: 15, mobs: [{ name: 'Penguin', image: 'images/mobs/Penguin.png' }] },
      { statueId: 18, mobs: [{ name: 'Cryosnake', image: 'images/mobs/Cryosnake.png' }] },
      { statueId: 16, mobs: [{ name: 'Quenchie', image: 'images/mobs/Quenchie.png' }] },
      { statueId: 17, mobs: [{ name: 'Crystal Cattle', image: 'images/mobs/Crystal_Cattle.png' }] },
    ],
  },
  {
    world: 'World 4',
    statueIds: [19, 20, 21],
    mobs: [
      { name: 'Clammie', image: 'images/mobs/Clammie.png' },
    ],
  },
  {
    world: 'World 5',
    statueIds: [22, 23, 24],
    mobs: [
      { name: 'Tremor Wurm', image: 'images/mobs/Tremor_Wurm.png' },
    ],
    individual: [
      { statueId: 28, afk: true, mobs: [{ name: 'Gloomie Mushroom', image: 'images/mobs/Gloomie_Mushroom.png' }] },
      { statueId: 29, afk: true, mobs: [{ name: 'Ancient Golem', image: 'images/mobs/Ancient_Golem.png' }] },
    ],
  },
  {
    world: 'World 6',
    statueIds: [25, 26, 27],
    mobs: [
      { name: 'Minichief Spirit', image: 'images/mobs/Minichief_Spirit.png' },
    ],
  },
  {
    world: 'World 7',
    statueIds: [30, 31],
    afk: true, // best farmed AFK instead of active
    mobs: [
      { name: 'Magni Pufferfin', image: 'images/mobs/Magni_Pufferfin.png' },
    ],
  },
]

// Best mob to be AFK on when using Time Candy, grouped by mob (in world order)
export const statueCandyMobs = [
  { mob: { name: 'Slime', image: 'images/mobs/Slime.png' }, statueIds: [0] },
  { mob: { name: 'Glublin', image: 'images/mobs/Glublin.png' }, statueIds: [4] },
  { mob: { name: 'Poop', image: 'images/mobs/Poop.png' }, statueIds: [3] },
  { mob: { name: 'Mimic', image: 'images/mobs/Mimic.png' }, statueIds: [11] },
  { mob: { name: 'Sand Castle', image: 'images/mobs/Sand_Castle.png' }, statueIds: [10] },
  { mob: { name: 'Sand Giant', image: 'images/mobs/Sand_Giant.png' }, statueIds: [12] },
  { mob: { name: 'Sir Stache', image: 'images/mobs/Sir_Stache.png' }, statueIds: [1, 17, 16] },
  { mob: { name: 'Sheepie', image: 'images/mobs/Sheepie.png' }, statueIds: [15] },
  { mob: { name: 'Cryosnake', image: 'images/mobs/Cryosnake.png' }, statueIds: [18] },
  { mob: { name: 'TV', image: 'images/mobs/TV.png' }, statueIds: [19] },
  { mob: { name: 'Soda Can', image: 'images/mobs/Soda_Can.png' }, statueIds: [20] },
  { mob: { name: 'Flombeige', image: 'images/mobs/Flombeige.png' }, statueIds: [21] },
  { mob: { name: 'Stiltmole', image: 'images/mobs/Stiltmole.png' }, statueIds: [22] },
  { mob: { name: 'Fire Spirit', image: 'images/mobs/Fire_Spirit.png' }, statueIds: [24] },
  { mob: { name: 'Tremor Wurm', image: 'images/mobs/Tremor_Wurm.png' }, statueIds: [23] },
  { mob: { name: 'Woodlin Spirit', image: 'images/mobs/Woodlin_Spirit.png' }, statueIds: [25] },
  { mob: { name: 'Leek Spirit', image: 'images/mobs/Leek_Spirit.png' }, statueIds: [26] },
  { mob: { name: 'Skydoggie Spirit', image: 'images/mobs/Skydoggie_Spirit.png' }, statueIds: [27] },
]
