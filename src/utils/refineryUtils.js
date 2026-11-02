import {
  refinerySalts,
  REFINERY_BASE_CYCLE_SECONDS,
  REFINERY_SPEED_SOURCES,
  REFINERY_POWER_CAPS,
  REFINERY_SALT_COMPANION,
} from '../data/refineryMap'
import { getVialBonusByStat } from './alchemyUtils'
import { getStampBonusByEffect } from './stampUtils'
import { getShinyPassiveTotal } from './breedingUtils'
import { getArcadeBonus } from './arcadeUtils'
import { getAccountFamilyBonuses } from './talentUtils'
import { getResearchGridBonus } from './researchUtils'
import { getMealBonusByStat } from './cookingUtils'
import { getLegendTalentBonus, getLegendTalentLevel } from './legendTalentUtils'
import { getAssumedLabBonus, LAB_BONUSES } from './labUtils'
import { getArtifactBonus } from './sailingUtils'
import { isBallotBonusSelected, isMeritocracyBonusSelected } from './voteUtils'
import { getPrintedPerHour } from './printerUtils'
import { getCompanionBonus } from './companionUtils'

// Refinery (W3), ported from IdleonToolbox parsers/world-3/refinery.ts (getRefineryCycleBonuses,
// computeRefineryCycleTimes, calcCost, getSaltsBalance).

const SRC = REFINERY_SPEED_SOURCES
const CHILLED_YARN_MERITOCRACY = 21

// Pipe Gauge sigil: tier bonus × Chilled Yarn artifact (sigils are boosted by it)
function getPipeGaugeBonus(snapshot) {
  const tier = snapshot?.refinery?.sigilTiers?.[SRC.pipeGaugeSigil] ?? -1
  const base = tier >= 0 ? SRC.pipeGaugeTiers[tier] ?? 0 : 0
  return base * (1 + getArtifactBonus(snapshot?.sailing, 'Chilled Yarn'))
}

// Construction mastery tier 1: floor(total building levels / 10) once the rift reaches 40
function getConstructMasteryBonus(snapshot) {
  if ((snapshot?.rift?.level ?? 0) < SRC.constructMasteryRift) return 0
  const total = (snapshot?.towerLevels ?? []).reduce((sum, level) => sum + level, 0)
  return Math.floor(total / 10)
}

// Every % refinery speed source (added together), the 3x lab node, the legend talent and the
// polymerize-only bonuses. Returns the three cycle times in seconds plus a breakdown.
export function getRefineryCycleTimes(snapshot) {
  const lickLevel = Math.min(snapshot?.refinery?.saltLickLevels?.[SRC.saltLickUpgrade] ?? 0, SRC.saltLickMaxLevel)
  const vial = getVialBonusByStat(snapshot, 'RefSpd')
  const lab = getAssumedLabBonus(LAB_BONUSES.gildedCyclicalTubing)
  const meal = getMealBonusByStat(snapshot, 'PolyRefSpd')
  const voteWins = isBallotBonusSelected(snapshot?.voteBallot, SRC.voteBonus)
  const yarnMeritocracy = isMeritocracyBonusSelected(snapshot?.voteBallot, CHILLED_YARN_MERITOCRACY)

  const speedSources = [
    { name: 'Red Malt (vial)', value: vial.value },
    { name: 'Salt Lick', value: SRC.saltLickPerLevel * lickLevel },
    { name: 'Family (Divine Knight)', value: getAccountFamilyBonuses(snapshot)['Divine Knight'] ?? 0 },
    { name: 'Pipe Gauge (sigil)', value: getPipeGaugeBonus(snapshot), partial: yarnMeritocracy },
    { name: 'Stamps', value: getStampBonusByEffect(snapshot, '+{% Faster refinery cycles').value },
    { name: 'Shinies', value: getShinyPassiveTotal(snapshot?.breeding, '+{%_Faster_Refinery_Speed') },
    { name: 'Construction mastery', value: getConstructMasteryBonus(snapshot) },
    { name: 'Arcade', value: getArcadeBonus(snapshot, 'Refinery Speed') },
    { name: 'Vote', value: 0, partial: voteWins },
    { name: 'Polymer Refinery (research)', value: getResearchGridBonus(snapshot, SRC.researchGridSpeed) },
  ]
  const speed = speedSources.reduce((sum, source) => sum + (Number(source.value) || 0), 0)
  const legendLevel = getLegendTalentLevel(snapshot?.legendTalents, SRC.legendTalent)
  const legend = getLegendTalentBonus(SRC.legendTalent, legendLevel)
  const polymerBonus = meal.value + getResearchGridBonus(snapshot, SRC.researchGridPolymer)
  const factor = (1 + speed / 100) * lab.value * (1 + legend / 100)
  return {
    speed,
    speedSources,
    labMulti: lab.value,
    legend,
    polymerBonus,
    partial: speedSources.some(source => source.partial),
    combustion: REFINERY_BASE_CYCLE_SECONDS.combustion / factor,
    synthesis: REFINERY_BASE_CYCLE_SECONDS.synthesis / factor,
    polymerize: REFINERY_BASE_CYCLE_SECONDS.polymerize / (factor * (1 + polymerBonus / 100)),
  }
}

