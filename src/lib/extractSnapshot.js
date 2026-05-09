import { talentMap } from '../data/talentMap'
import { MASTERCLASSES } from '../data/masterClasses'
import { anvilMapById } from '../data/anvilMap'
import { characters } from '../data/characters'

// ── Anvil ──────────────────────────────────────────────────────────────────
function parseAnvil(json) {
  const characterCount = characters.length
  const allRows = []

  for (let i = 0; i < characterCount; i++) {
    const selectKey = `AnvilPAselect_${i}`
    const raw = json[selectKey]
    const selected = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
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
        charName: characters[i].name ?? `Character ${i + 1}`,
        charClass: characters[i].class ?? '',
        itemId,
        item,
        hammers,
      })
    })
  }

  return { rows: allRows }
}

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
}

// ── Statues ─────────────────────────────────────────────────────────────────
function parseStatues(json) {
  const raw = json['StatueLevels_0']
  const arr = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
  return arr.map(([level, xp], id) => ({ id, level, xp }))
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
  // Tower layout: 9 towers per row, 3 rows (indices 0–26)
  // Row 1: indices  0– 8  (first building row)
  // Row 2: indices  9–17  (second building row)
  // Row 3: indices 18–26  (shrines)
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
    // Shrine construction levels occupy tower row 3 (indices 18–26),
    // matching shrine order (i=0 → Woodular → towerLevels[18])
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

// ── Armor Smithy Sets ─────────────────────────────────────────────────────────
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

// ── Mini Bosses ───────────────────────────────────────────────────────────────
function parseMiniBosses(json) {
  const rawSneaking = json['Ninja']
  const arr = typeof rawSneaking === 'string' ? JSON.parse(rawSneaking) : (rawSneaking ?? [])
  const kills = arr?.[105] ?? []
  return kills.slice(0, 9)
}

// ── Cooking ──────────────────────────────────────────────────────────────────
// Meals[0]        — meal levels, indexed by meal ID (CookingMB0–CookingMB73)
// Ribbon[0–27]    — ribbon cabinet inventory (4 columns × 7 rows)
// Ribbon[28–101]  — ribbon rank applied per meal, indexed by meal ID
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

// ── Breeding ──────────────────────────────────────────────────────────────────
// Shiny counters are stored in the Breeding array starting at index 22,
// grouped by world. The Pets array's first 27 entries are the fence yard slots,
// each entry: [petName, type, power, time]
function parseBreeding(json) {
  const raw = json['Breeding']
  const arr = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
  const petsRaw = typeof json['Pets'] === 'string' ? JSON.parse(json['Pets']) : (json['Pets'] ?? [])
 
  const shinyPetsLevels = arr.slice(22, 26)
 
  // First 27 entries of Pets array are the fence yard slots
  const fencePets = petsRaw.slice(0, 27).reduce((acc, [name]) => {
    if (name === 'none') return acc
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})
 
  return { shinyPetsLevels, fencePets }
}

// ── Main Export ───────────────────────────────────────────────────────────────
export function extractSnapshot(json) {
  const characterCount = 10
  const extractedCharacters = Array.from({ length: characterCount }, (_, i) => {
    const extracted = {}
    for (const [field, fn] of Object.entries(extractors)) {
      extracted[field] = fn(json, i, weaponKeys)
    }
    return extracted
  })

  const statues = parseStatues(json)

  return {
    characters: extractedCharacters,
    storage: parseStorage(json),
    statues: parseStatues(json),
    shrines: parseShrines(json),
    armorSmithySets: parseArmorSmithySets(json),
    miniBossesKills: parseMiniBosses(json),
    exaltedStamps: parseExaltedStamps(json),
    prismaBubbles: parsePrismaBubbles(json),
    mapBonuses: parseMapBonuses(json),
    construction: parseConstruction(json),
    anvil: parseAnvil(json),
    cooking: parseCooking(json),
    breeding: parseBreeding(json),
    importedAt: new Date().toISOString(),
  }
}