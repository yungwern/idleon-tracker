// =========================
// CARDS
// =========================
// Source: IdleonToolbox (Morta1/IdleonToolbox) data/website-data/cards.json + cardSets.
// Keyed by the monster rawName Toolbox uses (cards.wolfB, cards.w7b7, ...).
// Images: public/images/cards/2Cards<cardIndex>.png and CardSet<n>.png
//
// effect = 1-star base value. In game the equipped bonus is base × (stars + 1).

export const cardSetMap = {
  CardSet0: {
    name: 'Blunder Hills Set',
    img: 'images/cards/CardSet0.png',
    effect: '+8% EXP if below Lv 50',
  },
  CardSet1: {
    name: 'Yum Yum Desert Set',
    img: 'images/cards/CardSet1.png',
    effect: '+10% All Food Effect',
  },
  CardSet2: {
    name: 'Easy Resources Set',
    img: 'images/cards/CardSet2.png',
    effect: '+8% Skill Efficiency',
  },
  CardSet3: {
    name: 'Medium Resources Set',
    img: 'images/cards/CardSet3.png',
    effect: '+5% Skill EXP Gain',
  },
  CardSet4: {
    name: 'Frostbite Tundra Set',
    img: 'images/cards/CardSet4.png',
    effect: '+5% DEF and ACC',
  },
  CardSet5: {
    name: 'Hard Resources Set',
    img: 'images/cards/CardSet5.png',
    effect: '+2% Skill AFK Gain Rate',
  },
  CardSet6: {
    name: 'Hyperion Nebula Set',
    img: 'images/cards/CardSet6.png',
    effect: '+6% Crit Chance',
  },
  CardSet7: {
    name: 'Dungeons Set',
    img: 'images/cards/CardSet7.png',
    effect: '+5% more Dungeon Credits',
  },
  CardSet8: {
    name: 'Smolderin\' Plateau Set',
    img: 'images/cards/CardSet8.png',
    effect: '+2% Fight AFK Gain Rate',
  },
  CardSet9: {
    name: 'Spirited Valley Set',
    img: 'images/cards/CardSet9.png',
    effect: '+6% Multikill Per Tier',
  },
  CardSet10: {
    name: 'Shimmerfin Deep Set',
    img: 'images/cards/CardSet10.png',
    effect: '+10% Class Exp (Multi)',
  },
  CardSet25: {
    name: 'Events Set',
    img: 'images/cards/CardSet25.png',
    effect: '+7% Drop Rate',
  },
  CardSet26: {
    name: 'Bosses Set',
    img: 'images/cards/CardSet26.png',
    effect: '+6% Dmg, Drop, and EXP',
  },
}

