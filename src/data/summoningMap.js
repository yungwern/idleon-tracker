// ============================================================
// SUMMONING (W6)
// summoningBonuses: winner bonus text by bonusId. summoningEnemyBonuses: what each battle win gives (first entry per enemy, like Toolbox's find)
// (Summon[1] = won enemy ids). summoningEndless: endless battle i gives bonusIds[i % 40] - 1 its quantity.
// From IdleonToolbox shared-data summoningBonuses / summoningEndless and summoningEnemies.json.
// ============================================================

export const summoningBonuses = [
  '<x Total DMG',
  '<x Jade Gain',
  '<x Farming SPD',
  '<x Artifact Find',
  '+{ Lab Con Range',
  '<x All Essence',
  '<x Sneak EXP',
  '<x Sigil SPD',
  '<x Farming EXP',
  '+{% Drop Rate',
  '<x Crop EVO',
  '+{% AFK Gains',
  '+{% Skill EXP',
  '<x Construct SPD',
  '<x Skill Effncy.',
  '<x Cooking SPD',
  '<x Gaming Bits',
  '<x Shiny EXP',
  '+{% All Stat',
  '+{ Library Max',
  '+{ Stamp LV/day',
  '+{% Villager EXP',
  '+{% Ballot Bonus',
  '+{% Class EXP',
  '+{ Equinox Max LV',
  '+{% Monument AFK',
  '<x Meal Bonuses',
  '<x Spelunk POW',
  '<x Amber Gain',
  '+{% for World 7',
  '+{% for World 7',
  '<x Winner Bonuses',
]

