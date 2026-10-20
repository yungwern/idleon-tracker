import { talentMap } from '../data/talentMap'
import { MASTERCLASSES } from '../data/masterClasses'
import { anvilMapById } from '../data/anvilMap'
import { getClassName } from '../data/classes'
import { worshipMap } from '../data'
import { seedInfo } from '../data/farmingMap'
import { RANK_BAR_UNLOCK_ARMORY, KINGDOM_EXPANSION_ARMORY, COMPOUNDING_OUTPOSTING_ARMORY, GLORIFICATION_ORBLET, KINGDOM_SOVEREIGNTY_ARMORY } from '../data/royalOutposts'

// ── Storage ───────────────────────────────────────────────────────────────────
function parseStorage(json) {
  const order    = typeof json.ChestOrder    === 'string' ? JSON.parse(json.ChestOrder)    : (json.ChestOrder    ?? [])
  const quantity = typeof json.ChestQuantity === 'string' ? JSON.parse(json.ChestQuantity) : (json.ChestQuantity ?? [])

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
  let names = typeof rawNames === 'string' ? JSON.parse(rawNames) : rawNames

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
  equipOrder: (json, i) => json[`EquipOrder_${i}`]?.[0] ?? {},
  inventory: (json, i, weaponKeys) => {
    const order = json[`InventoryOrder_${i}`] ?? []
    const qty   = json[`ItemQTY_${i}`] ?? []
    const meta  = JSON.parse(json[`IMm_${i}`] ?? '{}')
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
    const caps = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? {})
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
    const spelunk = typeof json.Spelunk === 'string'
      ? JSON.parse(json.Spelunk)
      : json.Spelunk

    const presetConfig = [
      { label: 'Tab 1', presetIndex: 0, slKey: `SL_${i}` },
      { label: 'Tab 2', presetIndex: 1, slKey: `SM_${i}` },
    ]

    return presetConfig.map(({ label, presetIndex, slKey }) => {
      const talentLevels = typeof json[slKey] === 'string'
        ? JSON.parse(json[slKey])
        : (json[slKey] ?? {})

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
    const arr = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
    return arr.filter(id => id !== -1)
  },
  obols: (json, i) => {
    const order = json[`ObolEqO0_${i}`] ?? []
    const mapRaw = json[`ObolEqMAP_${i}`]
    const stoneMap = typeof mapRaw === 'string' ? JSON.parse(mapRaw) : (mapRaw ?? {})

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
    const compass = typeof json['Compass'] === 'string'
      ? JSON.parse(json['Compass'])
      : (json['Compass'] ?? [])
    return compass[4] ?? []
  } catch {
    console.warn('Failed to parse exalted stamps from Compass.')
    return []
  }
}

// ── Prisma Bubbles ────────────────────────────────────────────────────────────
function parsePrismaBubbles(json) {
  try {
    const optLacc = json['OptLacc'] ?? []
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
  const arr = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
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

// ── Map Bonus Cap (Arcane Cultist) ────────────────────────────────────────────
// Cap = 100 * (Overwhelming Energy bonus - 1) + min(10, Beyond All Limits)
// Overwhelming Energy = talent 589, highest base level across characters (SL_i, live talents).
//   Added talent levels are NOT included, so the cap can read slightly low.
// Beyond All Limits = Tesseract upgrade 58 (Arcane[58]), +1 per level.
function parseMapBonusCap(json, charCount) {
  let overwhelmingEnergy = 0
  for (let i = 0; i < charCount; i++) {
    const raw = json[`SL_${i}`]
    const levels = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? {})
    overwhelmingEnergy = Math.max(overwhelmingEnergy, Number(levels['589'] ?? 0))
  }
  const rawArcane = json['Arcane']
  const arcane = typeof rawArcane === 'string' ? JSON.parse(rawArcane) : (rawArcane ?? [])
  return {
    overwhelmingEnergy,
    beyondAllLimits: Number(arcane[58] ?? 0),
  }
}

// ── Minibosses ───────────────────────────────────────────────────────────────
function parseMiniBosses(json) {
  const rawSneaking = json['Ninja']
  const arr = typeof rawSneaking === 'string' ? JSON.parse(rawSneaking) : (rawSneaking ?? [])
  const kills = arr?.[105] ?? []
  return kills.slice(0, 10)
}

// Days since each spawned miniboss was last spawned (OptLacc = account options list)
function parseMiniBossDays(json) {
  const raw = json['OptLacc']
  const opts = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
  return {
    mini3a: Number(opts[96] ?? 0),
    mini4a: Number(opts[98] ?? 0),
    mini5a: Number(opts[225] ?? 0),
    mini6a: Number(opts[226] ?? 0),
  }
}

// ── Gear Optimizer ─────────────────────────────────────────────────────────
function parseArmorSmithySets(json) {
  try {
    const optLacc = json['OptLacc'] ?? []
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
  const arr = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
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
    const selected = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])

    const statsKey = `AnvilPAstats_${i}`
    const rawStats = json[statsKey]
    const paStats = typeof rawStats === 'string' ? JSON.parse(rawStats) : (rawStats ?? [])
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
  const stoneMap = typeof mapRaw === 'string' ? JSON.parse(mapRaw) : (mapRaw ?? {})

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

const CONSTRUCTION_PATTERN_LABELS = {
  row: 'Boosts entire Row',
  column: 'Boosts entire Column',
}

function parseConstruction(json) {
  const cogMap = typeof json.CogM === 'string' ? JSON.parse(json.CogM) : (json.CogM ?? {})
  const cogOrder = typeof json.CogO === 'string' ? JSON.parse(json.CogO) : (json.CogO ?? [])

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

  return { cogs, totalExpRate }
}

function parseTowerLevels(json) {
  const raw = json['Tower']
  const arr = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
  return arr.slice(0, 27).map(v => Number(v) || 0)
}

// ── Shrines ─────────────────────────────────────────────────────────────────
function parseShrines(json) {
  const raw = json['Shrine']
  const arr = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
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

// ── Worship ─────────────────────────────────────────────────────────
function parseWorship(json) {
  const raw = json?.TotemInfo
  const totemInfoRaw = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
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
  const meals = typeof json.Meals === 'string' ? JSON.parse(json.Meals) : (json.Meals ?? [])
  const ribbon = typeof json.Ribbon === 'string' ? JSON.parse(json.Ribbon) : (json.Ribbon ?? [])

  const mealLevels = meals[0] ?? []
  const cabinetSlots = ribbon.slice(0, 28)
  const mealRibbons = ribbon.slice(28)

  return {
    mealLevels,
    cabinetSlots,
    mealRibbons,
  }
}

// ── Breeding ──────────────────────────────────────────────────────────────────
function parseBreeding(json) {
  const raw = json['Breeding']
  const arr = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
  const petsRaw = typeof json['Pets'] === 'string' ? JSON.parse(json['Pets']) : (json['Pets'] ?? [])

  const shinyPetsLevels = arr.slice(22, 26)

  const fencePets = petsRaw.slice(0, 27).reduce((acc, [name]) => {
    if (name === 'none') return acc
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  return { shinyPetsLevels, fencePets }
}

// ── Farming ───────────────────────────────────────────────────────────────────
function parseFarming(json) {
  // ── Raw save keys ──
  const rawTimeAway = typeof json['TimeAway'] === 'string'
  ? JSON.parse(json['TimeAway'])
  : (json['TimeAway'] ?? {})

  const globalTime = rawTimeAway?.GlobalTime ?? null

  const rawUpgrades = typeof json['FarmUpg'] === 'string'
    ? JSON.parse(json['FarmUpg'])
    : (json['FarmUpg'] ?? [])

  const rawPlot = typeof json['FarmPlot'] === 'string'
    ? JSON.parse(json['FarmPlot'])
    : (json['FarmPlot'] ?? [])

  const rawCrop = typeof json['FarmCrop'] === 'string'
    ? JSON.parse(json['FarmCrop'])
    : (json['FarmCrop'] ?? {})

  const rawRanks = typeof json['FarmRank'] === 'string'
    ? JSON.parse(json['FarmRank'])
    : (json['FarmRank'] ?? [])

  // ── Market upgrade levels ──
  // Index 1 = beans, index 19 = instaGrow (matches toolbox)
  // Indices 2–17 = 16 market upgrades (day market 0–7, night market 8–15)
  // Indices 20+ = exotic market upgrade levels: rawUpgrades[20 + exoticIndex]
  const beans     = rawUpgrades[1] ?? 0
  const instaGrow = rawUpgrades[19] ?? 0

  const marketLevels = rawUpgrades.slice(2, 18)   // 16 entries
  const exoticLevels = rawUpgrades.slice(20, 80)  // 60 entries, exoticLevels[i] = rawUpgrades[20 + i]

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
function parseCards(json) {
  const parse = raw => (typeof raw === 'string' ? JSON.parse(raw) : raw)
  const counts = parse(json['Cards0']) ?? {}
  const rift = parse(json['Rift']) ?? []
  const spelunk = parse(json['Spelunk']) ?? []
  const optLacc = parse(json['OptLacc']) ?? []
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
  const lab = typeof json['Lab'] === 'string' ? JSON.parse(json['Lab']) : (json['Lab'] ?? [])
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
  const spelunk = typeof json['Spelunk'] === 'string'
    ? JSON.parse(json['Spelunk'])
    : (json['Spelunk'] ?? [])
  const levels = spelunk[18] ?? []
  return levels
}

// ── Royal Guardian ────────────────────────────────────────────────────────────
// RoyalG[0] = Royal Statue levels, RoyalG[2] = armory upgrade levels
//   (45 = Royal Reverence, 78 = Statue Flair unlocked), RoyalG[22] = Statue Flair level per statue
// Menagerie[2][17] = unlock that raises the Statue Flair max level from 3 to 4
function parseRoyalGuardian(json) {
  const raw = typeof json['RoyalG'] === 'string'
    ? JSON.parse(json['RoyalG'])
    : (json['RoyalG'] ?? [])
  const menagerie = typeof json['Menagerie'] === 'string'
    ? JSON.parse(json['Menagerie'])
    : (json['Menagerie'] ?? [])
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
  const maps = typeof json['RoyalMaps'] === 'string'
    ? JSON.parse(json['RoyalMaps'])
    : (json['RoyalMaps'] ?? [])
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
  const research = typeof json['Research'] === 'string'
    ? JSON.parse(json['Research'])
    : (json['Research'] ?? [])

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

  return {
    importedAt: new Date().toISOString(),
    characters: extractedCharacters,
    storage: parseStorage(json),
    statues: parseStatues(json),
    anvil: parseAnvil(json, charList),
    accountObols: parseAccountObols(json),
    shrines: parseShrines(json),
    worship: parseWorship(json),
    towerLevels: parseTowerLevels(json),
    armorSmithySets: parseArmorSmithySets(json),
    miniBossesKills: parseMiniBosses(json),
    miniBossDays: parseMiniBossDays(json),
    exaltedStamps: parseExaltedStamps(json),
    prismaBubbles: parsePrismaBubbles(json),
    mapBonuses: parseMapBonuses(json),
    mapBonusCap: parseMapBonusCap(json, charList.length),
    construction: parseConstruction(json),
    cooking: parseCooking(json),
    breeding: parseBreeding(json),
    farming: parseFarming(json),
    legendTalents: parseLegendTalents(json),
    cards: parseCards(json),
    labChips: parseLabChips(json, charList.length),
    royalGuardian: parseRoyalGuardian(json),
  }
}