export const cardMap = {

  // ── Blunder Hills ──
  mushG: {
    name: 'Green Mushroom',
    img: 'images/cards/2CardsA0.png',
    effect: '+12 Base HP',
  },
  mushR: {
    name: 'Red Mushroom',
    img: 'images/cards/2CardsA1.png',
    effect: '+3 Base LUK',
  },
  frogG: {
    name: 'Frog',
    img: 'images/cards/2CardsA2.png',
    effect: '+10 Base MP',
  },
  beanG: {
    name: 'Bored Bean',
    img: 'images/cards/2CardsA3.png',
    effect: '+7 Base Damage',
  },
  slimeG: {
    name: 'Slime',
    img: 'images/cards/2CardsA4.png',
    effect: '+2 Base WIS',
  },
  snakeG: {
    name: 'Baby Boa',
    img: 'images/cards/2CardsA5.png',
    effect: '+1 Move Spd',
  },
  carrotO: {
    name: 'Carrotman',
    img: 'images/cards/2CardsA6.png',
    effect: '+2 Base AGI',
  },
  goblinG: {
    name: 'Glublin',
    img: 'images/cards/2CardsA7.png',
    effect: '+2% Total HP',
  },
  plank: {
    name: 'Wode Board',
    img: 'images/cards/2CardsA8.png',
    effect: '+2 Base STR',
  },
  frogBIG: {
    name: 'Gigafrog',
    img: 'images/cards/2CardsA9.png',
    effect: '+5% Card Drop Chance',
  },
  poopSmall: {
    name: 'Poop',
    img: 'images/cards/2CardsA10.png',
    effect: '+10% Crystal Mob Spawn Chance',
  },
  ratB: {
    name: 'Rat',
    img: 'images/cards/2CardsA11.png',
    effect: '+1% Critical Chance',
  },
  branch: {
    name: 'Walking Stick',
    img: 'images/cards/2CardsA12.png',
    effect: '+5 Base WIS',
  },
  acorn: {
    name: 'Nutto',
    img: 'images/cards/2CardsA13.png',
    effect: '+5% Money from Monsters',
  },
  Crystal0: {
    name: 'Crystal Carrot',
    img: 'images/cards/2CardsA14.png',
    effect: '+5% Total Drop Rate',
  },
  mushW: {
    name: 'Wood Mushroom',
    img: 'images/cards/2CardsA16.png',
    effect: '+5% Total Accuracy',
  },

  // ── Yum Yum Desert ──
  jarSand: {
    name: 'Sandy Pot',
    img: 'images/cards/2CardsB1.png',
    effect: '+12% EXP Conversion from Talent',
  },
  mimicA: {
    name: 'Mimic',
    img: 'images/cards/2CardsB2.png',
    effect: '+2% Total Drop Rate',
  },
  crabcake: {
    name: 'Crabcake',
    img: 'images/cards/2CardsB3.png',
    effect: '+5% To not consume Food',
  },
  coconut: {
    name: 'Mafioso',
    img: 'images/cards/2CardsB4.png',
    effect: '+5 Base AGI',
  },
  sandcastle: {
    name: 'Sand Castle',
    img: 'images/cards/2CardsB5.png',
    effect: '+4% Total Accuracy',
  },
  pincermin: {
    name: 'Pincermin',
    img: 'images/cards/2CardsB6.png',
    effect: '+1 Weapon Power',
  },
  potato: {
    name: 'Mashed Potato',
    img: 'images/cards/2CardsB7.png',
    effect: '+3% Critical Damage',
  },
  steak: {
    name: 'Tyson',
    img: 'images/cards/2CardsB8.png',
    effect: '+5 Base STR',
  },
  moonman: {
    name: 'Moonmoon',
    img: 'images/cards/2CardsB9.png',
    effect: '+8% Monster EXP While Active',
  },
  sandgiant: {
    name: 'Sand Giant',
    img: 'images/cards/2CardsB10.png',
    effect: '+2% Minimum Damage',
  },
  snailZ: {
    name: 'Snelbie',
    img: 'images/cards/2CardsB11.png',
    effect: '+8% Card Drop Chance',
  },
  shovelR: {
    name: 'Dig Doug',
    img: 'images/cards/2CardsB12.png',
    effect: '+6 Base LUK',
  },
  Crystal1: {
    name: 'Crystal Crabal',
    img: 'images/cards/2CardsB13.png',
    effect: '+2% EXP from monsters',
  },
  Bandit_Bob: {
    name: 'Bandit Bob',
    img: 'images/cards/2CardsB14.png',
    effect: '+1% Money from Monsters',
  },

  // ── Easy Resources ──
  Copper: {
    name: 'Copper',
    img: 'images/cards/2CardsC1.png',
    effect: '+4 Base accuracy',
  },
  Iron: {
    name: 'Iron',
    img: 'images/cards/2CardsC2.png',
    effect: '+5% Total Mining Efficiency',
  },
  Gold: {
    name: 'Gold',
    img: 'images/cards/2CardsC3.png',
    effect: '+5% Mining EXP',
  },
  ForgeA: {
    name: 'Fire Forge',
    img: 'images/cards/2CardsC16.png',
    effect: '+4% Smithing EXP (Passive)',
  },
  OakTree: {
    name: 'Oak Tree',
    img: 'images/cards/2CardsC4.png',
    effect: '+3 Base Defence',
  },
  BirchTree: {
    name: 'Birch Tree',
    img: 'images/cards/2CardsC5.png',
    effect: '+5% Total Choppin Efficiency',
  },
  JungleTree: {
    name: 'Jungle Tree',
    img: 'images/cards/2CardsC6.png',
    effect: '+5% Choppin EXP',
  },
  ForestTree: {
    name: 'Forest Tree',
    img: 'images/cards/2CardsC7.png',
    effect: '+8% EXP Conversion from Talent',
  },
  Fish1: {
    name: 'Goldfish',
    img: 'images/cards/2CardsC8.png',
    effect: '+3% Total MP',
  },
  Fish2: {
    name: 'Hermit Can',
    img: 'images/cards/2CardsC9.png',
    effect: '+5% Total Fishing Efficiency',
  },
  Fish3: {
    name: 'Jellyfish',
    img: 'images/cards/2CardsC10.png',
    effect: '+5% Fishing EXP',
  },
  Bug1: {
    name: 'Flies',
    img: 'images/cards/2CardsC11.png',
    effect: '+4% Monster EXP While Active',
  },
  Bug2: {
    name: 'Butterflies',
    img: 'images/cards/2CardsC12.png',
    effect: '+5% Total Catching Efficiency',
  },

  // ── Medium Resources ──
  Plat: {
    name: 'Plat',
    img: 'images/cards/2CardsD2.png',
    effect: '+2% Mining Away Gains',
  },
  Dementia: {
    name: 'Dementia',
    img: 'images/cards/2CardsD1.png',
    effect: '+4% Mining Speed',
  },
  Void: {
    name: 'Void',
    img: 'images/cards/2CardsD3.png',
    effect: '+6% Total Mining Efficiency',
  },
  Lustre: {
    name: 'Lustre',
    img: 'images/cards/2CardsD4.png',
    effect: '+5% Mining Speed',
  },
  ForgeB: {
    name: 'Cinder Forge',
    img: 'images/cards/2CardsD16.png',
    effect: '+7% Smithing EXP (Passive)',
  },
  PalmTree: {
    name: 'Palm Tree',
    img: 'images/cards/2CardsD7.png',
    effect: '+2% Choppin Away Gains',
  },
  ToiletTree: {
    name: 'Toilet Tree',
    img: 'images/cards/2CardsD5.png',
    effect: '+4% Choppin Speed',
  },
  StumpTree: {
    name: 'Stump Tree',
    img: 'images/cards/2CardsD6.png',
    effect: '+3% Total Accuracy',
  },
  SaharanFoal: {
    name: 'Saharan Foal',
    img: 'images/cards/2CardsD8.png',
    effect: '+2.5% Choppin Away Gains',
  },
  Tree7: {
    name: 'Wispy Tree',
    img: 'images/cards/2CardsF2.png',
    effect: '+6% Choppin Speed',
  },
  AlienTree: {
    name: 'Alien Tree',
    img: 'images/cards/2CardsF13.png',
    effect: '+8% Total Choppin Efficiency',
  },
  Tree8: {
    name: 'Cubed Tree',
    img: 'images/cards/2CardsF12.png',
    effect: '+7% Choppin Speed',
  },
  Fish4: {
    name: 'Bloach',
    img: 'images/cards/2CardsD11.png',
    effect: '+2% Fishing Away Gains',
  },
  Fish5: {
    name: 'Skelefish',
    img: 'images/cards/2CardsF20.png',
    effect: '+8% Total Fishing Efficiency',
  },
  Fish6: {
    name: 'Shark',
    img: 'images/cards/2CardsF21.png',
    effect: '+4% Fishing Speed',
  },
  Fish7: {
    name: 'Manta Ray',
    img: 'images/cards/2CardsF22.png',
    effect: '+10% Fishing EXP',
  },
  Fish8: {
    name: 'Kraken',
    img: 'images/cards/2CardsF23.png',
    effect: '+3% Fishing Away Gains',
  },
  Bug3: {
    name: 'Sentient Cereal',
    img: 'images/cards/2CardsD10.png',
    effect: '+5% Catching EXP',
  },
  Bug4: {
    name: 'Fruitflies',
    img: 'images/cards/2CardsD9.png',
    effect: '+2% Catching Away Gains',
  },
  Bug5: {
    name: 'Mosquisnow',
    img: 'images/cards/2CardsF8.png',
    effect: '+7% Total Catching Efficiency',
  },
  Bug6: {
    name: 'Flycicle',
    img: 'images/cards/2CardsF9.png',
    effect: '+2.5% Catching Away Gains',
  },
  Bug7: {
    name: 'Bumble Bee',
    img: 'images/cards/2CardsF14.png',
    effect: '+8% Total Catching Efficiency',
  },
  SoulCard1: {
    name: 'Forest Soul',
    img: 'images/cards/2CardsD17.png',
    effect: '+3% Defence from Equipment',
  },
  SoulCard2: {
    name: 'Dune Soul',
    img: 'images/cards/2CardsD18.png',
    effect: '+4 Starting Pts in Worship',
  },
  SoulCard3: {
    name: 'Rooted Soul',
    img: 'images/cards/2CardsF3.png',
    effect: '+6 Starting Pts in Worship',
  },
  SoulCard4: {
    name: 'Frigid Soul',
    img: 'images/cards/2CardsF10.png',
    effect: '+7% Max Charge',
  },
  CritterCard1: {
    name: 'Froge',
    img: 'images/cards/2CardsD19.png',
    effect: '+3% Shiny Critter Chance',
  },
  CritterCard2: {
    name: 'Crabbo',
    img: 'images/cards/2CardsD20.png',
    effect: '+5% Trapping Efficiency',
  },
  CritterCard3: {
    name: 'Scorpie',
    img: 'images/cards/2CardsD21.png',
    effect: '+5% Trapping EXP',
  },
  CritterCard4: {
    name: 'Mousey',
    img: 'images/cards/2CardsF4.png',
    effect: '+5% Shiny Critter Chance',
  },
  CritterCard5: {
    name: 'Owlio',
    img: 'images/cards/2CardsF5.png',
    effect: '+1.25% EXP from monsters',
  },

  // ── Frostbite Tundra ──
  sheep: {
    name: 'Sheepie',
    img: 'images/cards/2CardsE0.png',
    effect: '+3% Defence from Equipment',
  },
  flake: {
    name: 'Frost Flake',
    img: 'images/cards/2CardsE1.png',
    effect: '+7 Base STR',
  },
  stache: {
    name: 'Sir Stache',
    img: 'images/cards/2CardsE2.png',
    effect: '+9% Card Drop Chance',
  },
  bloque: {
    name: 'Bloque',
    img: 'images/cards/2CardsE3.png',
    effect: '+7 Base AGI',
  },
  mamoth: {
    name: 'Mamooth',
    img: 'images/cards/2CardsE4.png',
    effect: '+3.5% Total HP',
  },
  snowball: {
    name: 'Snowman',
    img: 'images/cards/2CardsE5.png',
    effect: '+3% Total Damage',
  },
  penguin: {
    name: 'Penguin',
    img: 'images/cards/2CardsE6.png',
    effect: '+7 Base WIS',
  },
  thermostat: {
    name: 'Thermister',
    img: 'images/cards/2CardsE7.png',
    effect: '+4% Critical Damage',
  },
  glass: {
    name: 'Quenchie',
    img: 'images/cards/2CardsE8.png',
    effect: '+7 Base LUK',
  },
  snakeB: {
    name: 'Cryosnake',
    img: 'images/cards/2CardsE9.png',
    effect: '+5% MP regen rate',
  },
  speaker: {
    name: 'Bop Box',
    img: 'images/cards/2CardsE10.png',
    effect: '+3.5% Total Drop Rate',
  },
  eye: {
    name: 'Neyeptune',
    img: 'images/cards/2CardsE11.png',
    effect: '+5% Total Accuracy',
  },
  ram: {
    name: 'Dedotated Ram',
    img: 'images/cards/2CardsE14.png',
    effect: '+2 Weapon Power',
  },
  skele: {
    name: 'Xylobone',
    img: 'images/cards/2CardsE12.png',
    effect: '+1% Critical Chance',
  },
  skele2: {
    name: 'Bloodbone',
    img: 'images/cards/2CardsE13.png',
    effect: '+3% Total Damage',
  },
  Crystal2: {
    name: 'Crystal Cattle',
    img: 'images/cards/2CardsE15.png',
    effect: '+3% EXP from monsters',
  },

  // ── Hard Resources ──
  Starfire: {
    name: 'Starfire',
    img: 'images/cards/2CardsF16.png',
    effect: '+8% Mining EXP',
  },
  Dreadlo: {
    name: 'Dreadlo',
    img: 'images/cards/2CardsF29.png',
    effect: '+3% Mining Away Gains',
  },
  Godshard: {
    name: 'Godshard',
    img: 'images/cards/2CardsF39.png',
    effect: '+30% Forge Cap and SPD (Passive)',
  },
  Prehistrium: {
    name: 'Prehistrium',
    img: 'images/cards/2CardsF44.png',
    effect: '+5% Mining Away Gains',
  },
  Tree9: {
    name: 'Maple Tree',
    img: 'images/cards/2CardsF24.png',
    effect: '+3% Choppin Away Gains',
  },
  Tree10: {
    name: 'Dandelioli Tree',
    img: 'images/cards/2CardsF25.png',
    effect: '+8% Choppin Speed',
  },
  Tree12: {
    name: 'Bamboo',
    img: 'images/cards/2CardsF34.png',
    effect: '+10% Total Choppin Efficiency',
  },
  Tree13: {
    name: 'Effervescent Eucalyptus',
    img: 'images/cards/2CardsF35.png',
    effect: '+4% Choppin Away Gains',
  },
  Tree14: {
    name: 'Ancient Seaweed',
    img: 'images/cards/2CardsF40.png',
    effect: '+5% Choppin Away Gains',
  },
  Fish9: {
    name: 'Icefish',
    img: 'images/cards/2CardsF30.png',
    effect: '+15% Fishing EXP',
  },
  Fish10: {
    name: 'Shellfish',
    img: 'images/cards/2CardsF31.png',
    effect: '+12% Total Fishing Efficiency',
  },
  Fish11: {
    name: 'Jumbo Shrimp',
    img: 'images/cards/2CardsF32.png',
    effect: '+3.5% Fishing Away Gains',
  },
  Fish12: {
    name: 'Caulifish',
    img: 'images/cards/2CardsF33.png',
    effect: '+7% Fishing Speed',
  },
  Bug8: {
    name: 'Fairy',
    img: 'images/cards/2CardsF15.png',
    effect: '+4% Catching Speed',
  },
  Bug9: {
    name: 'Scarab',
    img: 'images/cards/2CardsF26.png',
    effect: '+10% Total Catching Efficiency',
  },
  Bug10: {
    name: 'Dust Mote',
    img: 'images/cards/2CardsF27.png',
    effect: '+3% Catching Away Gains',
  },
  Bug12: {
    name: 'Ladybug',
    img: 'images/cards/2CardsF37.png',
    effect: '+5% Total Catching Efficiency',
  },
  Bug13: {
    name: 'Firefly',
    img: 'images/cards/2CardsF38.png',
    effect: '+5% Catching Speed',
  },
  Bug14: {
    name: 'Fractalfly',
    img: 'images/cards/2CardsF46.png',
    effect: '+8% Total Catching Efficiency',
  },
  CritterCard6: {
    name: 'Pingy',
    img: 'images/cards/2CardsF6.png',
    effect: '+6% Shiny Critter Chance',
  },
  CritterCard7: {
    name: 'Bunny',
    img: 'images/cards/2CardsF7.png',
    effect: '+1% Skill AFK gain rate',
  },
  CritterCard8: {
    name: 'Dung Beat',
    img: 'images/cards/2CardsF17.png',
    effect: '+7% Trapping Efficiency',
  },
  CritterCard9: {
    name: 'Honker',
    img: 'images/cards/2CardsF18.png',
    effect: '+8% Trapping EXP',
  },
  CritterCard10: {
    name: 'Blobfish',
    img: 'images/cards/2CardsF19.png',
    effect: '+8% Shiny Critter Chance',
  },
  CritterCard11: {
    name: 'Tuttle',
    img: 'images/cards/2CardsF47.png',
    effect: '+15% Shiny Critter Chance',
  },
  SoulCard5: {
    name: 'Squishy Soul',
    img: 'images/cards/2CardsF11.png',
    effect: '+5% Charge Rate',
  },
  SoulCard6: {
    name: 'Oozie Soul',
    img: 'images/cards/2CardsF28.png',
    effect: '+10% Max Charge',
  },
  SoulCard7: {
    name: 'Breezy Soul',
    img: 'images/cards/2CardsF36.png',
    effect: '+7% Charge Rate',
  },
  SoulCard8: {
    name: 'Deepsea Soul',
    img: 'images/cards/2CardsF45.png',
    effect: '+50 Starting Pts in Worship',
  },
  SpelunkingCard0: {
    name: 'Fearful Tunnel',
    img: 'images/cards/2CardsF41.png',
    effect: '+4% Spelunking EXP',
  },
  SpelunkingCard1: {
    name: 'Decaying Crevasse',
    img: 'images/cards/2CardsF42.png',
    effect: '+8% Spelunking Efficiency',
  },
  SpelunkingCard2: {
    name: 'Buried Church',
    img: 'images/cards/2CardsF43.png',
    effect: '+2% Spelunking AFK Gain',
  },
  SpelunkingCard3: {
    name: 'One Way Opening',
    img: 'images/cards/2CardsF48.png',
    effect: '+8% Spelunking EXP',
  },
  SpelunkingCard4: {
    name: 'Plunder Cranny',
    img: 'images/cards/2CardsF49.png',
    effect: '+2% Spelunking AFK Gain',
  },
  SpelunkingCard5: {
    name: 'Kelp Forest',
    img: 'images/cards/2CardsF50.png',
    effect: '+15% Spelunking EXP',
  },
  SpelunkingCard6: {
    name: 'Burned Tunnel',
    img: 'images/cards/2CardsF51.png',
    effect: '+30% Spelunking EXP',
  },

  // ── Hyperion Nebula ──
  mushP: {
    name: 'Purp Mushroom',
    img: 'images/cards/2CardsG1.png',
    effect: '+8% Money from Monsters',
  },
  w4a2: {
    name: 'TV',
    img: 'images/cards/2CardsG2.png',
    effect: '+5% Breeding EXP (Passive)',
  },
  w4a3: {
    name: 'Donut',
    img: 'images/cards/2CardsG3.png',
    effect: '+4% Defence from Equipment',
  },
  demonP: {
    name: 'Demon Genie',
    img: 'images/cards/2CardsG4.png',
    effect: '+15% Crystal Mob Spawn Chance',
  },
  w4b2: {
    name: 'Soda Can',
    img: 'images/cards/2CardsG6.png',
    effect: '+5 Star Talent Pts (Passive)',
  },
  w4b1: {
    name: 'Flying Worm',
    img: 'images/cards/2CardsG5.png',
    effect: '+12 Base WIS',
  },
  w4b3: {
    name: 'Gelatinous Cuboid',
    img: 'images/cards/2CardsG7.png',
    effect: '+4% Lab EXP gain',
  },
  w4b4: {
    name: 'Choccie',
    img: 'images/cards/2CardsG8.png',
    effect: '+2.5 Weapon Power',
  },
  w4b5: {
    name: 'Biggole Wurm',
    img: 'images/cards/2CardsG9.png',
    effect: '+12 Base AGI',
  },
  w4c1: {
    name: 'Clammie',
    img: 'images/cards/2CardsG10.png',
    effect: '+1.5% Multikill per tier',
  },
  w4c2: {
    name: 'Octodar',
    img: 'images/cards/2CardsG11.png',
    effect: '+12 Base STR',
  },
  w4c3: {
    name: 'Flombeige',
    img: 'images/cards/2CardsG12.png',
    effect: '+1.5% Critical Chance (Passive)',
  },
  w4c4: {
    name: 'Stilted Seeker',
    img: 'images/cards/2CardsG13.png',
    effect: '+0.5% All Stat',
  },
  Crystal3: {
    name: 'Crystal Custard',
    img: 'images/cards/2CardsG14.png',
    effect: '+2px Line Width (Passive)',
  },

  // ── Dungeons ──
  frogP: {
    name: 'Poisonic Frog',
    img: 'images/cards/2CardsX0.png',
    effect: '+2 Base Dungeon MP',
  },
  frogD: {
    name: 'Globohopper',
    img: 'images/cards/2CardsX1.png',
    effect: '+2% Block Chance',
  },
  frogY: {
    name: 'King Frog',
    img: 'images/cards/2CardsX2.png',
    effect: '+1.5 Base Dungeon Damage',
  },
  frogR: {
    name: 'Lava Slimer',
    img: 'images/cards/2CardsX14.png',
    effect: '+6% Dungeon Card Chance',
  },
  frogW: {
    name: 'Chromatium Frog',
    img: 'images/cards/2CardsX15.png',
    effect: '+2.5% Dungeon Credits',
  },
  frogGG: {
    name: 'Eldritch Croaker',
    img: 'images/cards/2CardsX22.png',
    effect: '20% to start with RNG orb (Passive)',
  },
  frogGR: {
    name: 'Grandfrogger',
    img: 'images/cards/2CardsX3.png',
    effect: '15% to start with RNG orb (Passive)',
  },
  frogGR2: {
    name: 'Rotting Grandfrogger',
    img: 'images/cards/2CardsX4.png',
    effect: '+4% Dungeon Flurbos',
  },
  frogGR3: {
    name: 'Forlorn Grandfrogger',
    img: 'images/cards/2CardsX5.png',
    effect: '+5% Dungeon Credits',
  },
  frogGR4: {
    name: 'Vengeful Grandfrogger',
    img: 'images/cards/2CardsX21.png',
    effect: '+7% Dungeon Move Speed',
  },
  target: {
    name: 'Target',
    img: 'images/cards/2CardsX6.png',
    effect: '+2 Base Dungeon HP',
  },
  rocky: {
    name: 'Grumblo',
    img: 'images/cards/2CardsX7.png',
    effect: '+8% Dungeon Card Chance',
  },
  steakR: {
    name: 'Beefie',
    img: 'images/cards/2CardsX9.png',
    effect: '+6% Dungeon Money',
  },
  totem: {
    name: 'Lazlo',
    img: 'images/cards/2CardsX16.png',
    effect: '+10% RNG item rarity',
  },
  cactus: {
    name: 'Cactopunk',
    img: 'images/cards/2CardsX8.png',
    effect: '+3% Dungeon Boss Dmg',
  },
  potatoB: {
    name: 'Crescent Spud',
    img: 'images/cards/2CardsX10.png',
    effect: '+5% Dungeon MP regen',
  },
  snakeZ: {
    name: 'Snakenhotep',
    img: 'images/cards/2CardsX11.png',
    effect: '+4% Dungeon Drop Rate',
  },
  snakeZ2: {
    name: 'Enraged Snakenhotep',
    img: 'images/cards/2CardsX12.png',
    effect: '+5% Total Dungeon Dmg',
  },
  snakeZ3: {
    name: 'Inevitable Snakenhotep',
    img: 'images/cards/2CardsX13.png',
    effect: '+5% Dungeon Flurbos',
  },
  iceknight: {
    name: 'Ice Guard',
    img: 'images/cards/2CardsX17.png',
    effect: '+8% Dungeon MP regen',
  },
  iceBossZ: {
    name: 'Glaciaxus',
    img: 'images/cards/2CardsX18.png',
    effect: '+15% Dungeon Card Chance',
  },
  iceBossZ2: {
    name: 'Golden Glaciaxus',
    img: 'images/cards/2CardsX19.png',
    effect: '+8% Dungeon Credits',
  },
  iceBossZ3: {
    name: 'Caustic Glaciaxus',
    img: 'images/cards/2CardsX20.png',
    effect: '+8% Total Dungeon Dmg',
  },

  // ── Smolderin' Plateau ──
  w5a1: {
    name: 'Suggma',
    img: 'images/cards/2CardsH1.png',
    effect: '+2% Multikill per tier',
  },
  w5a2: {
    name: 'Maccie',
    img: 'images/cards/2CardsH2.png',
    effect: '+5% Defence from Equipment',
  },
  w5a3: {
    name: 'Mister Brightside',
    img: 'images/cards/2CardsH3.png',
    effect: '+6% Total Drop Rate',
  },
  w5a4: {
    name: 'Cheese Nub',
    img: 'images/cards/2CardsH4.png',
    effect: '+5% Skill EXP (Passive)',
  },
  w5a5: {
    name: 'Stiltmole',
    img: 'images/cards/2CardsH5.png',
    effect: '+6% Divinity EXP (Passive)',
  },
  w5b1: {
    name: 'Molti',
    img: 'images/cards/2CardsH6.png',
    effect: '+7% Money from mobs (Passive)',
  },
  w5b2: {
    name: 'Purgatory Stalker',
    img: 'images/cards/2CardsH7.png',
    effect: '+1 Weapon Power (Passive)',
  },
  w5b3: {
    name: 'Citringe',
    img: 'images/cards/2CardsH8.png',
    effect: '+4.5% Total Damage',
  },
  w5b4: {
    name: 'Lampar',
    img: 'images/cards/2CardsH9.png',
    effect: '+4% EXP from monsters',
  },
  w5b5: {
    name: 'Fire Spirit',
    img: 'images/cards/2CardsH10.png',
    effect: '+15 Base LUK',
  },
  w5b6: {
    name: 'Biggole Mole',
    img: 'images/cards/2CardsH11.png',
    effect: '+6% Mining Speed',
  },
  w5c1: {
    name: 'Crawler',
    img: 'images/cards/2CardsH12.png',
    effect: '+4% Sailing Speed (Passive)',
  },
  w5c2: {
    name: 'Tremor Wurm',
    img: 'images/cards/2CardsH13.png',
    effect: '+1% All Stat',
  },
  caveB: {
    name: 'Gloomie Mushroom',
    img: 'images/cards/2CardsH15.png',
    effect: '+4% Villager EXP (Passive)',
  },
  caveC: {
    name: 'Ancient Golem',
    img: 'images/cards/2CardsH16.png',
    effect: '+4% Total Drop Rate (Passive)',
  },
  caveD: {
    name: 'Crystal Glunko',
    img: 'images/cards/2CardsH17.png',
    effect: '+6% Total Drop Rate (Passive)',
  },
  Crystal4: {
    name: 'Crystal Capybara',
    img: 'images/cards/2CardsH14.png',
    effect: '+3% Skill Efficncy (Passive)',
  },

  // ── Spirited Valley ──
  w6a1: {
    name: 'Sprout Spirit',
    img: 'images/cards/2CardsI1.png',
    effect: '+5% Total Damage',
  },
  w6a2: {
    name: 'Ricecake',
    img: 'images/cards/2CardsI2.png',
    effect: '+3% DEF from Equips (Passive)',
  },
  w6a3: {
    name: 'River Spirit',
    img: 'images/cards/2CardsI3.png',
    effect: '+1.5% All Stat',
  },
  w6a4: {
    name: 'Baby Troll',
    img: 'images/cards/2CardsI4.png',
    effect: '+3% Sneaking EXP (Passive)',
  },
  w6a5: {
    name: 'Woodlin Spirit',
    img: 'images/cards/2CardsI5.png',
    effect: '+3% Multikill per tier',
  },
  w6b1: {
    name: 'Bamboo Spirit',
    img: 'images/cards/2CardsI6.png',
    effect: '+3% Summoning EXP (Passive)',
  },
  w6b2: {
    name: 'Lantern Spirit',
    img: 'images/cards/2CardsI7.png',
    effect: '+2% Farming EXP (Passive)',
  },
  w6b3: {
    name: 'Mama Troll',
    img: 'images/cards/2CardsI8.png',
    effect: '+2% Skill AFK gain rate',
  },
  w6b4: {
    name: 'Leek Spirit',
    img: 'images/cards/2CardsI9.png',
    effect: '+4% Jade Coin gain (Passive)',
  },
  w6c1: {
    name: 'Ceramic Spirit',
    img: 'images/cards/2CardsI10.png',
    effect: '+5% Cooking Spd Multi (Passive)',
  },
  w6c2: {
    name: 'Skydoggie Spirit',
    img: 'images/cards/2CardsI11.png',
    effect: '+20 Base LUK',
  },
  w6d1: {
    name: 'Royal Egg',
    img: 'images/cards/2CardsI12.png',
    effect: '+1% Fighting AFK (Passive)',
  },
  w6d2: {
    name: 'Minichief Spirit',
    img: 'images/cards/2CardsI13.png',
    effect: '+8% Total Drop Rate',
  },
  w6d3: {
    name: 'Samurai Guardian',
    img: 'images/cards/2CardsI14.png',
    effect: '+1.5% All AFK Gains(Passive)',
  },
  Crystal5: {
    name: 'Crystal Candalight',
    img: 'images/cards/2CardsI15.png',
    effect: '+4% Sneaking Stealth (Passive)',
  },

  // ── Shimmerfin Deep ──
  w7a1: {
    name: 'Equinox Broadbass',
    img: 'images/cards/2CardsJ1.png',
    effect: '+7% Spelunking Efficiency',
  },
  w7a2: {
    name: 'Doodlefish',
    img: 'images/cards/2CardsJ2.png',
    effect: '+3% Total Damage Multi',
  },
  w7a3: {
    name: 'Eamsy Earl',
    img: 'images/cards/2CardsJ3.png',
    effect: '+3% Class EXP Multi',
  },
  w7a4: {
    name: 'Shellslug',
    img: 'images/cards/2CardsJ4.png',
    effect: '+3% Spelunking AFK Gain',
  },
  w7a5: {
    name: 'Balloonfish',
    img: 'images/cards/2CardsJ5.png',
    effect: '+4% Spelunk POW (Passive)',
  },
  w7a6: {
    name: 'Noble Clam',
    img: 'images/cards/2CardsJ6.png',
    effect: '+3% Spelunking EXP',
  },
  w7a7: {
    name: 'Litterfish',
    img: 'images/cards/2CardsJ7.png',
    effect: '+5% Spelunk Amber (Passive)',
  },
  w7a8: {
    name: 'Pufferblob',
    img: 'images/cards/2CardsJ8.png',
    effect: '+3% Class EXP Multi',
  },
  w7a9: {
    name: 'Demonblub',
    img: 'images/cards/2CardsJ9.png',
    effect: '+2% Daily Coral (Passive)',
  },
  w7a10: {
    name: 'Spearfish',
    img: 'images/cards/2CardsJ10.png',
    effect: '+2% Stamina Regen (Passive)',
  },
  w7a11: {
    name: 'Coralcave Crab',
    img: 'images/cards/2CardsJ11.png',
    effect: '+1% Gallery Bonus (Passive)',
  },
  w7a12: {
    name: 'Coralcave Guardian',
    img: 'images/cards/2CardsJ12.png',
    effect: '+1% Drop Rate Multi',
  },
  w7b1: {
    name: 'Trench Fish',
    img: 'images/cards/2CardsJ13.png',
    effect: '+1% Research EXP (Passive)',
  },
  w7b2: {
    name: 'Boomy Mine',
    img: 'images/cards/2CardsJ14.png',
    effect: '+20% Gaming Bit Multi (Passive)',
  },
  w7b3: {
    name: 'Pirate Underling',
    img: 'images/cards/2CardsJ15.png',
    effect: '+10% Flaggy Rate Multi (Passive)',
  },
  w7b4: {
    name: 'Eggroll',
    img: 'images/cards/2CardsJ16.png',
    effect: '+2% Research EXP (Passive)',
  },
  w7b5: {
    name: 'Jellofish',
    img: 'images/cards/2CardsJ17.png',
    effect: '+50% Farming EVO Multi (Passive)',
  },
  w7b6: {
    name: 'Kelpfish',
    img: 'images/cards/2CardsJ18.png',
    effect: '+5% Class EXP Multi',
  },
  w7b7: {
    name: 'Mantaray',
    img: 'images/cards/2CardsJ19.png',
    effect: '+1% Drop Rate Multi',
  },
  w7b8: {
    name: 'Glowfish',
    img: 'images/cards/2CardsJ20.png',
    effect: '+3% Research EXP (Passive)',
  },
  w7b9: {
    name: 'Ancientfish',
    img: 'images/cards/2CardsJ21.png',
    effect: '+1% Drop Rate Multi',
  },
  w7b10: {
    name: 'Magni Pufferfin',
    img: 'images/cards/2CardsJ22.png',
    effect: '+5% Lumi Hourly Gains (Passive)',
  },
  w7b11: {
    name: 'Pirate Deckhand',
    img: 'images/cards/2CardsJ23.png',
    effect: '+1% Research AFK gain (Passive)',
  },
  w7b12: {
    name: 'Dreadnaught Captain',
    img: 'images/cards/2CardsJ24.png',
    effect: '+10% Spelunk Amber (Passive)',
  },
  Crystal6: {
    name: 'Crystal Cuttlefish',
    img: 'images/cards/2CardsJ99.png',
    effect: '+1.5% Damage Multi (Passive)',
  },

  // ── Events ──
  ghost: {
    name: 'Ghost',
    img: 'images/cards/2CardsY0.png',
    effect: '+3% Monster EXP While Active',
  },
  xmasEvent: {
    name: 'Giftmas Blobulyte',
    img: 'images/cards/2CardsY1.png',
    effect: '+3% Total Drop Rate',
  },
  xmasEvent2: {
    name: 'Meaning of Giftmas',
    img: 'images/cards/2CardsY2.png',
    effect: '+3% Money from Monsters',
  },
  slimeR: {
    name: 'Valenslime',
    img: 'images/cards/2CardsY3.png',
    effect: '+3% Defence from Equipment',
  },
  loveEvent: {
    name: 'Loveulyte',
    img: 'images/cards/2CardsY4.png',
    effect: '+5% Total HP',
  },
  loveEvent2: {
    name: 'Chocco Box',
    img: 'images/cards/2CardsY5.png',
    effect: '+4% Boost Food Effect',
  },
  loveEvent3: {
    name: 'Giant Rose',
    img: 'images/cards/2CardsY15.png',
    effect: '+3% EXP from monsters',
  },
  sheepB: {
    name: 'Floofie',
    img: 'images/cards/2CardsY6.png',
    effect: '+3% MP regen rate',
  },
  snakeY: {
    name: 'Shell Snake',
    img: 'images/cards/2CardsY7.png',
    effect: '+3 Base LUK',
  },
  EasterEvent1: {
    name: 'Egggulyte',
    img: 'images/cards/2CardsY8.png',
    effect: '+1% Card Drop Chance',
  },
  EasterEvent2: {
    name: 'Egg Capsule',
    img: 'images/cards/2CardsY9.png',
    effect: '+1% Critical Damage',
  },
  shovelY: {
    name: 'Plasti Doug',
    img: 'images/cards/2CardsY13.png',
    effect: '+2 Base Defence',
  },
  crabcakeB: {
    name: 'Mr Blueberry',
    img: 'images/cards/2CardsY10.png',
    effect: '+3% Total Drop Rate',
  },
  SummerEvent1: {
    name: 'Coastiolyte',
    img: 'images/cards/2CardsY11.png',
    effect: '+1% Fishing Away Gains',
  },
  SummerEvent2: {
    name: 'Summer Spirit',
    img: 'images/cards/2CardsY12.png',
    effect: '+4% Catching EXP',
  },
  xmasEvent3: {
    name: 'Golden Giftmas Box',
    img: 'images/cards/2CardsY14.png',
    effect: '+3% Defence from Equipment',
  },
  springEvent1: {
    name: 'Bubbulyte',
    img: 'images/cards/2CardsY16.png',
    effect: '+2% Class EXP (Passive)',
  },
  springEvent2: {
    name: 'Spring Splendor',
    img: 'images/cards/2CardsY17.png',
    effect: '+2% All Skill EXP (Passive)',
  },
  fallEvent1: {
    name: 'Falloween Pumpkin',
    img: 'images/cards/2CardsY18.png',
    effect: '+4 Star Talent Pts (Passive)',
  },
  anni4Event1: {
    name: 'IdleOn 4th Anniversary',
    img: 'images/cards/2CardsY19.png',
    effect: '+2% Drop Rate (Passive)',
  },
  cropfallEvent1: {
    name: 'Bort The Cornhusk',
    img: 'images/cards/2CardsY20.png',
    effect: '+4% Gold Food Effect (Passive)',
  },
  xmasEvent4: {
    name: 'Big Ol Giftmas Box',
    img: 'images/cards/2CardsY21.png',
    effect: '+2% Catching Away Gains',
  },
  luckEvent1: {
    name: 'Luckulyte',
    img: 'images/cards/2CardsY22.png',
    effect: '+3% Drop Rate (Passive)',
  },
  luckEvent2: {
    name: 'Potluck',
    img: 'images/cards/2CardsY23.png',
    effect: '+4% Money from Monsters',
  },
  anni5Event1: {
    name: 'IdleOn 5th Anniversary',
    img: 'images/cards/2CardsY24.png',
    effect: '+5% Gold Food Effect (Passive)',
  },

  // ── Bosses ──
  slimeB: {
    name: 'Glunko The Massive',
    img: 'images/cards/2CardsZ26.png',
    effect: '+2 Weapon Power',
  },
  babayaga: {
    name: 'Baba Yaga',
    img: 'images/cards/2CardsZ0.png',
    effect: '+10% Money from Monsters',
  },
  poopBig: {
    name: 'Dr Defecaus',
    img: 'images/cards/2CardsZ1.png',
    effect: '+5% Total Damage',
  },
  poopD: {
    name: 'Boop',
    img: 'images/cards/2CardsA15.png',
    effect: '+1% Fighting AFK gain rate',
  },
  wolfA: {
    name: 'Amarok',
    img: 'images/cards/2CardsZ2.png',
    effect: '+2.5% Skill AFK gain rate',
  },
  wolfB: {
    name: 'Chaotic Amarok',
    img: 'images/cards/2CardsZ4.png',
    effect: '+2.5% Fighting AFK gain rate',
  },
  wolfC: {
    name: 'Radiant Amarok',
    img: 'images/cards/2CardsZ14.png',
    effect: '+3 Weapon Power',
  },
  babaHour: {
    name: 'Biggie Hours',
    img: 'images/cards/2CardsZ5.png',
    effect: '+3% Double AFK claim chance',
  },
  babaMummy: {
    name: 'King Doot',
    img: 'images/cards/2CardsZ6.png',
    effect: '+6% Total Drop Rate',
  },
  Boss2A: {
    name: 'Efaunt',
    img: 'images/cards/2CardsZ3.png',
    effect: '+5% EXP from monsters',
  },
  Boss2B: {
    name: 'Chaotic Efaunt',
    img: 'images/cards/2CardsZ7.png',
    effect: '+3.75% Skill EXP',
  },
  Boss2C: {
    name: 'Gilded Efaunt',
    img: 'images/cards/2CardsZ15.png',
    effect: '+15 Star Talent Pts (Passive)',
  },
  mini3a: {
    name: 'Dilapidated Slush',
    img: 'images/cards/2CardsZ12.png',
    effect: '+12% Money from Monsters',
  },
  Boss3A: {
    name: 'Chizoar',
    img: 'images/cards/2CardsZ8.png',
    effect: '+8% Cog Build Spd (Passive)',
  },
  Boss3B: {
    name: 'Chaotic Chizoar',
    img: 'images/cards/2CardsZ9.png',
    effect: '+5% Shrine Effects (Passive)',
  },
  Boss3C: {
    name: 'Blighted Chizoar',
    img: 'images/cards/2CardsZ16.png',
    effect: '+1.5% All Stat',
  },
  mini4a: {
    name: 'Mutated Mush',
    img: 'images/cards/2CardsZ13.png',
    effect: '+6% Cooking EXP gain',
  },
  Boss4A: {
    name: 'Massive Troll',
    img: 'images/cards/2CardsZ10.png',
    effect: '+6% Kitchen Speed (Passive)',
  },
  Boss4B: {
    name: 'Chaotic Troll',
    img: 'images/cards/2CardsZ11.png',
    effect: '+10% All Skill Efficiency',
  },
  Boss4C: {
    name: 'Blitzkrieg Troll',
    img: 'images/cards/2CardsZ17.png',
    effect: '+7% Total Damage',
  },
  mini5a: {
    name: 'Domeo Magmus',
    img: 'images/cards/2CardsZ24.png',
    effect: '+1.5% Total Drop Rate (Passive)',
  },
  Boss5A: {
    name: 'Kattlekruk',
    img: 'images/cards/2CardsZ18.png',
    effect: '+6% Sailing Speed (Passive)',
  },
  Boss5B: {
    name: 'Chaotic Kattlekruk',
    img: 'images/cards/2CardsZ19.png',
    effect: '+8% EXP from monsters',
  },
  Boss5C: {
    name: 'Sacrilegious Kattlekruk',
    img: 'images/cards/2CardsZ20.png',
    effect: '+18% Money from Monsters',
  },
  mini6a: {
    name: 'Demented Spiritlord',
    img: 'images/cards/2CardsZ25.png',
    effect: '+2.5% Fighting AFK gain rate',
  },
  Boss6A: {
    name: 'Emperor',
    img: 'images/cards/2CardsZ21.png',
    effect: '+12% Total Drop Rate',
  },
  Boss6B: {
    name: 'Chaotic Emperor',
    img: 'images/cards/2CardsZ22.png',
    effect: '+8% Total Damage Multi',
  },
  Boss6C: {
    name: 'Sovereign Emperor',
    img: 'images/cards/2CardsZ23.png',
    effect: '+20% Multikill per tier',
  },
  fm_rat: {
    name: 'Verminous',
    img: 'images/cards/2CardsZ27.png',
    effect: '+1% Masterclass Drops (Passive)',
  },
}