export const summoningEnemyBonuses = {
  mushG: {
    bonusId: 0,
    bonusQty: 15,
  },
  frogG: {
    bonusId: 1,
    bonusQty: 30,
  },
  poopSmall: {
    bonusId: 5,
    bonusQty: 15,
  },
  branch: {
    bonusId: 2,
    bonusQty: 4,
  },
  beanG: {
    bonusId: 0,
    bonusQty: 16,
  },
  ratB: {
    bonusId: 3,
    bonusQty: 15,
  },
  slimeG: {
    bonusId: 4,
    bonusQty: 0.3,
  },
  mushR: {
    bonusId: 6,
    bonusQty: 10,
  },
  acorn: {
    bonusId: 5,
    bonusQty: 20,
  },
  snakeG: {
    bonusId: 1,
    bonusQty: 35,
  },
  carrotO: {
    bonusId: 2,
    bonusQty: 5,
  },
  goblinG: {
    bonusId: 3,
    bonusQty: 20,
  },
  plank: {
    bonusId: 7,
    bonusQty: 10,
  },
  frogBIG: {
    bonusId: 4,
    bonusQty: 0.3,
  },
  mushW: {
    bonusId: 0,
    bonusQty: 19,
  },
  poopD: {
    bonusId: 5,
    bonusQty: 25,
  },
  jarSand: {
    bonusId: 8,
    bonusQty: 5,
  },
  mimicA: {
    bonusId: 6,
    bonusQty: 15,
  },
  crabcake: {
    bonusId: 9,
    bonusQty: 2,
  },
  coconut: {
    bonusId: 1,
    bonusQty: 40,
  },
  sandcastle: {
    bonusId: 7,
    bonusQty: 15,
  },
  pincermin: {
    bonusId: 6,
    bonusQty: 25,
  },
  potato: {
    bonusId: 2,
    bonusQty: 6,
  },
  steak: {
    bonusId: 4,
    bonusQty: 0.3,
  },
  moonman: {
    bonusId: 10,
    bonusQty: 10,
  },
  sandgiant: {
    bonusId: 3,
    bonusQty: 20,
  },
  snailZ: {
    bonusId: 0,
    bonusQty: 25,
  },
  sheep: {
    bonusId: 11,
    bonusQty: 1,
  },
  flake: {
    bonusId: 8,
    bonusQty: 10,
  },
  stache: {
    bonusId: 5,
    bonusQty: 30,
  },
  bloque: {
    bonusId: 0,
    bonusQty: 30,
  },
  mamoth: {
    bonusId: 7,
    bonusQty: 15,
  },
  snowball: {
    bonusId: 12,
    bonusQty: 10,
  },
  penguin: {
    bonusId: 1,
    bonusQty: 50,
  },
  thermostat: {
    bonusId: 3,
    bonusQty: 20,
  },
  glass: {
    bonusId: 9,
    bonusQty: 3,
  },
  snakeB: {
    bonusId: 13,
    bonusQty: 30,
  },
  speaker: {
    bonusId: 14,
    bonusQty: 10,
  },
  eye: {
    bonusId: 6,
    bonusQty: 30,
  },
  ram: {
    bonusId: 4,
    bonusQty: 0.3,
  },
  skele2: {
    bonusId: 10,
    bonusQty: 15,
  },
  mushP: {
    bonusId: 15,
    bonusQty: 50,
  },
  w4a2: {
    bonusId: 8,
    bonusQty: 15,
  },
  w4a3: {
    bonusId: 0,
    bonusQty: 35,
  },
  demonP: {
    bonusId: 2,
    bonusQty: 6,
  },
  w4b2: {
    bonusId: 11,
    bonusQty: 2,
  },
  w4b1: {
    bonusId: 5,
    bonusQty: 35,
  },
  w4b3: {
    bonusId: 7,
    bonusQty: 20,
  },
  w4b4: {
    bonusId: 12,
    bonusQty: 15,
  },
  w4b5: {
    bonusId: 0,
    bonusQty: 50,
  },
  w4c1: {
    bonusId: 1,
    bonusQty: 75,
  },
  w4c2: {
    bonusId: 3,
    bonusQty: 25,
  },
  w4c3: {
    bonusId: 9,
    bonusQty: 5,
  },
  w4c4: {
    bonusId: 13,
    bonusQty: 60,
  },
  w5a1: {
    bonusId: 16,
    bonusQty: 30,
  },
  w5a2: {
    bonusId: 14,
    bonusQty: 10,
  },
  w5a3: {
    bonusId: 0,
    bonusQty: 40,
  },
  w5a4: {
    bonusId: 4,
    bonusQty: 0.3,
  },
  w5a5: {
    bonusId: 10,
    bonusQty: 25,
  },
  w5b1: {
    bonusId: 15,
    bonusQty: 90,
  },
  w5b2: {
    bonusId: 6,
    bonusQty: 30,
  },
  w5b3: {
    bonusId: 17,
    bonusQty: 25,
  },
  w5b4: {
    bonusId: 8,
    bonusQty: 25,
  },
  w5b5: {
    bonusId: 2,
    bonusQty: 7,
  },
  w5b6: {
    bonusId: 5,
    bonusQty: 25,
  },
  w5c1: {
    bonusId: 3,
    bonusQty: 15,
  },
  w5c2: {
    bonusId: 9,
    bonusQty: 10,
  },
  w6a1: {
    bonusId: 18,
    bonusQty: 3,
  },
  w6a2: {
    bonusId: 1,
    bonusQty: 50,
  },
  w6a3: {
    bonusId: 7,
    bonusQty: 20,
  },
  w6a4: {
    bonusId: 11,
    bonusQty: 2,
  },
  w6a5: {
    bonusId: 13,
    bonusQty: 80,
  },
  w6b1: {
    bonusId: 12,
    bonusQty: 20,
  },
  w6b2: {
    bonusId: 0,
    bonusQty: 60,
  },
  w6b3: {
    bonusId: 15,
    bonusQty: 120,
  },
  w6b4: {
    bonusId: 4,
    bonusQty: 0.3,
  },
  w6c1: {
    bonusId: 14,
    bonusQty: 20,
  },
  w6c2: {
    bonusId: 16,
    bonusQty: 50,
  },
  w6d1: {
    bonusId: 2,
    bonusQty: 8,
  },
  w6d2: {
    bonusId: 17,
    bonusQty: 70,
  },
  w6d3: {
    bonusId: 19,
    bonusQty: 3,
  },
  Pet1: {
    bonusId: 0,
    bonusQty: 8,
  },
  Pet2: {
    bonusId: 1,
    bonusQty: 15,
  },
  Pet3: {
    bonusId: 2,
    bonusQty: 3,
  },
  Pet0: {
    bonusId: 5,
    bonusQty: 7,
  },
  Pet4: {
    bonusId: 3,
    bonusQty: 15,
  },
  Pet6: {
    bonusId: 1,
    bonusQty: 25,
  },
  Pet5: {
    bonusId: 0,
    bonusQty: 12,
  },
  Pet10: {
    bonusId: 4,
    bonusQty: 0.3,
  },
  Pet11: {
    bonusId: 2,
    bonusQty: 4,
  },
  rift1: {
    bonusId: 19,
    bonusQty: 0,
  },
  rift2: {
    bonusId: 19,
    bonusQty: 0,
  },
  rift3: {
    bonusId: 19,
    bonusQty: 0,
  },
  rift4: {
    bonusId: 19,
    bonusQty: 0,
  },
  rift5: {
    bonusId: 19,
    bonusQty: 0,
  },
  Crystal1: {
    bonusId: 19,
    bonusQty: 0,
  },
  Crystal2: {
    bonusId: 19,
    bonusQty: 0,
  },
  Crystal3: {
    bonusId: 19,
    bonusQty: 0,
  },
  Crystal4: {
    bonusId: 19,
    bonusQty: 0,
  },
  Crystal0: {
    bonusId: 19,
    bonusQty: 0,
  },
  Crystal5: {
    bonusId: 19,
    bonusQty: 0,
  },
  babaMummy: {
    bonusId: -1,
    bonusQty: 0,
  },
  slimeB: {
    bonusId: -1,
    bonusQty: 0,
  },
  mini6a: {
    bonusId: -1,
    bonusQty: 0,
  },
  mini3a: {
    bonusId: -1,
    bonusQty: 0,
  },
  mini4a: {
    bonusId: -1,
    bonusQty: 0,
  },
  mini5a: {
    bonusId: -1,
    bonusQty: 0,
  },
  Boss6: {
    bonusId: -1,
    bonusQty: 0,
  },
  babayaga: {
    bonusId: -1,
    bonusQty: 0,
  },
  w7a1: {
    bonusId: 0,
    bonusQty: 250,
  },
  w7a2: {
    bonusId: 3,
    bonusQty: 17,
  },
  w7a3: {
    bonusId: 9,
    bonusQty: 5,
  },
  w7a4: {
    bonusId: 11,
    bonusQty: 3,
  },
  w7a5: {
    bonusId: 0,
    bonusQty: 350,
  },
  w7a6: {
    bonusId: 16,
    bonusQty: 250,
  },
  w7a7: {
    bonusId: 3,
    bonusQty: 20,
  },
  w7a8: {
    bonusId: 13,
    bonusQty: 300,
  },
  w7a9: {
    bonusId: 19,
    bonusQty: 1,
  },
  w7a10: {
    bonusId: 0,
    bonusQty: 500,
  },
  w7a11: {
    bonusId: 3,
    bonusQty: 23,
  },
  w7a12: {
    bonusId: 10,
    bonusQty: 90,
  },
  w7b1: {
    bonusId: 0,
    bonusQty: 400,
  },
  w7b2: {
    bonusId: 8,
    bonusQty: 80,
  },
  w7b3: {
    bonusId: 15,
    bonusQty: 150,
  },
  w7b4: {
    bonusId: 10,
    bonusQty: 70,
  },
  w7b5: {
    bonusId: 16,
    bonusQty: 200,
  },
  w7b6: {
    bonusId: 0,
    bonusQty: 500,
  },
}

