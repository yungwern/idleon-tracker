// ============================================================
// ROYAL GUARDIAN OUTPOSTS
// Formulas and tables from IdleOn Toolbox (parsers/class-specific/royalGuardian.ts).
// Save layout: RoyalMaps[mapIndex] is one outpost once it has 3+ entries:
//   [0-2] upgrade levels, [3-7] rank EXP, [8-9] connections, [10] mode, [12] glorified.
//   A map with exactly 1 entry is still being cleared.
// ============================================================

import { mapEnemyData } from './mobsMap'

// Mob sprite (images/mobs/<key>.png) per outpost map. Mining, fishing and empty maps have none.
// The Rift isn't in mapEnemyData (Map Bonuses skip it), so it's added here.
const OUTPOST_MOBS = {
  ...Object.fromEntries(mapEnemyData.map(e => [e.mapIndex, e.mobKey])),
  166: 'The_Rift',
}

// Every map that can hold an outpost, keyed by map index. Towns, shops and other
// non-idle screens can't hold one, so they're left out.
export const OUTPOST_MAPS = {
  // World 1
  1: "Spore Meadows",
  2: "Froggy Fields",
  6: "Tunnels Entrance",
  7: "Freefall Caverns",
  10: "The Ol' Straightaway",
  11: "Echoing Egress",
  12: "Slip Slidy Ledges",
  13: "The Base Of The Bark",
  14: "Valley Of The Beans",
  15: "Rats Nest",
  16: "Jungle Perimeter",
  17: "Birch Enclave",
  18: "Hollowed Trunk",
  19: "Winding Willows",
  24: "Vegetable Patch",
  26: "Forest Outskirts",
  27: "Encroaching Forest Villas",
  28: "Tucked Away",
  30: "The Roots",
  31: "Where the Branches End",
  32: "Motherlode Pit",
  42: "Grand Owl Perch",
  // World 2
  51: "Jar Bridge",
  52: "The Mimic Hole",
  53: "Dessert Dunes",
  54: "Salty Shores",
  55: "Faraway Piers",
  57: "The Grandioso Canyon",
  58: "Shifty Sandbox",
  59: "Pincer Plateau",
  60: "Slamabam Straightaway",
  61: "Deepwater Docks",
  62: "The Ring",
  63: "Up Up Down Down",
  64: "Sands of Time",
  65: "Djonnuttown",
  67: "Bandit Bob's Hideout",
  73: "The Oasis",
  // World 3
  101: "Steep Sheep Ledge",
  102: "Trappers Folley",
  103: "Snowfield Outskirts",
  104: "The Stache Split",
  105: "Refrigeration Station",
  106: "Mamooooth Mountain",
  107: "Rollin' Tundra",
  108: "Signature Slopes",
  109: "Thermonuclear Climb",
  110: "Waterlogged Entrance",
  111: "Cryo Catacombs",
  112: "Overpass of Sound",
  113: "Crystal Basecamp",
  116: "Wam Wonderland",
  117: "Hell Hath Frozen Over",
  // World 4
  151: "Spaceway Raceway",
  152: "TV Outpost",
  153: "Donut Drive-In",
  154: "Outskirts of Fallstar Isle",
  155: "Mountainous Deugh",
  156: "Wurm Highway",
  157: "Jelly Cube Bridge",
  158: "Cocoa Tunnel",
  159: "Standstill Plains",
  160: "Shelled Shores",
  161: "The Untraveled Octopath",
  162: "Flamboyant Bayou",
  163: "Enclave of Eyes",
  166: "The Rift",
  // World 5
  201: "Naut Sake Perimeter",
  202: "Niagrilled Falls",
  203: "The Killer Roundabout",
  204: "Cracker Jack Lake",
  205: "The Great Molehill",
  206: "Erruption River",
  207: "Mount Doomish",
  208: "OJ Bay",
  209: "Lampar Lake",
  210: "Spitfire River",
  211: "Miner Mole Outskirts",
  212: "Crawly Catacombs",
  213: "The Worm Nest",
  // World 6
  251: "Gooble Goop Creek",
  252: "Picnic Bridgeways",
  253: "Irrigation Station",
  254: "Troll Playground",
  255: "Edge of the Valley",
  256: "Bamboo Laboredge",
  257: "Lightway Path",
  258: "Troll Broodnest",
  259: "Above the Clouds",
  260: "Sleepy Skyline",
  261: "Dozey Dogpark",
  262: "Yolkrock Basin",
  263: "Chieftain Stairway",
  264: "Emperor's Castle Doorstep",
  // World 7
  301: "Refraction Bend",
  302: "Doodle Reef",
  303: "Seaweed Street",
  304: "Barnacle Curb",
  305: "Balloon Bay",
  307: "Plastic Basin",
  308: "Puffpuff Overpass",
  309: "Pinpoint Summit",
  310: "Middle of Nowhere",
  311: "Coralcave Outskirts",
  312: "Coralcave Perimeter",
  315: "Deep End of the Koipond",
  316: "Minefield",
  317: "Pirate Upper Deck",
  318: "Sushi Perimeter",
  319: "Jellofish Fields",
  320: "Where the Kelp Meets Trench",
  321: "Trench Precipice",
  322: "The Glowing Underbelly",
  323: "Ancient Fissure",
  324: "Molten Edge",
  325: "Pirate Mess Hall",
  326: "Dreadnaught Chamber",
}