// Hours as a short duration ('5.2 h', '3.1 days', '2.0 years', 'forever')
export function formatRefineryHours(hours) {
  if (!isFinite(hours)) return 'forever'
  if (hours < 48) return `${hours.toFixed(1)} h`
  if (hours < 24 * 365) return `${(hours / 24).toFixed(1)} days`
  return `${(hours / 24 / 365).toFixed(1)} years`
}

// The game rounds cycle times up (CycleInitialTime): salts 1-3 combustion, 4-6 synthesis, then polymerize
export function getSaltCycleSeconds(index, cycleTimes) {
  const time = index <= 2 ? cycleTimes.combustion : index <= 5 ? cycleTimes.synthesis : cycleTimes.polymerize
  return Math.ceil(time)
}

// Cost per cycle of one input: floor(rank ^ 1.5) × quantity; salt inputs use ^1.3 once the
// salt's index is within the Refinery task level
export function getSaltInputCost(rank, quantity, item, saltIndex, saltTaskLevel) {
  const isSalt = item.startsWith('Refinery')
  const power = isSalt && saltIndex <= saltTaskLevel ? 1.3 : 1.5
  return Math.floor(Math.pow(rank, power)) * quantity
}

// Every non-salt material each active salt eats, per hour at its current rank, next to what the
// printer makes of it. status: 'ok' (printing enough), 'short' (printing, not enough),
// 'notPrinting' (printable but no one prints it), 'unprintable' (souls, critters, bars).
export function getRefineryMaterialNeeds(snapshot) {
  const refinery = snapshot?.refinery
  if (!refinery?.salts) return null
  const cycleTimes = getRefineryCycleTimes(snapshot)
  const printed = getPrintedPerHour(snapshot)
  const storage = snapshot?.storage?.items ?? {}
  const salts = refinerySalts.map((salt, index) => {
    const state = refinery.salts[index] ?? { unlocked: false, rank: 0, active: false }
    const cycleSeconds = getSaltCycleSeconds(index, cycleTimes)
    const running = state.unlocked && state.active && state.rank > 0
    const materials = salt.cost
      .filter(({ item }) => !item.startsWith('Refinery'))
      .map(({ item, quantity, printable, skill }) => {
        const perCycle = getSaltInputCost(state.rank, quantity, item, index, refinery.saltTaskLevel)
        const neededPerHour = running ? perCycle * 3600 / cycleSeconds : 0
        const printedPerHour = printed[item] ?? 0
        const status = !running ? 'idle'
          : !printable ? 'unprintable'
          : printedPerHour <= 0 ? 'notPrinting'
            : printedPerHour >= neededPerHour ? 'ok' : 'short'
        return {
          item,
          quantity,
          printable,
          skill,
          perCycle,
          neededPerHour,
          printedPerHour,
          stored: storage[item] ?? 0,
          status,
        }
      })
    return {
      ...salt,
      index,
      ...state,
      running,
      cycleSeconds,
      materials,
    }
  })
  return {
    cycleTimes,
    saltTaskLevel: refinery.saltTaskLevel,
    salts,
  }
}

