import { talentMap } from '../data/talentMap'
import { MASTERCLASSES } from '../data/masterClasses'
import { anvilMapById } from '../data/anvilMap'
import { getClassName } from '../data/classes'
import { worshipMap } from '../data'
import { seedInfo } from '../data/farmingMap'
import { RANK_BAR_UNLOCK_ARMORY, KINGDOM_EXPANSION_ARMORY, COMPOUNDING_OUTPOSTING_ARMORY, GLORIFICATION_ORBLET, KINGDOM_SOVEREIGNTY_ARMORY } from '../data/royalOutposts'

// ── Storage ───────────────────────────────────────────────────────────────────
function parseStorage(json) {
  const order    = parseRaw(json.ChestOrder) ?? []
  const quantity = parseRaw(json.ChestQuantity) ?? []

  const items = {}
  order.forEach((key, idx) => {
    if (key === 'Blank' || key === 'LockedInvSpace') return
    const qty = quantity[idx] ?? 0
    if (items[key]) {
      items[key] += qty
    } else {
      items[key] = qty
    }
  })

  return { items }
}

// ── Character List ────────────────────────────────────────────────────────────
// Names and classes straight from the save, so any account (and any number of
// characters) works. Save index i matches every `_${i}` key (Lv0_i, EquipOrder_i, ...).
function parseCharacterList(json) {
  const rawNames = json.playerNames ?? json.charNames ?? []
  let names = parseRaw(rawNames)

  // No name list in this export — count the characters by their class keys instead
  if (!Array.isArray(names) || names.length === 0) {
    let count = 0
    while (json[`CharacterClass_${count}`] !== undefined) count++
    names = Array.from({ length: count }, (_, i) => `Character ${i + 1}`)
  }

  return names.map((name, i) => ({
    name,
    class: getClassName(json[`CharacterClass_${i}`]),
  }))
}

// ── Character Extractors ──────────────────────────────────────────────────────
const weaponKeys = new Set(
  MASTERCLASSES.flatMap(mc =>
    mc.sections
      .filter(s => s.variant === 'weapon')
      .flatMap(s => Array.isArray(s.inventoryKey) ? s.inventoryKey : [s.inventoryKey])
  )
)

const extractors = {
  level: (json, i) => json[`Lv0_${i}`]?.[0] ?? null,
  // Lv0_i = [class LV, then skill LVs by skill index (16 = Farming, 18 = Summoning)]
  skillLevels: (json, i) => parseRaw(json[`Lv0_${i}`]) ?? [],
  // KLA_i[map][0] = kills still needed to clear each map (0 or below = cleared)
  mapKillsLeft: (json, i) => (parseRaw(json[`KLA_${i}`]) ?? []).map(entry => entry?.[0] ?? 0),
  // SL_i = { talentId: base level } on the live talent tab
  talentLevels: (json, i) => parseRaw(json[`SL_${i}`]) ?? {},
  // CauldronBubbles[i] = the character's equipped active bubbles ('c21' style ids, 0 = empty)
  equippedBubbles: (json, i) => ((parseRaw(json['CauldronBubbles']) ?? [])[i] ?? []).filter(id => typeof id === 'string'),
  // PTimeAway_i = when this character was last left; the played character's keeps moving
  awayTime: (json, i) => Number(json[`PTimeAway_${i}`]) || 0,
  // PVtStarSign_i = '69,64,6,' — equipped star sign indexes (see data/starSignMap.js)
  starSigns: (json, i) => String(json[`PVtStarSign_${i}`] ?? '').split(',').filter(Boolean).map(Number),
  equipOrder: (json, i) => json[`EquipOrder_${i}`]?.[0] ?? {},
  inventory: (json, i, weaponKeys) => {
    const order = json[`InventoryOrder_${i}`] ?? []
    const qty   = json[`ItemQTY_${i}`] ?? []
    const meta  = parseRaw(json[`IMm_${i}`]) ?? {}
    const map = {}
    order.forEach((key, idx) => {
      if (key !== 'Blank' && key !== 'LockedInvSpace') {
        if (weaponKeys.has(key)) {
          map[key] = map[key] ?? []
          map[key].push({ qty: qty[idx] ?? 0, stats: meta[idx] ?? {} })
        } else {
          if (map[key]) {
            map[key].qty += qty[idx] ?? 0
          } else {
            map[key] = { qty: qty[idx] ?? 0, stats: meta[idx] ?? {} }
          }
        }
      }
    })
    return map
  },
  carryBags: (json, i) => {
    const raw = json[`MaxCarryCap_${i}`]
    const caps = parseRaw(raw) ?? {}
    return {
      Mining:   caps.Mining   ?? 0,
      Chopping: caps.Chopping ?? 0,
      Foods:    caps.Foods    ?? 0,
      bCraft:   caps.bCraft   ?? 0,
      Fishing:  caps.Fishing  ?? 0,
      Bugs:     caps.Bugs     ?? 0,
      Critters: caps.Critters ?? 0,
      Souls:    caps.Souls    ?? 0,
    }
  },
  superTalentPresets: (json, i) => {
    const spelunk = parseRaw(json.Spelunk)

    const presetConfig = [
      { label: 'Tab 1', presetIndex: 0, slKey: `SL_${i}` },
      { label: 'Tab 2', presetIndex: 1, slKey: `SM_${i}` },
    ]

    return presetConfig.map(({ label, presetIndex, slKey }) => {
      const talentLevels = parseRaw(json[slKey]) ?? {}

      const spelunkIndex = 20 + i + 12 * presetIndex
      const superArray = spelunk?.[spelunkIndex] ?? []

      const superedTalents = superArray
        .filter((id) => id !== -1)
        .map((id) => ({
          id,
          name: talentMap[id] ?? `Unknown Talent (${id})`,
          level: talentLevels[String(id)] ?? 0,
        }))

      return { label, superedTalents }
    })
  },
  prayers: (json, i) => {
    const raw = json[`Prayers_${i}`]
    const arr = parseRaw(raw) ?? []
    return arr.filter(id => id !== -1)
  },
  obols: (json, i) => {
    const order = json[`ObolEqO0_${i}`] ?? []
    const mapRaw = json[`ObolEqMAP_${i}`]
    const stoneMap = parseRaw(mapRaw) ?? {}

    return order.map((rawName, idx) => {
      if (rawName === 'Blank') return { rawName: 'Blank', stoneData: {} }
      const stoneData = stoneMap[String(idx)] ?? {}
      const { SuperFunItemDisplayType: _, ...bonuses } = stoneData
      return {
        rawName,
        stoneData: bonuses,
      }
    })
  },
}

