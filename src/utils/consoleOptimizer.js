import {
  labChipMap,
  cardMap,
  itemMap,
  deathNoteMobs,
  mapEnemyData,
  CHIP_SLOT_LEVELS,
  CHIP_VALUES,
  CONSOLE_ROLES,
  PRIORITY_CHIP_STATS,
  DOUBLER_ROLE_ORDER,
  DOUBLER_FREE_SLOTS,
  STACKED_CHIPS,
  CHIP_DISPLAY_GROUPS,
  CHIP_DISPLAY_LAST,
  CHIP_FALLBACK_SHARE,
  CHIP_STACK_DECAY,
  CHIP_KEEP_BONUS,
  ACTIVE_REPLACED_ROLE,
} from '../data'
import { getSkillLevel } from './skillUtils'

// Lab Console (World 4): every character's 7 chip slots, chip storage, and the Chip Planner.
// Save = snapshot.lab (chipSlots per character, chipTotals = owned per chip index).
// Planner: black/orange chips are stacked first (stackDoublers: full sets on as few characters as possible,
// Active, then Crystals, Fighting, Skilling). The rest is a min-cost flow (chips → characters, capped by owned
// copies and free slots): each chip is worth CHIP_VALUES[stat][role] (or [all]), or CHIP_FALLBACK_SHARE of its
// value on the role's fallback (Fighting fills up with skilling chips and back); extra copies of a stackable
// chip lose CHIP_STACK_DECAY per copy; one-per-player chips can't double up. Ties keep chips where they are
// (CHIP_KEEP_BONUS per chip kept).

export const EMPTY_SLOT = -1
const CHIP_IDS = Object.keys(labChipMap)
const MOB_TARGETS = new Set([
  ...deathNoteMobs.map(mob => mob.rawName),
  ...mapEnemyData.map(mob => mob.rawName),
])

// Equipment slots the Silkrode chips double (EquipOrder_i[0])
const PENDANT_SLOT = 3
const UPPER_KEYCHAIN_SLOT = 9
const TROPHY_SLOT = 10
const TOP_LEFT_CARD = 0
const BOTTOM_RIGHT_CARD = 7

function chipAt(index) {
  return labChipMap[`ConsoleChip${index}`] ?? null
}

export function getChipByIndex(index) {
  return chipAt(index)
}

// Effect text the game shows for this account (some chips change once World 7 is reached)
export function getChipEffect(chip, snapshot) {
  if (!chip) return ''
  return snapshot?.lab?.world7 && chip.w7Effect ? chip.w7Effect : chip.effect
}

export function getLabLevel(character) {
  return getSkillLevel(character, 'lab')
}

// How many of the 7 slots this Lab LV opens
export function getUnlockedChipSlots(labLevel) {
  return CHIP_SLOT_LEVELS.filter(level => labLevel >= level).length
}

// Role guessed from the AFK target: a monster = fighting, anything else = skilling
export function getDefaultConsoleRole(character) {
  const target = character?.afkTarget
  return target && MOB_TARGETS.has(target) ? 'fighting' : 'skilling'
}

export function isConsoleRole(role) {
  return CONSOLE_ROLES.some(entry => entry.id === role)
}

function isSingleRole(role) {
  return !!CONSOLE_ROLES.find(entry => entry.id === role)?.single
}

// Roles by character index from the saved { name: role } map: unknown ids fall back to the AFK guess,
// and a single-use role (Active) only stays on the first character that has it
export function resolveConsoleRoles(characters, saved) {
  const used = new Set()
  return Object.fromEntries((characters ?? []).map((character, i) => {
    let role = isConsoleRole(saved?.[character.name]) ? saved[character.name] : getDefaultConsoleRole(character)
    if (isSingleRole(role)) {
      if (used.has(role)) role = ACTIVE_REPLACED_ROLE
      used.add(role)
    }
    return [i, role]
  }))
}

// New saved map after picking a role for one character: picking Active moves the old Active to Fighting
export function setConsoleRole(characters, saved, name, role) {
  const current = resolveConsoleRoles(characters, saved)
  const next = Object.fromEntries((characters ?? []).map((character, i) => [character.name, current[i]]))
  if (isSingleRole(role)) {
    Object.keys(next).forEach(other => {
      if (next[other] === role) next[other] = ACTIVE_REPLACED_ROLE
    })
  }
  next[name] = role
  return next
}

// New saved map after "Set all": every character but the Active one gets the role (never a single role)
export function setAllConsoleRoles(characters, saved, role) {
  if (isSingleRole(role)) return saved
  const current = resolveConsoleRoles(characters, saved)
  return Object.fromEntries((characters ?? []).map((character, i) => [
    character.name,
    isSingleRole(current[i]) ? current[i] : role,
  ]))
}