// Printer > Salt Materials tab: every printable material a running salt uses, in salt order (an item
// two salts share is listed under the first and its need summed), with who prints it and how long
// storage lasts at the current shortfall
export function getRefineryPrintList(snapshot) {
  const needs = getRefineryMaterialNeeds(snapshot)
  if (!needs) return null
  const list = []
  for (const salt of needs.salts) {
    if (!salt.running) continue
    for (const material of salt.materials) {
      if (!material.printable) continue
      const existing = list.find(entry => entry.item === material.item)
      if (existing) {
        existing.neededPerHour += material.neededPerHour
        existing.salts.push(salt.name)
      } else {
        list.push({
          item: material.item,
          skill: material.skill,
          neededPerHour: material.neededPerHour,
          printedPerHour: material.printedPerHour,
          stored: material.stored,
          saltIndex: salt.index,
          saltRawName: salt.rawName,
          salts: [salt.name],
        })
      }
    }
  }
  const characters = snapshot?.characters ?? []
  for (const entry of list) {
    entry.status = entry.printedPerHour <= 0 ? 'notPrinting'
      : entry.printedPerHour >= entry.neededPerHour ? 'ok' : 'short'
    entry.hoursLeft = entry.stored / Math.max(entry.neededPerHour - entry.printedPerHour, 1e-9)
    entry.printers = (snapshot?.printer?.characters ?? [])
      .map((printer, index) => (printer.printing ?? []).some(sample => sample?.item === entry.item) ? characters[index]?.name : null)
      .filter(Boolean)
  }
  return list
}

// ── Rank planner ─────────────────────────────────────────────────────────────
// Each salt is made from the one before it, and its cost of that salt grows with its own rank, so ranking a
// salt too far drains its feeder faster than the feeder makes it (Toolbox getSaltsBalance). Rank ups are
// manual once the bar is full, so the plan is: which full bars are safe to rank, and how high each salt can go.

// Salt (and power) made per cycle: floor(min(250k, rank ^ 1.3 × Panda multi)), game "PowerPerCycle"
export function getSaltOutputMulti(snapshot) {
  return 1 + getCompanionBonus(snapshot?.companions, REFINERY_SALT_COMPANION)
}

export function getSaltPowerPerCycle(rank, outputMulti) {
  return Math.floor(Math.min(SRC.maxPowerPerCycle, Math.pow(rank, 1.3) * outputMulti))
}

// Rank where output hits the 250k cap: more ranks past it only raise costs
export function getMaxUsefulSaltRank(outputMulti) {
  return Math.ceil(Math.pow(SRC.maxPowerPerCycle / outputMulti, 1 / 1.3))
}

// Power the bar needs for the next rank, game "PowerCAP"
export function getSaltPowerCap(rank) {
  return Math.max(REFINERY_POWER_CAPS[Math.min(rank, REFINERY_POWER_CAPS.length - 2)] ?? 0, 25)
}

// The game rounds the cycles left, so a bar within half a cycle of its cap is ready to rank up
export function isSaltBarFull(refined, rank, powerPerCycle) {
  return Math.round((getSaltPowerCap(rank) - refined) / Math.max(powerPerCycle, 1)) <= 0
}

function getSaltInputPower(saltIndex, saltTaskLevel) {
  return saltIndex <= saltTaskLevel ? 1.3 : 1.5
}

// Highest rank whose per-cycle cost of one input still fits in `allowedPerCycle` (worked per cycle, not
// per hour, so a cost landing exactly on the feeder's output isn't lost to float error)
export function getMaxRankForAllowance(allowedPerCycle, quantity, power) {
  if (!(quantity > 0) || !(allowedPerCycle > 0)) return 0
  const allowed = allowedPerCycle + 1e-9
  const costFor = rank => Math.floor(Math.pow(rank, power)) * quantity
  let rank = Math.max(0, Math.floor(Math.pow(allowed / quantity, 1 / power)))
  while (costFor(rank + 1) <= allowed) rank++
  while (rank > 0 && costFor(rank) > allowed) rank--
  return rank
}

