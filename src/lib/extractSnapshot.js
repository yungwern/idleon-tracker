import { talentMap } from '../data/talentMap'
import { MASTERCLASSES } from '../data/masterClasses'
import { anvilMapById } from '../data/anvilMap'
import { getClassName } from '../data/classes'
import { worshipMap } from '../data'
import { seedInfo } from '../data/farmingMap'

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
      { label: 'Fighting', presetIndex: 0, slKey: `SL_${i}` },
      { label: 'Skilling', presetIndex: 1, slKey: `SM_${i}` },
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
  actionBar: (json, i) => {
    const parseRows = (raw) => {
      const arr = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
      return arr.slice(0, 3).map(row =>
        (Array.isArray(row) ? row : []).slice(0, 6).map(v => v === 'Null' ? null : v)
      )
    }
    return {
      active: parseRows(json[`AttackLoadout_${i}`]),
      alternate: parseRows(json[`AttackLoadoutpre_${i}`]),
    }
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

// ── Minibosses ───────────────────────────────────────────────────────────────
function parseMiniBosses(json) {
  const rawSneaking = json['Ninja']
  const arr = typeof rawSneaking === 'string' ? JSON.parse(rawSneaking) : (rawSneaking ?? [])
  const kills = arr?.[105] ?? []
  return kills.slice(0, 9)
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

// ── Legend Talents ────────────────────────────────────────────────────────────────
function parseLegendTalents(json) {
  const spelunk = typeof json['Spelunk'] === 'string'
    ? JSON.parse(json['Spelunk'])
    : (json['Spelunk'] ?? [])
  const levels = spelunk[18] ?? []
  return levels
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
    exaltedStamps: parseExaltedStamps(json),
    prismaBubbles: parsePrismaBubbles(json),
    mapBonuses: parseMapBonuses(json),
    construction: parseConstruction(json),
    cooking: parseCooking(json),
    breeding: parseBreeding(json),
    farming: parseFarming(json),
    legendTalents: parseLegendTalents(json),
  }
}