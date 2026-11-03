// =========================
// ISLANDS (World 2)
// =========================
// Source: IdleonToolbox parsers/world-2/islands.ts (costs, shops, trials, Fractal bonuses) and
// shared-data.json bribes. Feature lists and guide text are from Eli's island guide picture.
// Save: OptLacc[160..184] (see parseIslands in lib/extractSnapshot.js).
// Images: public/images/islands/ (IslandSail<i> = in-game name plate).

// OptLacc[169] = unlocked islands as save letters: '_' = Trash, 'a' = Rando ... 'e' = Fractal
export const islandMap = [
  {
    id: 'trash',
    name: 'Trash Island',
    shortName: 'Trash',
    subtitle: 'Daily Resource Generator',
    saveLetter: '_',
    img: 'images/islands/IslandSail0.png',
    color: '#9ca3af',
    preUnlockCost: 4,
    baseCost: 10,
    features: [
      'Garbage washes up every day: spend it at the Garbage Tuna for upgrades',
      '4 new stamps',
      '1 new set of bribes',
      '1 new Star Talent (Filthy Damage)',
      '1 new nametag (Trash Tuna)',
      'Garbage and Bottle gain upgrades',
    ],
    guide: {
      recommendation: 'Rush the new bribes: they help with garbage generation. Always buy % Garbage Up when it\'s the cheapest thing in the shop.',
      notes: 'The slowest island: its mechanic is time-gated, so don\'t spend too much time here.',
    },
  },
  {
    id: 'rando',
    name: 'Rando Island',
    shortName: 'Rando',
    subtitle: 'Weekly Random Event',
    saveLetter: 'a',
    img: 'images/islands/IslandSail1.png',
    color: '#fb923c',
    preUnlockCost: 12,
    baseCost: 12,
    features: [
      '1 guaranteed random event every week',
      'An NPC here sells upgrades for bottles',
      '1 new Star Talent (Rando Event Looty)',
      '+5% Random Event drop rate per upgrade',
      '+3% chance of a 2x Random Event per upgrade',
    ],
    guide: {
      recommendation: 'Only worth it if you haven\'t gotten the rare drop yet. Don\'t spend bottles here until every island is unlocked.',
      notes: 'Gets better once you have the Trash Island bribe set: Random Garbage makes random event bosses drop garbage.',
    },
  },
  {
    id: 'crystal',
    name: 'Crystal Island',
    shortName: 'Crystal',
    subtitle: 'Daily Giant Crystal',
    saveLetter: 'b',
    img: 'images/islands/IslandSail2.png',
    color: '#e879f9',
    preUnlockCost: 20,
    baseCost: 15,
    features: [
      'Giant Crystal mobs spawn every day',
      'They keep stacking even when you don\'t check in (up to 14 days)',
      'Giant Crystals drop candy, EXP and their normal loot',
    ],
    guide: {
      recommendation: 'Not worth it unless Crystal Giants give a rare, strong drop.',
      notes: 'The candy drop table is the same as minibosses (Doot, Biggie...).',
    },
  },
  {
    id: 'seasalt',
    name: 'Seasalt Island',
    shortName: 'Seasalt',
    subtitle: 'New Fishing Spots',
    saveLetter: 'c',
    img: 'images/islands/IslandSail3.png',
    color: '#4ade80',
    preUnlockCost: 28,
    baseCost: 50,
    features: [
      'No time-gated mechanics',
      '3 new fishing spots',
      '4 new fish (with cards)',
      'Fish used to craft World 6 gear',
    ],
    guide: {
      recommendation: 'Pretty good island: unlock it if you want to grind more resources.',
      notes: 'Gives much more Fishing EXP, so your characters can level fishing. Required for Omar\'s last quest.',
    },
  },
  {
    id: 'shimmer',
    name: 'Shimmer Island',
    shortName: 'Shimmer',
    subtitle: 'Weekly Trials and DPS Tests',
    saveLetter: 'd',
    img: 'images/islands/IslandSail4.png',
    color: '#38bdf8',
    preUnlockCost: 40,
    baseCost: 25,
    features: [
      'A new Shimmer Trial every week',
      'Each trial tests one thing (STR, AGI, WIS, LUK, DPS, Movement Speed, skill efficiency...), 22 in all',
      'Earn Shimmer based on how well you do, then spend it on upgrades',
      '1 new Star Talent (Dummy Thicc Stats)',
    ],
    guide: {
      recommendation: 'Good island: gives players at every stage something to focus on.',
      notes: 'The Star Talent is a 1% chance (RNG), and it doesn\'t raise your Shimmer points.',
    },
  },
  {
    id: 'fractal',
    name: 'Fractal Island',
    shortName: 'Fractal',
    subtitle: 'Time Candy Dump and Nothing',
    saveLetter: 'e',
    img: 'images/islands/IslandSail5.png',
    color: '#a5b4fc',
    preUnlockCost: 52,
    baseCost: 70,
    features: [
      'Unlocks Nothing AFK: AFK doing Nothing (on this island or in town)',
      'Bonuses unlock from your total Nothing AFK hours, up to 60,000 hours',
      'Time candy works here',
      'New best AFK trophy (1 in 100,000 per hour of Nothing)',
    ],
    guide: {
      recommendation: 'Somewhat endgame: for people who don\'t want to grind Tremor Wurm for the nth hour.',
      notes: '20,000 hours unlocks every current bonus; 40k and 60k are the World 6 / 7 bonuses.',
    },
  },
]

