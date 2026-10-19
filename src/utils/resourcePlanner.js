// ============================================================
// ROYAL GUARDIAN RESOURCE PLANNER
// 1. Stockpile and daily income per resource.
// 2. Best-in-slot overnight setup: which Resource Depot should be connected to which node
//    so the biggest nodes (raw amount) are the ones being collected while you're away.
// Collection speed isn't modelled: it depends on bonuses from other systems, and every node
// in the save is drained each day anyway, so only reach and node size matter.
// ============================================================

import { ROYAL_NODES, OUTPOST_MAP_POSITIONS, MAP_ANCHOR, NODE_ANCHOR, REACH_SLACK, NODES_PER_WORLD, nodeCapacity } from '../data/royalResources'

const RESOURCE_DEPOT = 0
// The save has two connection fields per outpost, but no depot in a real save uses the second,
// so each Resource Depot is planned with one node
const CONNECTION_SLOTS = 1
const MAX_NODE_LINK = 999
const UNIT_GUARD = 2
const UNIT_DIGIT_OFFSET = 2
const MAX_UNIT_SLOTS = 6

const ARMORY_GREAT_GUARDS = 21 // +5px per Guard per level, on top of 25px
const ARMORY_MILITARY_RANK = 74 // +2px per Military rank per level
const ARMORY_RESOURCE_REPLENISH = 70 // drained nodes refill every day
const ORBLET_LONG_RANGE = 8 // +1px per level

// game: OutpostRange
function outpostRange(rg, outpost) {
  const armory = id => rg?.armory?.[id] ?? 0
  const logistics = outpost.upgrades[1]
  const commandRank = outpost.ranks[2].rank
  const militaryRank = outpost.ranks[3].rank
  const raw = (rg?.outposts ?? []).find(o => o.mapIndex === outpost.mapIndex)
  const slots = Math.min(MAX_UNIT_SLOTS, 1 + outpost.upgrades[0])
  const slotGuards = [...(raw?.units ?? '').slice(0, slots)]
    .filter(c => Number(c) - UNIT_DIGIT_OFFSET === UNIT_GUARD).length
  const guards = slotGuards + Math.ceil(Math.max(0, commandRank - UNIT_GUARD) / 4)
  const range = 80
    + (rg?.orbletLevels?.[ORBLET_LONG_RANGE] ?? 0)
    + 250 * (logistics / (logistics + 100))
    + (25 + 5 * armory(ARMORY_GREAT_GUARDS)) * guards
    + militaryRank * 2 * armory(ARMORY_MILITARY_RANK)
  return Math.floor(Math.min(999, range))
}

function canReach(mapIndex, range, node) {
  const pos = OUTPOST_MAP_POSITIONS[mapIndex]
  if (!pos) return false
  const dx = pos[0] + MAP_ANCHOR[0] - (node.x + NODE_ANCHOR[0])
  const dy = pos[1] + MAP_ANCHOR[1] - (node.y + NODE_ANCHOR[1])
  return range + REACH_SLACK >= Math.sqrt(dx * dx + dy * dy)
}

// Every node in the save with its capacity and current connections
function readNodes(rg, outposts) {
  const linkedBy = new Map()
  ;(rg?.outposts ?? []).forEach(o => {
    if (o.mode !== RESOURCE_DEPOT) return
    o.links.filter(v => v >= 0 && v <= MAX_NODE_LINK).forEach(v => {
      linkedBy.set(v, [...(linkedBy.get(v) ?? []), o.mapIndex])
    })
  })
  const built = new Set(outposts.map(o => o.mapIndex))
  return ROYAL_NODES.map(node => {
    const level = rg?.nodeLevels?.[node.index] ?? 0
    return {
      ...node,
      world: 1 + Math.floor(node.index / NODES_PER_WORLD),
      level,
      capacity: nodeCapacity(node, level),
      drained: (rg?.nodeCollected?.[node.index] ?? 0) < 0,
      linkedBy: (linkedBy.get(node.index) ?? []).filter(m => built.has(m)),
    }
  })
}

