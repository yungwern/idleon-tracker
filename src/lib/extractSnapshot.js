import { talentMap } from '../data/talentMap'

const extractors = {
  level: (json, i) => json[`Lv0_${i}`]?.[0] ?? null,
  equipOrder: (json, i) => json[`EquipOrder_${i}`]?.[0] ?? {},
  inventory: (json, i) => {
    const order = json[`InventoryOrder_${i}`] ?? []
    const qty   = json[`ItemQTY_${i}`] ?? []
    const map = {}
    order.forEach((key, idx) => {
      if (key !== 'Blank' && key !== 'LockedInvSpace') {
        map[key] = (map[key] ?? 0) + (qty[idx] ?? 0)
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

function parseStatues(json) {
  const raw = json['StatueLevels_0']
  const arr = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
  return arr.map(([level, xp], id) => ({ id, level, xp }))
}

function parseShrines(json) {
  const raw = json['Shrine']
  const arr = typeof raw === 'string' ? JSON.parse(raw) : (raw ?? [])
  return arr.map((entry, i) => {
    const level = entry[3]
    const xp = entry[4]
    const xpRequired = Math.floor(20 * (level - 1) + 6 * level * Math.pow(1.63, level - 1))
    return {
      id: i + 18,
      level,
      xp,
      xpRequired,
    }
  })
}

function parseMiniBosses(json) {
  const rawSneaking = json['Ninja']
  const arr = typeof rawSneaking === 'string' ? JSON.parse(rawSneaking) : (rawSneaking ?? [])
  const kills = arr?.[105] ?? []
  return kills.slice(0, 9)
}

// ── Exalted Stamps ────────────────────────────────────────────
// Returns a Set of compassIndex strings for stamps the player has exalted.
// Stored in Compass[4] as an array e.g. ['b2', 'a7', '_3', ...]
// Match against stampMap[rawName].compassIndex to check if a stamp is exalted.
function parseExaltedStamps(json) {
  try {
    const compass = typeof json['Compass'] === 'string'
      ? JSON.parse(json['Compass'])
      : (json['Compass'] ?? [])
    const exaltedRaw = compass[4] ?? []
    return new Set(exaltedRaw)
  } catch {
    console.warn('Failed to parse exalted stamps from Compass.')
    return new Set()
  }
}

// ── Prisma Bubbles ────────────────────────────────────────────
// Returns a Set of bubbleIndex strings for bubbles the player has prisma'd.
// Stored in OptLacc[384] as a comma-separated string e.g. "_1,a1,b1,c9,"
// Match against bubbleMap[rawName].bubbleIndex to check if a bubble is prisma'd.
function parsePrismaBubbles(json) {
  try {
    const optLacc = json['OptLacc'] ?? []
    const raw = optLacc[384] ?? ''
    if (!raw) return new Set()
    // Split on commas, filter empty strings from trailing comma
    return new Set(raw.split(',').filter(Boolean))
  } catch {
    console.warn('Failed to parse prisma bubbles from OptLacc.')
    return new Set()
  }
}

export function extractSnapshot(json) {
  const characterCount = 10
  const characters = Array.from({ length: characterCount }, (_, i) => {
    const extracted = {}
    for (const [field, fn] of Object.entries(extractors)) {
      extracted[field] = fn(json, i)
    }
    return extracted
  })

  return {
    characters,
    statues: parseStatues(json),
    shrines: parseShrines(json),
    miniBossesKills: parseMiniBosses(json),
    exaltedStamps: parseExaltedStamps(json),
    prismaBubbles: parsePrismaBubbles(json),
    importedAt: new Date().toISOString(),
  }
}