// Unlock cost of every still-locked island = baseCost + this[islands unlocked];
// with nothing unlocked yet it's preUnlockCost. The game's chain stops at 5, so 6 keeps 500 (Toolbox).
export const ISLAND_COST_STEPS = [0, 15, 45, 100, 200, 500, 500]

// The guide's order: Trash > Shimmer > Seasalt > Fractal > Rando > Crystal
export const ISLAND_PATH = ['trash', 'shimmer', 'seasalt', 'fractal', 'rando', 'crystal']
export const ISLAND_PATH_NOTE = 'Unlocking every island takes about 1,100 bottles. At around 6 bottles a day that\'s ~184 days (gem shop and packs not counted), so plan your path.'

// Bottles per day = floor(4 × (1 + % / 100)) (Toolbox getIslands)
export const BOTTLES_BASE_PER_DAY = 4
export const BOTTLE_GAIN_PER_LEVEL = 10 // Trash shop Bottle Gain upgrade, OptLacc[164]
export const BOTTLE_PER_OMAR_QUEST = 10 // Omar Da Ogar quests (QuestComplete_i), 6 in all
export const BOTTLE_BUNDLE = { name: 'bun_p', bonus: 30 } // Explorer bundle
export const OMAR_QUESTS = ['Omar_Da_Ogar1', 'Omar_Da_Ogar2', 'Omar_Da_Ogar3', 'Omar_Da_Ogar4', 'Omar_Da_Ogar5', 'Omar_Da_Ogar6']

// BribeStatus indices. The Art of the Bail (26) points to the Garbage Tuna; his set is 27-33.
export const ISLAND_BRIBES = {
  artOfTheBail: 26,
  randomGarbage: 27,
  bottleService: 31,
  bottleServiceBonus: 10,
}
export const TRASH_BRIBE_SET = [
  { index: 27, name: 'Random Garbage', desc: 'Random event bosses drop Garbage Piles for the Garbage Tuna' },
  { index: 28, name: 'Godlier Creation', desc: 'Godly Creation gives up to +12 stats instead of +4' },
  { index: 29, name: 'Fishermaster', desc: '+25% Fishing EXP and +15% Fishing Efficiency' },
  { index: 30, name: 'Muscles on Muscles', desc: '+2% Total Damage' },
  { index: 31, name: 'Bottle Service', desc: 'Bottles wash up +10% more often' },
  { index: 32, name: 'Star Scraper', desc: '+33 Star Talent points for every character' },
  { index: 33, name: 'The Art of the Grail', desc: 'Unlocks the next bribe set' },
]

