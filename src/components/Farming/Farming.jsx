import { useState, useMemo } from 'react'
import {
  marketMap,
  exoticMarketMap,
  landRankMap,
  landRankStatGroups,
  calcExoticBonus,
  calcRankBonus,
  getSeedByCropId,
} from '../../data'
import InfoPanel from '../InfoPanel/InfoPanel'
import './Farming.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBonus(value, decimals = 1, shorten = false) {
  if (value === null || value === undefined) return '0'
  if (shorten) {
    if (value >= 1e12) return (value / 1e12).toFixed(2) + 'T'
    if (value >= 1e9)  return (value / 1e9).toFixed(2)  + 'B'
    if (value >= 1e6)  return (value / 1e6).toFixed(2)  + 'M'
    if (value >= 1e3)  return (value / 1e3).toFixed(2)  + 'K'
  }
  return Number(value.toFixed(decimals)).toString()
}

function cropImgPath(cropId) {
  const seed = getSeedByCropId(cropId)
  if (!seed) return null
  const resolvedId = seed.seedId === 6 ? 230 : Math.round(cropId)
  return `/images/farming/FarmCrop${resolvedId}.png`
}

function seedImgPath(seedId) {
  if (seedId === 6) return `/images/farming/FarmCrop230.png`
  return `/images/farming/Seed_${seedId}.png`
}

function renderBonusText(bonusText, value) {
  if (!bonusText || value === undefined) return bonusText ?? ''
  const additive = formatBonus(value)
  const multi    = formatBonus(1 + value / 100, 3)
  return bonusText
    .replace('{', additive)
    .replace('}', multi)
    .replace('$', Math.ceil(value).toString())
}

function getNextCosts(upgrade, currentLevel) {
  const { cropId, cropIdIncrement, cost, costExponent, maxLvl } = upgrade
  const upgradeMap = new Map()
  let extraLv = 0

  while (currentLevel + extraLv < maxLvl) {
    const lv         = currentLevel + extraLv
    const thisCropId = upgrade.index === 0
      ? Math.floor(cropId + cropIdIncrement * (lv + 2 * Math.floor(lv / 3) + Math.floor(lv / 4)))
      : Math.floor(cropId + cropIdIncrement * lv)
    const divisor  = upgrade.index >= 8 ? 10 : 15
    const thisCost = cost * Math.pow(costExponent, lv - Math.floor(lv / divisor))

    if (upgradeMap.has(thisCropId)) {
      upgradeMap.set(thisCropId, upgradeMap.get(thisCropId) + thisCost)
    } else {
      if (upgradeMap.size === 4) break
      upgradeMap.set(thisCropId, thisCost)
    }

    extraLv++
  }

  return Array.from(upgradeMap.entries()).map(([cropId, cost]) => ({ cropId, cost }))
}

function getNextLevelCost(upgrade, currentLevel) {
  if (currentLevel >= upgrade.maxLvl) return null
  const divisor = upgrade.index >= 8 ? 10 : 15
  return upgrade.cost * Math.pow(upgrade.costExponent, currentLevel - Math.floor(currentLevel / divisor))
}

// Given a crop quantity, returns how many exotic levels that quantity would buy.
// Accounts for Better Exotic upgrade (index 38) and Legend Talent Brown 10 (Spelunk[18][29]).
function calcExoticLevelsFromCrops(cropQty, betterExoticLevel, legendTalentLevel) {
  const betterExoticBonus = 70 * (betterExoticLevel / (1000 + betterExoticLevel))
  const legendBonus       = legendTalentLevel * 100
  const totalMulti        = (1 + betterExoticBonus / 100) * (1 + legendBonus / 100)
  const baseQty           = cropQty / totalMulti
  if (baseQty <= 1) return 0
  return Math.max(0, Math.floor(Math.log10(baseQty) * 10.36 + 1))
}

// Seed rank indices in landRankMap
const SEED_RANK_INDICES = [4, 9, 14, 19]

// Which rank indices have "per rank of the land plot" scaling
const PER_PLOT_RANK_INDICES = new Set([0, 1, 2])

const LS_EVO_BOOST_KEY = 'farming_evo_boost_input'

// ============================================================
// LAND RANKS TAB
// ============================================================

