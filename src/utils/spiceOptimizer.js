// Spice Optimizer: models territory foraging and finds the best formation of gene types per spice.
//
// Model (matches the game's TotalTrekkingHR / TotalTrekkingREQ, checked against real saves):
//   - Forage speed per hour = sum of each foraging pet's power (with gene multipliers) x team multipliers.
//   - Fill n of a run needs (powerReq + n) x growth^n progress, growth = 1 + 0.02 / (Monolithics / 5 + 1).
//   - Every fill banks 1 + 0.5 x Alchemics spices.
//   - Claiming resets the run unless the team has a Converter (50% chance to keep it and its spices, so the
//     same batch can be claimed again; extras don't stack).
// Each territory gets the formation that makes it the most spice; neighbour effects (Borger, Targeter,
// Badumdum) are weighed so every spice counts the same.

import { TERRITORY_POWER_REQ, FORAGE_GENE_IDS, COMBAT_GENE_IDS, GENE } from '../data/breedingMap'

const FORAGE = new Set(FORAGE_GENE_IDS)
const COMBAT = new Set(COMBAT_GENE_IDS)
const TEAM_SIZE = 4
const BASE_GROWTH = 0.02
const CONVERTER_KEEP_CHANCE = 0.5
const MAX_FILLS = 20000

// ============================================================
// FORAGE MODEL
// ============================================================

const countGene = (pets, geneId) => pets.filter(pet => pet?.geneId === geneId).length

// team / prev / next are positional arrays of { geneId, power } or null (prev = territory above)
export function forageSpeed(team, prev = [], next = []) {
  const members = team.filter(Boolean)
  if (!members.length) return 0

  const prevHasForager = countGene(prev, GENE.FORAGER) > 0
  const maxPower = Math.max(...members.map(pet => pet.power))

  const base = team.reduce((sum, pet, slot) => {
    if (!pet || !FORAGE.has(pet.geneId)) return sum
    switch (pet.geneId) {
      case GENE.FORAGER:
        return sum + 2 * pet.power
      case GENE.TARGETER:
        return sum + (prev[slot]?.geneId === GENE.TARGETER ? 5 : 1) * pet.power
      case GENE.OPTICULAR:
        return sum + (pet.power >= maxPower ? 3 : 1) * pet.power
      case GENE.BORGER:
        return sum + (prevHasForager ? 10 : 1) * pet.power
      default:
        return sum + pet.power
    }
  }, 0)

  const geneIds = members.map(pet => pet.geneId)
  const hasCombat = members.some(pet => COMBAT.has(pet.geneId))
  const miasma = countGene(members, GENE.MIASMA) > 0 && new Set(geneIds).size === geneIds.length ? 4 : 1
  const badumdums = countGene(members, GENE.BADUMDUM) + countGene(prev, GENE.BADUMDUM) + countGene(next, GENE.BADUMDUM)
  const mixGene = hasCombat ? GENE.FASTIDIOUS : GENE.FLASHY

  return base
    * Math.pow(1.3, countGene(members, GENE.FLEETER))
    * Math.pow(1.2, badumdums)
    * Math.pow(1.5, countGene(members, mixGene))
    * miasma
}

// Cumulative progress needed for n fills, cached per territory + Monolithic count
const fillCurves = new Map()

function fillsFromProgress(row, monolithics, progress) {
  const key = `${row}|${monolithics}`
  let curve = fillCurves.get(key)
  if (!curve) {
    curve = {
      growth: 1 + BASE_GROWTH / (monolithics / 5 + 1),
      powerReq: TERRITORY_POWER_REQ[row] ?? TERRITORY_POWER_REQ[TERRITORY_POWER_REQ.length - 1],
      cumulative: [0],
    }
    fillCurves.set(key, curve)
  }
  const { growth, powerReq, cumulative } = curve
  const requirement = n => (powerReq + n) * Math.pow(growth, n)

  while (cumulative[cumulative.length - 1] <= progress && cumulative.length < MAX_FILLS) {
    const n = cumulative.length - 1
    cumulative.push(cumulative[n] + requirement(n))
  }

  // Largest n with cumulative[n] <= progress, plus how far into the next fill we are
  let low = 0
  let high = cumulative.length - 1
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (cumulative[mid] <= progress) low = mid
    else high = mid - 1
  }
  return low + (progress - cumulative[low]) / requirement(low)
}

// Average spices a territory makes per day when you claim every claimHours.
// A claim normally resets the run. With a Converter it has a 50% chance not to, and the spices stay
// waiting (seen in real saves), so you can claim the same batch again right away: on average each batch
// is collected 1 / (1 - 0.5) = 2 times before the run resets.
export function expectedSpicesPerDay(row, team, prev, next, claimHours) {
  const speed = forageSpeed(team, prev, next)
  if (!speed) return 0

  const members = team.filter(Boolean)
  const spicesPerFill = 1 + 0.5 * countGene(members, GENE.ALCHEMIC)
  const monolithics = countGene(members, GENE.MONOLITHIC)
  const batch = spicesPerFill * fillsFromProgress(row, monolithics, speed * claimHours)
  const claimsPerBatch = countGene(members, GENE.CONVERTER) ? 1 / (1 - CONVERTER_KEEP_CHANCE) : 1

  return batch * claimsPerBatch * (24 / claimHours)
}

// ============================================================
// SEARCH
// ============================================================