// Garbage Tuna shop (Toolbox trashShopPrices). kind: stamp = owned once its level > 0,
// garbageGain / bottleGain = repeatable upgrades, bribes / talent / nametag = one-time.
// Repeatable cost = base × growth^level.
export const trashShopMap = [
  { id: 'stampB47', name: 'Skelefish Stamp', img: 'images/stamps/StampB47.png', kind: 'stamp', stamp: 'StampB47', cost: 20 },
  { id: 'stampB32', name: 'Amplestample Stamp', img: 'images/stamps/StampB32.png', kind: 'stamp', stamp: 'StampB32', cost: 40 },
  { id: 'stampA38', name: 'Golden Sixes Stamp', img: 'images/stamps/StampA38.png', kind: 'stamp', stamp: 'StampA38', cost: 80 },
  { id: 'stampA39', name: 'Stat Wallstreet Stamp', img: 'images/stamps/StampA39.png', kind: 'stamp', stamp: 'StampA39', cost: 300 },
  { id: 'garbageGain', name: '+20% Garbage Gain', img: 'images/islands/Trash_Currency.png', kind: 'garbageGain', cost: 7, growth: 1.4 },
  { id: 'bribes', name: 'New Bribe Set', img: 'images/islands/Bribe.png', kind: 'bribes', cost: 135 },
  { id: 'bottleGain', name: '+10% Bottle Gain', img: 'images/islands/Island1.png', kind: 'bottleGain', cost: 25, growth: 1.5 },
  { id: 'filthyDamage', name: 'Filthy Damage Talent Book', img: 'images/islands/TalentBook1.png', kind: 'talent', talentId: 649, cost: 450 },
  { id: 'nametag', name: 'Trash Tuna Nametag', img: 'images/islands/EquipmentNametag6b.png', kind: 'nametag', cost: 1500 },
]

// Rando Island bottle shop. level = OptLacc index, per = bonus per level
export const randoShopMap = [
  { id: 'loot', name: 'Random Event Drop Rate', optIndex: 166, cost: 10, growth: 1.5, per: 5, unit: '% drop rate' },
  { id: 'double', name: 'Double Random Event', optIndex: 167, cost: 6, growth: 1.4, per: 3, unit: '% chance of 2x' },
]
export const RANDO_TALENT = { id: 650, name: 'Rando Event Looty', desc: '+% AFK Gains Rate per Random Event rare item found', cost: 200 }

// Crystal Island: one unclaimed day per daily reset, capped at 14. Mobs = 1 + 2 × days below 14,
// then ceil(sqrt(16 × days)), so a capped island spawns FEWER (13 days = 27, 14 days = 15).
export const CRYSTAL_MAX_DAYS = 14
export const CRYSTAL_WARN_DAYS = 13

// Seasalt Island fish (cards in cardMap.js)
export const SEASALT_FISH = ['Fish9', 'Fish10', 'Fish11', 'Fish12']

// Shimmer shop: OptLacc[174 + i] = level, cost = 1 + floor(level / divider).
// Bonus = level × Shim Lantern multi (2x with the artifact, more per form, max 4x).
// img = the matching combat/skill stamp (Fist, Agile, Book, Clover, Tomahawk, Gud EXP, Multitool).
export const shimmerShopMap = [
  { name: 'Base STR', img: 'images/stamps/StampA9.png', unit: '', divider: 12 },
  { name: 'Base AGI', img: 'images/stamps/StampA11.png', unit: '', divider: 12 },
  { name: 'Base WIS', img: 'images/stamps/StampA13.png', unit: '', divider: 12 },
  { name: 'Base LUK', img: 'images/stamps/StampA15.png', unit: '', divider: 10 },
  { name: 'Total DMG', img: 'images/stamps/StampA4.png', unit: '%', divider: 3 },
  { name: 'Class EXP', img: 'images/stamps/StampA44.png', unit: '%', divider: 4 },
  { name: 'Skill Efficiency', img: 'images/stamps/StampB46.png', unit: '%', divider: 5 },
]
export const SHIMMER_SHOP_START = 174
export const SHIMMER_MAX_MULTI = 4
export const DUMMY_TALENT = { id: 653, name: 'Dummy Thicc Stats', desc: '+% All Stat per power of 10 of your best DPS ever on the Target Dummy' }