function countChips(list) {
  const counts = {}
  list.forEach(index => {
    if (index >= 0) counts[index] = (counts[index] ?? 0) + 1
  })
  return counts
}

// Current console: per character slots (chip index or -1), unlocked slot count, and chips in storage
export function getConsoleState(snapshot) {
  const lab = snapshot?.lab
  const characters = snapshot?.characters ?? []
  const consoleCharacters = characters.map((character, i) => {
    const labLevel = getLabLevel(character)
    const slots = Array.from({ length: CHIP_SLOT_LEVELS.length }, (_, s) => lab?.chipSlots?.[i]?.[s] ?? EMPTY_SLOT)
    return {
      index: i,
      name: character.name,
      className: character.class,
      labLevel,
      unlocked: getUnlockedChipSlots(labLevel),
      slots,
    }
  })
  const equipped = countChips(consoleCharacters.flatMap(character => character.slots))
  const storage = CHIP_IDS.map(id => {
    const chip = labChipMap[id]
    const owned = lab?.chipTotals?.[chip.index] ?? 0
    const inUse = equipped[chip.index] ?? 0
    return {
      chip,
      owned,
      equipped: inUse,
      stored: Math.max(0, owned - inUse),
    }
  })
  return {
    characters: consoleCharacters,
    storage,
  }
}

function itemName(rawName) {
  return itemMap[rawName] ?? rawName
}

// What a gated chip would double on this character: { label, active } (active false → worth 0)
export function getChipTarget(snapshot, characterIndex, chip) {
  const character = snapshot?.characters?.[characterIndex]
  const gear = character?.equipOrder ?? {}
  const cards = character?.equippedCards ?? []
  const cardLabel = rawName => cardMap[rawName]?.name ?? rawName
  switch (chip?.stat) {
    case 'card1':
      return cards[TOP_LEFT_CARD]
        ? { label: `Top left card: ${cardLabel(cards[TOP_LEFT_CARD])}`, active: true }
        : { label: 'No card in the top left slot', active: false }
    case 'card2':
      return cards[BOTTOM_RIGHT_CARD]
        ? { label: `Bottom right card: ${cardLabel(cards[BOTTOM_RIGHT_CARD])}`, active: true }
        : { label: 'No card in the bottom right slot', active: false }
    case 'key1': {
      const keychain = gear[UPPER_KEYCHAIN_SLOT]
      return keychain && keychain !== 'Blank'
        ? { label: `Upper keychain: ${itemName(keychain)}`, active: true }
        : { label: 'No upper keychain', active: false }
    }
    case 'pend': {
      const pendant = gear[PENDANT_SLOT]
      return pendant && pendant !== 'Blank'
        ? { label: `Pendant: ${itemName(pendant)}`, active: true }
        : { label: 'No pendant', active: false }
    }
    case 'troph': {
      if (snapshot?.lab?.world7) return { label: '+10% Gallery Bonus Multi (World 7 text)', active: true }
      const trophy = gear[TROPHY_SLOT]
      return trophy && trophy !== 'Blank'
        ? { label: `Trophy: ${itemName(trophy)}`, active: true }
        : { label: 'No trophy', active: false }
    }
    default:
      return null
  }
}

function getRoleInfo(role) {
  return CONSOLE_ROLES.find(entry => entry.id === role)
}

// CHIP_VALUES entry for a role (Crystals / Active borrow Fighting's where they have none)
function getRoleValue(chip, role) {
  const values = CHIP_VALUES[chip.stat] ?? {}
  if (values.all !== undefined) return values.all
  const borrowed = getRoleInfo(role)?.valuesFrom
  return values[role] ?? (borrowed ? values[borrowed] : undefined) ?? 0
}

// Own-role value, else a share of the value on the role's fallback (CONSOLE_ROLES)
function getBaseValue(chip, role) {
  const own = getRoleValue(chip, role)
  if (own > 0) return own
  const fallback = getRoleInfo(role)?.fallback
  return fallback ? getRoleValue(chip, fallback) * CHIP_FALLBACK_SHARE : 0
}

// Worth of the (copy + 1)th copy of a chip on a character with this role. Returns a number >= 0.
export function getChipValue(snapshot, characterIndex, role, chip, copy = 0) {
  if (!chip) return 0
  if (chip.onePerPlayer && copy > 0) return 0
  const target = getChipTarget(snapshot, characterIndex, chip)
  if (target && !target.active) return 0
  return getBaseValue(chip, role) * Math.pow(CHIP_STACK_DECAY, copy)
}