export const summoningEndless = {
  bonusIds: [21, 22, 23, 24, 25, 27, 23, 22, 24, 29, 25, 26, 24, 23, 22, 32, 30, 31, 25, 24, 26, 29, 24, 22, 21, 23, 31, 28, 27, 24, 26, 22, 30, 25, 29, 28, 23, 26, 24, 32],
  bonusQuantities: [1, 3, 1, 12, 1, 7, 2, 4, 15, 3, 1, 4, 18, 2, 4, 3, 2, 2, 2, 20, 5, 4, 24, 4, 1, 2, 3, 5, 9, 26, 5, 5, 3, 1, 5, 8, 2, 6, 30, 3],
}

// ============================================================
// SUMMONING STONE BOSSES (W6 Summoning > Bosses)
// One boss per essence colour, fought at a summoning stone on a map. Kills = KRbest SummzTrz<index>.
// Boss and base HP = Toolbox summoningEnemies[106 + index]; next fight HP = 2 × baseHp × 4000^kills.
// Beating a colour's boss multiplies most of that colour's summoning upgrades by 1 + kills.
// Map mob = the mob on the stone's map (images/mobs/<mapMob>.png), to find the map in game.
// ============================================================

export const summoningStoneBosses = [
  {
    index: 0,
    name: 'The Aetherdoot',
    colour: 'White',
    boss: 'King_Doot',
    baseHp: 250000,
    mapIndex: 256,
    mapName: 'Bamboo Laboredge',
    mapMob: 'Bamboo_Spirit',
  },
  {
    index: 1,
    name: 'The Grover Glunko',
    colour: 'Green',
    boss: 'Glunko_The_Massive',
    baseHp: 1000000,
    mapIndex: 257,
    mapName: 'Lightway Path',
    mapMob: 'Lantern_Spirit',
  },
  {
    index: 2,
    name: 'The Shimmerlord',
    colour: 'Yellow',
    boss: 'Demented_Spiritlord',
    baseHp: 150000000,
    mapIndex: 262,
    mapName: 'Yolkrock Basin',
    mapMob: 'Royal_Egg',
  },
  {
    index: 3,
    name: 'The Freezerslush',
    colour: 'Blue',
    boss: 'Dilapidated_Slush',
    baseHp: 10000000,
    mapIndex: 120,
    mapName: 'Equinox Valley',
    mapMob: 'Dedotated_Ram',
  },
  {
    index: 4,
    name: 'The Hexermush',
    colour: 'Purple',
    boss: 'Mutated_Mush',
    baseHp: 4000000,
    mapIndex: 157,
    mapName: 'Jelly Cube Bridge',
    mapMob: 'Gelatinous_Cuboid',
  },
  {
    index: 5,
    name: 'The Cinderdomeo',
    colour: 'Red',
    boss: 'Domeo_Magmus',
    baseHp: 40000000,
    mapIndex: 212,
    mapName: 'Crawly Catacombs',
    mapMob: 'Crawler',
  },
  {
    index: 6,
    name: 'The Zephyeror',
    colour: 'Cyan',
    boss: 'Emperor',
    baseHp: 500000000,
    mapIndex: 264,
    mapName: "Emperor's Castle Doorstep",
    mapMob: 'Samurai_Guardian',
  },
]