// OptLacc[183] = this week's trial. How the game picks the next one isn't known (no server var for it).
// req = score for 1 / 10 / 40 shimmer (40 = the weekly max), from Eli's trial table (column headers inferred:
// stat trials scale with the square root of the score, x100 for 10 and x1600 for 40; digit trials add one shimmer
// per extra digit). Toolbox-style notation: M, B, T, Q, QQ, and 1eN where the table used 10E+N (10E+42 = 1e43).
export const SHIMMER_WEEKLY_MAX = 40
export const SHIMMER_REQ_TIERS = [1, 10, 40]
export const shimmerTrials = [
  { name: 'Most total stats (STR, AGI, WIS and LUK combined)', req: ['500', '50,000', '800,000'] },
  { name: 'Most STR', req: ['150', '15,000', '240,000'] },
  { name: 'Most AGI', req: ['150', '15,000', '240,000'] },
  { name: 'Most WIS', req: ['150', '15,000', '240,000'] },
  { name: 'Most LUK', req: ['150', '15,000', '240,000'] },
  { name: 'Highest DPS (digits) on a Beginner', req: ['10,000', '10T', '1e43'] },
  { name: 'Highest DPS (digits) on a Warrior', req: ['100M', '100Q', '1e47'] },
  { name: 'Highest DPS (digits) on an Archer', req: ['100M', '100Q', '1e47'] },
  { name: 'Highest DPS (digits) on a Mage', req: ['10B', '10QQ', '1e49'] },
  { name: 'Highest Accuracy', req: ['50,000', '5M', '80M'] },
  { name: 'Highest Defence (tank mains, it\'s your moment!)', req: ['200', '20,000', '320,000'] },
  { name: 'Highest Movement Speed', req: ['5', '500', '8,000'] },
  { name: 'Highest Critical Chance %', req: ['2.5', '250', '4,000'] },
  { name: 'Most Giant Mobs spawned this week', req: ['0.25', '25', '400'] },
  { name: 'Highest Max HP', req: ['15,000', '1.5M', '24M'] },
  { name: 'Highest Max MP', req: ['15,000', '1.5M', '24M'] },
  { name: 'Most hits on the DPS Dummy within the timer', req: ['2.4', '240', '3,840'] },
  { name: 'Most Mining Efficiency (digits)', req: ['100', '100B', '1e41'] },
  { name: 'Most Choppin Efficiency (digits)', req: ['10', '10B', '1e40'] },
  { name: 'Most Fishing Efficiency (digits)', req: ['0.1', '100M', '1e38'] },
  { name: 'Most Catching Efficiency (digits)', req: ['1', '1B', '1e39'] },
  { name: 'Most Guild GP claimed this week', req: ['6', '600', '9,600'] },
]

// Fractal Island: bonuses unlock at total Nothing AFK hours (OptLacc[184])
export const fractalBonusMap = [
  { hours: 24, effect: '1 in 100,000 chance for a Trophy per hour of Nothing AFK' },
  { hours: 200, effect: '1.25x Dungeon Credits and Flurbos' },
  { hours: 750, effect: '-30% Kitchen upgrade costs' },
  { hours: 2500, effect: '1.20x chance to find Sailing Artifacts' },
  { hours: 10000, effect: 'Dirty Shovel digs up +25% more Gold Nuggets' },
  { hours: 20000, effect: '+100 Star Talent points' },
  { hours: 40000, effect: 'All Ninja Twins get +2% Stealth per Sneaking LV' },
  { hours: 60000, effect: 'World 7 Bonus... I wonder what it will be... (in-game text)' },
]

// Master of Nothing trophy: 1 in 100,000 per hour of Nothing AFK once the 24 h Fractal bonus is unlocked.
// Owned = Trophy18 in Cards1 (snapshot.droppedTrophies).
export const NOTHING_TROPHY = {
  rawName: 'Trophy18',
  name: 'Master of Nothing',
  img: 'images/islands/Trophy18.png',
  chancePerHour: 1 / 100000,
  startHours: 24,
}
