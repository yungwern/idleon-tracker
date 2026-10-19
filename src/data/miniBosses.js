export const MINIBOSSES = [
  { rawName: 'slimeB',    
    displayName: 'Glunko The Massive',  
    world: 'World 1', 
    worldColor: 'var(--world-1-color)', 
    index: 0, 
    location: 'Slime', 
    spawnItem: null 
  },
  { rawName: 'babayaga',  
    displayName: 'Baba Yaga',           
    world: 'World 1', 
    worldColor: 'var(--world-1-color)', 
    index: 2, 
    location: 'Red Mushroom', 
    spawnItem: null 
  },
  { rawName: 'poopBig',   
    displayName: 'Dr Defecaus',         
    world: 'World 1', 
    worldColor: 'var(--world-1-color)', 
    index: 1, 
    location: 'Poop', 
    spawnItem: null 
  },
  { rawName: 'babaHour',  
    displayName: 'Biggie Hours',        
    world: 'World 2', 
    worldColor: 'var(--world-2-color)', 
    index: 3, 
    location: 'Mimic', 
    spawnItem: { displayName: 'Googley Eyes', imageKey: 'Quest35' } 
  },
  { rawName: 'babaMummy', 
    displayName: 'King Doot',           
    world: 'World 2', 
    worldColor: 'var(--world-2-color)', 
    index: 4, 
    location: 'Sand Giant', 
    spawnItem: { displayName: 'Dootjat Eye', imageKey: 'Quest36' } 
  },
  { rawName: 'mini3a',    
    displayName: 'Dilapidated Slush',   
    world: 'World 3', 
    worldColor: 'var(--world-3-color)', 
    index: 5, location: 'Bloque', 
    spawnItem: { displayName: 'Bucket of Slush', imageKey: 'Quest68' },
    spawnTimer: { exponent: 0.55, max: 10 }
  },
  { rawName: 'mini4a',    
    displayName: 'Mutated Mush',        
    world: 'World 4', 
    worldColor: 'var(--world-4-color)', 
    index: 6, 
    location: 'Purp Mushroom', 
    spawnItem: { displayName: 'Toxic Sludge', imageKey: 'OilBarrel2' },
    spawnTimer: { exponent: 0.5, max: 8 }
  },
  { rawName: 'mini5a',    
    displayName: 'Domeo Magmus',        
    world: 'World 5', 
    worldColor: 'var(--world-5-color)', 
    index: 7, 
    location: 'Mister Brightside', 
    spawnItem: null,
    spawnTimer: { exponent: 0.5, max: 6 }
  },
  { rawName: 'mini6a',    
    displayName: 'Demented Spiritlord', 
    world: 'World 6', 
    worldColor: 'var(--world-6-color)', 
    index: 8, 
    location: 'Mama Troll', 
    spawnItem: null,
    spawnTimer: { exponent: 0.5, max: 6 }
  },
  { rawName: 'fm_rat',
    displayName: 'Verminous Rats',
    world: 'Royal Castle',
    worldColor: '#fbbf24',
    index: 9,
    location: 'Royal Castle Cellar',
    spawnItem: null,
    castleBoss: true
  },
]

// Verminous (Royal Guardian): inside the Royal Castle your own damage is ignored. Every hit uses the
// castle damage from the Armory (Anti-Rodent Power Move I/II) with 20% mastery, so min = max * 0.2.
// Formula from IdleOn Toolbox (parsers/misc/boneJoeCalculator.ts, parsers/class-specific/royalGuardian.ts).
const VERMINOUS_BASE_HP = 100000
const VERMINOUS_MASTERY = 0.2
const ARMORY_RAT_BASE_DMG = 35 // +5 base damage per level
const ARMORY_RAT_TOTAL_DMG = 36 // +2% total damage per level
const PICKLE_HP_MULTI = 1.1

// Average non-crit hit inside the castle
export function getVerminousHit(armory) {
  const level = id => Number(armory?.[id] ?? 0)
  const maxHit = (10 + 5 * level(ARMORY_RAT_BASE_DMG)) * (1 + (2 * level(ARMORY_RAT_TOTAL_DMG)) / 100)
  return (maxHit * (1 + VERMINOUS_MASTERY)) / 2
}

export function getVerminousHits(avgHit, pickles) {
  return Math.ceil((VERMINOUS_BASE_HP * Math.pow(PICKLE_HP_MULTI, pickles)) / avgHit)
}

// Death Note kills per hit = (pickles + 1) / 1.1^pickles. It peaks at 9-10 pickles (a tie);
// 10 is used since it needs fewer kills for the same total hits.
export function getBestVerminousPickles() {
  let best = 0
  for (let p = 1; p <= 50; p++) {
    const perHit = q => (q + 1) / Math.pow(PICKLE_HP_MULTI, q)
    if (perHit(p) >= perHit(best) - 1e-9) best = p
    else break
  }
  return best
}

// Spawned minibosses (W3–W6) stack kills from the days since you last spawned them.
// Game formula: min(max, floor((days - 3) ^ exponent)), nothing before day 4.
export function getAvailableKills(timer, days) {
  return Math.min(timer.max, Math.floor(Math.pow(Math.max(days, 3) - 3, timer.exponent)))
}

export function getDaysForKills(timer, kills) {
  let days = 0
  while (getAvailableKills(timer, days) < kills) days++
  return days
}

// Stack size with the best kills-per-day. Waiting past it means the next stack takes longer than
// it is worth, so you get fewer kills over time.
export function getOptimalKills(timer) {
  let best = 1
  for (let n = 2; n <= timer.max; n++) {
    if (n / getDaysForKills(timer, n) > best / getDaysForKills(timer, best)) best = n
  }
  return best
}

export const RANK_THRESHOLDS = [
  { kills: 100     },
  { kills: 250     },
  { kills: 1000    },
  { kills: 5000    },
  { kills: 25000   },
  { kills: 100000  },
  { kills: 1000000 },
]

// Skull index = how many rank thresholds you've passed (0 = none, 7 = max)
export function getSkullIndex(kills) {
  return RANK_THRESHOLDS.filter(t => kills >= t.kills).length
}

export function rankColor(skullIndex) {
  switch (skullIndex) {
    case 0:  return '#6b7280'
    case 1:  return '#ffffff'
    case 2:  return '#cd7f32'
    case 3:  return '#94a3b8'
    case 4:  return '#fbbf24'
    case 5:  return '#37c7f9'
    case 6:  return '#aa37d8'
    case 7:  return '#f43f5e'
  }
}

export function formatKills(kills) {
  if (kills == null || kills === 0) return '0'
  if (kills >= 1_000_000) return `${(kills / 1_000_000).toFixed(1)}M`
  if (kills >= 1_000) return `${(kills / 1_000).toFixed(1)}K`
  return kills.toLocaleString()
}