// ============================================================
// SUMMONING UPGRADES (Summoning > Doublers)
// By upgrade index (Summon[0][i] = level). From Toolbox summoningUpgrades.json. bonus = level × bonusQty,
// × (1 + kills) of the colour's stone boss when stoneBoosted (column 10), × the doubler multi when doubled.
// colour: 0 White, 1 Green, 2 Yellow, 3 Blue, 4 Purple, 5 Red, 6 Cyan, 7 Teal.
// ============================================================

export const summoningColourNames = ['White', 'Green', 'Yellow', 'Blue', 'Purple', 'Red', 'Cyan', 'Teal']

export const summoningUpgrades = [
  {
    name: 'White Essence Champ',
    colour: 0,
    bonusQty: 5,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 0
  {
    name: 'Unit Health',
    colour: 0,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 1
  {
    name: 'Familiar',
    colour: 0,
    bonusQty: 1,
    maxLvl: 25,
    stoneBoosted: false,
  }, // 2
  {
    name: 'Unit Damage',
    colour: 0,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 3
  {
    name: 'Green Summoning',
    colour: 0,
    bonusQty: 10,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 4
  {
    name: 'Mana Generation',
    colour: 0,
    bonusQty: 2,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 5
  {
    name: 'Familiar Merging',
    colour: 0,
    bonusQty: 1,
    maxLvl: 1,
    stoneBoosted: false,
  }, // 6
  {
    name: 'Dodge Roll',
    colour: 0,
    bonusQty: 1,
    maxLvl: 30,
    stoneBoosted: false,
  }, // 7
  {
    name: 'Multi-Number Cards',
    colour: 0,
    bonusQty: 1,
    maxLvl: 1,
    stoneBoosted: false,
  }, // 8
  {
    name: 'Vrumbi',
    colour: 1,
    bonusQty: 5,
    maxLvl: 10,
    stoneBoosted: false,
  }, // 9
  {
    name: 'Unit Wellness',
    colour: 1,
    bonusQty: 2,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 10
  {
    name: 'Green Essence Victor',
    colour: 1,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 11
  {
    name: 'Powerful Units',
    colour: 1,
    bonusQty: 2,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 12
  {
    name: 'Yellow Summoning',
    colour: 1,
    bonusQty: 10,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 13
  {
    name: 'Mana Overflow',
    colour: 1,
    bonusQty: 1,
    maxLvl: 1,
    stoneBoosted: false,
  }, // 14
  {
    name: 'Spiked Placement',
    colour: 1,
    bonusQty: 4,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 15
  {
    name: 'Starting Mana frfr',
    colour: 1,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 16
  {
    name: 'Bloomy',
    colour: 2,
    bonusQty: 5,
    maxLvl: 10,
    stoneBoosted: false,
  }, // 17
  {
    name: 'Yellow Essence Winnin\'',
    colour: 2,
    bonusQty: 5,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 18
  {
    name: 'Luck of the Draw',
    colour: 2,
    bonusQty: 2,
    maxLvl: 10,
    stoneBoosted: false,
  }, // 19
  {
    name: 'Unit Constitution',
    colour: 2,
    bonusQty: 5,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 20
  {
    name: 'Stronger Units',
    colour: 2,
    bonusQty: 4,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 21
  {
    name: 'Slime Cellsplit',
    colour: 2,
    bonusQty: 1,
    maxLvl: 30,
    stoneBoosted: false,
  }, // 22
  {
    name: 'Blue Summoning',
    colour: 2,
    bonusQty: 10,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 23
  {
    name: 'Re-Draw',
    colour: 2,
    bonusQty: 1,
    maxLvl: 3,
    stoneBoosted: true,
  }, // 24
  {
    name: 'Another Slot',
    colour: 2,
    bonusQty: 1,
    maxLvl: 1,
    stoneBoosted: false,
  }, // 25
  {
    name: 'Tonka',
    colour: 3,
    bonusQty: 10,
    maxLvl: 20,
    stoneBoosted: false,
  }, // 26
  {
    name: 'Blue Essence Ballin\'',
    colour: 3,
    bonusQty: 5,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 27
  {
    name: 'Slime Mitosis',
    colour: 3,
    bonusQty: 1,
    maxLvl: 30,
    stoneBoosted: false,
  }, // 28
  {
    name: 'Manaranarr',
    colour: 3,
    bonusQty: 2,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 29
  {
    name: 'Blue Knowledge',
    colour: 3,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 30
  {
    name: 'Beefier Units',
    colour: 3,
    bonusQty: 6,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 31
  {
    name: 'Jeweled Cards',
    colour: 3,
    bonusQty: 6,
    maxLvl: 3,
    stoneBoosted: true,
  }, // 32
  {
    name: 'Purple Summoning',
    colour: 3,
    bonusQty: 10,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 33
  {
    name: 'Another Slot',
    colour: 3,
    bonusQty: 1,
    maxLvl: 1,
    stoneBoosted: false,
  }, // 34
  {
    name: 'Unit Ache Pea',
    colour: 3,
    bonusQty: 9,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 35
  {
    name: 'Regalis',
    colour: 4,
    bonusQty: 1,
    maxLvl: 30,
    stoneBoosted: false,
  }, // 36
  {
    name: 'Unit Hitpoints',
    colour: 4,
    bonusQty: 13,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 37
  {
    name: 'Purp Essence Pumpin\'',
    colour: 4,
    bonusQty: 5,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 38
  {
    name: 'Familiar Skipping',
    colour: 4,
    bonusQty: 1,
    maxLvl: 100,
    stoneBoosted: false,
  }, // 39
  {
    name: 'Purple Knowledge',
    colour: 4,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 40
  {
    name: 'Final Card',
    colour: 4,
    bonusQty: 1,
    maxLvl: 3,
    stoneBoosted: true,
  }, // 41
  {
    name: 'Mana Dividends',
    colour: 4,
    bonusQty: 2,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 42
  {
    name: 'Brutal Units',
    colour: 4,
    bonusQty: 5,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 43
  {
    name: 'Red Summoning',
    colour: 4,
    bonusQty: 10,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 44
  {
    name: 'Sparkie',
    colour: 5,
    bonusQty: 5,
    maxLvl: 30,
    stoneBoosted: false,
  }, // 45
  {
    name: 'Red Essence Ragin\'',
    colour: 5,
    bonusQty: 5,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 46
  {
    name: 'Seeing Red',
    colour: 5,
    bonusQty: 1,
    maxLvl: 10,
    stoneBoosted: true,
  }, // 47
  {
    name: 'Slime Duplication',
    colour: 5,
    bonusQty: 1,
    maxLvl: 40,
    stoneBoosted: false,
  }, // 48
  {
    name: 'Cost Crashing',
    colour: 5,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 49
  {
    name: 'Unit Blood',
    colour: 5,
    bonusQty: 10,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 50
  {
    name: 'Merciless Units',
    colour: 5,
    bonusQty: 8,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 51
  {
    name: 'Red Knowledge',
    colour: 5,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 52
  {
    name: 'Cyan Summoning',
    colour: 5,
    bonusQty: 10,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 53
  {
    name: 'Cyan Essence King',
    colour: 6,
    bonusQty: 5,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 54
  {
    name: 'I Frames',
    colour: 6,
    bonusQty: 1,
    maxLvl: 30,
    stoneBoosted: false,
  }, // 55
  {
    name: 'Units of Destruction',
    colour: 6,
    bonusQty: 10,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 56
  {
    name: 'Cost Deflation',
    colour: 6,
    bonusQty: 2,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 57
  {
    name: 'Cyan Knowledge',
    colour: 6,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 58
  {
    name: 'Undying Units',
    colour: 6,
    bonusQty: 14,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 59
  {
    name: 'DMG Laundering',
    colour: 6,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 60
  {
    name: 'HP Laundering',
    colour: 6,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 61
  {
    name: 'Infinite Essence',
    colour: 6,
    bonusQty: 5,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 62
  {
    name: 'Infinite Health',
    colour: 6,
    bonusQty: 2,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 63
  {
    name: 'Infinite Damage',
    colour: 6,
    bonusQty: 2,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 64
  {
    name: 'White Knowledge',
    colour: 0,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 65
  {
    name: 'Green Knowledge',
    colour: 1,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 66
  {
    name: 'Yellow Knowledge',
    colour: 2,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 67
  {
    name: 'Sharpened Spikes',
    colour: 2,
    bonusQty: 1,
    maxLvl: 20,
    stoneBoosted: true,
  }, // 68
  {
    name: 'Guardio',
    colour: 6,
    bonusQty: 8,
    maxLvl: 30,
    stoneBoosted: false,
  }, // 69
  {
    name: 'Endless Summoning',
    colour: 6,
    bonusQty: 1,
    maxLvl: 1,
    stoneBoosted: false,
  }, // 70
  {
    name: 'Muddah',
    colour: 7,
    bonusQty: 1,
    maxLvl: 1,
    stoneBoosted: false,
  }, // 71
  {
    name: 'Sell Sell Sell',
    colour: 7,
    bonusQty: 3,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 72
  {
    name: 'Teal Tirade',
    colour: 7,
    bonusQty: 5,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 73
  {
    name: 'Unit Obliteration',
    colour: 7,
    bonusQty: 50,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 74
  {
    name: 'Cost Laundering',
    colour: 7,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 75
  {
    name: 'Hundredaire',
    colour: 7,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 76
  {
    name: 'Serrated Spikes',
    colour: 7,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 77
  {
    name: 'Allstar',
    colour: 7,
    bonusQty: 1,
    maxLvl: 50,
    stoneBoosted: false,
  }, // 78
  {
    name: 'Whims of the Tide',
    colour: 7,
    bonusQty: 2,
    maxLvl: 250,
    stoneBoosted: false,
  }, // 79
  {
    name: 'Teal Knowledge',
    colour: 7,
    bonusQty: 1,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 80
  {
    name: 'Glombolic Units',
    colour: 7,
    bonusQty: 100,
    maxLvl: 9999,
    stoneBoosted: true,
  }, // 81
]

// Per essence colour (Toolbox getEssenceGain): knowledge = % per Summoning LV, victories = % per career win
// of that colour (white: every win, endless included), summoning = the colour's "<Colour> Summoning" upgrade
export const summoningEssenceUpgrades = [
  {
    knowledge: 65,
    victories: 0,
  },
  {
    knowledge: 66,
    victories: 11,
    summoning: 4,
  },
  {
    knowledge: 67,
    victories: 18,
    summoning: 13,
  },
  {
    knowledge: 30,
    victories: 27,
    summoning: 23,
  },
  {
    knowledge: 40,
    victories: 38,
    summoning: 33,
  },
  {
    knowledge: 52,
    victories: 46,
    summoning: 44,
  },
  {
    knowledge: 58,
    victories: 54,
    summoning: 53,
  },
  {
    knowledge: 80,
    victories: 73,
  },
]

// How each doubler candidate feeds its stat (Toolbox getArmyDamage / getArmyHealth / upgrade cost, plus the
// in-game text). flat = one additive pool, multi = own multipliers, group = one shared % pool (+ endless ×
// highest endless), perHundred = % per 100 total upgrade levels. Merciless Units (51) and Unit Blood (50) stay
// in Toolbox's shared pools even though their text says "a brand new multiplier": Eli's testing shows a
// doubler on them does almost nothing. Unit Obliteration (74) and Glombolic Units (81) aren't in Toolbox yet:
// treated as own multipliers. Seeing Red (47) and Hundredaire (76) only kick in mid-fight (see
// summoningDoublerNotes) but count fully. Jeweled Cards (32) = a raised chance, not a sure thing, even above
// 100% (Eli tested in game): valued as if bonus / 100 more cards spawn 4x units for 2x mana (an estimate).
// Starting Mana counts as a multiplier.
export const summoningDoublerModel = {
  damage: {
    flat: [3, 12, 21, 31],
    multi: [43, 74, 47, 76],
    group: [51, 56],
    endless: 64,
    perHundred: 60,
  },
  health: {
    flat: [1, 10, 35, 37],
    multi: [20, 81],
    group: [50, 59],
    endless: 63,
    perHundred: 61,
  },
  spikes: {
    flat: 15,
    ofDamage: 68,
    multi: 77,
  },
  jeweledCards: 32,
  mana: {
    regen: [5, 29, 42],
    regenMulti: [41],
    starting: 16,
  },
  infiniteEssence: 62,
  costCuts: [49, 57, 72],
  costLaundering: 75,
  allstar: 78,
}

// Shown next to a doubler pick whose bonus only applies part of the time
export const summoningDoublerNotes = {
  47: 'after an enemy reaches your line',
  76: 'with 100x a unit\'s mana cost banked',
  32: 'value is an estimate: the chance isn\'t a sure thing',
  41: 'when you play your whole hand',
}
