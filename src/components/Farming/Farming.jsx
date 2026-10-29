import { useState, useMemo, useRef, useEffect } from 'react'
import { marketMap, exoticMarketMap, landRankMap, calcExoticBonus, exoticCap, calcRankBonus, getSeedByCropId, seedInfo } from '../../data'
import InfoPanel from '../InfoPanel/InfoPanel'
import { getLegendTalentLevel } from '../../utils/legendTalentUtils'
import { getOrganicLabels, getExoticMilestones } from '../../utils/exoticUtils'
import { formatBigNumber } from '../../utils/cogBoardUtils'
import {
  BEAN_IMG,
  cropImgPath,
  cropName,
  formatDecimal,
  formatMulti,
  fillBonusText,
  isNightMarket,
  marketCostMulti,
  marketLevelCost,
  marketCropId,
  marketUpcomingCosts,
  marketAffordableLevels,
  marketMaxLevel,
  getLowValueUpgrades,
  getExoticRotation,
  getUpcomingExoticRotations,
  findExoticWeeks,
  getNextExoticOffsets,
  getExoticWeek,
  exoticWeekStart,
  EXOTIC_SEARCH_WEEKS,
  rotationTimeLeft,
  BUY_ONE_GET_ONE_TALENT,
  exoticLevelsFromCrops,
  cropsForExoticLevels,
  OG_MAX,
  PER_PLOT_RANKS,
  getRankMulti,
  getSeedRankMaxLevel,
  getLandRankTotals,
  optimizeLandRanks,
  compareLandRankPlans,
  getEvoTarget,
  getOgContext,
  getOgOutlook,
  OG_RELIABILITY,
  countPlotsMet,
  getCropEvolutionBreakdown,
  getCropPushOutlook,
  getInstaGrows,
  getUndiscoveredCrops,
  getPushVerdict,
  multiNeededWithin,
  PUSH_VERDICTS,
  TOTAL_CROPS,
  formatChance,
  formatWait,
  formatTimesMore,
} from '../../utils/farmingUtils'
import './Farming.css'

const TABS = [
  { id: 'landranks', label: 'Land Ranks' },
  { id: 'market', label: 'Market' },
  { id: 'exotic', label: 'Exotic Market' },
  { id: 'cropEvo', label: 'Crop Evolution' },
]


const ORGANIC_LABEL_IMG = 'images/menagerie/OrganicLabel.png'

const hideBrokenImg = e => {
  e.currentTarget.style.display = 'none'
}

function SeedTag({ seed }) {
  return (
    <span className={`farming-seed-tag farming-seed-tag--${seed?.name?.toLowerCase() ?? 'unknown'}`}>
      {seed?.name ?? '?'}
    </span>
  )
}

// "Low value" pill next to an upgrade name; `reason` from getLowValueUpgrades
function LowValueBadge({ reason }) {
  if (!reason) return null
  return (
    <span className="farming-low-value tooltip-anchor">
      Low value
      <span className="tooltip tooltip--wrap">{reason}</span>
    </span>
  )
}

function StatChip({ label, value, valueClass = '', tooltip, icon }) {
  return (
    <div className={`farming-chip${tooltip ? ' tooltip-anchor' : ''}`}>
      {icon && (
        <img
          src={icon}
          alt=""
          className="farming-chip-icon"
        />
      )}
      <span className="farming-chip-label">{label}</span>
      <span className={`farming-chip-value ${valueClass}`}>{value}</span>
      {tooltip && <span className="tooltip tooltip--wrap">{tooltip}</span>}
    </div>
  )
}

// ============================================================
// LAND RANKS TAB
// ============================================================

function RankCard({ rank, level, locked, badge, unchanged, children }) {
  return (
    <div className={`rank-upg-card${locked ? ' rank-upg-card--locked' : ''}${badge ? ' rank-upg-card--planned' : ''}${unchanged ? ' rank-upg-card--unchanged' : ''}`}>
      {badge}
      <img
        src={`images/farming/RankUpg${rank.index}.png`}
        alt={rank.name}
        className="rank-upg-img"
        onError={hideBrokenImg}
      />
      <span className="rank-upg-name">{rank.name}</span>
      <span className="rank-upg-level">Lv. {level}</span>
      {children}
    </div>
  )
}

function changeClass(before, after) {
  if (after > before) return 'rank-change--up'
  if (after < before) return 'rank-change--down'
  return 'rank-change--same'
}