// Genes that only add their own power while foraging. One stands in for all of them, since swapping
// one for another changes nothing (Fastidious too: recommended teams have no combat pets).
const SPECIAL_GENES = new Set([
  GENE.FORAGER,
  GENE.FLEETER,
  GENE.FLASHY,
  GENE.OPTICULAR,
  GENE.MONOLITHIC,
  GENE.ALCHEMIC,
  GENE.BADUMDUM,
  GENE.TARGETER,
  GENE.MIASMA,
  GENE.CONVERTER,
  GENE.BORGER,
])
const EMPTY = -1
const MAX_SWEEPS = 25

// Targeters go first so they line up under the Targeters of the territory above
const canonical = genes => [...genes].sort((a, b) =>
  (a === GENE.TARGETER ? -1 : 0) - (b === GENE.TARGETER ? -1 : 0) || a - b)

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

// Every team of up to 4 from the given genes (order doesn't matter, empty slots allowed)
function allFormations(options) {
  const picks = [...options, EMPTY]
  const formations = []
  const build = (start, team) => {
    if (team.length === TEAM_SIZE) {
      formations.push(canonical(team.filter(id => id !== EMPTY)))
      return
    }
    for (let i = start; i < picks.length; i++) build(i, [...team, picks[i]])
  }
  build(0, [])
  return formations.filter(team => team.length)
}

// Finds the best formation of gene types for every unlocked territory. Only gene types the account owns
// can be used, but how many of each it owns doesn't matter, and every pet counts as the account's typical
// power, so the answer is about which types to run, not which exact pets.
export function optimizeFormations({ territories, ownedPets, claimHours }) {
  const rowCount = territories?.length ?? 0
  const isOpen = row => territories[row].unlocked !== false
  const openRows = territories.map((_, row) => row).filter(isOpen)
  const foragers = (ownedPets ?? []).filter(pet => FORAGE.has(pet.geneId))
  if (!openRows.length || !foragers.length) return null

  const typicalPower = median(foragers.map(pet => pet.power))
  const ownedGenes = new Set(foragers.map(pet => pet.geneId))
  const plainGene = [...ownedGenes].find(id => !SPECIAL_GENES.has(id))
  const options = [...ownedGenes].filter(id => SPECIAL_GENES.has(id))
  if (plainGene !== undefined) options.push(plainGene)
  const formations = allFormations(options)

  const toTeam = genes => genes.map(geneId => ({ geneId, power: typicalPower }))
  const valueCache = new Map()
  const valueOf = (plan, row) => {
    if (!isOpen(row)) return 0
    const genes = plan[row]
    const prev = plan[row - 1] ?? []
    const next = plan[row + 1] ?? []
    const key = `${row}|${genes}|${prev}|${countGene(next.map(geneId => ({ geneId })), GENE.BADUMDUM)}`
    if (!valueCache.has(key)) {
      valueCache.set(key, expectedSpicesPerDay(row, toTeam(genes), toTeam(prev), toTeam(next), claimHours))
    }
    return valueCache.get(key)
  }

  // Each spice counts the same: a formation is judged by the sum of log spices, so helping one territory
  // (a Forager for the Borger below, a Badumdum for its neighbours) has to pay for what it costs its own.
  const floor = 1e-6
  const neighbourhoodScore = (plan, row) => [row - 1, row, row + 1]
    .filter(r => r >= 0 && r < rowCount && isOpen(r))
    .reduce((sum, r) => sum + Math.log(valueOf(plan, r) + floor), 0)

  // Coordinate ascent: give each territory its best formation given its neighbours, repeat until stable
  const climb = start => {
    const plan = start.map(genes => [...genes])
    for (let sweep = 0; sweep < MAX_SWEEPS; sweep++) {
      let changed = false
      openRows.forEach(row => {
        let best = plan[row]
        let bestScore = neighbourhoodScore(plan, row)
        formations.forEach(genes => {
          plan[row] = genes
          const score = neighbourhoodScore(plan, row)
          if (score > bestScore + 1e-9) {
            best = genes
            bestScore = score
          }
        })
        if (plan[row] !== best) changed = changed || best.join() !== plan[row].join()
        plan[row] = best
      })
      if (!changed) break
    }
    return plan
  }
  const totalScore = plan => openRows.reduce((sum, row) => sum + Math.log(valueOf(plan, row) + floor), 0)

  // Current teams keep their combat pets, since those switch Flashy off and Fastidious on
  const currentGenes = territories.map(t => (t.unlocked === false ? [] : canonical(
    (t.team ?? []).filter(Boolean).map(pet => pet.geneId))))
  // Start from the current layout and from empty territories, keep whichever ends higher
  const plans = [
    climb(currentGenes),
    climb(territories.map(() => [])),
  ]
  const plan = plans.reduce((best, p) => (totalScore(p) > totalScore(best) ? p : best))

  const rows = openRows.map(row => {
    const current = valueOf(currentGenes, row)
    const recommended = valueOf(plan, row)
    return {
      row,
      currentTeam: (territories[row].team ?? []).map(pet => pet?.geneId ?? null),
      recommendedGenes: plan[row],
      current,
      recommended,
      change: current > 0 ? recommended / current - 1 : null,
      changed: plan[row].join() !== currentGenes[row].join(),
    }
  })

  const overall = Math.exp(rows.reduce((sum, r) =>
    sum + Math.log(r.recommended + floor) - Math.log(r.current + floor), 0) / rows.length) - 1

  return {
    rows,
    overall,
    typicalPower,
    changedCount: rows.filter(r => r.changed).length,
  }
}
