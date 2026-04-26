import { talentMap } from '../data/talentMap'

const extractors = {
  level: (json, i) => json[`Lv0_${i}`]?.[0] ?? null,
  equipOrder: (json, i) => json[`EquipOrder_${i}`]?.[0] ?? {},
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
    importedAt: new Date().toISOString(),
  }
}