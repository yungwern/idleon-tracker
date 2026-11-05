// World 3 3D Printer: gem shop unlocks (GemItemsPurchased index = Toolbox gemShop.json globalIndex)
export const PRINTER_BASE_LIBRARY_SLOTS = 4
export const SAMPLE_SPACES_MAX = 6

export const printerBuffMap = {
  crystalPrinter: {
    name: 'Crystal 3D Printer',
    source: 'Gem Shop · World 3',
    img: 'images/gem shop/GemQ1.png',
    gemIndex: 111,
    maxPurchases: 1,
    effect: 'Unlocks the 2nd printer chamber: every character prints two things at once (can be the same thing twice)',
  },
  sampleSpaces: {
    name: 'More Sample Spaces',
    source: 'Gem Shop · World 3',
    img: 'images/gem shop/GemQ2.png',
    gemIndex: 112,
    maxPurchases: SAMPLE_SPACES_MAX,
    effect: '+1 sample library slot per purchase (4 base, 10 with all 6)',
  },
}

// The five "MULTI" lines on the in-game printer screen, in the game's order. Math: utils/printerUtils.js
// (Toolbox getPrinterMulti). maxDays = how long the daily ones keep growing (from the in-game text).
export const printerMultiMap = [
  {
    key: 'kingOfTheRemembered',
    name: 'King of the Remembered',
    source: 'Divine Knight talent',
    img: 'images/talents/UISkillIcon178.png',
    effect: '+% printer output for every power of 10 kills done with the Orb of Remembrance',
  },
  {
    key: 'supremeWiring',
    name: 'Supreme Wiring',
    source: 'Event shop',
    img: 'images/printer/EventShopBuy4.png',
    effect: '+2% printer output per day. Taking a new sample resets it',
  },
  {
    key: 'biggoleMole',
    name: 'Biggole Mole',
    source: 'Companion',
    img: 'images/printer/w5b6.png',
    effect: 'Samples grow +1% per day for 100 days',
    maxDays: 100,
  },
  {
    key: 'moonOfPrint',
    name: 'Moon of Print',
    source: 'Compass upgrade (Wind Walker)',
    img: 'images/printer/CompassUpg43.png',
    effect: 'Samples grow +{% per day for 100 days',
    maxDays: 100,
  },
  {
    key: 'yetAnotherPrinterMulti',
    name: 'Yet Another Printer Multi',
    source: 'Legend talent',
    img: 'images/legend talents/LegendTalentIcon17.png',
    effect: '+{% printer output per day for 20 days. Taking a new sample resets it',
    maxDays: 20,
  },
]

// Multis that also apply to printing but aren't listed on the in-game printer screen (Toolbox getPrinterMulti)
export const printerHiddenMultiMap = [
  {
    key: 'goldRelic',
    name: 'Gold Relic',
    source: 'Sailing artifact',
    img: 'images/printer/Arti4.png',
    effect: 'Samples grow +{% per day for $ days. Taking a new sample resets it',
  },
  {
    key: 'skillMastery',
    name: 'Skill Mastery + Lolly Flower',
    source: 'Rift Skill Mastery + Pristine Charm (added together)',
    img: 'images/printer/NjTrP15.png',
    effect: 'Skill Mastery: 7% + 1% per skill at rank 6+ (needs rift 15). Lolly Flower: +25%',
  },
  {
    key: 'vote',
    name: 'Vote Ballot',
    source: 'Weekly vote (bonus 11)',
    img: 'images/printer/VoteBon11.png',
    effect: 'Printer resources +20% × the vote multi, only in weeks it wins',
  },
]

// Gold Relic by artifact form (0 = not found): +perDay % for maxDays days (Toolbox artifacts.json)
export const GOLD_RELIC_FORMS = [
  null,
  { perDay: 2, maxDays: 40 },
  { perDay: 2.5, maxDays: 60 },
  { perDay: 3, maxDays: 80 },
  { perDay: 5, maxDays: 100 },
  { perDay: 6, maxDays: 120 },
  { perDay: 7, maxDays: 140 },
  { perDay: 10, maxDays: 160 },
]

// Save indices / formula constants for the multis above
export const PRINTER_MULTI_SOURCES = {
  kingTalentId: 178,
  supremeWiringEventShop: 4,
  supremeWiringPerDay: 2,
  biggoleMoleCompanion: 17,
  moonOfPrintPerLevel: 0.02,
  printerLegendTalent: 17,
  goldRelicArtifact: 4,
  skillMasteryBase: 7,
  skillMasteryRank: 5,
  lollyFlowerCharm: 'Lolly Flower',
  voteBonus: 11,
}

// Per-character printer multis (Toolbox parsers/world-3/printer.ts)
export const PRINTER_CHARACTER_MULTIS = {
  wiredIn: 2, // lab bonus Wired In: characters AFK in the lab (or with Arctis's major bonus)
  harriep: 3, // Harriep's major bonus
}