// ── Min-cost flow (successive shortest paths, Bellman-Ford: the graph has ~2,000 edges) ──
function createGraph(nodeCount) {
  return {
    adjacency: Array.from({ length: nodeCount }, () => []),
    edges: [],
  }
}

function addEdge(graph, from, to, capacity, cost) {
  const id = graph.edges.length
  graph.edges.push({ from, to, capacity, cost, flow: 0 })
  graph.edges.push({ from: to, to: from, capacity: 0, cost: -cost, flow: 0 })
  graph.adjacency[from].push(id)
  graph.adjacency[to].push(id + 1)
  return id
}

function runMinCostFlow(graph, source, sink) {
  const nodeCount = graph.adjacency.length
  for (;;) {
    const dist = new Array(nodeCount).fill(Infinity)
    const prevEdge = new Array(nodeCount).fill(-1)
    dist[source] = 0
    for (let round = 0; round < nodeCount; round++) {
      let changed = false
      graph.edges.forEach((edge, id) => {
        if (edge.capacity - edge.flow <= 0 || dist[edge.from] === Infinity) return
        const next = dist[edge.from] + edge.cost
        if (next < dist[edge.to] - 1e-9) {
          dist[edge.to] = next
          prevEdge[edge.to] = id
          changed = true
        }
      })
      if (!changed) break
    }
    // Only worth pushing while the path adds value (cost < 0): empty slots beat worthless chips
    if (dist[sink] >= -1e-9) return
    let node = sink
    while (node !== source) {
      const id = prevEdge[node]
      graph.edges[id].flow += 1
      graph.edges[id ^ 1].flow -= 1
      node = graph.edges[id].from
    }
  }
}

// Display rank: black chips, orange chips, everything else, Chocolatey Chip last (CHIP_DISPLAY_GROUPS)
function getDisplayRank(index) {
  const stat = chipAt(index)?.stat
  if (stat === CHIP_DISPLAY_LAST) return CHIP_DISPLAY_GROUPS.length + 2
  const group = CHIP_DISPLAY_GROUPS.findIndex(stats => stats.includes(stat))
  return group === -1 ? CHIP_DISPLAY_GROUPS.length : group
}

// Planned chips top to bottom in display order; empty unlocked slots sit above the Chocolatey Chip
function arrangeSlots(unlocked, plannedCounts) {
  const chips = Object.entries(plannedCounts)
    .flatMap(([index, count]) => Array(count).fill(Number(index)))
    .sort((a, b) => getDisplayRank(a) - getDisplayRank(b) || a - b)
  const last = chips.filter(index => chipAt(index)?.stat === CHIP_DISPLAY_LAST)
  const rest = chips.filter(index => chipAt(index)?.stat !== CHIP_DISPLAY_LAST)
  const empties = Math.max(0, unlocked - chips.length)
  const ordered = [...rest, ...Array(empties).fill(EMPTY_SLOT), ...last]
  return Array.from({ length: CHIP_SLOT_LEVELS.length }, (_, s) => (s < unlocked ? ordered[s] ?? EMPTY_SLOT : EMPTY_SLOT))
}

function diffCounts(fromCounts, toCounts) {
  const indexes = new Set([...Object.keys(fromCounts), ...Object.keys(toCounts)].map(Number))
  const added = []
  const removed = []
  indexes.forEach(index => {
    const change = (toCounts[index] ?? 0) - (fromCounts[index] ?? 0)
    for (let n = 0; n < Math.abs(change); n++) (change > 0 ? added : removed).push(index)
  })
  return {
    added: added.sort((a, b) => a - b),
    removed: removed.sort((a, b) => a - b),
  }
}

const isDoubler = chip => PRIORITY_CHIP_STATS.includes(chip?.stat)