// Lowest feeder rank whose output (minus the spare share) covers `costPerCycle` of this salt.
// cycleRatio = this salt's cycle seconds / the feeder's.
function getMinFeederRank(costPerCycle, cycleRatio, outputMulti, keepShare, maxUsefulRank) {
  const usable = rank => getSaltPowerPerCycle(rank, outputMulti) * (1 - keepShare) * cycleRatio + 1e-9
  let rank = Math.max(1, Math.floor(Math.pow(costPerCycle / cycleRatio / (1 - keepShare) / outputMulti, 1 / 1.3)))
  while (rank > 1 && usable(rank - 1) >= costPerCycle) rank--
  while (usable(rank) < costPerCycle) {
    if (rank > maxUsefulRank) return null
    rank++
  }
  return rank
}

// One entry per unlocked salt, in chain order.
// keepShare = share of each salt's output to keep for other uses (0 = the next salt may eat all of it).
// verdict: 'free' (no salt input, rank any time), 'rankUp' (next rank is safe), 'hold' (next rank would
// out-eat the feeder), 'over' (already out-eats it), 'spare' (no deficit, but eats into the kept share), 'maxed' (output capped, ranks only cost more).
// Sustained output assumes stock runs dry: a starved salt only cycles as often as its feeder allows, which
// starves the salt after it too. Planning assumes every unlocked salt is turned on.
export function getSaltRankPlan(snapshot, keepShare = 0) {
  const refinery = snapshot?.refinery
  if (!refinery?.salts) return null
  const cycleTimes = getRefineryCycleTimes(snapshot)
  const outputMulti = getSaltOutputMulti(snapshot)
  const maxUsefulRank = getMaxUsefulSaltRank(outputMulti)
  const saltTaskLevel = refinery.saltTaskLevel ?? 0
  const printed = getPrintedPerHour(snapshot)
  const chests = snapshot?.storage?.items ?? {}

  const salts = []
  refinerySalts.forEach((salt, index) => {
    const state = refinery.salts[index]
    if (!state?.unlocked) return
    const cycleSeconds = getSaltCycleSeconds(index, cycleTimes)
    const powerPerCycle = getSaltPowerPerCycle(state.rank, outputMulti)
    const feeder = salts[index - 1] ?? null
    const feederInput = salt.cost.find(({ item }) => item.startsWith('Refinery'))
    const entry = {
      ...salt,
      index,
      rank: state.rank,
      active: state.active,
      refined: state.refined ?? 0,
      powerCap: getSaltPowerCap(state.rank),
      barFull: isSaltBarFull(state.refined ?? 0, state.rank, powerPerCycle),
      cycleSeconds,
      powerPerCycle,
      outputPerHour: powerPerCycle * 3600 / cycleSeconds,
      stock: (chests[salt.rawName] ?? 0) + (refinery.storage?.[salt.rawName] ?? 0),
      outputMaxed: state.rank >= maxUsefulRank,
      feeder: null,
      sustained: 1,
      printerLimit: null,
    }

    if (feeder && feederInput) {
      const power = getSaltInputPower(index, saltTaskLevel)
      const cycleRatio = cycleSeconds / feeder.cycleSeconds
      const costPerCycle = Math.floor(Math.pow(state.rank, power)) * feederInput.quantity
      const nextCostPerCycle = Math.floor(Math.pow(state.rank + 1, power)) * feederInput.quantity
      // What the feeder can spare per one of this salt's cycles, at the rate it can keep up
      const feederPerCycle = feeder.powerPerCycle * feeder.sustained
      const allowedPerCycle = feederPerCycle * (1 - keepShare) * cycleRatio
      const maxSafeRank = Math.min(maxUsefulRank, getMaxRankForAllowance(allowedPerCycle, feederInput.quantity, power))
      const eatsPerHour = costPerCycle * 3600 / cycleSeconds
      const feederMakesPerHour = feeder.outputPerHour * feeder.sustained
      entry.feeder = {
        index: feeder.index,
        rawName: feeder.rawName,
        name: feeder.name,
        rank: feeder.rank,
        stock: feeder.stock,
        eatsPerHour,
        nextEatsPerHour: nextCostPerCycle * 3600 / cycleSeconds,
        makesPerHour: feederMakesPerHour,
        share: feederMakesPerHour > 0 ? eatsPerHour / feederMakesPerHour : Infinity,
        // feeder rank this salt's current rank needs (over) and its next rank needs (hold)
        rankForCurrent: getMinFeederRank(costPerCycle, cycleRatio, outputMulti, keepShare, maxUsefulRank),
        rankForNext: getMinFeederRank(nextCostPerCycle, cycleRatio, outputMulti, keepShare, maxUsefulRank),
        hoursLeft: eatsPerHour > feederMakesPerHour ? feeder.stock / (eatsPerHour - feederMakesPerHour) : Infinity,
      }
      entry.maxSafeRank = maxSafeRank
      entry.sustained = eatsPerHour > 0 ? Math.min(1, feederMakesPerHour / eatsPerHour) : 1
    } else {
      entry.maxSafeRank = maxUsefulRank
    }

    // Printing that wouldn't keep up at the next rank (only items being printed: the rest have no rate)
    for (const { item, quantity } of salt.cost) {
      const printedPerHour = printed[item] ?? 0
      if (item.startsWith('Refinery') || printedPerHour <= 0) continue
      const maxRank = getMaxRankForAllowance(printedPerHour * cycleSeconds / 3600, quantity, 1.5)
      if (maxRank <= state.rank && (!entry.printerLimit || maxRank < entry.printerLimit.maxRank)) {
        entry.printerLimit = { item, maxRank, printedPerHour }
      }
    }

    entry.headroom = entry.maxSafeRank - entry.rank
    entry.verdict = entry.outputMaxed ? 'maxed'
      : !entry.feeder ? 'free'
        : entry.rank > entry.maxSafeRank ? (entry.feeder.eatsPerHour > entry.feeder.makesPerHour ? 'over' : 'spare')
          : entry.rank + 1 > entry.maxSafeRank ? 'hold' : 'rankUp'
    salts.push(entry)
  })

  // What eats each salt (the next salt, if it's running)
  for (const entry of salts) {
    const next = salts.find(other => other.feeder?.index === entry.index)
    entry.eatenBy = next && next.active ? {
      name: next.name,
      perHour: next.feeder.eatsPerHour,
    } : null
  }

  return {
    cycleTimes,
    outputMulti,
    maxUsefulRank,
    keepShare,
    salts,
    rankNow: getRankNowList(salts, outputMulti, keepShare, saltTaskLevel, maxUsefulRank),
  }
}