// Searchable crop picker for the evolution target, in crop order with seed headers. Each crop
// shows your chance per roll of evolving into it now, and whether it's in your depot yet.
function CropTargetPicker({ cropId, onChange, farming, evoTotal }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const listRef = useRef(null)
  const depot = useMemo(() => farming?.cropDepot ?? {}, [farming])

  const crops = useMemo(() => seedInfo.flatMap(seed => (
    Array.from({ length: seed.cropIdMax - seed.cropIdMin + 1 }, (_, i) => {
      const id = seed.cropIdMin + i
      return {
        id,
        seed,
        name: cropName(id),
        found: Boolean(depot[String(id)]),
        chance: i === 0 ? 1 : Math.min(1, seedInfo[0].nextCropChance * Math.pow(seed.nextCropDecay, i - 1) * evoTotal),
      }
    })
  )), [depot, evoTotal])
  const nextNew = crops.find(c => !c.found)?.id ?? null

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? crops.filter(c => c.name.toLowerCase().includes(q)) : crops
  }, [crops, query])

  useEffect(() => {
    if (!open) return undefined
    const onDown = e => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // Open on the chosen crop, or the next one you haven't found
  useEffect(() => {
    if (!open || query) return
    const focusId = cropId ?? nextNew
    listRef.current?.querySelector(`[data-crop="${focusId}"]`)?.scrollIntoView({ block: 'center' })
  }, [open, query, cropId, nextNew])

  function choose(id) {
    onChange(id)
    setQuery('')
    setOpen(false)
  }

  return (
    <div
      ref={boxRef}
      className="exotic-search evo-target"
    >
      {cropId !== null && !open && (
        <img
          src={cropImgPath(cropId)}
          alt=""
          className="evo-target-input-img"
          onError={hideBrokenImg}
        />
      )}
      <input
        type="text"
        className={`farming-input exotic-search-input${cropId !== null && !open ? ' evo-target-input--picked' : ''}`}
        placeholder="Pick a crop"
        value={open ? query : (cropId === null ? '' : cropName(cropId))}
        onMouseDown={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onChange={e => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') setOpen(false)
          if (e.key === 'Enter' && matches[0]) choose(matches[0].id)
        }}
      />
      {cropId !== null && (
        <button
          type="button"
          className="exotic-search-clear"
          aria-label="Clear target"
          onMouseDown={e => e.preventDefault()}
          onClick={() => onChange(null)}
        >
          ×
        </button>
      )}
      {open && (
        <div
          ref={listRef}
          className="exotic-search-list"
        >
          {matches.length === 0 && (
            <div className="exotic-search-empty">No crops match</div>
          )}
          {matches.map((crop, i) => (
            <div key={crop.id}>
              {(i === 0 || matches[i - 1].seed !== crop.seed) && (
                <div className={`evo-target-seed-head farming-seed--${crop.seed.name.toLowerCase()}`}>{crop.seed.name}</div>
              )}
              <div
                data-crop={crop.id}
                className={`evo-target-option${crop.id === cropId ? ' exotic-search-option--selected' : ''}${crop.found ? ' evo-target-option--found' : ''}`}
                onMouseDown={e => e.preventDefault()}
                onClick={() => choose(crop.id)}
              >
                <img
                  src={cropImgPath(crop.id)}
                  alt=""
                  className="evo-target-option-img"
                  onError={hideBrokenImg}
                />
                <span className="exotic-search-option-name">{crop.name}</span>
                <span className="evo-target-option-chance">
                  {crop.id === nextNew && <span className="evo-target-next">next</span>}
                  {formatChance(crop.chance)} / roll
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LandRanksTab({ snapshot, farming, tomePoints }) {
  const upgradesLevels = useMemo(() => farming.upgradesLevels ?? [], [farming.upgradesLevels])
  const totalRankPoints = farming.totalRankPoints ?? 0
  const usedRankPoints = farming.usedRankPoints ?? 0
  const freePoints = totalRankPoints - usedRankPoints
  const plotCount = farming.plotCount ?? 0
  const farmingRanks = farming.farmingRanks ?? []
  const lowestPlotRank = farmingRanks.length ? Math.min(...farmingRanks) : 0
  const seedLevel = getSeedRankMaxLevel(snapshot)

  const [includeFarmExp, setIncludeFarmExp] = useState(false)
  const [plan, setPlan] = useState(null)
  const [targetCrop, setTargetCrop] = useState(null)
  const [targetChance, setTargetChance] = useState('100')

  const rankMulti = getRankMulti(snapshot)
  const evo = useMemo(
    () => getCropEvolutionBreakdown(snapshot, rankMulti, { tomePoints }),
    [snapshot, rankMulti, tomePoints]
  )
  const ogContext = useMemo(() => getOgContext(snapshot), [snapshot])
  const ogNow = useMemo(
    () => getOgOutlook(upgradesLevels, rankMulti, ogContext),
    [upgradesLevels, rankMulti, ogContext]
  )
  const chancePct = Math.min(100, Math.max(0, parseFloat(targetChance) || 0))
  const evoTarget = useMemo(
    () => (targetCrop === null || chancePct <= 0 ? null : getEvoTarget(farming, rankMulti, evo, targetCrop, chancePct)),
    [farming, rankMulti, evo, targetCrop, chancePct]
  )
  const totals = useMemo(
    () => getLandRankTotals(farming, rankMulti),
    [farming, rankMulti]
  )

  const rankBonus = (rank, level) => {
    const bonus = calcRankBonus(rank, level, rankMulti)
    return PER_PLOT_RANKS.has(rank.index) ? bonus * lowestPlotRank : bonus
  }

  function runOptimizer(fullReset) {
    const { levels, leftover, target, og } = optimizeLandRanks(farming, rankMulti, {
      seedLevel,
      includeFarmingExp: includeFarmExp,
      fullReset,
      evoCap: evoTarget?.landNeeded ?? Infinity,
      ogContext,
    })
    setPlan({
      fullReset,
      levels,
      leftover,
      og,
      target: evoTarget && {
        ...evoTarget,
        ...countPlotsMet(farming, rankMulti, levels, evoTarget.landNeeded),
        reachable: target?.reachable ?? true,
        bestLandMulti: target?.bestLandMulti,
      },
      changes: compareLandRankPlans(farming, rankMulti, upgradesLevels, levels)
        .filter(({ change }) => Math.abs(change) >= 0.005),
    })
  }

  const ogChange = plan?.changes.find(({ goal }) => goal === 'overgrowth')

  // Every upgrade in game order (rows of 5, each ending on a Seed upgrade) so the plan lines up
  // with the in-game database; unchanged ones are dimmed
  const planRows = plan && landRankMap.map(rank => ({
    rank,
    before: upgradesLevels[rank.index] ?? 0,
    after: plan.levels[rank.index],
  }))

  return (
    <div className="farming-tab">

      <div className="farming-chip-row">
        <StatChip
          label="Total Plot Ranks"
          value={totalRankPoints.toLocaleString()}
        />
        <StatChip
          label="Points Used"
          value={usedRankPoints.toLocaleString()}
        />
        <StatChip
          label="Points Available"
          value={freePoints.toLocaleString()}
          valueClass={freePoints > 0 ? 'farming-chip-value--good' : ''}
        />
        <StatChip
          label="Lowest Plot"
          value={lowestPlotRank.toLocaleString()}
          valueClass="farming-chip-value--gold"
        />
        <StatChip
          label="Plots"
          value={`${plotCount}/36`}
        />
      </div>

      {/* ── Rank Database ── */}
      <section className="farming-section">
        <div className="farming-group-label">Land Rank Database</div>
        <div className="rank-database-grid">
          {landRankMap.map(rank => {
            const level = upgradesLevels[rank.index] ?? 0
            const locked = totalRankPoints < rank.unlockAt
            const bonus = calcRankBonus(rank, level, rankMulti)
            return (
              <RankCard
                key={rank.index}
                rank={rank}
                level={level}
                locked={locked}
              >
                <span className="rank-upg-desc">
                  {rank.description.replace('{', formatDecimal(bonus, 2))}
                </span>
                {!locked && PER_PLOT_RANKS.has(rank.index) && level > 0 && (
                  <span className="rank-upg-per-plot">
                    +{formatDecimal(bonus * lowestPlotRank, 2)}% on lowest plot
                  </span>
                )}
                {locked && (
                  <span className="rank-upg-unlock">
                    Unlocks at {rank.unlockAt.toLocaleString()} total plot rank
                  </span>
                )}
              </RankCard>
            )
          })}
        </div>

        <div className="farming-chip-row">
          <StatChip
            label="Land Rank Evo Multi"
            value={`${formatMulti(totals.cropEvolution)}x`}
            tooltip="Only the Land Rank Database's part of crop evolution, averaged over your plots. The Crop Evolution tab has the full multi."
          />
          <StatChip
            label="Plots at Value Cap"
            value={`${totals.cappedPlots}/${totals.plotCount}`}
            valueClass={totals.plotCount > 0 && totals.cappedPlots === totals.plotCount ? 'farming-chip-value--good' : ''}
            tooltip={`Lowest plot: ${totals.lowestCropValue.toLocaleString()} / ${Math.round(totals.cropValueCap).toLocaleString()} crop value`}
          />
          <StatChip
            label="OG in a Day"
            value={`${ogNow.ogInDay}`}
            tooltip={`A fresh ${ogContext.seed.name} plant reaches OG ${ogNow.ogInDay} within a day ${Math.round(ogNow.chanceInDay * 100)}% of the time${ogNow.nextChanceInDay !== null ? ` (OG ${ogNow.ogInDay + 1}: ${Math.round(ogNow.nextChanceInDay * 100)}%)` : ''}, with your current land ranks.`}
          />
          <StatChip
            label="Highest OG"
            value={`${totals.highestOg}/${OG_MAX}`}
            valueClass={totals.highestOg >= OG_MAX ? 'farming-chip-value--good' : ''}
            tooltip={`Each OG doubles a crop's value, up to the 1e9x cap at OG ${OG_MAX}. Lowest planted plot: OG ${totals.lowestOg}.`}
          />
        </div>
      </section>

      {/* ── Optimizer ── */}
      <section className="farming-section">
        <div className="farming-group-label">Point Distribution Optimizer</div>
        <div className="farming-input-row">
          <label className="farming-check tooltip-anchor">
            <input
              type="checkbox"
              checked={includeFarmExp}
              onChange={e => setIncludeFarmExp(e.target.checked)}
            />
            Include Farming EXP
            <span className="tooltip tooltip--wrap">Adds the Farming EXP ranks to the split. They only get points while those points are worth more there than in crop evolution or rank EXP. Farming EXP levels off fast, so a big share would mostly waste points.</span>
          </label>
          <button
            className="farming-btn"
            onClick={() => runOptimizer(false)}
            disabled={freePoints <= 0}
          >
            Spend {Math.max(0, freePoints).toLocaleString()} Points
          </button>
          <button
            className="farming-btn farming-btn--reset tooltip-anchor"
            onClick={() => runOptimizer(true)}
            disabled={totalRankPoints === 0}
          >
            Full Reset
            <span className="tooltip tooltip--wrap">Replans all {totalRankPoints.toLocaleString()} points, as if you reset them in game</span>
          </button>
        </div>
        <div className="farming-input-row">
          <span className="farming-input-label tooltip-anchor">
            Crop Evo Target
            <span className="tooltip tooltip--wrap">Stops adding crop evolution once every plot reaches this chance of evolving into the chosen crop, so the rest goes to crop value, rank EXP and Overgrowth</span>
          </span>
          <CropTargetPicker
            cropId={targetCrop}
            onChange={setTargetCrop}
            farming={farming}
            evoTotal={evo.total}
          />
          <input
            type="number"
            min="0"
            max="100"
            className="farming-input evo-target-chance"
            value={targetChance}
            onChange={e => setTargetChance(e.target.value)}
            disabled={targetCrop === null}
          />
          <span className="farming-input-hint">% chance</span>
        </div>
        {evoTarget && (
          <p className="farming-note">
            {evoTarget.tier === 0
              ? <>{cropName(evoTarget.cropId)} is the first {evoTarget.seed.name} crop, so it needs no evolution.</>
              : <>
                  {cropName(evoTarget.cropId)} at {formatDecimal(evoTarget.chancePct, 2)}% needs {formatMulti(evoTarget.needTotal)}x crop evolution.
                  Everything outside land ranks gives {formatMulti(evoTarget.otherMulti)}x, so land ranks must give{' '}
                  <span className="farming-note-highlight">{formatMulti(Math.max(1, evoTarget.landNeeded))}x</span> on every plot.
                  {' '}{evoTarget.plotsMet} / {evoTarget.scoredPlots} plots get there now.
                </>}
          </p>
        )}
        <p className="farming-note">
          {freePoints > 0
            ? <>Spend adds your <span className="farming-note-highlight">{freePoints.toLocaleString()}</span> unspent points on top of your current levels and never removes any. </>
            : <>No unspent points right now. </>}
          Full Reset replans all {totalRankPoints.toLocaleString()} points from scratch. Seed ranks are filled to Lv. {seedLevel} first.
          {' '}Overgrowth only gets what it needs for the best OG a crop reaches within a day in {Math.round(OG_RELIABILITY * 100)}% of plantings (more points level off and rarely add an OG); the rest goes to crop evolution, rank EXP and crop value.
        </p>

        {plan && (
          <>
            <div className="farming-chip-row">
              <StatChip
                label="Plan"
                value={plan.fullReset ? 'Full Reset' : 'Spend Unspent'}
              />
              {plan.changes.length === 0 && (
                <StatChip
                  label="Result"
                  value={plan.fullReset ? 'Already optimal' : 'No gain'}
                  valueClass={plan.fullReset ? 'farming-chip-value--good' : ''}
                />
              )}
              {/* Overgrowth gets its own chip below, with its % change in the tooltip */}
              {plan.changes.filter(({ goal }) => !(plan.og && goal === 'overgrowth')).map(({ goal, label, change }) => (
                <StatChip
                  key={goal}
                  label={label}
                  value={`${change > 0 ? '+' : ''}${formatDecimal(change, 2)}%`}
                  valueClass={change > 0 ? 'farming-chip-value--good' : 'farming-chip-value--bad'}
                />
              ))}
              {plan.og && (
                <StatChip
                  label="Overgrowth"
                  value={`OG ${plan.og.plan.ogInDay} in a day`}
                  valueClass="farming-chip-value--good"
                  tooltip={`Overgrowth gets the fewest points that still reach OG ${plan.og.plan.ogInDay} within a day of growing in ${Math.round(plan.og.plan.chanceInDay * 100)}% of ${plan.og.seed.name} plantings (${plan.og.seed.name} needs the most of your seeds, so every seed you plant is covered). Even every point in Overgrowth would reach OG ${plan.og.best.ogInDay + 1} in a day only ${Math.round((plan.og.best.nextChanceInDay ?? 0) * 100)}% of the time, so the rest went to crop evolution, rank EXP and crop value.${ogChange ? ` OG chance ${ogChange.change > 0 ? '+' : ''}${formatDecimal(ogChange.change, 2)}% vs your current levels.` : ''}`}
                />
              )}
              {plan.target && plan.target.tier > 0 && (
                <StatChip
                  label={`${cropName(plan.target.cropId)} Target`}
                  value={plan.target.reachable ? `${plan.target.plotsMet} / ${plan.target.scoredPlots} plots` : 'Out of reach'}
                  valueClass={plan.target.reachable ? 'farming-chip-value--good' : 'farming-chip-value--bad'}
                  tooltip={plan.target.reachable
                    ? 'Every plot reaches the target. Points past it went to the other goals.'
                    : `Even with every point in crop evolution, land ranks reach ${formatMulti(plan.target.bestLandMulti)}x on your lowest plot, short of the ${formatMulti(plan.target.landNeeded)}x needed. Planned as if no target was set.`}
                />
              )}
              {plan.leftover > 0 && (
                <StatChip
                  label="Unused Points"
                  value={plan.leftover.toLocaleString()}
                  tooltip="Nothing unlocked gains from these"
                />
              )}
            </div>
            <div className="rank-database-grid">
              {planRows.map(({ rank, before, after }) => {
                const gain = rankBonus(rank, after) - rankBonus(rank, before)
                return (
                  <RankCard
                    key={rank.index}
                    rank={rank}
                    level={after}
                    locked={totalRankPoints < rank.unlockAt}
                    unchanged={before === after}
                    badge={(
                      <span className={`rank-change-badge ${changeClass(before, after)}`}>
                        {before} → {after}
                      </span>
                    )}
                  >
                    {gain !== 0 && (
                      <span className={`rank-upg-gain ${changeClass(0, gain)}`}>
                        {gain > 0 ? '+' : ''}{formatDecimal(gain, 2)}%
                      </span>
                    )}
                  </RankCard>
                )
              })}
            </div>
          </>
        )}
      </section>

    </div>
  )
}

// ============================================================
// MARKET TAB
// ============================================================

const cropLabel = cropId => cropId === null ? 'Magic Beans' : cropName(cropId)
const costImg = cropId => cropId === null ? BEAN_IMG : cropImgPath(cropId)

function MarketRow({ upgrade, level, costMulti, haveOf, lowValue }) {
  const isMaxed = level >= upgrade.maxLvl
  const night = isNightMarket(upgrade)
  const nextCropId = night ? null : marketCropId(upgrade, Math.min(level, upgrade.maxLvl - 1))
  const nextCost = isMaxed ? 0 : marketLevelCost(upgrade, level, costMulti)
  const have = haveOf(nextCropId)
  const affordable = isMaxed ? 0 : marketAffordableLevels(upgrade, level, costMulti, haveOf)
  // The first group is the crop the next level costs, already shown in its own column
  const later = isMaxed ? [] : marketUpcomingCosts(upgrade, level, costMulti).slice(1)
  const seedClass = night
    ? 'farming-seed--bean'
    : `farming-seed--${getSeedByCropId(nextCropId)?.name?.toLowerCase() ?? 'unknown'}`
  const rowClass = [
    'market-row',
    isMaxed ? 'market-row--maxed' : seedClass,
  ].join(' ')

  return (
    <div className={rowClass}>
      <span className="exotic-crop tooltip-anchor">
        <img
          src={costImg(nextCropId)}
          alt=""
          className="market-row-img"
          onError={hideBrokenImg}
        />
        <span className="tooltip">{cropLabel(nextCropId)}</span>
      </span>
      <div className="market-row-info">
        <span className="market-row-name">
          {upgrade.label}
          <LowValueBadge reason={lowValue} />
        </span>
        <span className="market-row-bonus">
          {fillBonusText(upgrade.bonusText, level * upgrade.bonusPerLvl)}
        </span>
      </div>
      <div className="market-row-level">
        <span className="market-row-level-text">
          Lv <span>{level}</span> / {upgrade.maxLvl}
        </span>
        <div className="exotic-progress">
          <div
            className="exotic-progress-fill"
            style={{ width: `${Math.min(100, (level / upgrade.maxLvl) * 100)}%` }}
          />
        </div>
      </div>
      <div className="market-row-next">
        {isMaxed ? (
          <span className="market-row-maxed">Maxed</span>
        ) : (
          <>
            <span className="market-row-cost">
              <span className={have >= nextCost ? 'market-cost-have' : 'market-cost-need'}>
                {formatBigNumber(have)}
              </span>
              {' / '}
              {formatBigNumber(nextCost)}
            </span>
            <span className="market-row-afford">
              {affordable > 0 ? `+${affordable} LV affordable now` : cropLabel(nextCropId)}
            </span>
          </>
        )}
      </div>
      <div className="market-row-later">
        {later.map(({ cropId, cost, levels }, i) => {
          const laterHave = haveOf(cropId)
          return (
            <span
              key={i}
              className={`market-later tooltip-anchor${laterHave >= cost ? ' market-later--have' : ''}`}
            >
              <img
                src={costImg(cropId)}
                alt=""
                className="market-later-img"
                onError={hideBrokenImg}
              />
              <span className="market-later-cost">{formatBigNumber(cost)}</span>
              <span className="tooltip tooltip--right">
                {night
                  ? `LV ${level + i + 2}: ${formatBigNumber(laterHave)} / ${formatBigNumber(cost)} beans`
                  : `${cropLabel(cropId)} · ${levels} LV${levels > 1 ? 's' : ''}: ${formatBigNumber(laterHave)} / ${formatBigNumber(cost)}`}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

function MarketTab({ snapshot, farming }) {
  const [activeMarket, setActiveMarket] = useState('day')
  const marketLevels = farming.marketLevels ?? []
  const cropDepot = farming.cropDepot ?? {}
  const night = activeMarket === 'night'
  const costMulti = marketCostMulti(snapshot, night)
  // maxLvl here includes the research grid raise, so every cost helper stops at the real cap
  const upgrades = (night ? marketMap.slice(8) : marketMap.slice(0, 8))
    .map(upgrade => ({
      ...upgrade,
      maxLvl: marketMaxLevel(snapshot, upgrade),
    }))

  // Night Market costs magic beans (cropId null)
  const haveOf = cropId => cropId === null
    ? farming.beans ?? 0
    : cropDepot[String(cropId)]?.qty ?? 0

  const maxedCount = upgrades.filter(u => (marketLevels[u.index] ?? 0) >= u.maxLvl).length
  const lowValue = useMemo(() => getLowValueUpgrades(snapshot, getRankMulti(snapshot)), [snapshot])

  return (
    <div className="farming-tab">
      <div className="market-sub-nav">
        {['day', 'night'].map(id => (
          <button
            key={id}
            className={`market-sub-btn${activeMarket === id ? ' market-sub-btn--active' : ''}`}
            onClick={() => setActiveMarket(id)}
          >
            {id === 'day' ? 'Day Market' : 'Night Market'}
          </button>
        ))}
      </div>
      <section className="farming-section">
        <div className="farming-chip-row">
          <StatChip
            label="Costs"
            value={`${formatDecimal((1 - costMulti) * 100, 1)}% off`}
            tooltip={`Emperor discount × Better ${night ? 'Night' : 'Day'} I and II exotics. Every cost below already includes it.`}
          />
          {night && (
            <StatChip
              icon={BEAN_IMG}
              label="Magic Beans"
              value={formatBigNumber(farming.beans ?? 0)}
            />
          )}
          <StatChip
            label="Maxed"
            value={`${maxedCount} / ${upgrades.length}`}
          />
        </div>
        <div className="market-list">
          <div className="market-list-head">
            <span />
            <span>Upgrade</span>
            <span>Level</span>
            <span>Next level · have / need</span>
            <span>{night ? 'Following levels' : 'Upcoming crops'}</span>
          </div>
          {upgrades.map(upgrade => (
            <MarketRow
              key={upgrade.index}
              upgrade={upgrade}
              level={marketLevels[upgrade.index] ?? 0}
              costMulti={costMulti}
              haveOf={haveOf}
              lowValue={lowValue.market.get(upgrade.index)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

// ============================================================
// EXOTIC MARKET TAB
// ============================================================

const UPCOMING_WEEKS = 10

// Rotation row badges: amber when the upgrade won't be sold again for longer than
// LONG_ABSENCE_WEEKS, green when it's back within RETURNS_SOON_WEEKS
const LONG_ABSENCE_WEEKS = 12
const RETURNS_SOON_WEEKS = 3

// "Wed, Nov 4, 2026, 5:00 PM" in the viewer's own time zone
const formatWeekStart = date => date.toLocaleString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const weeksAway = offset => offset === 1 ? 'Next week' : `In ${offset} weeks`

function ExoticRow({ upgrade, buy, returnsIn, now, lowValue }) {
  const value = calcExoticBonus(upgrade, upgrade.level, upgrade.organic)
  // Type 1 bonuses approach their cap; type 0 grow without one
  const capPct = upgrade.type === 1 ? (value / exoticCap(upgrade, upgrade.organic)) * 100 : null
  const milestones = getExoticMilestones(upgrade, upgrade.level, upgrade.organic, buy?.levels ?? 0)
  const seed = getSeedByCropId(upgrade.cropCostId)
  const rowClass = [
    'exotic-row',
    `farming-seed--${seed?.name?.toLowerCase() ?? 'unknown'}`,
  ].filter(Boolean).join(' ')

  const awayLong = returnsIn === undefined || returnsIn > LONG_ABSENCE_WEEKS
  const backSoon = returnsIn !== undefined && returnsIn <= RETURNS_SOON_WEEKS

  return (
    <div className={rowClass}>
      {backSoon && (
        <span className="notice-badge exotic-away exotic-away--soon tooltip-anchor">
          {returnsIn}w
          <span className="tooltip tooltip--right">
            Back {weeksAway(returnsIn).toLowerCase()} ({formatWeekStart(exoticWeekStart(getExoticWeek(now) + returnsIn))})
          </span>
        </span>
      )}
      {awayLong && (
        <span className="notice-badge exotic-away tooltip-anchor">
          {returnsIn === undefined ? '10y+' : `${returnsIn}w`}
          <span className="tooltip tooltip--right">
            {returnsIn === undefined
              ? `Not back for over ${EXOTIC_SEARCH_WEEKS / 52} years`
              : `Not back for ${returnsIn} weeks (${formatWeekStart(exoticWeekStart(getExoticWeek(now) + returnsIn))})`}
          </span>
        </span>
      )}
      <span className="exotic-crop tooltip-anchor">
        <img
          src={cropImgPath(upgrade.cropCostId)}
          alt=""
          className="exotic-crop-img"
          onError={hideBrokenImg}
        />
        <span className="tooltip">{cropName(upgrade.cropCostId)}</span>
      </span>
      <div className="exotic-row-info">
        <span className="exotic-row-name">
          {upgrade.label}
          {upgrade.organic && (
            <img
              src={ORGANIC_LABEL_IMG}
              alt="Organic Label"
              className="exotic-organic-img"
            />
          )}
          <LowValueBadge reason={lowValue} />
        </span>
        <span className="exotic-row-bonus">
          {fillBonusText(upgrade.bonusText, value)}
        </span>
      </div>
      <span className="exotic-row-level">
        Lv <span>{upgrade.level}</span>
      </span>
      <div className="exotic-row-cap">
        {capPct !== null ? (
          <>
            <span className="exotic-row-cap-text">{capPct.toFixed(1)}% of cap</span>
            <div className="exotic-progress">
              <div
                className="exotic-progress-fill"
                style={{ width: `${Math.min(100, capPct)}%` }}
              />
            </div>
            <span className="milestone-row">
              {milestones.map(milestone => (
                <span
                  key={milestone.percent}
                  className={`milestone tooltip-anchor${milestone.reached ? ' milestone--reached' : ''}${milestone.reachedAfterBuy ? ' milestone--soon' : ''}`}
                >
                  {milestone.percent}
                  <span className="tooltip">
                    {milestone.percent}% of cap at Lv {milestone.level.toLocaleString('en-US')}
                    {milestone.reached
                      ? ' ✓'
                      : ` (${(milestone.level - upgrade.level).toLocaleString('en-US')} to go${milestone.reachedAfterBuy ? ', this buy gets it' : ''})`}
                  </span>
                </span>
              ))}
            </span>
          </>
        ) : (
          <span className="exotic-row-cap-text">No cap</span>
        )}
      </div>
      {buy && (
        <div className="exotic-row-buy">
          <span className="exotic-row-buy-lvls">+{buy.levels} LV</span>
          <span className="exotic-row-buy-qty">{formatBigNumber(buy.haveQty)} crops</span>
          {buy.target && (
            <span className={`exotic-row-target${buy.haveQty >= buy.target.need ? ' exotic-row-target--ready' : ''}`}>
              {buy.target.levels} LV: {buy.haveQty >= buy.target.need ? 'ready' : `${formatBigNumber(buy.target.need)} crops`}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function UpcomingChip({ upgrade, highlighted, lowValue }) {
  const seed = getSeedByCropId(upgrade.cropCostId)
  const value = calcExoticBonus(upgrade, upgrade.level, false)
  const capPct = upgrade.type === 1 ? (value / exoticCap(upgrade, false)) * 100 : null
  const chipClass = [
    'exotic-chip',
    `farming-seed--${seed?.name?.toLowerCase() ?? 'unknown'}`,
    highlighted ? 'exotic-chip--highlight' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={chipClass}>
      <span className="exotic-crop tooltip-anchor">
        <img
          src={cropImgPath(upgrade.cropCostId)}
          alt=""
          className="exotic-chip-img"
          onError={hideBrokenImg}
        />
        <span className="tooltip">{cropName(upgrade.cropCostId)}</span>
      </span>
      <div className="exotic-chip-info">
        <span className="exotic-chip-name">
          {upgrade.label}
          <LowValueBadge reason={lowValue} />
        </span>
        <span className="exotic-chip-meta">
          Lv {upgrade.level.toLocaleString('en-US')}
          {capPct !== null && ` · ${capPct.toFixed(1)}% of cap`}
        </span>
      </div>
    </div>
  )
}

// Searchable upgrade picker (a native <select> can't be styled dark on Windows)
function UpgradeSearch({ upgrades, nextOffsets, value, onChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listRef = useRef(null)
  const boxRef = useRef(null)
  const selected = upgrades.find(u => u.index === value)

  // Close on any click outside the picker (blur alone misses some clicks)
  useEffect(() => {
    if (!open) return undefined
    const onDown = e => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return upgrades.filter(u => !q
      || u.label.toLowerCase().includes(q)
      || u.bonusText.toLowerCase().includes(q))
  }, [upgrades, query])

  function choose(upgrade) {
    onChange(upgrade.index)
    setQuery('')
    setOpen(false)
  }

  function moveActive(step) {
    const next = Math.max(0, Math.min(matches.length - 1, active + step))
    setActive(next)
    listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' })
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) setOpen(true)
      else moveActive(1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveActive(-1)
    } else if (e.key === 'Enter' && open && matches[active]) {
      e.preventDefault()
      choose(matches[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div
      ref={boxRef}
      className="exotic-search"
    >
      <input
        type="text"
        className="farming-input exotic-search-input"
        placeholder={selected ? selected.label : 'Filter by upgrade'}
        value={open ? query : (selected?.label ?? '')}
        onFocus={() => {
          setOpen(true)
          setActive(0)
        }}
        onMouseDown={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={e => {
          setQuery(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
      />
      {selected && (
        <button
          type="button"
          className="exotic-search-clear"
          aria-label="Clear filter"
          onMouseDown={e => e.preventDefault()}
          onClick={() => onChange(null)}
        >
          ×
        </button>
      )}
      {open && (
        <div
          ref={listRef}
          className="exotic-search-list"
        >
          {matches.length === 0 && (
            <div className="exotic-search-empty">No upgrades match</div>
          )}
          {matches.map((upgrade, i) => {
            const offset = nextOffsets.get(upgrade.index)
            const value = calcExoticBonus(upgrade, upgrade.level, upgrade.organic)
            return (
              <div
                key={upgrade.index}
                className={`exotic-search-option${i === active ? ' exotic-search-option--active' : ''}${upgrade.index === selected?.index ? ' exotic-search-option--selected' : ''}`}
                onMouseDown={e => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(upgrade)}
              >
                <span className="exotic-search-option-name">{upgrade.label}</span>
                <span className="exotic-search-option-next">
                  {offset ? weeksAway(offset).toLowerCase() : 'not soon'}
                </span>
                <span className="exotic-search-option-bonus">{fillBonusText(upgrade.bonusText, value)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function UpcomingRotations({ upgrades, nextOffsets, now, lowValue }) {
  const [filterIndex, setFilterIndex] = useState(null)

  const byIndex = useMemo(() => new Map(upgrades.map(u => [u.index, u])), [upgrades])
  // Upgrade order, like the in-game market and Toolbox's filter
  const options = useMemo(() => [...upgrades].sort((a, b) => a.index - b.index), [upgrades])

  const weeks = useMemo(() => filterIndex === null
    ? getUpcomingExoticRotations(now, UPCOMING_WEEKS)
    : findExoticWeeks(filterIndex, now, UPCOMING_WEEKS),
  [filterIndex, now])

  const nextOffset = filterIndex === null ? null : nextOffsets.get(filterIndex)
  const hint = filterIndex === null
    ? `The next ${UPCOMING_WEEKS} weekly rotations`
    : nextOffset
      ? `Next sold ${weeksAway(nextOffset).toLowerCase()}, ${formatWeekStart(weeks[0].start)}. Showing its next ${weeks.length} rotations.`
      : `Not sold in the next ${EXOTIC_SEARCH_WEEKS / 52} years`

  return (
    <section className="farming-section">
      <div className="farming-group-label">Upcoming Rotations</div>
      <div className="farming-input-row">
        <span className="farming-input-label">Find an Upgrade</span>
        <UpgradeSearch
          upgrades={options}
          nextOffsets={nextOffsets}
          value={filterIndex}
          onChange={setFilterIndex}
        />
        <span className="farming-input-hint">{hint}</span>
      </div>
      <div className="exotic-weeks">
        {weeks.map(week => (
          <div
            key={week.week}
            className="exotic-week"
          >
            <div className="exotic-week-head">
              <span className="exotic-week-title">{weeksAway(week.offset)}</span>
              <span className="exotic-week-date">{formatWeekStart(week.start)}</span>
            </div>
            <div className="exotic-week-grid">
              {week.upgrades
                .map(i => byIndex.get(i))
                .filter(Boolean)
                .sort((a, b) => a.cropCostId - b.cropCostId)
                .map(upgrade => (
                  <UpcomingChip
                    key={upgrade.index}
                    upgrade={upgrade}
                    highlighted={upgrade.index === filterIndex}
                    lowValue={lowValue.exotic.get(upgrade.index)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ExoticMarketTab({ snapshot, farming }) {
  const { exoticLevels, organicExotics, cropDepot } = farming
  const legendTalents = snapshot?.legendTalents
  const organicLabels = getOrganicLabels(snapshot)
  const lowValue = useMemo(() => getLowValueUpgrades(snapshot, getRankMulti(snapshot)), [snapshot])
  const buyOneGetOneLevel = getLegendTalentLevel(legendTalents, BUY_ONE_GET_ONE_TALENT)
  const [target, setTarget] = useState('')
  const targetLevels = parseInt(target) || 0

  // The rotation follows the real clock, so it stays right even with an old save
  const [now] = useState(() => Date.now() / 1000)

  const nextOffsets = useMemo(() => getNextExoticOffsets(now), [now])

  const { upgrades, onSale } = useMemo(() => {
    const rotation = getExoticRotation(now)
    const upgrades = exoticMarketMap
      .filter(Boolean)
      .map(u => ({
        ...u,
        level: exoticLevels?.[u.index] ?? 0,
        organic: (organicExotics ?? []).includes(u.index),
      }))
    return {
      upgrades,
      onSale: rotation.map(i => upgrades.find(u => u.index === i)),
    }
  }, [now, exoticLevels, organicExotics])

  // This week's upgrades in crop order, which is the order you grow them in
  const growOrder = useMemo(() => onSale
    .map(upgrade => {
      const haveQty = cropDepot?.[String(upgrade.cropCostId)]?.qty ?? 0
      const levels = exoticLevelsFromCrops(haveQty, farming, buyOneGetOneLevel, upgrade.index)
      const target = targetLevels > 0
        ? {
            levels: targetLevels,
            need: cropsForExoticLevels(targetLevels, farming, buyOneGetOneLevel, upgrade.organic),
          }
        : null
      return {
        upgrade,
        buy: {
          haveQty,
          levels,
          target,
        },
      }
    })
    .sort((a, b) => a.upgrade.cropCostId - b.upgrade.cropCostId),
  [onSale, cropDepot, farming, buyOneGetOneLevel, targetLevels])

  return (
    <div className="farming-tab">

      {/* ── This Week's Rotation ── */}
      <section className="farming-section">
        <div className="farming-group-label">
          This Week's Rotation
          <span className="farming-group-label-note">resets in {rotationTimeLeft(now)}</span>
        </div>
        {organicLabels.owned > 0 && (
          <div className="farming-chip-row">
            <StatChip
              icon={ORGANIC_LABEL_IMG}
              label="Organic Labels"
              value={`${organicLabels.left} left · ${organicLabels.placed} / ${organicLabels.owned} placed`}
              tooltip="Labels can only go on upgrades in this week's rotation. A labelled upgrade gets 2x its bonus, and each purchase gives 1.5x as many LVs as it would without the label."
            />
          </div>
        )}
        <div className="farming-input-row">
          <span className="farming-input-label">Target LVs per Buy</span>
          <input
            type="number"
            className="farming-input"
            placeholder="e.g. 800"
            value={target}
            onChange={e => setTarget(e.target.value)}
          />
          <span className="farming-input-hint">
            {targetLevels > 0
              ? `Crops each upgrade needs to get +${targetLevels} LV in one buy`
              : 'Enter LVs to see how many crops each buy needs'}
          </span>
        </div>
        <div className="exotic-list">
          <div className="exotic-list-head">
            <span />
            <span>Upgrade · in grow order</span>
            <span>Level</span>
            <span>Cap</span>
            <span>Your crops buy</span>
          </div>
          {growOrder.map(({ upgrade, buy }) => (
            <ExoticRow
              key={upgrade.index}
              upgrade={upgrade}
              buy={buy}
              returnsIn={nextOffsets.get(upgrade.index)}
              now={now}
              lowValue={lowValue.exotic.get(upgrade.index)}
            />
          ))}
        </div>
      </section>

      <UpcomingRotations
        upgrades={upgrades}
        nextOffsets={nextOffsets}
        now={now}
        lowValue={lowValue}
      />

    </div>
  )
}

// ============================================================
// CROP EVOLUTION TAB
// ============================================================

const STATUS_LABELS = {
  exact: 'Exact',
  partial: 'Partial',
  input: 'Needs input',
  missing: 'Not read yet',
}

// Sources that count as 1x until something is added: show their note instead of a multi
const isPending = status => status === 'input' || status === 'missing'

const growthsText = cycles => `${formatDecimal(cycles, 1)} ${cycles === 1 ? 'growth' : 'growths'}`
const waitText = (cycles, growthSeconds) => (cycles <= 0 ? 'Right away' : formatWait(cycles * growthSeconds))

function NextCropCard({ outlook, instaGrows }) {
  const {
    cropId,
    seed,
    tier,
    chance,
    multiNeeded,
    climbCycles,
    lastRollCycles,
    medianCycles,
    instaMedianCycles,
    instaFor50,
    instaFor90,
    growthSeconds,
    plotCount,
    focusPlots,
  } = outlook
  const verdict = getPushVerdict(outlook, instaGrows)
  const hasInsta = instaGrows.banked + instaGrows.daily > 0
  const seedSize = seed.cropIdMax - seed.cropIdMin + 1
  const dayMulti = multiNeededWithin(outlook, 86400)

  return (
    <div className={`evo-next evo-next--${verdict}`}>
      <div className="evo-next-head">
        <img
          src={cropImgPath(cropId)}
          alt=""
          className="evo-next-img"
          onError={hideBrokenImg}
        />
        <div className="evo-next-title">
          <span className="evo-next-name">Crop {cropId + 1} of {TOTAL_CROPS}</span>
          <span className="evo-next-sub">
            <SeedTag seed={seed} /> crop {tier + 1} of {seedSize}
          </span>
        </div>
        <span className={`evo-verdict evo-verdict--${verdict} tooltip-anchor`}>
          {PUSH_VERDICTS[verdict].label}
          <span className="tooltip tooltip--wrap tooltip--right">{PUSH_VERDICTS[verdict].hint}</span>
        </span>
      </div>

      <div className="evo-next-stats">
        <div className="evo-next-stat">
          <span className="evo-next-label">Evolve chance</span>
          <span className="evo-next-value">{formatChance(chance)}</span>
          <span className="evo-next-note">per growth, per plot</span>
        </div>
        <div className="evo-next-stat">
          <span className="evo-next-label">Climb</span>
          <span className="evo-next-value">{formatWait(climbCycles * growthSeconds)}</span>
          <span className="evo-next-note">{growthsText(climbCycles)} of sure steps from a fresh plant</span>
        </div>
        <div className="evo-next-stat">
          <span className="evo-next-label">Last roll</span>
          <span className="evo-next-value">{chance >= 1 ? '—' : formatWait(lastRollCycles * growthSeconds)}</span>
          <span className="evo-next-note">
            {chance >= 1 ? 'every roll lands' : `${growthsText(lastRollCycles)} with ${plotCount} plots one tier below`}
          </span>
        </div>
        {hasInsta && (
          <div className="evo-next-stat evo-next-stat--insta">
            <span className="evo-next-label">With insta grows</span>
            <span className="evo-next-value">{waitText(instaMedianCycles, growthSeconds)}</span>
            <span className="evo-next-note">
              all on {focusPlots > 1 ? `one column (${focusPlots} plots)` : 'one plot'}: {formatBigNumber(instaFor50)} for a 50% shot, {formatBigNumber(instaFor90)} for 90%
            </span>
          </div>
        )}
        <div className="evo-next-stat">
          <span className="evo-next-label">{hasInsta ? 'No insta grows' : 'Likely found'}</span>
          <span className="evo-next-value">{waitText(medianCycles, growthSeconds)}</span>
          <span className="evo-next-note">after planting (50% chance)</span>
        </div>
      </div>

      {chance < 1 && (
        <p className="evo-next-goal">
          {dayMulti > 1
            ? <>Evo multi goal: <strong>{formatTimesMore(dayMulti)}x</strong> more gets the last roll under a day</>
            : <>The last roll is already under a day</>}
          {' · '}
          <strong>{formatTimesMore(multiNeeded)}x</strong> more makes every roll land
        </p>
      )}
    </div>
  )
}

function UpcomingCrops({ outlooks, hasInsta }) {
  return (
    <div className={`evo-upcoming${hasInsta ? ' evo-upcoming--insta' : ''}`}>
      <div className="evo-upcoming-row evo-upcoming-row--head">
        <span>Crop</span>
        <span>Chance / growth</span>
        <span>Multi for a sure roll</span>
        {hasInsta && <span>Insta grows for 50%</span>}
        <span>Likely found</span>
      </div>
      {outlooks.map(o => (
        <div
          key={o.cropId}
          className="evo-upcoming-row"
        >
          <span className="evo-upcoming-crop">
            <img
              src={cropImgPath(o.cropId)}
              alt=""
              className="evo-upcoming-img"
              onError={hideBrokenImg}
            />
            <span>
              {o.cropId + 1}
              <span className="evo-note"> {o.seed.name} {o.tier + 1}</span>
            </span>
          </span>
          <span>{formatChance(o.chance)}</span>
          <span>{o.multiNeeded > 1 ? `${formatTimesMore(o.multiNeeded)}x more` : 'Already sure'}</span>
          {hasInsta && <span>{formatBigNumber(o.instaFor50)}</span>}
          <span>{waitText(hasInsta ? o.instaMedianCycles : o.medianCycles, o.growthSeconds)}</span>
        </div>
      ))}
    </div>
  )
}

function EvolutionSources({ sources, total }) {
  const counts = sources.reduce((acc, s) => ({ ...acc, [s.status]: (acc[s.status] ?? 0) + 1 }), {})

  return (
    <details className="dropdown-panel">
      <summary className="dropdown-panel-head">
        <span className="dropdown-panel-title">Evolution Sources</span>
        <span className="dropdown-panel-stat">{sources.length} multipliers · {formatMulti(total)}x total</span>
        <span className="dropdown-panel-chips">
          <span className="evo-status evo-status--exact">{counts.exact ?? 0} exact</span>
          {counts.partial > 0 && <span className="evo-status evo-status--partial">{counts.partial} partial</span>}
          {counts.input > 0 && <span className="evo-status evo-status--input">{counts.input} needs input</span>}
          {counts.missing > 0 && <span className="evo-status evo-status--missing">{counts.missing} not read</span>}
        </span>
      </summary>
      <div className="evo-table dropdown-panel-body">
        {sources.map(s => (
          <div
            key={s.id}
            className={`evo-row evo-row--${s.status}`}
          >
            <span className="evo-name">
              {s.label}
              {s.note && !isPending(s.status) && <span className="evo-note">{s.note}</span>}
            </span>
            <span className="evo-system">{s.system}</span>
            <span className="evo-multi">{isPending(s.status) ? '—' : `${formatMulti(s.multi)}x`}</span>
            <span className={`evo-status evo-status--${s.status} tooltip-anchor`}>
              {STATUS_LABELS[s.status]}
              {(s.status !== 'exact') && (
                <span className="tooltip tooltip--wrap tooltip--right">
                  {isPending(s.status) ? s.note : `Not included yet: ${s.missing.join(', ')}`}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </details>
  )
}

function CropEvolutionTab({ snapshot, tomePoints }) {
  const evo = useMemo(
    () => getCropEvolutionBreakdown(snapshot, getRankMulti(snapshot), { tomePoints }),
    [snapshot, tomePoints]
  )
  const outlooks = useMemo(() => getCropPushOutlook(snapshot, evo), [snapshot, evo])
  const instaGrows = getInstaGrows(snapshot)
  const hasInsta = instaGrows.banked + instaGrows.daily > 0
  const cropsFound = TOTAL_CROPS - getUndiscoveredCrops(snapshot?.farming).length
  const next = outlooks[0]

  return (
    <div className="farming-tab">
      <div className="farming-chip-row">
        <StatChip
          label="Crops Found"
          value={`${cropsFound} / ${TOTAL_CROPS}`}
          valueClass={cropsFound >= TOTAL_CROPS ? 'farming-chip-value--good' : ''}
        />
        <StatChip
          label="Crop Evolution Multi"
          value={`${formatMulti(evo.total)}x`}
          tooltip="Every source in Evolution Sources multiplied together, on your average plot rank. Sources that need input count as 1x until they're filled in."
        />
        {next && (
          <StatChip
            label={`${next.seed.name} Growth`}
            value={formatWait(next.growthSeconds)}
            tooltip="One growth = one evolution roll per plot."
          />
        )}
        {hasInsta && (
          <StatChip
            label="Insta Grows"
            value={`${instaGrows.banked.toLocaleString()} (+${instaGrows.daily}/day)`}
            tooltip={`Each insta grow finishes a plot's growth on the spot: one extra evolution roll${instaGrows.plotsPerInsta > 1 ? `, for all ${instaGrows.plotsPerInsta} plots in its column thanks to Mass Irrigation` : ''}. Daily ones come from the Instagrow Generator in the gem shop.`}
          />
        )}
      </div>

      {next ? (
        <>
          <section className="farming-section">
            <div className="farming-group-label">Next Crop</div>
            <NextCropCard
              outlook={next}
              instaGrows={instaGrows}
            />
          </section>

          {outlooks.length > 1 && (
            <section className="farming-section">
              <div className="farming-group-label">Crops After That</div>
              <UpcomingCrops
                outlooks={outlooks.slice(1)}
                hasInsta={hasInsta}
              />
            </section>
          )}
        </>
      ) : (
        <p className="evo-done">Every crop has been found. Nothing left to evolve into!</p>
      )}

      <EvolutionSources
        sources={evo.sources}
        total={evo.total}
      />
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Farming({ snapshot, tomePoints }) {
  const [activeTab, setActiveTab] = useState('landranks')
  const farming = snapshot?.farming ?? {}

  return (
    <div className="page farming-page">
      <h2 className="page-title">Farming</h2>

      <InfoPanel
        intro="Track your farming progress across land ranks, the Day and Night markets, and the weekly Exotic Market."
        items={[
          'Land Ranks: locked upgrades are dimmed. Evolution, Production and Soil EXP Boost scale with plot rank, so their cards also show the total on your lowest plot.',
          'Land rank bonuses use Dank Ranks from your save, with every added talent level your played character gets.',
          'Spend plans only your unspent points on top of your current levels, since the game can only take points back by resetting all of them. Full Reset replans every point from scratch.',
          'Both score each plot the way IdleOn Toolbox does: seed ranks go to their max level, Farm EXP gets the points you reserve, and every other point goes where it raises Crop Evolution × Crop Value × Rank EXP × Overgrowth the most. Crop value stops getting points once every plot is at the cap.',
          'Market costs include your Emperor discount and Better Day / Better Night exotics, and max levels include the Research grid raise. Night Market upgrades cost magic beans.',
          'The Exotic Market rotation follows the real weekly reset (Thursday 00:00 UTC). Enter a target to see how many crops each buy needs for that many levels, and use Upcoming Rotations to find when any upgrade is sold again.',
          'Crop Evolution: each growth, every plot rolls once to evolve one crop up its seed (30% × the seed\'s decay per crop × your evo multi). A fresh plant climbs one crop per growth even when every roll is sure, so pushing for a new crop always costs that climb. Timings assume every plot is planted with the next crop\'s seed and unlocked. Insta grows count as one extra roll each, all spent on one plot: it climbs fastest, and after that each one is another roll at the new crop. With Mass Irrigation an insta grow also grows every plot above and below, so they go on one column and roll for all of its plots.',
        ]}
      />

      <div className="page-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`page-tab-btn${activeTab === tab.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'landranks' && <LandRanksTab snapshot={snapshot} farming={farming} tomePoints={tomePoints} />}
      {activeTab === 'market' && <MarketTab snapshot={snapshot} farming={farming} />}
      {activeTab === 'exotic' && <ExoticMarketTab snapshot={snapshot} farming={farming} />}
      {activeTab === 'cropEvo' && <CropEvolutionTab
        snapshot={snapshot}
        tomePoints={tomePoints}
      />}
    </div>
  )
}