// Stacks black/orange chips onto as few characters as possible (DOUBLER_ROLE_ORDER, then most already held,
// then save order): each character takes every one it can use, black first, up to its slots minus
// DOUBLER_FREE_SLOTS, before the next character gets any. Takes them out of `available`.
// Returns { [characterIndex]: { [chipIndex]: 1 } }.
function stackDoublers(snapshot, characters, roleOf, available) {
  const doublers = CHIP_IDS.map(id => labChipMap[id])
    .filter(isDoubler)
    .sort((a, b) => getRoleValue(b, 'active') - getRoleValue(a, 'active') || a.index - b.index)
  const rank = role => {
    const at = DOUBLER_ROLE_ORDER.indexOf(role)
    return at === -1 ? DOUBLER_ROLE_ORDER.length : at
  }
  const held = character => character.slots.filter(index => isDoubler(chipAt(index))).length
  const order = characters
    .filter(character => character.unlocked > 0)
    .sort((a, b) => rank(roleOf(a)) - rank(roleOf(b)) || held(b) - held(a) || a.index - b.index)
  const fixed = {}
  order.forEach(character => {
    const limit = Math.max(0, character.unlocked - DOUBLER_FREE_SLOTS)
    const role = roleOf(character)
    fixed[character.index] = {}
    let placed = 0
    doublers.forEach(chip => {
      if (placed >= limit || !available[chip.index]) return
      if (getChipValue(snapshot, character.index, role, chip, 0) <= 0) return
      fixed[character.index][chip.index] = 1
      available[chip.index] -= 1
      placed += 1
    })
  })
  return fixed
}

// Fills every free slot (after the black/orange stack) with copies of a stacked chip, character by character
// (STACKED_CHIPS: Galvanic Nanochip on Fighting, Eli: best AFK fighting chip after black/orange, worth more than
// one Conductive Software + Poker Chip). quotas = { [characterIndex]: copies }; `available` loses them.
function getStackQuotas(characters, roleOf, available, fixed, stack) {
  const held = character => character.slots.filter(index => index === stack.chipIndex).length
  const quotas = {}
  characters
    .filter(character => stack.roles.includes(roleOf(character)))
    .sort((a, b) => stack.roles.indexOf(roleOf(a)) - stack.roles.indexOf(roleOf(b)) || held(b) - held(a) || a.index - b.index)
    .forEach(character => {
      const used = Object.values(fixed[character.index] ?? {}).reduce((sum, count) => sum + count, 0)
      const take = Math.max(0, Math.min(available[stack.chipIndex] ?? 0, character.unlocked - used))
      quotas[character.index] = take
      available[stack.chipIndex] = (available[stack.chipIndex] ?? 0) - take
    })
  return quotas
}

// Min-cost flow for every chip not already placed. fixed = { [characterIndex]: { [chipIndex]: count } }.
// Returns planned counts per character (fixed + flow).
function planRest(snapshot, characters, roleOf, available, fixed, skip) {
  const chips = CHIP_IDS.map(id => labChipMap[id])
  const source = 0
  const chipNode = c => 1 + c
  const characterNode = i => 1 + chips.length + i
  const sink = 1 + chips.length + characters.length
  const graph = createGraph(sink + 1)
  const placements = []

  chips.forEach((chip, c) => {
    if ((available[chip.index] ?? 0) > 0) addEdge(graph, source, chipNode(c), available[chip.index], 0)
  })
  characters.forEach(character => {
    const role = roleOf(character)
    const already = fixed[character.index] ?? {}
    const free = character.unlocked - Object.values(already).reduce((sum, count) => sum + count, 0)
    if (free <= 0) return
    addEdge(graph, characterNode(character.index), sink, free, 0)
    const current = countChips(character.slots)
    chips.forEach((chip, c) => {
      if (!available[chip.index] || skip(chip)) return
      const start = already[chip.index] ?? 0
      const copies = chip.onePerPlayer ? 1 : character.unlocked
      for (let copy = start; copy < copies; copy++) {
        const value = getChipValue(snapshot, character.index, role, chip, copy)
        if (value <= 0) break
        const keep = copy < (current[chip.index] ?? 0) ? CHIP_KEEP_BONUS : 0
        const edge = addEdge(graph, chipNode(c), characterNode(character.index), 1, -(value + keep))
        placements.push({
          edge,
          character: character.index,
          chipIndex: chip.index,
        })
      }
    })
  })

  runMinCostFlow(graph, source, sink)

  const planned = characters.map(character => ({ ...(fixed[character.index] ?? {}) }))
  placements.forEach(({ edge, character, chipIndex }) => {
    if (graph.edges[edge].flow > 0) planned[character][chipIndex] = (planned[character][chipIndex] ?? 0) + 1
  })
  return planned
}

// A character on a stacking role whose plan has a slot without one of its own role's chips (empty or a
// fallback chip from the other side)
function hasOffRoleSlot(snapshot, character, role, counts) {
  let used = 0
  const offRole = Object.entries(counts).some(([index, count]) => {
    used += count
    const chip = chipAt(Number(index))
    return getChipValue(snapshot, character.index, role, chip, 0) > 0 && getRoleValue(chip, role) <= 0
  })
  return offRole || used < character.unlocked
}