// ────────────────────────────────────────────────────────────
// ── Masterclass
// ────────────────────────────────────────────────────────────

// ── Exalted Stamps ────────────────────────────────────────────────────────────
function parseExaltedStamps(json) {
  try {
    const compass = parseRaw(json['Compass']) ?? []
    return compass[4] ?? []
  } catch {
    console.warn('Failed to parse exalted stamps from Compass.')
    return []
  }
}

// ── Prisma Bubbles ────────────────────────────────────────────────────────────
function parsePrismaBubbles(optLacc) {
  try {
    const raw = optLacc[384] ?? ''
    if (!raw) return []
    return raw.split(',').filter(Boolean).map(id => id.replace(/^0(?=[a-z_])/, ''))
  } catch {
    console.warn('Failed to parse prisma bubbles from OptLacc.')
    return []
  }
}

// ── Map Bonuses (Arcane Cultist) ──────────────────────────────────────────────
function parseMapBonuses(json) {
  const raw = json['MapBon']
  const arr = parseRaw(raw) ?? []
  return arr.map((entry, mapIndex) => {
    if (!Array.isArray(entry) || entry.length < 3) return null
    return {
      mapIndex,
      dr: entry[0] ?? 0,
      exp: entry[1] ?? 0,
      afk: entry[2] ?? 0,
    }
  })
}

// ── Minibosses ───────────────────────────────────────────────────────────────
function parseMiniBosses(json) {
  const rawSneaking = json['Ninja']
  const arr = parseRaw(rawSneaking) ?? []
  const kills = arr?.[105] ?? []
  return kills.slice(0, 10)
}

// Menagerie[1] = W7 Luminous Menagerie mission claims; [30] = "Deathnote Boss PTS".
// No Menagerie key = save from before W7, so the mission doesn't exist yet (null).
const DEATH_NOTE_MISSION_INDEX = 30

function parseMiniBossMission(json) {
  const menagerie = parseRaw(json['Menagerie'])
  if (!Array.isArray(menagerie)) return null
  return {
    claims: Number(menagerie?.[1]?.[DEATH_NOTE_MISSION_INDEX] ?? 0),
  }
}

// Days since each spawned miniboss was last spawned (OptLacc = account options list)
function parseMiniBossDays(optLacc) {
  return {
    mini3a: Number(optLacc[96] ?? 0),
    mini4a: Number(optLacc[98] ?? 0),
    mini5a: Number(optLacc[225] ?? 0),
    mini6a: Number(optLacc[226] ?? 0),
  }
}

// ── Gear Optimizer ─────────────────────────────────────────────────────────
function parseArmorSmithySets(optLacc) {
  try {
    const raw = optLacc[379] ?? ''
    if (!raw) return []
    const [, ...unlockedSets] = raw.toString().split(',')
    return unlockedSets.filter(Boolean)
  } catch {
    console.warn('Failed to parse armor smithy sets from OptLacc.')
    return []
  }
}

// ── Statues ─────────────────────────────────────────────────────────────────
function parseStatues(json) {
  const raw = json['StatueLevels_0']
  const arr = parseRaw(raw) ?? []
  return arr.map(([level, xp], id) => ({ id, level, xp }))
}

// ── Anvil ─────────────────────────────────────────────────────────────────
function parseAnvil(json, charList) {
  const characterCount = charList.length
  const allRows = []
  const charStats = []

  for (let i = 0; i < characterCount; i++) {
    const selectKey = `AnvilPAselect_${i}`
    const raw = json[selectKey]
    const selected = parseRaw(raw) ?? []

    const statsKey = `AnvilPAstats_${i}`
    const rawStats = json[statsKey]
    const paStats = parseRaw(rawStats) ?? []
    const capPoints = paStats[5] ?? 0

    charStats.push({ capPoints, totalHammers: selected.length })

    if (!selected.length) continue

    const hammerCounts = {}
    selected.forEach(itemId => {
      hammerCounts[itemId] = (hammerCounts[itemId] || 0) + 1
    })

    Object.entries(hammerCounts).forEach(([itemIdStr, hammers]) => {
      const itemId = parseInt(itemIdStr)
      const item = anvilMapById[itemId]
      if (!item) return

      allRows.push({
        charIndex: i,
        charName: charList[i].name,
        charClass: charList[i].class,
        itemId,
        item,
        hammers,
      })
    })
  }

  return { rows: allRows, charStats }
}

// ── Obols ─────────────────────────────────────────────────────────────────────
function parseAccountObols(json) {
  const order = json['ObolEqO1'] ?? []
  const mapRaw = json['ObolEqMAPz1']
  const stoneMap = parseRaw(mapRaw) ?? {}

  return order.map((rawName, idx) => {
    if (rawName === 'Blank') return { rawName: 'Blank', stoneData: {} }
    const stoneData = stoneMap[String(idx)] ?? {}
    const { SuperFunItemDisplayType: _, ...bonuses } = stoneData
    return {
      rawName,
      stoneData: bonuses,
    }
  })
}

// ── Construction ──────────────────────────────────────────────────────────────
const CONSTRUCTION_COG_INDICES = [30, 31, 32, 33, 34, 35, 62, 63, 74, 75, 86, 87]
const CONSTRUCTION_BOARD_COLS = 12
const CONSTRUCTION_BOARD_SIZE = 96

const CONSTRUCTION_PATTERN_LABELS = {
  row: 'Boosts entire Row',
  column: 'Boosts entire Column',
}

function parseConstruction(json) {
  const cogMap = parseRaw(json.CogM) ?? {}
  const cogOrder = parseRaw(json.CogO) ?? []

  let totalExpRate = 0

  const cogs = CONSTRUCTION_COG_INDICES.map(index => {
    const cog = cogMap[index] ?? {}
    const bonusConstructExp = cog.d ?? 0
    const playerConstructExp = cog.f ?? 0
    const total = bonusConstructExp + playerConstructExp
    totalExpRate += total

    return {
      index,
      name: cogOrder[index] ?? 'Blank',
      bonusConstructExp,
      playerConstructExp,
      total,
      patternLabel: CONSTRUCTION_PATTERN_LABELS[cog.h] ?? null,
    }
  })

  // Full 8x12 board — CogO/CogM indices 0-95, row-major from the top-left
  const board = Array.from({ length: CONSTRUCTION_BOARD_SIZE }, (_, index) => {
    const cog = cogMap[index] ?? {}
    return {
      index,
      row: Math.floor(index / CONSTRUCTION_BOARD_COLS),
      col: index % CONSTRUCTION_BOARD_COLS,
      name: cogOrder[index] ?? 'Blank',
      pattern: cog.h ?? null,
      bonusConstructExp: cog.d ?? 0,
      playerConstructExp: cog.f ?? 0,
      buildRate: cog.a ?? 0,
      expPerHour: cog.b ?? 0,
    }
  })

  return { cogs, totalExpRate, board }
}

