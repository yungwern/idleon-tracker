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
