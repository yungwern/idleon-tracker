export const MINIBOSSES = [
  { rawName: 'slimeB',    displayName: 'Glunko The Massive',  world: 'World 1', worldColor: '#86efac', index: 0, location: 'Slime', spawnItem: null },
  { rawName: 'babayaga',  displayName: 'Baba Yaga',           world: 'World 1', worldColor: '#86efac', index: 2, location: 'Red Mushroom', spawnItem: null },
  { rawName: 'poopBig',   displayName: 'Dr Defecaus',         world: 'World 2', worldColor: '#fcd34d', index: 1, location: 'Poop', spawnItem: null },
  { rawName: 'babaHour',  displayName: 'Biggie Hours',        world: 'World 2', worldColor: '#fcd34d', index: 3, location: 'Mimic', spawnItem: { displayName: 'Googley Eyes', imageKey: 'Quest35' } },
  { rawName: 'babaMummy', displayName: 'King Doot',           world: 'World 2', worldColor: '#fcd34d', index: 4, location: 'Sand Giant', spawnItem: { displayName: 'Dootjat Eye', imageKey: 'Quest36' } },
  { rawName: 'mini3a',    displayName: 'Dilapidated Slush',   world: 'World 3', worldColor: '#93c5fd', index: 5, location: 'Bloque', spawnItem: { displayName: 'Bucket of Slush', imageKey: 'Quest68' } },
  { rawName: 'mini4a',    displayName: 'Mutated Mush',        world: 'World 4', worldColor: '#fb923c', index: 6, location: 'Purp Mushroom', spawnItem: { displayName: 'Toxic Sludge', imageKey: 'OilBarrel2' } },
  { rawName: 'mini5a',    displayName: 'Domeo Magmus',        world: 'World 5', worldColor: '#fca5a5', index: 7, location: 'Mister Brightside', spawnItem: null },
  { rawName: 'mini6a',    displayName: 'Demented Spiritlord', world: 'World 6', worldColor: '#c4b5fd', index: 8, location: 'Mama Troll', spawnItem: null },
]

export const RANK_THRESHOLDS = [
  { kills: 100     },
  { kills: 250     },
  { kills: 1000    },
  { kills: 5000    },
  { kills: 25000   },
  { kills: 100000  },
  { kills: 1000000 },
]

export function getSkullIndex(kills) {
  if (kills < 100)    return 0
  if (kills < 250)    return 1
  if (kills < 1000)   return 2
  if (kills < 5000)   return 3
  if (kills < 25000)  return 4
  if (kills < 100000) return 5
  return 6
}

export function rankColor(skullIndex) {
  switch (skullIndex) {
    case 0:  return '#6b7280'
    case 1:  return '#cd7f32'
    case 2:  return '#94a3b8'
    case 3:  return '#fbbf24'
    case 4:  return '#34d399'
    case 5:  return '#60a5fa'
    case 6:  return '#f43f5e'
    default: return '#6b7280'
  }
}

export function formatKills(kills) {
  if (kills == null || kills === 0) return '0'
  if (kills >= 1_000_000) return `${(kills / 1_000_000).toFixed(1)}M`
  if (kills >= 1_000) return `${(kills / 1_000).toFixed(1)}K`
  return kills.toLocaleString()
}