function LandRanksTab({ farming }) {
  const upgradesLevels  = farming?.upgradesLevels  ?? []
  const exoticLevels    = farming?.exoticLevels    ?? []
  const totalRankPoints = farming?.totalRankPoints ?? 0
  const usedRankPoints  = farming?.usedRankPoints  ?? 0
  const plotRanks       = farming?.plotRanks       ?? []
  const freePoints      = totalRankPoints - usedRankPoints
  const gmoCropCounts = farming?.gmoCropCounts ?? {}
  const plotCount     = farming?.plotCount     ?? 0

  const [optimizerResult, setOptimizerResult] = useState(null)
  const currentSeedLevel = Math.max(
    upgradesLevels[4]  ?? 0,
    upgradesLevels[9]  ?? 0,
    upgradesLevels[14] ?? 0,
    upgradesLevels[19] ?? 0,
  )
  const [farmExpPoints,   setFarmExpPoints]   = useState('')

  // Lowest individual plot rank
  const lowestPlotRank = useMemo(() => {
    if (!plotRanks.length) return 0
    return Math.min(...plotRanks.map(p => p.rank ?? 0))
  }, [plotRanks])

  // Combined rank multiplier (apoWow * exoticMulti)
  const plumpEntry  = exoticMarketMap[14]
  const plumpLevel  = exoticLevels[14] ?? 0
  const plumpBonus  = plumpEntry ? calcExoticBonus(plumpEntry, plumpLevel) : 0
  const exoticMulti = 1 + plumpBonus / 100

  // Persist evo boost input to localStorage
  const [dankRanksInput, setDankRanksInput] = useState(
    () => localStorage.getItem(LS_EVO_BOOST_KEY) ?? ''
  )

  function handleDankRanksChange(e) {
    const val = e.target.value
    setDankRanksInput(val)
    if (val.trim() === '') {
      localStorage.removeItem(LS_EVO_BOOST_KEY)
    } else {
      localStorage.setItem(LS_EVO_BOOST_KEY, val)
    }
  }

  const evoLevel = upgradesLevels[0] ?? 0
  const evoBase  = evoLevel > 0 ? (1.7 * 250 * evoLevel) / (evoLevel + 80) : 0

  const apoWow = useMemo(() => {
    const val = parseFloat(dankRanksInput)
    if (val > 0 && evoBase > 0) return val / (exoticMulti * evoBase)
    return 1
  }, [dankRanksInput, evoBase, exoticMulti])

  const combinedMulti = Math.max(1, apoWow) * exoticMulti

  // Build rank entries with bonus values
  const ranksWithBonus = useMemo(() =>
    landRankMap.map(rank => {
      const upgradeLevel = upgradesLevels[rank.index] ?? 0
      const baseBonus    = calcRankBonus(rank, upgradeLevel, combinedMulti)

      const perPlotBonus = PER_PLOT_RANK_INDICES.has(rank.index) && lowestPlotRank > 0
        ? baseBonus * lowestPlotRank
        : null

      return {
        ...rank,
        upgradeLevel,
        currentBonus: baseBonus,
        perPlotBonus,
        isUnlocked: totalRankPoints >= rank.unlockAt,
      }
    }),
    [upgradesLevels, totalRankPoints, combinedMulti, lowestPlotRank]
  )

  const OG_GAME_MAX = 30

  // Stat group totals — sum bonuses first, express multiplicative groups as 1 + sum/100
  const statTotals = useMemo(() => {
    // Crop Evolution multiplicative total
    const evoSum = landRankStatGroups[0].rankIndices.reduce((acc, ri) => {
      const entry = ranksWithBonus[ri]
      return acc + (entry?.currentBonus ?? 0)
    }, 0)
    const cropEvolution = 1 + evoSum / 100

    // Crop Value uncapped = calcCropValue at current levels
    const firstPlotRank  = farming?.farmingRanks?.[0] ?? 0
    const valueGmoLevel  = farming?.marketLevels?.[14] ?? 0
    const superGmoLevel  = farming?.marketLevels?.[15] ?? 0
    const prodBonus1     = calcRankBonus(landRankMap[1],  upgradesLevels[1]  ?? 0, combinedMulti)
    const prodBonus8     = calcRankBonus(landRankMap[8],  upgradesLevels[8]  ?? 0, combinedMulti)
    const prodBonus17    = calcRankBonus(landRankMap[17], upgradesLevels[17] ?? 0, combinedMulti)
    const landFactor     = 1 + (prodBonus1 + prodBonus8 + prodBonus17) / 100
    const rankMultiplier = 1 + (prodBonus1 * firstPlotRank) / 100
    const valueGmo       = Math.max(1, 1 + (valueGmoLevel * 0.02 * (gmoCropCounts[10000] ?? 0)) / 100)
    const superGmo       = 1 + (superGmoLevel * 0.5 * (gmoCropCounts[100000] ?? 0)) / 100
    const cropValueUncapped = Math.round(landFactor * valueGmo * rankMultiplier * superGmo)
    const cropValueCap      = productionCap()

    // Approximate OG Cap
    // Uses available data: OG land ranks, exotic 26/27, night market OG fertilizer
    const ogLandRankBonus = [7, 11, 18].reduce((sum, ri) => {
      return sum + calcRankBonus(landRankMap[ri], upgradesLevels[ri] ?? 0, combinedMulti)
    }, 0)
    const exotic26      = exoticLevels[26] ?? 0
    const exotic27      = exoticLevels[27] ?? 0
    const exoticBonus26 = exoticMarketMap[26] ? calcExoticBonus(exoticMarketMap[26], exotic26) : 0
    const exoticBonus27 = exoticMarketMap[27] ? calcExoticBonus(exoticMarketMap[27], exotic27) : 0
    const ogFertLevel   = farming?.marketLevels?.[11] ?? 0
    const ogFertBonus   = ogFertLevel > 0 ? ogFertLevel : 0
    const ogMultiplier  =
      Math.max(1, 1 + ogFertBonus / 100) *
      (1 + ogLandRankBonus / 100) *
      (1 + exoticBonus26 / 100) *
      (1 + exoticBonus27 / 100)

    const THRESHOLD   = 8e-6
    let approxOgCap   = 0
    for (let t = 0; t < OG_GAME_MAX; t++) {
      const chance = Math.pow(0.4, t + 1) * ogMultiplier
      if (chance < THRESHOLD) break
      approxOgCap = t + 1
    }

    return { cropEvolution, cropValueUncapped, cropValueCap, approxOgCap }
  }, [ranksWithBonus, upgradesLevels, combinedMulti, farming, exoticLevels, gmoCropCounts])

  // ── Optimizer ──────────────────────────────────────────────────────────────

// ── Group definitions (matching egizz983 FO tool) ──
const GROUP_EVOLUTION   = [0, 3, 10, 15]
const GROUP_PRODUCTION  = [1, 8, 17]
const GROUP_OG          = [7, 11, 18]
const GROUP_SOILEXP     = [2, 6, 13]
const GROUP_FARMEXP     = [5, 12, 16]

// Evolution score: product of all (1 + bonus/100) for evolution ranks
// Matches LankRankUpgBonus multiplicative nature
function evoScore(levels) {
  return GROUP_EVOLUTION.reduce((prod, ri) => {
    const rank  = landRankMap[ri]
    const bonus = calcRankBonus(rank, levels[ri] ?? 0, combinedMulti)
    return prod * (1 + bonus / 100)
  }, 1)
}

// OG score: approximation of calculateNextOGChance(0)
// 0.4^1 * ogMultiplier where ogMultiplier uses available data
function ogScore(levels) {
  // getLandRankUpgBonusTOTAL(3) = bonus(7) + bonus(11) + bonus(18)
  const ogLandRankBonus = GROUP_OG.reduce((sum, ri) => {
    return sum + calcRankBonus(landRankMap[ri], levels[ri] ?? 0, combinedMulti)
  }, 0)
  // Exotic 26 + 27 (Evergrow I + II)
  const exotic26 = farming?.exoticLevels?.[26] ?? 0
  const exotic27 = farming?.exoticLevels?.[27] ?? 0
  const exoticBonus26 = exoticMarketMap[26] ? calcExoticBonus(exoticMarketMap[26], exotic26) : 0
  const exoticBonus27 = exoticMarketMap[27] ? calcExoticBonus(exoticMarketMap[27], exotic27) : 0
  // Night market OG Fertilizer (index 11 in marketMap = index 3 in night market)
  const ogFertLevel   = farming?.marketLevels?.[11] ?? 0
  const ogFertBonus   = ogFertLevel > 0 ? (1 + ogFertLevel * 1) / 100 : 0  // bonusPerLvl=1

  return 0.4 *
    Math.max(1, 1 + ogFertBonus) *
    (1 + ogLandRankBonus / 100) *
    (1 + exoticBonus26 / 100) *
    (1 + exoticBonus27 / 100)
}

// Soil EXP score: chainBonus × landRankTotal(2)
function soilScore(levels) {
  const chainBonus   = calcRankBonus(landRankMap[2], levels[2] ?? 0, combinedMulti)
  const soilTotal    = GROUP_SOILEXP.reduce((sum, ri) => {
    return sum + calcRankBonus(landRankMap[ri], levels[ri] ?? 0, combinedMulti)
  }, 0)
  return (1 + (chainBonus * lowestPlotRank) / 100) * (1 + soilTotal / 100)
}

// Production score: land rank production total × value GMO
function productionScore(levels) {
  const prodTotal     = GROUP_PRODUCTION.reduce((sum, ri) => {
    return sum + calcRankBonus(landRankMap[ri], levels[ri] ?? 0, combinedMulti)
  }, 0)
  const valueGmoLevel = farming?.marketLevels?.[14] ?? 0
  const cnt10k        = gmoCropCounts[10000] ?? 0
  const valueGmo      = 1 + (valueGmoLevel * 0.02 * cnt10k) / 100
  const superGmoLevel = farming?.marketLevels?.[15] ?? 0
  const cnt100k       = gmoCropCounts[100000] ?? 0
  const superGmo      = 1 + (superGmoLevel * 0.5 * cnt100k) / 100
  return (1 + prodTotal / 100) * valueGmo * superGmo
}

// Production cap: value cap from exotic 23/24/25
function productionCap() {
  const e23 = farming?.exoticLevels?.[23] ?? 0
  const e24 = farming?.exoticLevels?.[24] ?? 0
  const e25 = farming?.exoticLevels?.[25] ?? 0
  const b23 = exoticMarketMap[23] ? calcExoticBonus(exoticMarketMap[23], e23) : 0
  const b24 = exoticMarketMap[24] ? calcExoticBonus(exoticMarketMap[24], e24) : 0
  const b25 = exoticMarketMap[25] ? calcExoticBonus(exoticMarketMap[25], e25) : 0
  return 10000 * (1 + (b23 + b24 + b25) / 100)
}

// FarmExp score: additive sum
function farmExpScore(levels) {
  return GROUP_FARMEXP.reduce((sum, ri) => {
    return sum + calcRankBonus(landRankMap[ri], levels[ri] ?? 0, combinedMulti)
  }, 0)
}

// Greedy allocator for a group using a score function
function greedyAllocate(groupIds, pool, scoreFn, levels, capTarget = Infinity) {
  let rem = pool
  const unlocked = groupIds.filter(ri =>
    totalRankPoints >= (landRankMap[ri]?.unlockAt ?? 0)
  )
  let safety = 0
  while (rem > 0 && safety++ < 200000) {
    if (scoreFn(levels) >= capTarget) break
    const base = scoreFn(levels)
    let bestId = -1, bestDelta = 0
    for (const ri of unlocked) {
      const rank = landRankMap[ri]
      if (!rank?.base) continue
      levels[ri] = (levels[ri] ?? 0) + 1
      const delta = scoreFn(levels) - base
      levels[ri]--
      if (delta > bestDelta) { bestDelta = delta; bestId = ri }
    }
    if (bestId === -1 || bestDelta <= 0) break
    levels[bestId] = (levels[bestId] ?? 0) + 1
    rem--
  }
  return rem // leftover points
}

function runOptimizer() {

  const budget = totalRankPoints
  if (!budget || budget <= 0) {
    setOptimizerResult([])
    return
  }

  const levels = new Array(20).fill(0)

  let pointsLeft = budget

  // ── Step 1: Utility (seeds) up to seedMaxLevel ──
  const seedMax = currentSeedLevel
  if (seedMax > 0) {
    for (const ri of SEED_RANK_INDICES) {
      const current = levels[ri] ?? 0
      const needed  = Math.max(0, seedMax - current)
      const alloc   = Math.min(needed, pointsLeft)
      levels[ri]    = current + alloc
      pointsLeft   -= alloc
    }
  }

  // ── Step 2: Production — greedy until cropValueCap/2 ──
  const firstPlotRank = farming?.farmingRanks?.[0] ?? 0
  const valueGmoLevel = farming?.marketLevels?.[14] ?? 0
  const cnt10kOpt     = plotCount
  const superGmoLevel = farming?.marketLevels?.[15] ?? 0
  const cnt100kOpt    = plotCount

  const calcCropValue = (levels) => {
    // getLandRankUpgBonusTOTAL(1) = bonus(1) + bonus(8) + bonus(17)
    const prodBonus1  = calcRankBonus(landRankMap[1],  levels[1]  ?? 0, combinedMulti)
    const prodBonus8  = calcRankBonus(landRankMap[8],  levels[8]  ?? 0, combinedMulti)
    const prodBonus17 = calcRankBonus(landRankMap[17], levels[17] ?? 0, combinedMulti)
    const landTotal   = prodBonus1 + prodBonus8 + prodBonus17
    const landFactor  = 1 + landTotal / 100

    // rankMultiplier uses rank[1] bonus × firstPlotRank
    const rankMultiplier = 1 + (prodBonus1 * firstPlotRank) / 100

    // Value GMO basket factor (night market index 14, using plotCount as crop count)
    const valueGmo   = Math.max(1, 1 + (valueGmoLevel * 0.02 * cnt10kOpt) / 100)

    // Super GMO multiplier
    const superGmo   = 1 + (superGmoLevel * 0.5 * cnt100kOpt) / 100

    return Math.round(landFactor * valueGmo * rankMultiplier * superGmo)
  }

  const capTarget    = productionCap() / 2
  const prodLeftover = greedyAllocate(GROUP_PRODUCTION, pointsLeft, calcCropValue, levels, capTarget)
  pointsLeft         = prodLeftover

  // ── Step 3: Farm EXP carve-off ──
  const farmExpInput = parseInt(farmExpPoints) || 0
  const farmExpPool  = Math.min(farmExpInput, pointsLeft)
  pointsLeft        -= farmExpPool

  // ── Step 4: Split remaining 3 ways between Evo, OG, Soil ──
  const basePool  = Math.floor(pointsLeft / 3)
  const remainder = pointsLeft % 3
  let evoPool  = basePool + (remainder > 0 ? 1 : 0)
  let ogPool   = basePool + (remainder > 1 ? 1 : 0)
  let soilPool = basePool

  // ── Step 5: Evolution greedy ──
  const evoLeftover = greedyAllocate(GROUP_EVOLUTION, evoPool, evoScore, levels)
  if (evoLeftover > 0) {
    const half = Math.floor(evoLeftover / 2)
    ogPool   += half
    soilPool += evoLeftover - half
  }

  // ── Step 6: OG greedy ──
  greedyAllocate(GROUP_OG, ogPool, ogScore, levels)

  // ── Step 7: Soil EXP greedy ──
  greedyAllocate(GROUP_SOILEXP, soilPool, soilScore, levels)

  // ── Step 8: Farm EXP greedy ──
  if (farmExpPool > 0) {
    greedyAllocate(GROUP_FARMEXP, farmExpPool, farmExpScore, levels)
  }

  const baseline = upgradesLevels.slice()
  while (baseline.length < 20) baseline.push(0)

  const results = landRankMap.map((rank, i) => {
    const before = baseline[i] ?? 0
    const after  = levels[i]   ?? 0
    const scale  = PER_PLOT_RANK_INDICES.has(i) && lowestPlotRank > 0 ? lowestPlotRank : 1
    return {
      ...rank,
      before,
      after,
      bonusBefore: calcRankBonus(rank, before, combinedMulti) * scale,
      bonusAfter:  calcRankBonus(rank, after,  combinedMulti) * scale,
      changed:     after !== before,
    }
  }).filter(r => r.before > 0 || r.after > 0)

  setOptimizerResult(results)
}

  return (
    <div className="farming-overview">

      {/* ── Points Summary ── */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="rank-stat-chip">
          <span className="rank-stat-chip-label">Total Plot Ranks:</span>
          <span className="rank-stat-chip-value">{totalRankPoints.toLocaleString()}</span>
        </div>
        <div className="rank-stat-chip">
          <span className="rank-stat-chip-label">Points Used:</span>
          <span className="rank-stat-chip-value">{usedRankPoints.toLocaleString()}</span>
        </div>
        <div className="rank-stat-chip">
          <span className="rank-stat-chip-label">Points Available:</span>
          <span className="rank-stat-chip-value" style={{ color: freePoints > 0 ? '#86efac' : '#a0c4ff' }}>
            {freePoints.toLocaleString()}
          </span>
        </div>
        {lowestPlotRank > 0 && (
          <div className="rank-stat-chip">
            <span className="rank-stat-chip-label">Lowest Plot:</span>
            <span className="rank-stat-chip-value" style={{ color: '#fbbf24' }}>
              {lowestPlotRank.toLocaleString()}
            </span>
          </div>
        )}
        {plotCount > 0 && (
          <div className="rank-stat-chip">
            <span className="rank-stat-chip-label">Plot Count:</span>
            <span className="rank-stat-chip-value">{plotCount}/36</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, margin: '10px 0 4px' }}>
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Evo Boost %
        </span>
        <input
          type="number"
          className="optimizer-input"
          placeholder="e.g. 1500"
          value={dankRanksInput}
          onChange={handleDankRanksChange}
          style={{ width: 90, margin: 0 }}
        />
        <span style={{ fontSize: 10, color: '#4b5563' }}>
          Enter to calibrate land rank bonus calculations.
        </span>
      </div>

      {/* ── Rank Database ── */}
      <div className="rank-database-section">
        <div className="farming-group-label">Land Rank Database</div>
        <div className="rank-database-grid">
          {ranksWithBonus.map(rank => (
            <div
              key={rank.index}
              className={`rank-upg-card tooltip-anchor${!rank.isUnlocked ? ' rank-upg-card--locked' : ''}`}
            >
              {!rank.isUnlocked && (
                <span className="tooltip">
                  Unlocks at {rank.unlockAt.toLocaleString()} total plot rank
                </span>
              )}
              <img
                src={`/images/farming/RankUpg${rank.index}.png`}
                alt={rank.name}
                className="rank-upg-img"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
              <span className="rank-upg-name">{rank.name}</span>
              <span className="rank-upg-level">Lv. {rank.upgradeLevel}</span>
              {rank.isUnlocked && rank.upgradeLevel > 0 && (
                <span className="rank-upg-bonus">
                  +{formatBonus(rank.currentBonus, 2)}%
                  {rank.perPlotBonus !== null && (
                    <span className="rank-upg-per-plot">
                      +{formatBonus(rank.perPlotBonus, 2)}%
                    </span>
                  )}
                </span>
              )}
              {!rank.isUnlocked && (
                <span style={{ fontSize: 9, color: '#4b5563' }}>
                  Unlocks at {rank.unlockAt.toLocaleString()}
                </span>
              )}
              <span className="rank-upg-desc">
                {rank.description.replace(/_/g, ' ').replace('{', '').replace('%', '%')}
              </span>
            </div>
          ))}
        </div>

        {/* Stat group totals */}
        <div className="rank-stat-totals">
        <div className="rank-stat-chip">
            <span className="rank-stat-chip-label">Crop Evolution</span>
            <span className="rank-stat-chip-value">{formatBonus(statTotals.cropEvolution, 3)}x</span>
        </div>
        <div className="rank-stat-chip">
            <span className="rank-stat-chip-label">Crop Value Cap</span>
            <span className="rank-stat-chip-value">{Math.round(statTotals.cropValueCap).toLocaleString()}</span>
        </div>
        <div className="rank-stat-chip">
            <span className="rank-stat-chip-label">Crop Value</span>
            <span className="rank-stat-chip-value">{statTotals.cropValueUncapped.toLocaleString()}</span>
        </div>
        <div className="rank-stat-chip">
            <span className="rank-stat-chip-label">OG Cap (approx)</span>
            <span className="rank-stat-chip-value">{OG_GAME_MAX}/{statTotals.approxOgCap}</span>
        </div>
        </div>
        </div>

      {/* ── Optimizer ── */}
      <div className="rank-optimizer-section">
        <div className="farming-group-label">Point Distribution Optimizer</div>
        <div className="optimizer-controls">

          <div className="optimizer-control-group tooltip-anchor">
          <span className="optimizer-label">Farm EXP Points</span>
          <input
            type="number"
            min="0"
            className="optimizer-input"
            placeholder="e.g. 0"
            value={farmExpPoints}
            onChange={e => setFarmExpPoints(e.target.value)}
          />
          <span className="tooltip">
            Points to carve off for Farm EXP ranks before splitting
            the rest between Evolution, OG, and Soil EXP.
          </span>
          </div>

          <button className="optimizer-btn" onClick={runOptimizer}>
            Optimize
          </button>
        </div>

        {freePoints > 0 && (
        <p style={{ textAlign: 'center', fontSize: 11, color: '#6b7280', margin: '0 0 4px' }}>
            You have <span style={{ color: '#86efac', fontWeight: 700 }}>{freePoints.toLocaleString()}</span> unallocated points — optimizer always plans from scratch using all {totalRankPoints.toLocaleString()} points. Enter any points you want to reserve for Farm EXP, then click Optimize.
        </p>
        )}

        {optimizerResult && (
          <div className="optimizer-results">
            {optimizerResult.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: 12, color: '#4b5563', padding: '12px 0' }}>
                {freePoints <= 0
                  ? 'No points available to optimize.'
                  : 'No changes — all points are already optimally allocated.'
                }
              </p>
            ) : (
              <div className="rank-database-grid">
                {optimizerResult.map(rank => {
                  const gainDelta  = rank.bonusAfter - rank.bonusBefore
                  const isPositive = gainDelta >= 0
                  const isUnlocked = totalRankPoints >= rank.unlockAt
                  return (
                  <div
                    key={rank.index}
                    className={`rank-upg-card${!isUnlocked ? ' rank-upg-card--locked' : ''}`}
                    style={{ position: 'relative' }}
                  >
                    <span style={{
                      position: 'absolute', top: 4, right: 4,
                      fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '1px 5px',
                      background: rank.after > rank.before ? '#14532d' : rank.after < rank.before ? '#450a0a' : '#1f2937',
                      color: rank.after > rank.before ? '#86efac' : rank.after < rank.before ? '#fca5a5' : '#6b7280',
                    }}>
                      {rank.before} → {rank.after}
                    </span>
                    <img
                      src={`/images/farming/RankUpg${rank.index}.png`}
                      alt={rank.name}
                      className="rank-upg-img"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                    <span className="rank-upg-name">{rank.name}</span>
                    <span className="rank-upg-level">Lv. {rank.after}</span>
                    {rank.base !== null && gainDelta !== 0 && (
                      <span style={{
                        fontSize: 10,
                        color: isPositive ? '#86efac' : '#fca5a5',
                        fontWeight: 600,
                      }}>
                        {isPositive ? '+' : ''}{formatBonus(gainDelta, 2)}%
                      </span>
                    )}
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

// ============================================================
// MARKET TAB
// ============================================================

function MarketCard({ upgrade, level, cropDepot = {} }) {
  const isMaxed         = level >= upgrade.maxLvl
  const bonusValue      = level * upgrade.bonusPerLvl
  const nextCosts       = isMaxed ? [] : getNextCosts(upgrade, level)
  const nextLevelCost   = getNextLevelCost(upgrade, level)
  const nextLevelCropId = nextCosts[0]?.cropId ?? Math.round(upgrade.cropId)
  const nextLevelHave   = cropDepot[String(Math.round(nextLevelCropId))]?.qty ?? 0
  const nextLevelEnough = nextLevelHave >= (nextLevelCost ?? 0)
  const isNightMarket   = upgrade.index >= 8
  const currentCosts    = getNextCosts(upgrade, level)
  const headerCropId    = isNightMarket
    ? 'bean'
    : currentCosts.length > 0 ? currentCosts[0].cropId : Math.round(upgrade.cropId)

  return (
    <div className={`market-card${isMaxed ? ' market-card--maxed' : ''}`}>
      <div className="market-card-header">
        <img
          src={isNightMarket ? '/images/farming/FarmCropBean.png' : cropImgPath(headerCropId)}
          alt=""
          className="market-crop-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <div className="market-card-title">
          <span className="market-card-name">{upgrade.label}</span>
          <span className={`market-card-level${isMaxed ? ' market-card-level--maxed' : ''}`}>
            <span>{level}</span> / {upgrade.maxLvl}
          </span>
        </div>
      </div>
      <div className="market-card-body">
        <span className="market-card-bonus">
          {renderBonusText(upgrade.bonusText, bonusValue)}
        </span>
        {!isMaxed && nextCosts.length > 0 && (
          <div className="market-next-costs">
            <span className="market-next-cost-label">Next level</span>
            <div className="market-next-cost-row">
              <img
                src={isNightMarket ? '/images/farming/FarmCropBean.png' : cropImgPath(nextLevelCropId)}
                alt=""
                className="market-next-cost-img"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
              <span className="market-next-cost-text">
                <span className={nextLevelEnough ? 'market-cost-have' : 'market-cost-need'}>
                  {formatBonus(nextLevelHave, 1, true)}
                </span>
                {' / '}
                <span>{formatBonus(nextLevelCost, 1, true)}</span>
              </span>
            </div>
            <span className="market-next-cost-label" style={{ marginTop: 4 }}>Future costs</span>
            {nextCosts.slice(0, isNightMarket ? 1 : 4).map(({ cropId: cid, cost }, i) => {
              const have      = cropDepot[String(Math.round(cid))]?.qty ?? 0
              const hasEnough = have >= cost
              return (
                <div key={i} className="market-next-cost-row">
                  <img
                    src={isNightMarket ? '/images/farming/FarmCropBean.png' : cropImgPath(cid)}
                    alt=""
                    className="market-next-cost-img"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                  <span className="market-next-cost-text">
                    <span className={hasEnough ? 'market-cost-have' : 'market-cost-need'}>
                      {formatBonus(have, 1, true)}
                    </span>
                    {' / '}
                    <span>{formatBonus(cost, 1, true)}</span>
                  </span>
                </div>
              )
            })}
          </div>
        )}
        {isMaxed && (
          <span style={{ fontSize: 10, color: '#86efac', marginTop: 4 }}>Maxed</span>
        )}
      </div>
    </div>
  )
}

function MarketTab({ farming }) {
  const [activeMarket] = useState('day')
  const [activeMarketState, setActiveMarket] = useState('day')
  const marketLevels = farming?.marketLevels ?? []
  const cropDepot    = farming?.cropDepot    ?? {}

  const dayMarket   = marketMap.slice(0, 8)
  const nightMarket = marketMap.slice(8, 16)
  const displayed   = activeMarketState === 'day' ? dayMarket : nightMarket

  return (
    <div className="market-tab">
      <div className="market-sub-nav">
        <button
          className={`market-sub-btn${activeMarketState === 'day' ? ' market-sub-btn--active' : ''}`}
          onClick={() => setActiveMarket('day')}
        >
          Day Market
        </button>
        <button
          className={`market-sub-btn${activeMarketState === 'night' ? ' market-sub-btn--active' : ''}`}
          onClick={() => setActiveMarket('night')}
        >
          Night Market
        </button>
      </div>
      <div className="market-grid">
        {displayed.map(upgrade => (
          <MarketCard
            key={upgrade.index}
            upgrade={upgrade}
            level={marketLevels[upgrade.index] ?? 0}
            cropDepot={cropDepot}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// EXOTIC MARKET TAB
// ============================================================

function ExoticCard({ upgrade, level, inRotation }) {
  const value    = calcExoticBonus(upgrade, level)
  const maxValue = upgrade.type === 1 ? upgrade.baseValue : null
  const pct      = maxValue ? (value / maxValue) * 100 : null
  const seed     = getSeedByCropId(upgrade.cropCostId)
  const seedName = seed?.name?.toLowerCase() ?? ''

  return (
    <div className={`exotic-card${inRotation ? ' exotic-card--rotation' : ''}`}>
      <div className="exotic-card-header">
        <img
          src={cropImgPath(upgrade.cropCostId)}
          alt=""
          className="exotic-crop-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <span className="exotic-card-name">{upgrade.label}</span>
      </div>
      <span className="exotic-card-level">
        Lv. <span>{level}</span>
      </span>
      <span className="exotic-card-bonus">
        {renderBonusText(upgrade.bonusText, value)}
      </span>
      {pct !== null && (
        <>
          <div className="exotic-card-progress">
            <div
              className="exotic-card-progress-fill"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <span className="exotic-card-pct">{pct.toFixed(1)}% of cap</span>
        </>
      )}
      <span className={`crop-path-seed-tag seed-tag--${seedName}`}>
        {seed?.name ?? 'Unknown'}
      </span>
    </div>
  )
}

function dc_hash(e) {
  let a = 5381
  e = Math.imul(e, -0x3361d2af)
  a ^= e = Math.imul((e << 15) | (e >>> 17), 0x1b873593)
  a = Math.imul((a << 13) | (a >>> 19), 5) + -0x19ab949c | 0
  a = Math.imul(a ^ (a >> 16), -0x7a143595)
  return (a = Math.imul(a ^ (a >> 13), -0x3d4d51cb)) ^ (a >> 16)
}

function makeLavaRand(seed) {
  let s1 = seed
  let s2 = dc_hash(seed)
  if (s1 === 0) s1 = 1
  if (s2 === 0) s2 = 1

  return function rand() {
    s1 = 36969 * (65535 & s1) + (s1 >> 16)
    s2 = 18000 * (65535 & s2) + (s2 >> 16)
    return (1073741823 & (s1 << 16) + s2) % 10007 / 10007
  }
}

function getExoticRotationIndices(globalTime) {
  const currentWeek = Math.floor(globalTime / 604800)
  const seed        = Math.round(100 * currentWeek)
  const selected    = []

  for (let i = 0; i < 8; i++) {
    let attempts = 0
    let upgradeIndex
    do {
      const currentSeed = seed + i + attempts * 1000
      const rand = makeLavaRand(currentSeed)
      const r = rand()
      upgradeIndex = Math.floor(Math.max(0, Math.min(59, 60 * r)))
      attempts++
    } while (selected.includes(upgradeIndex))
    selected.push(upgradeIndex)
  }

  return selected
}

function getRotationTimeRemaining(globalTime) {
  const currentWeek = Math.floor(globalTime / 604800)
  const nextReset   = (currentWeek + 1) * 604800
  const secondsLeft = Math.floor(nextReset - globalTime)
  if (secondsLeft <= 0) return 'Resetting...'
  const d = Math.floor(secondsLeft / 86400)
  const h = Math.floor((secondsLeft % 86400) / 3600)
  const m = Math.floor((secondsLeft % 3600) / 60)
  return `${d}d ${h}h ${m}m`
}

function ExoticMarketTab({ farming, snapshot }) {
  const exoticLevels        = farming?.exoticLevels ?? []
  const cropDepot           = farming?.cropDepot    ?? {}
  const globalTime          = farming?.globalTime   ?? null
  const rotationIndices     = globalTime ? getExoticRotationIndices(globalTime) : []
  const betterExoticLevel   = exoticLevels[38]              ?? 0
  const legendTalentBrown10 = snapshot?.legendTalents?.[29] ?? 0
  const [breakpoint, setBreakpoint] = useState('')

  const realUpgrades = exoticMarketMap
    .map((u, i) => u ? { ...u, index: i, level: exoticLevels[i] ?? 0 } : null)
    .filter(Boolean)

  const rotationUpgrades    = realUpgrades.filter(u => rotationIndices.includes(u.index))
  const offRotationUpgrades = realUpgrades.filter(u => !rotationIndices.includes(u.index))

  const breakpointVal = parseInt(breakpoint) || 0

  const cropPathItems = useMemo(() => {
    const seen  = new Set()
    const items = []

    for (const upgrade of rotationUpgrades) {
      const cid = upgrade.cropCostId
      if (seen.has(cid)) continue
      seen.add(cid)

      const depotEntry    = cropDepot[String(cid)]
      const haveQty       = depotEntry?.qty ?? 0
      const levelsGainable = breakpointVal > 0
        ? calcExoticLevelsFromCrops(haveQty, betterExoticLevel, legendTalentBrown10)
        : 0
      const isDone = breakpointVal > 0 ? levelsGainable >= breakpointVal : upgrade.level > 0

      items.push({
        cropId: cid,
        seed: getSeedByCropId(cid),
        upgradeName: upgrade.label,
        haveQty,
        levelsGainable,
        isDone,
      })
    }

    items.sort((a, b) => a.cropId - b.cropId)
    return items
  }, [rotationUpgrades, cropDepot, breakpointVal, betterExoticLevel, legendTalentBrown10])

  return (
    <div className="exotic-tab">

      {/* ── Crop Grow Path ── */}
      <div className="exotic-crop-path">
        <div className="farming-group-label">Rotation Crop Grow Order</div>
        <div className="crop-path-controls">
          <span className="crop-path-label">Target Levels per Upgrade</span>
          <input
            type="number"
            className="crop-path-input"
            placeholder="e.g. 130"
            value={breakpoint}
            onChange={e => setBreakpoint(e.target.value)}
          />
          <span style={{ fontSize: 11, color: '#4b5563' }}>
            {breakpointVal > 0
              ? `Crops where you can gain < ${breakpointVal} levels shown as needed`
              : 'Set a target level gain to filter grow order'}
          </span>
        </div>
        {cropPathItems.length === 0 ? (
          <span style={{ fontSize: 12, color: '#4b5563', textAlign: 'center' }}>
            {rotationIndices.length === 0
              ? 'Rotation data unavailable — save data may not include GlobalTime.'
              : 'No crops to grow for this rotation.'}
          </span>
        ) : (
          <div className="crop-path-list">
            {cropPathItems.map(({ cropId, seed, upgradeName, haveQty, levelsGainable, isDone }) => (
            <div
                key={cropId}
                className={`crop-path-item${isDone ? ' crop-path-item--done' : ' crop-path-item--needed'}`}
            >
                <img
                src={cropImgPath(cropId)}
                alt=""
                className="crop-path-crop-img"
                onError={e => { e.currentTarget.style.display = 'none' }}
                />
                <div className="crop-path-info">
                <span className="crop-path-upgrade-name" style={{ fontWeight: 700, color: '#e5e7eb' }}>
                    {upgradeName}
                </span>
                {haveQty > 0 && (
                    <span style={{ fontSize: 9, color: '#6b7280' }}>
                    {formatBonus(haveQty, 1, true)}
                    {breakpointVal > 0 && ` · ${levelsGainable} lvls`}
                    </span>
                )}
                </div>
                <span className={`crop-path-seed-tag seed-tag--${seed?.name?.toLowerCase() ?? ''}`}>
                {seed?.name ?? '?'}
                </span>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* ── This Week's Rotation ── */}
      <div>
        <div className="exotic-section-header">
          <div className="farming-group-label" style={{ margin: 0 }}>
            This Week's Rotation
            {globalTime && (
              <span style={{ marginLeft: 8, color: '#6b7280', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                — resets in {getRotationTimeRemaining(globalTime)}
              </span>
            )}
          </div>
        </div>
        {rotationUpgrades.length === 0 ? (
          <span style={{ fontSize: 12, color: '#4b5563' }}>
            Rotation unavailable — save data may not include GlobalTime.
          </span>
        ) : (
          <div className="exotic-grid" style={{ marginTop: 8 }}>
            {rotationUpgrades.map(upgrade => (
              <ExoticCard key={upgrade.index} upgrade={upgrade} level={upgrade.level} inRotation={true} />
            ))}
          </div>
        )}
      </div>

      {/* ── Off-Rotation ── */}
      <div>
        <div className="exotic-section-header">
          <div className="farming-group-label" style={{ margin: 0 }}>Off-Rotation Upgrades</div>
        </div>
        <div className="exotic-grid" style={{ marginTop: 8 }}>
          {offRotationUpgrades.map(upgrade => (
            <ExoticCard key={upgrade.index} upgrade={upgrade} level={upgrade.level} inRotation={false} />
          ))}
        </div>
      </div>

    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Farming({ snapshot }) {
  const [activeTab, setActiveTab] = useState('landranks')
  const farming = snapshot?.farming ?? {}

  const tabs = [
    { key: 'landranks', label: 'Land Ranks'   },
    { key: 'market',    label: 'Market'        },
    { key: 'exotic',    label: 'Exotic Market' },
  ]

  return (
    <div className="page farming-page">
      <h2 className="page-title">Farming</h2>

      <InfoPanel
        intro="Track your farming progress across market upgrades, exotic market rotations, and land ranks."
        items={[
          'The Land Ranks tab shows all 20 Land Rank Database upgrades. Locked upgrades are dimmed — hover to see the total plot rank required to unlock.',
          'The first 3 land ranks scale per rank of each land plot. The card shows the base bonus per rank and the scaled total using your lowest plot rank.',
          'Seed Ranks Max Level will automatically fill to your highest of the four seed ranks to reserve points for them before optimizing other ranks. Ensure these are maxed in-game before importing your JSON save data.',
          'The optimizer is likely to reduce your production levels in order to calculate the needed ranks to reach your production cap. Anything more would be wasted points and you shouldn\'t see any change in your actual production values.',
          'The Market tab shows Day and Night market upgrades with current levels and the next crop cost requirements.',
          'The Exotic Market tab shows the current weekly rotation at the top.',
          'Set a target level gain in the Crop Grow Order to see which crops in the rotation you still need to farm — accounts for your Better Exotic and Legend Talent bonuses.',
        ]}
      />

      <div className="farming-nav">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`farming-nav-btn${activeTab === tab.key ? ' farming-nav-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'landranks' && <LandRanksTab farming={farming} />}
      {activeTab === 'market'    && <MarketTab    farming={farming} />}
      {activeTab === 'exotic'    && <ExoticMarketTab farming={farming} snapshot={snapshot} />}
    </div>
  )
}