function parseTowerLevels(json) {
  const raw = json['Tower']
  const arr = parseRaw(raw) ?? []
  return arr.slice(0, 27).map(v => Number(v) || 0)
}

// ── Shrines ─────────────────────────────────────────────────────────────────
function parseShrines(json) {
  const raw = json['Shrine']
  const arr = parseRaw(raw) ?? []
  const towerLevels = parseTowerLevels(json)

  return arr.map((entry, i) => {
    const level = entry[3]
    const xp = entry[4] ?? 0
    const xpRequired = level > 0
      ? Math.floor(20 * (level - 1) + 6 * level * Math.pow(1.63, level - 1))
      : 0
    const constructionLevel = towerLevels[18 + i] ?? 0

    return {
      id: i + 18,
      mapIndex: entry[0],
      level,
      xp,
      xpRequired,
      constructionLevel,
    }
  })
}

// ── Shrine buffs ─────────────────────────────────────────────────────────────
// Account unlocks shown in the Shrines buffs panel (legend talent 38 comes from legendTalents).
//   Star talent 639 (Shrine Architect) = level in SL_N on any character
//   Sailing[3][0] = Moai Head artifact grade (0 = not found)
//   Ninja[102][9] = Jade Emporium unlock letters; upgrade 19 (Collective Bargaining) = 's'
//   Lv0_N[12] = Lab skill level. Shrine World Tour is a mainframe node with no unlock flag and the
//   save doesn't store lab connections, so Lab unlocked on any character stands in for it.
function parseShrineBuffs(json, charCount) {
  const architect = Array.from({ length: charCount }, (_, i) => parseRaw(json[`SL_${i}`]) ?? {})
    .some(levels => Number(levels['639']) > 0)
  const labUnlocked = Array.from({ length: charCount }, (_, i) => parseRaw(json[`Lv0_${i}`]) ?? [])
    .some(skills => Number(skills[12]) > 0)
  const sailing = parseRaw(json['Sailing']) ?? []
  const ninja = parseRaw(json['Ninja']) ?? []
  const jadeUnlocks = ninja[102]?.[9]

  return {
    architect,
    labUnlocked,
    moaiHead: Number(sailing[3]?.[0]) > 0,
    bargaining: typeof jadeUnlocks === 'string' ? jadeUnlocks.includes('s') : false,
  }
}

// ── Worship ─────────────────────────────────────────────────────────
function parseWorship(json) {
  const raw = json?.TotemInfo
  const totemInfoRaw = parseRaw(raw) ?? []
  const maxWaves = totemInfoRaw?.[0] ?? []
  const totemEntries = Object.values(worshipMap)

  return {
    totems: maxWaves.map((maxWave, index) => {
      const waveMulti = maxWave === 0 ? 0 : Math.pow((5 + maxWave) / 10, 2.6)
      const expReward = Math.floor(15 * Math.pow(index + 1, 2) * Math.pow(waveMulti, 0.9)) || 0
      const chargeReq = totemEntries[index]?.chargeReq ?? 1
      const expPerCharge = Math.floor(expReward / chargeReq) || 0
      return { maxWave, waveMulti, expReward, expPerCharge }
    }),
  }
}

// ── Cooking ──────────────────────────────────────────────────────────────────
function parseCooking(json) {
  const meals = parseRaw(json.Meals) ?? []
  const ribbon = parseRaw(json.Ribbon) ?? []
  const cookMaster = parseRaw(json.CookMaster) ?? []

  const mealLevels = meals[0] ?? []
  const cabinetSlots = ribbon.slice(0, 28)
  const mealRibbons = ribbon.slice(28)
  // Cooking Mastery yellow nodes, one level per meal index (CookMaster[0])
  const masteryNodes = cookMaster[0] ?? []

  return {
    mealLevels,
    cabinetSlots,
    mealRibbons,
    masteryNodes,
  }
}

// ── Breeding ──────────────────────────────────────────────────────────────────
// Menagerie[2] = W7 Luminous Menagerie unlocks (1 = owned). Unlock 11 = +10 Max Shiny LV in Breeding.
// No Menagerie key = save from before W7, so the unlock can't be owned.
const MENAGERIE_UNLOCKS = 2
const MENAGERIE_SHINY_UNLOCK = 11
// Pets: slots 0-26 = fence yard, 27+ = territory teams (4 per territory, row i = spice i).
// Each pet is [rawName, geneId, power, x]. PetsStored = pet storage, same shape.
// Territory[i] = [barProgress, fills since last claim, ?, 'CookingSpice{i}' or 'Blank' if locked, spices to claim, ...]
const TERRITORY_TEAM_START = 27
const TERRITORY_TEAM_SIZE = 4

