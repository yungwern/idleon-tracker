import { talentMap } from '../data/talentMap'
import { MASTERCLASSES } from '../data/masterClasses'

// ── Construction ──────────────────────────────────────────────
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

export function extractSnapshot(json) {
  const characterCount = 10
  const characters = Array.from({ length: characterCount }, (_, i) => {
    const extracted = {}
    for (const [field, fn] of Object.entries(extractors)) {
      extracted[field] = fn(json, i, weaponKeys)
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
    construction: parseConstruction(json),
    importedAt: new Date().toISOString(),
  }
}