// Black/orange stack, then each STACKED_CHIPS stack, then the flow for the rest. A stack gives way when it
// leaves another character on that role short of its own role's chips (Eli: spread them out when there
// aren't enough fighting chips to go round): one copy at a time moves from the biggest stack to that
// character until nobody is short or the stacks are even.
function planWithStacks(snapshot, characters, roleOf, owned) {
  const available = { ...owned }
  const doublers = stackDoublers(snapshot, characters, roleOf, available)
  const fixed = Object.fromEntries(characters.map(character => [character.index, { ...(doublers[character.index] ?? {}) }]))
  const stacks = STACKED_CHIPS.map(stack => ({
    ...stack,
    chipIndex: labChipMap[stack.chip]?.index,
  })).filter(stack => stack.chipIndex !== undefined)
  const quotas = stacks.map(stack => getStackQuotas(characters, roleOf, available, fixed, stack))
  const isStacked = chip => isDoubler(chip) || stacks.some(stack => stack.chipIndex === chip.index)

  const build = () => {
    const withStacks = Object.fromEntries(characters.map(character => {
      const counts = { ...fixed[character.index] }
      stacks.forEach((stack, k) => {
        const copies = quotas[k][character.index] ?? 0
        if (copies > 0) counts[stack.chipIndex] = copies
      })
      return [character.index, counts]
    }))
    const rest = { ...available }
    stacks.forEach(stack => {
      rest[stack.chipIndex] = available[stack.chipIndex]
    })
    // Leftover stacked copies (more than the stacking roles can hold) go through the flow like any chip
    return planRest(snapshot, characters, roleOf, rest, withStacks, chip => isDoubler(chip) || (isStacked(chip) && !(rest[chip.index] > 0)))
  }

  let planned = build()
  for (let guard = 0; guard < 100; guard++) {
    let moved = false
    stacks.forEach((stack, k) => {
      if (moved) return
      const members = characters.filter(character => stack.roles.includes(roleOf(character)))
      const quota = character => quotas[k][character.index] ?? 0
      const donor = [...members].sort((a, b) => quota(b) - quota(a))[0]
      const short = members
        .filter(character => hasOffRoleSlot(snapshot, character, roleOf(character), planned[character.index]))
        .sort((a, b) => quota(a) - quota(b))[0]
      if (!donor || !short || quota(donor) <= quota(short) + 1) return
      quotas[k][donor.index] -= 1
      quotas[k][short.index] = quota(short) + 1
      moved = true
    })
    if (!moved) break
    planned = build()
  }
  return planned
}

// roles = { [characterIndex]: role id }. Returns the planned console, per character changes,
// storage after the plan, and the total score (sum of chip values) before and after.
export function getConsolePlan(snapshot, roles) {
  const state = getConsoleState(snapshot)
  const characters = state.characters
  const roleOf = character => {
    const role = roles?.[character.index]
    return isConsoleRole(role) ? role : getDefaultConsoleRole(snapshot?.characters?.[character.index])
  }

  const owned = {}
  state.storage.forEach(({ chip, owned: count }) => {
    owned[chip.index] = count
  })
  const plannedCounts = planWithStacks(snapshot, characters, roleOf, owned)

  const scoreOf = (character, slots) => {
    const role = roleOf(character)
    const seen = {}
    return slots.reduce((sum, index) => {
      if (index < 0) return sum
      const copy = seen[index] ?? 0
      seen[index] = copy + 1
      return sum + getChipValue(snapshot, character.index, role, chipAt(index), copy)
    }, 0)
  }

  const plannedCharacters = characters.map(character => {
    const role = roleOf(character)
    const slots = arrangeSlots(character.unlocked, plannedCounts[character.index])
    const { added, removed } = diffCounts(countChips(character.slots), countChips(slots))
    return {
      ...character,
      role,
      currentSlots: character.slots,
      slots,
      added,
      removed,
      currentScore: scoreOf(character, character.slots),
      plannedScore: scoreOf(character, slots),
    }
  })

  const plannedEquipped = countChips(plannedCharacters.flatMap(character => character.slots))
  const storage = state.storage.map(entry => ({
    ...entry,
    equipped: plannedEquipped[entry.chip.index] ?? 0,
    stored: Math.max(0, entry.owned - (plannedEquipped[entry.chip.index] ?? 0)),
  }))

  return {
    characters: plannedCharacters,
    storage,
    moves: plannedCharacters.reduce((sum, character) => sum + character.added.length, 0),
    currentScore: plannedCharacters.reduce((sum, character) => sum + character.currentScore, 0),
    plannedScore: plannedCharacters.reduce((sum, character) => sum + character.plannedScore, 0),
  }
}