export const MAPS_PER_WORLD = 50

export const OUTPOST_RANK_NAMES = ['Trade', 'Intel', 'Command', 'Military', 'Purity']
export const PURITY_RANK = 4

export const OUTPOST_UPGRADES = [
  { name: 'Expanded Barracks', short: 'Barracks' },
  { name: 'Advanced Logistics', short: 'Logistics' },
  { name: 'Greater Education', short: 'Education' },
]

// RoyalMaps[10]
export const OUTPOST_MODES = ['Resource Depot', 'Support Camp', 'Savage Stronghold']
export const SUPPORT_CAMP_MODE = 1
export const SAVAGE_STRONGHOLD_MODE = 2

// A connection value of 1000 + map is a Support Camp's link to that map's outpost
export const SUPPORT_LINK_BASE = 1000

// Armory upgrade that unlocks each rank bar (Trader, Surveyor, Command, Military, Purity)
export const RANK_BAR_UNLOCK_ARMORY = [27, 29, 73, 74, 75]
// Armory "Kingdom Expansion 2-8": each one opens the next world's maps
export const KINGDOM_EXPANSION_ARMORY = [2, 3, 4, 5, 6, 7, 8]
export const COMPOUNDING_OUTPOSTING_ARMORY = 79
// Armory "Kingdom Sovereignty": each level recruits the next Movable Unit in RECRUIT_ORDER
export const KINGDOM_SOVEREIGNTY_ARMORY = 68

// Movable Unit recruit order (game tables royalRecruitOrder / royalRecruitClasses).
// Priests are the only units that raise Purity Rank, so a world can't be purified until it has one.
export const RECRUIT_ROLES = ['Commander', 'Knight', 'Priest']
export const PRIEST_ROLE = 2
export const RECRUIT_ORDER = {
  role: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 0, 1, 2, 2],
  world: [1, 2, 1, 2, 1, 2, 3, 1, 2, 3, 1, 2, 3, 3, 4, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 4, 4, 4],
}

// Worlds that have at least one Priest recruited
export function priestWorlds(recruitLevel) {
  const worlds = new Set()
  for (let i = 0; i < Math.min(recruitLevel, RECRUIT_ORDER.role.length); i++) {
    if (RECRUIT_ORDER.role[i] === PRIEST_ROLE) worlds.add(RECRUIT_ORDER.world[i])
  }
  return worlds
}
// Orblet Market upgrade that unlocks Glorifying outposts
export const GLORIFICATION_ORBLET = 4

// Compounding Outposting stat choices (RoyalG[3][2]) and how hard each one scales
export const COMPOUNDING_BONUSES = [
  { name: 'Construction Build Rate', scale: 10 },
  { name: 'Research EXP Gain', scale: 2 },
  { name: 'Spelunking Stamina Regen', scale: 1 },
  { name: 'Minehead Currency Gain', scale: 4 },
]

export function outpostWorld(mapIndex) {
  return 1 + Math.floor(mapIndex / MAPS_PER_WORLD)
}

// EXP needed to reach rank + 1 (game: OutpostEXPformula)
export function outpostRankThreshold(rank, type) {
  if (type === PURITY_RANK) return 1e5 * Math.pow(10, rank)
  if (type === 2) return (50 + 50 * rank) * Math.pow(1.8, rank)
  return (10 + 5 * rank) * Math.pow(1.3, rank)
}