// Stored amount and the most each resource can bring in per day (every node of it drained once)
export function getResourceTotals(rg, outposts) {
  const nodes = readNodes(rg, outposts)
  const byResource = new Map()
  nodes.forEach(node => {
    const entry = byResource.get(node.resource) ?? { resource: node.resource, world: node.world, perDay: 0, nodes: 0 }
    entry.perDay += node.capacity
    entry.nodes += 1
    byResource.set(node.resource, entry)
  })
  return [...byResource.values()]
    .map(r => ({ ...r, stored: rg?.resourceStorage?.[r.resource] ?? 0 }))
    .sort((a, b) => a.resource - b.resource)
}

// Best-in-slot overnight connections for one world.
// Every node is worth only its own capacity, so this is a transversal matroid: taking nodes
// biggest-first and keeping each one that can still be fitted (via an augmenting path) picks
// the best SET of nodes. Many layouts collect that same set, so a second pass starts from
// your current connections and only moves what it has to.
function bestInSlot(nodes, depots) {
  const slots = depots.flatMap(d => Array.from({ length: CONNECTION_SLOTS }, (_, i) => ({ depot: d, i })))

  function matcher() {
    const nodeInSlot = new Array(slots.length).fill(null)
    function tryAssign(node, visited) {
      for (let s = 0; s < slots.length; s++) {
        if (visited.has(s) || !slots[s].depot.reach.has(node.index)) continue
        visited.add(s)
        const occupant = nodeInSlot[s]
        if (occupant === null || tryAssign(occupant, visited)) {
          nodeInSlot[s] = node
          return true
        }
      }
      return false
    }
    return { nodeInSlot, tryAssign }
  }

  // Pass 1: which nodes make the cut (a failed search changes nothing, so misses are skipped)
  const pick = matcher()
  ;[...nodes].sort((a, b) => b.capacity - a.capacity).forEach(node => pick.tryAssign(node, new Set()))
  const chosen = new Set(pick.nodeInSlot.filter(Boolean).map(n => n.index))

  // Pass 2: place the chosen nodes with as few changes as possible.
  // Cost 0 = keep a current connection, 1 = new connection (Hungarian algorithm, rows = nodes).
  const rows = nodes.filter(n => chosen.has(n.index))
  const cost = rows.map(node => slots.map(slot => {
    if (!slot.depot.reach.has(node.index)) return Infinity
    return slot.depot.current.includes(node.index) ? 0 : 1
  }))
  const assignment = hungarian(cost)
  const nodeInSlot = new Array(slots.length).fill(null)
  assignment.forEach((s, r) => { if (s >= 0) nodeInSlot[s] = rows[r] })

  const byDepot = new Map(depots.map(d => [d.mapIndex, []]))
  nodeInSlot.forEach((node, s) => {
    if (node) byDepot.get(slots[s].depot.mapIndex).push(node)
  })
  return byDepot
}

// Min-cost assignment of every row to a distinct column (rows <= columns).
// Returns the column for each row, or -1 if a row can't be placed.
function hungarian(cost) {
  const n = cost.length
  const m = n ? cost[0].length : 0
  if (n === 0 || m < n) return cost.map(() => -1)
  const BIG = 1e9
  const c = (i, j) => (Number.isFinite(cost[i][j]) ? cost[i][j] : BIG)
  const u = new Array(n + 1).fill(0)
  const v = new Array(m + 1).fill(0)
  const p = new Array(m + 1).fill(0) // p[j] = row matched to column j (1-based)
  const way = new Array(m + 1).fill(0)
  for (let i = 1; i <= n; i++) {
    p[0] = i
    let j0 = 0
    const minv = new Array(m + 1).fill(Infinity)
    const used = new Array(m + 1).fill(false)
    do {
      used[j0] = true
      const i0 = p[j0]
      let delta = Infinity
      let j1 = 0
      for (let j = 1; j <= m; j++) {
        if (used[j]) continue
        const cur = c(i0 - 1, j - 1) - u[i0] - v[j]
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0 }
        if (minv[j] < delta) { delta = minv[j]; j1 = j }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta } else { minv[j] -= delta }
      }
      j0 = j1
    } while (p[j0] !== 0)
    do {
      const j1 = way[j0]
      p[j0] = p[j1]
      j0 = j1
    } while (j0)
  }
  const result = new Array(n).fill(-1)
  for (let j = 1; j <= m; j++) {
    if (p[j] > 0 && Number.isFinite(cost[p[j] - 1][j - 1])) result[p[j] - 1] = j - 1
  }
  return result
}