// Full bars to rank up right now, top of the chain first: ranking a feeder raises what the salt after it
// may cost, so a salt on hold can be freed by its feeder's rank up in the same pass (freedBy).
function getRankNowList(salts, outputMulti, keepShare, saltTaskLevel, maxUsefulRank) {
  const ranked = new Set()
  const list = []
  for (const entry of salts) {
    if (!entry.barFull || entry.outputMaxed) continue
    if (!entry.feeder) {
      ranked.add(entry.index)
      list.push({ entry, freedBy: null })
      continue
    }
    const feeder = salts.find(other => other.index === entry.feeder.index)
    const feederRank = feeder.rank + (ranked.has(feeder.index) ? 1 : 0)
    const feederPerCycle = getSaltPowerPerCycle(feederRank, outputMulti) * feeder.sustained
    const input = entry.cost.find(({ item }) => item.startsWith('Refinery'))
    const allowed = feederPerCycle * (1 - keepShare) * entry.cycleSeconds / feeder.cycleSeconds
    const maxRank = Math.min(maxUsefulRank, getMaxRankForAllowance(allowed, input.quantity, getSaltInputPower(entry.index, saltTaskLevel)))
    if (entry.rank + 1 <= maxRank) {
      ranked.add(entry.index)
      list.push({ entry, freedBy: entry.verdict === 'rankUp' ? null : feeder.name })
    }
  }
  return list
}