// Current rank, plus how far the bar is toward the next one (0-1)
export function outpostRankInfo(exp, type) {
  let rank = 0
  while (rank < 1000 && exp >= outpostRankThreshold(rank, type)) rank++
  const next = outpostRankThreshold(rank, type)
  const previous = rank === 0 ? 0 : outpostRankThreshold(rank - 1, type)
  const progress = Math.min(1, Math.max(0, (exp - previous) / (next - previous)))
  return { rank, exp, next, progress }
}

// game: OutpostROGbon - grows with the number of outposts built
export function compoundingOutpostingMulti(bonusIndex, outpostCount) {
  const bonus = COMPOUNDING_BONUSES[bonusIndex]
  if (!bonus) return 1
  const compounding = Math.max(1, outpostCount - 6)
  return 1 + (compounding / (40 + compounding)) * bonus.scale
}

// Short number format for rank EXP: 1,234 / 12.3K / 4.5M
export function formatOutpostExp(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e4) return `${(n / 1e3).toFixed(1)}K`
  return Math.floor(n).toLocaleString()
}

// Turns the parsed save (snapshot.royalGuardian) into everything the Outposts section shows
export function buildOutpostSummary(rg) {
  const raw = rg?.outposts ?? []
  const barsUnlocked = rg?.outpostBarsUnlocked ?? [false, false, false, false, false]

  const outposts = raw.map(o => {
    const ranks = OUTPOST_RANK_NAMES.map((name, type) => ({
      name,
      type,
      unlocked: barsUnlocked[type],
      ...outpostRankInfo(o.rankExp[type] ?? 0, type),
    }))
    return {
      mapIndex: o.mapIndex,
      name: OUTPOST_MAPS[o.mapIndex] ?? `Map ${o.mapIndex}`,
      mobKey: OUTPOST_MOBS[o.mapIndex] ?? null,
      world: outpostWorld(o.mapIndex),
      upgrades: o.upgrades,
      ranks,
      mode: o.mode,
      glorified: o.glorified,
      purified: ranks[PURITY_RANK].rank >= 1,
      supportTargets: o.mode === SUPPORT_CAMP_MODE
        ? o.links.filter(v => v >= SUPPORT_LINK_BASE).map(v => v - SUPPORT_LINK_BASE)
        : [],
      supportedBy: [],
    }
  })

  // Point each Support Camp's link back at the outpost it boosts
  const byMap = new Map(outposts.map(o => [o.mapIndex, o]))
  outposts.forEach(camp => {
    camp.supportTargets.forEach(target => byMap.get(target)?.supportedBy.push(camp.mapIndex))
  })

  const worldsUnlocked = rg?.worldsUnlocked ?? 1
  const builtMaps = new Set(outposts.map(o => o.mapIndex))
  const worldNumbers = new Set(outposts.map(o => o.world))
  for (let w = 1; w <= worldsUnlocked; w++) worldNumbers.add(w)

  const worlds = [...worldNumbers].sort((a, b) => a - b).map(world => {
    const list = outposts.filter(o => o.world === world).sort((a, b) => a.mapIndex - b.mapIndex)
    const slots = Object.keys(OUTPOST_MAPS).map(Number).filter(i => outpostWorld(i) === world)
    // Only worlds the Kingdom has expanded into can be cleared
    const toClear = world <= worldsUnlocked ? slots.filter(i => !builtMaps.has(i)).length : 0
    return {
      world,
      outposts: list,
      glorified: list.filter(o => o.glorified).length,
      purified: list.filter(o => o.purified).length,
      toClear,
    }
  })

  // Every Compounding Outposting choice at the current outpost count; only one is active
  const compounding = rg?.compoundingUnlocked
    ? COMPOUNDING_BONUSES.map((bonus, index) => ({
        name: bonus.name,
        multi: compoundingOutpostingMulti(index, outposts.length),
        active: index === rg.compoundingIndex,
      }))
    : null

  return {
    outposts,
    worlds,
    total: outposts.length,
    glorified: outposts.filter(o => o.glorified).length,
    purified: outposts.filter(o => o.purified).length,
    toClear: worlds.reduce((sum, w) => sum + w.toClear, 0),
    glorifyUnlocked: rg?.glorifyUnlocked ?? false,
    purityUnlocked: barsUnlocked[PURITY_RANK],
    // Purity only matters in worlds that have a Priest to raise it
    priestWorlds: priestWorlds(rg?.recruitLevel ?? 0),
    compounding,
    nameOf: mapIndex => OUTPOST_MAPS[mapIndex] ?? `Map ${mapIndex}`,
    mobOf: mapIndex => OUTPOST_MOBS[mapIndex] ?? null,
  }
}