function parseBreeding(json) {
  const raw = json['Breeding']
  const arr = parseRaw(raw) ?? []
  const petsRaw = parseRaw(json['Pets']) ?? []
  const menagerie = parseRaw(json['Menagerie']) ?? []

  const shinyPetsLevels = arr.slice(22, 26)

  const fencePets = petsRaw.slice(0, 27).reduce((acc, [name]) => {
    if (name === 'none') return acc
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  const menagerieShinyCap = Number(menagerie?.[MENAGERIE_UNLOCKS]?.[MENAGERIE_SHINY_UNLOCK]) >= 1

  return {
    shinyPetsLevels,
    fencePets,
    menagerieShinyCap,
    ...parseTerritories(json, petsRaw),
  }
}

// Spice foraging: unlocked territories, the team on each, and every pet the account owns
// (Spice Formations uses the owned pets for which gene types are available and their typical power)
function parseTerritories(json, petsRaw) {
  const parse = raw => (parseRaw(raw) ?? [])
  const territoryRaw = parse(json['Territory'])
  const storedRaw = parse(json['PetsStored'])
  const toPet = entry => ({
    rawName: entry[0],
    geneId: Number(entry[1]),
    power: Number(entry[2]) || 0,
  })

  // A locked territory has 'Blank' instead of its spice name. They don't always unlock in order
  // (e.g. 16 can be open while 14 isn't), so keep every row up to the last unlocked one.
  const isUnlocked = (row, i) => row?.[3] === `CookingSpice${i}`
  const lastUnlocked = territoryRaw.reduce((last, row, i) => (isUnlocked(row, i) ? i : last), -1)

  const territories = territoryRaw.slice(0, lastUnlocked + 1).map((row, i) => {
    const start = TERRITORY_TEAM_START + i * TERRITORY_TEAM_SIZE
    return {
      unlocked: isUnlocked(row, i),
      progress: Number(row[0]) || 0,
      fills: Number(row[1]) || 0,
      toClaim: Number(row[4]) || 0,
      team: petsRaw
        .slice(start, start + TERRITORY_TEAM_SIZE)
        .map(entry => (entry?.[0] && entry[0] !== 'none' ? toPet(entry) : null)),
    }
  })

  // Fence yard, territory teams and storage
  const owned = [...petsRaw, ...storedRaw]
    .filter(entry => entry?.[0] && entry[0] !== 'none')
    .map(toPet)

  return { territories, ownedPets: owned }
}

// ── Farming ───────────────────────────────────────────────────────────────────
function parseFarming(json) {
  // ── Raw save keys ──
  const rawTimeAway = parseRaw(json['TimeAway']) ?? {}

  const globalTime = rawTimeAway?.GlobalTime ?? null

  const rawUpgrades = parseRaw(json['FarmUpg']) ?? []

  const rawPlot = parseRaw(json['FarmPlot']) ?? []

  const rawCrop = parseRaw(json['FarmCrop']) ?? {}

  const rawRanks = parseRaw(json['FarmRank']) ?? []

  // ── Market upgrade levels ──
  // Index 1 = beans, index 19 = instaGrow (matches toolbox)
  // Indices 2–17 = 16 market upgrades (day market 0–7, night market 8–15)
  // Indices 20+ = exotic market upgrade levels: rawUpgrades[20 + exoticIndex]
  const beans     = rawUpgrades[1] ?? 0
  const instaGrow = rawUpgrades[19] ?? 0

  const marketLevels = rawUpgrades.slice(2, 18)   // 16 entries
  const exoticLevels = rawUpgrades.slice(20, 80)  // 60 entries, exoticLevels[i] = rawUpgrades[20 + i]
  // Spelunk[50] = exotics with an organic label (2x bonus)
  const organicExotics = ((parseRaw(json['Spelunk']) ?? [])[50] ?? []).map(Number)

  // ── Plots ──
  // Each entry: [seedType, progress, cropType, isLocked, cropQuantity, currentOG, cropProgress]
  const plots = rawPlot.map((entry, index) => {
    const [seedType, progress, cropType, isLocked, cropQuantity, currentOG, cropProgress] = entry

    const seed = seedInfo.find(s => seedType >= 0 && s.seedId === seedType) ?? null
    const cropId = seed ? Math.round(seed.cropIdMin + cropType) : null
    const growthReq = seedType === 6
      ? 25200
      : 14400 * Math.pow(1.5, seedType)

    return {
      index,
      seedType,
      seed,
      cropType,
      cropId,
      progress,
      cropQuantity,
      currentOG,
      cropProgress,
      isLocked: Boolean(isLocked),
      growthReq,
    }
  })

  // ── Crop depot ──
  const cropDepot = Object.entries(rawCrop).reduce((acc, [idStr, qty]) => {
    const id = parseFloat(idStr)
    const seed = seedInfo.find(s => id >= s.cropIdMin && id <= s.cropIdMax) ?? null
    acc[idStr] = {
      cropId: id,
      qty: parseFloat(qty),
      seed,
      rawName: `FarmCrop${Math.round(id)}.png`,
    }
    return acc
  }, {})

  const cropQtys = Object.values(cropDepot).map(e => e.qty ?? 0)
  const gmoCropCounts = {
  200:    cropQtys.filter(q => q >= 200).length,
  1000:   cropQtys.filter(q => q >= 1000).length,
  2500:   cropQtys.filter(q => q >= 2500).length,
  10000:  cropQtys.filter(q => q >= 10000).length,
  100000: cropQtys.filter(q => q >= 100000).length,
  }
  const plotCount = Array.isArray(rawPlot) ? rawPlot.length : 0

  // ── Land ranks ──
  // rawRanks is [farmingRanks[], ranksProgress[], upgradesLevels[]]
  const farmingRanks   = Array.isArray(rawRanks[0]) ? rawRanks[0] : []
  const ranksProgress  = Array.isArray(rawRanks[1]) ? rawRanks[1] : []
  const upgradesLevels = Array.isArray(rawRanks[2]) ? rawRanks[2] : []

  const plotRanks = farmingRanks.map((rank, i) => ({
    plotIndex: i,
    rank,
    progress:     ranksProgress[i]  ?? 0,
    upgradeLevel: upgradesLevels[i] ?? 0,
  }))

  const totalRankPoints = farmingRanks.reduce((s, r) => s + r, 0)
  const usedRankPoints  = upgradesLevels.reduce((s, l) => s + l, 0)

  return {
    globalTime,
    marketLevels,
    exoticLevels,
    organicExotics,
    beans,
    instaGrow,
    plots,
    cropDepot,
    cropsFound: Object.keys(rawCrop).length,
    plotRanks,
    farmingRanks,
    upgradesLevels,
    totalRankPoints,
    usedRankPoints,
    gmoCropCounts,
    plotCount,
  }
}

// ── Cards ─────────────────────────────────────────────────────────────────────────
// Cards0 = card counts by monster rawName (star math lives in utils/cardUtils.js)
// Max stars: 4, +1 at Rift 45, +1 once Spelunking lore boss 3 is beaten (Spelunk[0][2])
// OptLacc[155] / [603] = cards raised to at least 5 / 6 stars (0-indexed, same as borders)
function parseCards(json, optLacc) {
  const counts = parseRaw(json['Cards0']) ?? {}
  const rift = parseRaw(json['Rift']) ?? []
  const spelunk = parseRaw(json['Spelunk']) ?? []
  const toList = raw => (raw ? String(raw).split(',') : [])
  const riftStar = (rift[0] ?? 0) >= 45 ? 1 : 0
  const spelunkStar = (spelunk[0]?.[2] ?? 0) > 0 ? 1 : 0
  return {
    counts,
    maxStars: 4 + riftStar + spelunkStar,
    starFloor5: toList(optLacc[155]),
    starFloor6: toList(optLacc[603]),
  }
}

// ── Lab Chips ─────────────────────────────────────────────────────────────────────
// Lab[1 + i] = chip slots for character i (chip index, -1 = empty)
// Lab[15] = total owned per chip index (equipped + in storage)
// → { characters: [['ConsoleChip20', ...], ...], owned: ['ConsoleChip20', ...] }
function parseLabChips(json, charCount) {
  const lab = parseRaw(json['Lab']) ?? []
  const characters = Array.from({ length: charCount }, (_, i) => (lab[i + 1] ?? [])
    .filter(chip => chip >= 0)
    .map(chip => `ConsoleChip${chip}`))
  const inStorage = (lab[15] ?? [])
    .map((count, chip) => (count > 0 ? `ConsoleChip${chip}` : null))
    .filter(Boolean)
  return {
    characters,
    owned: [...new Set([...inStorage, ...characters.flat()])],
  }
}

// ── Legend Talents ────────────────────────────────────────────────────────────────
function parseLegendTalents(json) {
  const spelunk = parseRaw(json['Spelunk']) ?? []
  const levels = spelunk[18] ?? []
  return levels
}

// ── Royal Guardian ────────────────────────────────────────────────────────────
// RoyalG[0] = Royal Statue levels, RoyalG[2] = armory upgrade levels
//   (45 = Royal Reverence, 78 = Statue Flair unlocked), RoyalG[22] = Statue Flair level per statue
// Menagerie[2][17] = unlock that raises the Statue Flair max level from 3 to 4
function parseRoyalGuardian(json) {
  const raw = parseRaw(json['RoyalG']) ?? []
  const menagerie = parseRaw(json['Menagerie']) ?? []
  return {
    statueLevels: raw[0] ?? [],
    royalReverenceLevel: raw[2]?.[45] ?? 0,
    flairUnlocked: (raw[2]?.[78] ?? 0) >= 1,
    flairLevels: raw[22] ?? [],
    flairMaxLevel: 3 + ((menagerie[2]?.[17] ?? 0) >= 1 ? 1 : 0),
    ...parseOutposts(json, raw),
  }
}

// Royal Guardian outposts: RoyalMaps[mapIndex] with 3+ entries is a built outpost.
// Unlock flags come from the Armory (RoyalG[2]) and the Orblet Market (RoyalG[23]).
function parseOutposts(json, raw) {
  const maps = parseRaw(json['RoyalMaps']) ?? []
  const armory = raw[2] ?? []
  const level = id => Number(armory[id] ?? 0)

  const outposts = []
  ;(Array.isArray(maps) ? maps : []).forEach((m, mapIndex) => {
    if (!Array.isArray(m) || m.length < 3) return
    outposts.push({
      mapIndex,
      upgrades: [0, 1, 2].map(i => Number(m[i] ?? 0)),
      rankExp: [3, 4, 5, 6, 7].map(i => Number(m[i] ?? 0)),
      links: [Number(m[8] ?? -1), Number(m[9] ?? -1)],
      mode: Number(m[10] ?? 0),
      // One digit per unit slot: 1 = empty, otherwise 2 + unit type (Worker, Trader, Guard, Surveyor)
      units: String(m[11] ?? ''),
      glorified: Number(m[12] ?? 0) >= 1,
    })
  })

  // Movable units, per world: RoyalG[6 + 2w] = each unit's job, RoyalG[7 + 2w] = the map it's posted at
  const deployments = []
  for (let w = 0; w < 8; w++) {
    const jobs = raw[6 + 2 * w]
    const targets = raw[7 + 2 * w]
    if (!Array.isArray(jobs)) continue
    jobs.forEach((job, slot) => {
      deployments.push({ world: w + 1, job: Number(job), mapIndex: Number(targets?.[slot] ?? -1) })
    })
  }

  // Jelly Operator (World 7): obstructions defeated unlock its bonuses, some of which add outpost PTS
  const research = parseRaw(json['Research']) ?? []

  return {
    outposts,
    outpostBarsUnlocked: RANK_BAR_UNLOCK_ARMORY.map(id => level(id) >= 1),
    worldsUnlocked: 1 + KINGDOM_EXPANSION_ARMORY.reduce((sum, id) => sum + Math.min(1, level(id)), 0),
    compoundingUnlocked: level(COMPOUNDING_OUTPOSTING_ARMORY) >= 1,
    compoundingIndex: Math.round(Number(raw[3]?.[2] ?? 0)),
    recruitLevel: level(KINGDOM_SOVEREIGNTY_ARMORY),
    glorifyUnlocked: Number(raw[23]?.[GLORIFICATION_ORBLET] ?? 0) >= 1,
    // Inputs for the outpost optimizer (utils/outpostOptimizer.js)
    armory: armory.map(Number),
    orbletLevels: (raw[23] ?? []).map(Number),
    deployments,
    jellyObstructions: Number(research?.[7]?.[9] ?? 0),
    // Resources: amount banked per resource (RGres#), and per node its level and what's been pulled out (-1 = drained)
    resourceStorage: (raw[1] ?? []).map(Number),
    nodeLevels: (raw[5] ?? []).map(Number),
    nodeCollected: (raw[4] ?? []).map(Number),
  }
}

// ── Main Export ───────────────────────────────────────────────────────────────
// Accepts a flat save, or a wrapped export like IdleOn Toolbox's { data: {...}, charNames: [...] }
// Parses a save value that may be stored as a JSON string
function parseRaw(raw) {
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

// ── Alchemy ───────────────────────────────────────────────────────────────────
// CauldronInfo[0-3] = bubble levels per cauldron (power, quicc, high-iq, kazam) as
// { index: level }; CauldronInfo[4] = vial levels by vial index.
// bubbleLevels is keyed by bubbleIndex ('_29', 'a3', 'b12', 'c25') like bubbleMap.
const CAULDRON_PREFIXES = ['_', 'a', 'b', 'c']

function parseAlchemy(json) {
  const info = parseRaw(json['CauldronInfo']) ?? []
  const bubbleLevels = {}
  CAULDRON_PREFIXES.forEach((prefix, cauldron) => {
    Object.entries(info[cauldron] ?? {}).forEach(([index, level]) => {
      if (index !== 'length') bubbleLevels[`${prefix}${index}`] = Number(level) || 0
    })
  })
  const vialLevels = {}
  Object.entries(info[4] ?? {}).forEach(([index, level]) => {
    if (index !== 'length') vialLevels[index] = Number(level) || 0
  })
  return {
    bubbleLevels,
    vialLevels,
    etherealSigils: countEtherealSigils(json),
  }
}

// CauldronP2W[4] = [progress, tier] per sigil; tier 3 = ethereal, 4 = eclectic (also ethereal)
function countEtherealSigils(json) {
  const sigils = (parseRaw(json['CauldronP2W']) ?? [])[4] ?? []
  let count = 0
  for (let i = 1; i < sigils.length; i += 2) {
    if (sigils[i] === 3 || sigils[i] === 4) count++
  }
  return count
}

// ── Looty ─────────────────────────────────────────────────────────────────────
// Cards1 = every item the account has ever dropped; only trophies are kept
function parseDroppedTrophies(json) {
  return (parseRaw(json['Cards1']) ?? []).filter(item => String(item).startsWith('Trophy'))
}

// ── Grimoire (Death Bringer) ──────────────────────────────────────────────────
// Grimoire[i] = level of grimoire upgrade i (see data/grimoireMap.js)
function parseGrimoire(json) {
  return { levels: parseRaw(json['Grimoire']) ?? [] }
}

// ── Upgrade Vault ─────────────────────────────────────────────────────────────
// UpgVault[i] = level of vault upgrade i (see data/upgradeVaultMap.js)
function parseUpgradeVault(json) {
  return { levels: parseRaw(json['UpgVault']) ?? [] }
}

// ── Achievements ──────────────────────────────────────────────────────────────
// AchieveReg[i] === -1 means achievement i is complete
function parseAchievements(json) {
  return (parseRaw(json['AchieveReg']) ?? []).map(value => value === -1)
}

// ── Rift ──────────────────────────────────────────────────────────────────────
// Rift[0] = current rift level. Rift bonuses unlock every 5 levels (see utils/riftUtils.js).
function parseRift(json) {
  const rift = parseRaw(json['Rift']) ?? []
  return { level: parseInt(rift[0]) || 0 }
}

// ── Killroy ───────────────────────────────────────────────────────────────────
// Permanent shop bonus levels, by the game's KillroyBonuses index 0-7:
// OptLacc 228, 229, 230 then 467-471 (1 = Crop Evolution Chance)
const KILLROY_SHOP_OPTIONS = [228, 229, 230, 467, 468, 469, 470, 471]

function parseKillroy(optLacc) {
  return { shopLevels: KILLROY_SHOP_OPTIONS.map(option => Number(optLacc[option]) || 0) }
}

// ── Sushi Station (W7) ────────────────────────────────────────────────────────
// Sushi[5][i] >= 0 once sushi type i has been discovered. uniqueSushi counts the
// unbroken run of discovered types from the first one, like the game.
function parseSushi(json) {
  const tracking = parseRaw(json['Sushi'])?.[5] ?? []
  let uniqueSushi = 0
  while ((tracking[uniqueSushi] ?? -1) >= 0) uniqueSushi++
  return { uniqueSushi }
}

// ── Stamps ────────────────────────────────────────────────────────────────────
// StampLv[tree] = { index: level } for tree 0 combat, 1 skills, 2 misc
// (stampMap compassIndex prefixes '_', 'a', 'b'). Exalted stamps: see parseExaltedStamps.
function parseStamps(json) {
  const raw = parseRaw(json['StampLv']) ?? []
  const levels = [0, 1, 2].map(tree => {
    const entries = Object.entries(raw[tree] ?? {}).filter(([index]) => index !== 'length')
    return Object.fromEntries(entries.map(([index, level]) => [index, Number(level) || 0]))
  })
  return { levels }
}

// ── Sneaking (W6) ─────────────────────────────────────────────────────────────
// Ninja[107][i] = 1 once Pristine Charm i is unlocked (see data/sneakingMap.js)
// OptLacc[232] = ninja mastery tier
function parseSneaking(json, optLacc) {
  const ninja = parseRaw(json['Ninja']) ?? []
  return {
    pristineCharms: (ninja[107] ?? []).map(unlocked => unlocked === 1),
    ninjaMasteryTier: Number(optLacc[232]) || 0,
  }
}

// ── Companions ────────────────────────────────────────────────────────────────
// The export's top-level `companion.l` lists owned copies as 'index,tradable,?,?,level'.
// Pet Bonus Tokens (OptLacc[606] = comma list of indices) grant a companion's bonus without
// owning it, up to the tokens owned (OptLacc[605] + [615], max 2); the game wipes an
// over-long list. owned[index] = highest Pet Mart+ level owned (0 = base), -1 = token only.
function parseCompanions(rawJson, optLacc) {
  const owned = {}
  for (const entry of rawJson?.companion?.l ?? []) {
    const [index, , , , level] = String(entry).split(',')
    owned[index] = Math.max(owned[index] ?? 0, Number(level) || 0)
  }
  const tokensOwned = Math.min(1, Number(optLacc[605]) || 0) + Math.min(1, Number(optLacc[615]) || 0)
  const rawTokens = optLacc[606]
  const tokens = rawTokens === '' || rawTokens == null ? [] : String(rawTokens).split(',')
  if (tokens.length <= tokensOwned + 0.5) {
    tokens.forEach(index => {
      if (owned[index] === undefined && index !== '') owned[index] = -1
    })
  }
  return { owned }
}

// ── Jelly Operator (W7) ───────────────────────────────────────────────────────
// Research[7][9] = obstructions defeated (see data/jellyMap.js)
function parseJellyOperator(json) {
  const research = parseRaw(json['Research']) ?? []
  return { obstructionsDefeated: Number(research[7]?.[9]) || 0 }
}

// ── Tesseract (Arcane Cultist) ────────────────────────────────────────────────
// Arcane[i] = level of tesseract upgrade i (see data/tesseractMap.js)
function parseTesseract(json) {
  return { levels: parseRaw(json['Arcane']) ?? [] }
}

// ── Arcade (W2) ───────────────────────────────────────────────────────────────
// ArcadeUpg[i] = level of gold ball shop upgrade i (see data/arcadeMap.js)
function parseArcade(json) {
  return { levels: parseRaw(json['ArcadeUpg']) ?? [] }
}

// ── Gem Shop ──────────────────────────────────────────────────────────────────
// GemItemsPurchased[i] = times gem shop item i was bought
function parseGemShop(json) {
  return { purchases: parseRaw(json['GemItemsPurchased']) ?? [] }
}

// ── Merits (Tasks) ────────────────────────────────────────────────────────────
// TaskZZ2[world][i] = level of merit i in that world's merit shop (see data/meritMap.js)
function parseMerits(json) {
  return { levels: parseRaw(json['TaskZZ2']) ?? [] }
}

// ── Bundles ───────────────────────────────────────────────────────────────────
// BundlesReceived = { bundleName: count }; owned = names received at least once
function parseBundles(json) {
  const raw = parseRaw(json['BundlesReceived']) ?? {}
  return { owned: Object.keys(raw).filter(name => Number(raw[name]) > 0) }
}

// ── Sailing (W5) ──────────────────────────────────────────────────────────────
// Sailing[3][i] = artifact i's form (0 not found, 1 found, 2 ancient ... 7 verisimilitude)
function parseSailing(json) {
  const sailing = parseRaw(json['Sailing']) ?? []
  return { artifactForms: (sailing[3] ?? []).map(form => Number(form) || 0) }
}

// ── Emperor Showdown (W6) ─────────────────────────────────────────────────────
// OptLacc[369] = highest Emperor showdown beaten (see data/emperorMap.js)
function parseEmperor(optLacc) {
  return { highestShowdown: Number(optLacc[369]) || 0 }
}

// ── Summoning (W6) ────────────────────────────────────────────────────────────
// Summon[1] = enemy ids of every battle won; OptLacc[319] = highest endless battle reached
function parseSummoning(json, optLacc) {
  const summon = parseRaw(json['Summon']) ?? []
  return {
    wonBattles: summon[1] ?? [],
    highestEndless: Number(optLacc[319]) || 0,
  }
}

// ── Caverns (W5 Hole) ─────────────────────────────────────────────────────────
// Holes[4] / [6] = hole / IdleOn majik (cosmo) levels, [11][29..30] = the gods picked for
// Pocket Divinity, [15] = Bravery Monument bonus levels, [21] = Lamp wishes used,
// [31]/[32] = fountain upgrade levels / marbleize tiers per water type.
function parseCaverns(json) {
  const holes = parseRaw(json['Holes']) ?? []
  return {
    holeMajiks: holes[4] ?? [],
    idleonMajiks: holes[6] ?? [],
    pocketGods: [holes[11]?.[29] ?? -1, holes[11]?.[30] ?? -1].map(Number),
    braveryBonuses: holes[15] ?? [],
    wishesUsed: holes[21] ?? [],
    fountainLevels: holes[31] ?? [],
    fountainMarbles: holes[32] ?? [],
  }
}

// ── Zenith Market (W7 Spelunking) ─────────────────────────────────────────────
// Spelunk[45][i] = level of zenith market upgrade i (see data/zenithMap.js)
function parseZenith(json) {
  const spelunk = parseRaw(json['Spelunk']) ?? []
  return { marketLevels: spelunk[45] ?? [] }
}

// ── Star Signs ────────────────────────────────────────────────────────────────
// StarSg = { starName: 1 } for every unlocked star sign
function parseStarSigns(json) {
  const raw = parseRaw(json['StarSg']) ?? {}
  return { unlocked: Object.keys(raw).filter(name => Number(raw[name]) > 0) }
}

// ── Equinox (W3) ──────────────────────────────────────────────────────────────
// WeeklyBoss['d_' + i] = -1 once equinox cloud (challenge) i is complete.
// Dream[2 + i] = level of equinox upgrade i (see EQUINOX_UPGRADES in utils/equinoxUtils.js).
const DREAM_UPGRADES_OFFSET = 2

function parseEquinox(json) {
  const weeklyBoss = parseRaw(json['WeeklyBoss']) ?? {}
  const completedClouds = Object.keys(weeklyBoss)
    .filter(key => key.startsWith('d_') && weeklyBoss[key] === -1)
    .map(key => Number(key.slice(2)))
  const dream = parseRaw(json['Dream']) ?? []
  return {
    completedClouds,
    upgradeLevels: dream.slice(DREAM_UPGRADES_OFFSET).map(level => Number(level) || 0),
  }
}

// ── Research (W7) ─────────────────────────────────────────────────────────────
// Research[0] = grid square levels, [1] = observation placed on each square (-1 none),
// [9] = stickers owned per type, [11] = King Rat Crowns reclaimed (one entry each)
function parseResearch(json) {
  const research = parseRaw(json['Research']) ?? []
  return {
    gridLevels: research[0] ?? [],
    gridObservations: research[1] ?? [],
    stickerLevels: (research[9] ?? []).map(level => Number(level) || 0),
    kingRatCrowns: (research[11] ?? []).length,
  }
}

// ── Gaming (W5) ───────────────────────────────────────────────────────────────
// Gaming[12] = unlocked superbits as a string of save letters (see utils/saveCodeUtils.js).
// Palette colours live in Spelunk: [9] = level per colour, [49] = Menagerie black stars (0-2).
function parseGaming(json) {
  const gaming = parseRaw(json['Gaming']) ?? []
  const spelunk = parseRaw(json['Spelunk']) ?? []
  return {
    superbits: String(gaming[12] ?? ''),
    paletteLevels: (spelunk[9] ?? []).map(level => Number(level) || 0),
    paletteBlackStars: (spelunk[49] ?? []).map(stars => Number(stars) || 0),
  }
}

// ── Spelunking (W7) ───────────────────────────────────────────────────────────
// Spelunk[0][i] > 0 once lore boss i is defeated, [1] best depth per tunnel, [2] biggest haul per tunnel,
// [4] = [amber, overstim LV, overstim progress, exalted frags, prisma frags, .., .., .., trackometer LV, .., manic mode],
// [5] shop upgrade levels (-1 past the last upgrade), [6] discovery names, [44] grand discoveries per tunnel,
// [47] best manic depth per tunnel. OptLacc[410] = lore pages read today. Math → utils/spelunkingUtils.js
function parseSpelunking(json, optLacc) {
  const spelunk = parseRaw(json['Spelunk']) ?? []
  const numbers = list => (list ?? []).map(value => Number(value) || 0)
  const status = spelunk[4] ?? []
  return {
    loreBossesDefeated: (spelunk[0] ?? []).map(value => Number(value) > 0),
    bestDepths: numbers(spelunk[1]),
    biggestHauls: numbers(spelunk[2]),
    amber: Number(status[0]) || 0,
    overstimLevel: Number(status[1]) || 0,
    overstimProgress: Number(status[2]) || 0,
    exaltedFragments: Number(status[3]) || 0,
    prismaFragments: Number(status[4]) || 0,
    trackometerLevel: Number(status[8]) || 0,
    manicMode: Number(status[10]) >= 1,
    upgradeLevels: numbers(spelunk[5]),
    discoveries: spelunk[6] ?? [],
    grandDiscoveries: numbers(spelunk[44]),
    bestManicDepths: numbers(spelunk[47]),
    pageReadsToday: Number(optLacc[410]) || 0,
  }
}

// ── Account Options ───────────────────────────────────────────────────────────
// OptLacc[311] = event shop purchases as save letters; OptLacc[594] = Button presses (W7)
function parseEventShop(optLacc) {
  return { purchases: String(optLacc[311] ?? '') }
}

function parseButton(optLacc) {
  return { presses: Number(optLacc[594]) || 0 }
}

// ── Lab Jewels (W4) ───────────────────────────────────────────────────────────
// Lab[14][i] = 1 once jewel i is owned. Whether it's connected in the mainframe isn't worked out.
function parseLabJewels(json) {
  const lab = parseRaw(json['Lab']) ?? []
  return { owned: (lab[14] ?? []).map(owned => owned === 1) }
}

// ── Divinity (W5) ─────────────────────────────────────────────────────────────
// Divinity[12 + i] = god slot character i is linked to (-1 none), [25] = gods unlocked.
// Slots index data/divinityMap.js.
function parseDivinity(json, charCount) {
  const divinity = parseRaw(json['Divinity']) ?? []
  return {
    linkedGods: Array.from({ length: charCount }, (_, i) => Number(divinity[12 + i] ?? -1)),
    unlockedGods: Number(divinity[25]) || 0,
  }
}

// ── Coral Reef (W7) ───────────────────────────────────────────────────────────
// Coral Kid upgrade levels: OptLacc[427..432] (page 1) then OptLacc[616..] (page 2)
const CORAL_KID_PAGES = [427, 616]
const CORAL_KID_PAGE_SIZE = 6

function parseCoralReef(optLacc) {
  return {
    kidUpgradeLevels: CORAL_KID_PAGES.flatMap(start => (
      Array.from({ length: CORAL_KID_PAGE_SIZE }, (_, i) => Number(optLacc[start + i]) || 0)
    )),
  }
}

// ── Vote Ballot ───────────────────────────────────────────────────────────────
// serverVars (outside data) holds this week's vote: voteCategories[0] = the winning
// ballot bonus, voteCat2[0] = the winning Meritocracy bonus.
function parseVoteBallot(rawJson) {
  const serverVars = rawJson?.serverVars ?? {}
  return {
    selectedBonus: serverVars.voteCategories?.[0] ?? null,
    selectedMeritocracy: serverVars.voteCat2?.[0] ?? null,
  }
}

function unwrapSave(json) {
  const isWrapped = json?.data
    && typeof json.data === 'object'
    && !Array.isArray(json.data)
    && json.playerNames === undefined
    && json.CharacterClass_0 === undefined
  if (!isWrapped) return json
  return {
    ...json.data,
    playerNames: json.data.playerNames ?? json.charNames,
  }
}

export function extractSnapshot(rawJson) {
  const json = unwrapSave(rawJson)
  const charList = parseCharacterList(json)
  if (charList.length === 0) {
    const keys = Object.keys(rawJson ?? {}).slice(0, 8).join(', ')
    throw new Error(`No characters found in this save. Top-level keys: ${keys}`)
  }
  const extractedCharacters = charList.map(({ name, class: charClass }, i) => {
    const extracted = {}
    for (const [field, fn] of Object.entries(extractors)) {
      extracted[field] = fn(json, i, weaponKeys)
    }
    extracted.name  = name
    extracted.class = charClass
    return extracted
  })

  const optLacc = parseRaw(json['OptLacc']) ?? []

  return {
    importedAt: new Date().toISOString(),
    characters: extractedCharacters,
    storage: parseStorage(json),
    statues: parseStatues(json),
    anvil: parseAnvil(json, charList),
    accountObols: parseAccountObols(json),
    shrines: parseShrines(json),
    shrineBuffs: parseShrineBuffs(json, charList.length),
    worship: parseWorship(json),
    towerLevels: parseTowerLevels(json),
    armorSmithySets: parseArmorSmithySets(optLacc),
    miniBossesKills: parseMiniBosses(json),
    miniBossDays: parseMiniBossDays(optLacc),
    miniBossMission: parseMiniBossMission(json),
    exaltedStamps: parseExaltedStamps(json),
    prismaBubbles: parsePrismaBubbles(optLacc),
    mapBonuses: parseMapBonuses(json),
    construction: parseConstruction(json),
    cooking: parseCooking(json),
    breeding: parseBreeding(json),
    farming: parseFarming(json),
    legendTalents: parseLegendTalents(json),
    cards: parseCards(json, optLacc),
    labChips: parseLabChips(json, charList.length),
    royalGuardian: parseRoyalGuardian(json),
    alchemy: parseAlchemy(json),
    droppedTrophies: parseDroppedTrophies(json),
    grimoire: parseGrimoire(json),
    upgradeVault: parseUpgradeVault(json),
    achievements: parseAchievements(json),
    rift: parseRift(json),
    killroy: parseKillroy(optLacc),
    sushi: parseSushi(json),
    voteBallot: parseVoteBallot(rawJson),
    stamps: parseStamps(json),
    sneaking: parseSneaking(json, optLacc),
    companions: parseCompanions(rawJson, optLacc),
    jellyOperator: parseJellyOperator(json),
    tesseract: parseTesseract(json),
    arcade: parseArcade(json),
    gemShop: parseGemShop(json),
    merits: parseMerits(json),
    bundles: parseBundles(json),
    sailing: parseSailing(json),
    emperor: parseEmperor(optLacc),
    summoning: parseSummoning(json, optLacc),
    caverns: parseCaverns(json),
    zenith: parseZenith(json),
    starSigns: parseStarSigns(json),
    equinox: parseEquinox(json),
    research: parseResearch(json),
    gaming: parseGaming(json),
    spelunking: parseSpelunking(json, optLacc),
    eventShop: parseEventShop(optLacc),
    button: parseButton(optLacc),
    labJewels: parseLabJewels(json),
    divinity: parseDivinity(json, charList.length),
    coralReef: parseCoralReef(optLacc),
  }
}