// Everything the Resources section shows for the BiS setup, per world
export function planOvernightSetup(rg, outposts) {
  const nodes = readNodes(rg, outposts)
  const restock = (rg?.armory?.[ARMORY_RESOURCE_REPLENISH] ?? 0) >= 1
  const worlds = [...new Set(outposts.map(o => o.world))].sort((a, b) => a - b)

  return {
    restock,
    worlds: worlds.map(world => {
      const worldNodes = nodes.filter(n => n.world === world)
      const depots = outposts
        .filter(o => o.world === world && o.mode === RESOURCE_DEPOT)
        .map(o => {
          const range = outpostRange(rg, o)
          const raw = (rg?.outposts ?? []).find(r => r.mapIndex === o.mapIndex)
          const current = (raw?.links ?? []).filter(v => v >= 0 && v <= MAX_NODE_LINK)
          // Anything it's connected to now is in reach by definition
          const reach = new Set(worldNodes
            .filter(n => current.includes(n.index) || canReach(o.mapIndex, range, n))
            .map(n => n.index))
          return { mapIndex: o.mapIndex, name: o.name, range, reach, current }
        })

      const bis = bestInSlot(worldNodes, depots)
      const nodeByIndex = new Map(worldNodes.map(n => [n.index, n]))
      const rows = depots.map(d => {
        const target = bis.get(d.mapIndex) ?? []
        const currentNodes = d.current.map(i => nodeByIndex.get(i)).filter(Boolean)
        return {
          mapIndex: d.mapIndex,
          name: d.name,
          target: target.map(n => ({ ...n, alreadyLinked: d.current.includes(n.index) })),
          current: currentNodes,
          // Only a depot that needs a NEW connection counts; one with nothing assigned can stay as it is
          changed: target.some(n => !d.current.includes(n.index)),
          spare: target.length === 0,
        }
      })

      const bisTotal = rows.reduce((sum, r) => sum + r.target.reduce((s, n) => s + n.capacity, 0), 0)
      const currentIds = new Set(rows.flatMap(r => r.current.map(n => n.index)))
      const currentTotal = [...currentIds].reduce((sum, i) => sum + (nodeByIndex.get(i)?.capacity ?? 0), 0)
      const reachable = new Set(depots.flatMap(d => [...d.reach]))
      return {
        world,
        rows,
        bisTotal,
        currentTotal,
        allTotal: worldNodes.reduce((sum, n) => sum + n.capacity, 0),
        changes: rows.filter(r => r.changed).length,
        unreachable: worldNodes.filter(n => !reachable.has(n.index)),
      }
    }),
  }
}

// 1,234 / 12.3K / 4.5M / 6.7B / 8.9T / 1.2Q (quadrillion) / 3.4QQ (quintillion)
export function formatBig(n) {
  const units = [[1e18, 'QQ'], [1e15, 'Q'], [1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e4, 'K']]
  for (const [size, suffix] of units) {
    if (n >= size) {
      const v = n / size
      return `${v >= 100 ? Math.round(v) : v.toFixed(v >= 10 ? 1 : 2)}${suffix}`
    }
  }
  return Math.floor(n).toLocaleString()
}
