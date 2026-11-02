// World 3 Refinery: salts, their costs, and the cycle speed constants the Printer > Refinery tab uses.
// From Toolbox data/website-data (refinery, sigils, saltLicks) and parsers/world-3/refinery.ts.
// cost: { item, quantity, printable, skill } per cycle at rank 1 (printable = the 3D Printer can sample it;
// skill = what gathers it, for who should take its sample). Real cost = floor(rank ^ 1.5) × quantity
// (salt inputs use rank ^ 1.3 once the salt's Refinery task is done, see refineryUtils).
export const refinerySalts = [
  {
    rawName: 'Refinery1',
    name: 'Redox Salts',
    cost: [
      { item: 'Grasslands1', quantity: 10, printable: true, skill: 'fighting' },
      { item: 'Copper', quantity: 5, printable: true, skill: 'mining' },
    ],
  },
  {
    rawName: 'Refinery2',
    name: 'Explosive Salts',
    cost: [
      { item: 'Forest3', quantity: 10, printable: true, skill: 'fighting' },
      { item: 'ForestTree', quantity: 5, printable: true, skill: 'chopping' },
      { item: 'Refinery1', quantity: 2 },
    ],
  },
  {
    rawName: 'Refinery3',
    name: 'Spontaneity Salts',
    cost: [
      { item: 'DesertA1', quantity: 50, printable: true, skill: 'fighting' },
      { item: 'Fish1', quantity: 30, printable: true, skill: 'fishing' },
      { item: 'Bug1', quantity: 40, printable: true, skill: 'catching' },
      { item: 'Refinery2', quantity: 2 },
    ],
  },
  {
    rawName: 'Refinery4',
    name: 'Dioxide Synthesis',
    cost: [
      { item: 'SnowA1', quantity: 10, printable: true, skill: 'fighting' },
      { item: 'Soul2', quantity: 2, printable: false },
      { item: 'Critter3', quantity: 1, printable: false },
      { item: 'Refinery3', quantity: 1 },
    ],
  },
  {
    rawName: 'Refinery5',
    name: 'Purple Salt',
    cost: [
      { item: 'SnowB4', quantity: 25, printable: true, skill: 'fighting' },
      { item: 'Fish4', quantity: 5, printable: true, skill: 'fishing' },
      { item: 'Bug3', quantity: 5, printable: true, skill: 'catching' },
      { item: 'Critter4', quantity: 5, printable: false },
      { item: 'Refinery4', quantity: 2 },
    ],
  },
  {
    rawName: 'Refinery6',
    name: 'Nullo Salt',
    cost: [
      { item: 'SnowC4', quantity: 50, printable: true, skill: 'fighting' },
      { item: 'VoidBar', quantity: 5, printable: false },
      { item: 'Tree7', quantity: 5, printable: true, skill: 'chopping' },
      { item: 'Bug6', quantity: 5, printable: true, skill: 'catching' },
      { item: 'Soul4', quantity: 5, printable: false },
      { item: 'Refinery5', quantity: 2 },
    ],
  },
  {
    rawName: 'Refinery7',
    name: 'Crosslink Salt',
    cost: [
      { item: 'SpiB2', quantity: 10, printable: true, skill: 'fighting' },
      { item: 'Soul7', quantity: 2, printable: false },
      { item: 'Critter11', quantity: 1, printable: false },
      { item: 'Refinery6', quantity: 1 },
    ],
  },
  {
    rawName: 'Refinery8',
    name: 'Propagated Salt',
    cost: [
      { item: 'w7A1', quantity: 25, printable: true, skill: 'fighting' },
      { item: 'Fish12', quantity: 5, printable: true, skill: 'fishing' },
      { item: 'Bug15', quantity: 5, printable: true, skill: 'catching' },
      { item: 'PrehistriumBar', quantity: 5, printable: false },
      { item: 'Refinery7', quantity: 2 },
    ],
  },
  {
    rawName: 'Refinery9',
    name: 'Anionic Salt',
    cost: [
      { item: 'w7B10', quantity: 50, printable: true, skill: 'fighting' },
      { item: 'Soul8', quantity: 5, printable: false },
      { item: 'Refinery8', quantity: 2 },
    ],
  },
]

// Seconds per cycle before speed bonuses: salts 1-3 combustion, 4-6 synthesis, 7+ polymerize
export const REFINERY_BASE_CYCLE_SECONDS = {
  combustion: 900,
  synthesis: 3600,
  polymerize: 360000,
}

export const REFINERY_SPEED_SOURCES = {
  pipeGaugeSigil: 10,
  pipeGaugeTiers: [10, 20, 30, 60, 75],
  saltLickUpgrade: 2,
  saltLickPerLevel: 2,
  saltLickMaxLevel: 100,
  constructMasteryRift: 40,
  voteBonus: 33,
  researchGridSpeed: 49,
  researchGridPolymer: 48,
  legendTalent: 19,
  gildedTubingMulti: 3,
  maxPowerPerCycle: 250000,
}

// Power a salt's bar needs before it can rank up, by rank (Toolbox randomList[18], game "PowerCAP"; ranks past
// the list use its second to last entry, and never under 25). A salt makes as much salt per cycle as power.
export const REFINERY_POWER_CAPS = [
  50, 50, 200, 800, 3000, 8000, 14000, 20000, 30000, 40000, 50000, 65000, 80000,
  100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000,
  1000000, 1000000, 1000000,
]

// Panda companion: 2x salts (and power) per cycle, 3x with Pet Mart+
export const REFINERY_SALT_COMPANION = 35

// Who samples each gathering skill best (bigger AFK gains = bigger samples). stat = main stat that boosts
// the skill's efficiency; specialist = the class tab with that skill's own talents (Toolbox talents.json),
// so every class whose line passes through it is best. Monster drops have neither: any killer works.
export const SKILL_MAIN_STATS = {
  mining: 'STR',
  fishing: 'STR',
  chopping: 'WIS',
  catching: 'AGI',
  fighting: null,
}

export const SKILL_SPECIALISTS = {
  mining: {
    tab: 'Warrior',
    talents: 'Big Pick, Copper Collector (mining efficiency)',
  },
  fishing: {
    tab: 'Barbarian',
    talents: "Catching Some ZZZ's (fishing AFK gains)",
  },
  chopping: {
    tab: 'Mage',
    talents: 'Leaf Thief, Deforesting All Doubt (choppin efficiency)',
  },
  catching: {
    tab: 'Bowman',
    talents: "Sunset on the Hives (catching AFK gains), Briar Patch Runner, Teleki'net'ic Logs",
  },
}

// The Voidwalker (Vman) always prints Spore Caps, it's the best at them from portal runs
export const VMAN_CLASS = 'Voidwalker'
export const VMAN_ITEM = 'Grasslands1'
