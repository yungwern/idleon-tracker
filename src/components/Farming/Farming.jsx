import { useState, useMemo } from 'react'
import { marketMap, exoticMarketMap, landRankMap, calcExoticBonus, exoticCap, calcRankBonus, getSeedByCropId } from '../../data'
import InfoPanel from '../InfoPanel/InfoPanel'
import { getLegendTalentLevel } from '../../utils/legendTalentUtils'
import { formatBigNumber } from '../../utils/cogBoardUtils'
import {
  BEAN_IMG,
  cropImgPath,
  formatDecimal,
  formatMulti,
  fillBonusText,
  isNightMarket,
  marketCostMulti,
  marketLevelCost,
  marketCropId,
  marketUpcomingCosts,
  getExoticRotation,
  rotationTimeLeft,
  BUY_ONE_GET_ONE_TALENT,
  exoticLevelsFromCrops,
  OG_MAX,
  PER_PLOT_RANKS,
  getRankMulti,
  getSeedRankMaxLevel,
  getLandRankTotals,
  optimizeLandRanks,
  compareLandRankPlans,
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

function StatChip({ label, value, valueClass = '', tooltip }) {
  return (
    <div className={`farming-chip${tooltip ? ' tooltip-anchor' : ''}`}>
      <span className="farming-chip-label">{label}</span>
      <span className={`farming-chip-value ${valueClass}`}>{value}</span>
      {tooltip && <span className="tooltip tooltip--wrap">{tooltip}</span>}
    </div>
  )
}

// ============================================================
// LAND RANKS TAB
// ============================================================

function RankCard({ rank, level, locked, badge, children }) {
  return (
    <div className={`rank-upg-card${locked ? ' rank-upg-card--locked' : ''}${badge ? ' rank-upg-card--planned' : ''}`}>
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

function LandRanksTab({ snapshot, farming }) {
  const upgradesLevels = farming.upgradesLevels ?? []
  const totalRankPoints = farming.totalRankPoints ?? 0
  const usedRankPoints = farming.usedRankPoints ?? 0
  const freePoints = totalRankPoints - usedRankPoints
  const plotCount = farming.plotCount ?? 0
  const farmingRanks = farming.farmingRanks ?? []
  const lowestPlotRank = farmingRanks.length ? Math.min(...farmingRanks) : 0
  const seedLevel = getSeedRankMaxLevel(snapshot)

  const [farmExpPoints, setFarmExpPoints] = useState('')
  const [plan, setPlan] = useState(null)

  const rankMulti = getRankMulti(snapshot)
  const totals = useMemo(
    () => getLandRankTotals(farming, rankMulti),
    [farming, rankMulti]
  )

  const rankBonus = (rank, level) => {
    const bonus = calcRankBonus(rank, level, rankMulti)
    return PER_PLOT_RANKS.has(rank.index) ? bonus * lowestPlotRank : bonus
  }

  function runOptimizer(fullReset) {
    const { levels, leftover } = optimizeLandRanks(farming, rankMulti, {
      seedLevel,
      farmExpPoints: parseInt(farmExpPoints) || 0,
      fullReset,
    })
    setPlan({
      fullReset,
      levels,
      leftover,
      changes: compareLandRankPlans(farming, rankMulti, upgradesLevels, levels)
        .filter(({ change }) => Math.abs(change) >= 0.005),
    })
  }

  const planRows = plan && landRankMap
    .map(rank => ({
      rank,
      before: upgradesLevels[rank.index] ?? 0,
      after: plan.levels[rank.index],
    }))
    // Spending only adds, so just show what changes; a reset shows the whole layout
    .filter(({ before, after }) => (plan.fullReset ? before > 0 || after > 0 : after !== before))

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
          <span className="farming-input-label tooltip-anchor">
            Farm EXP Points
            <span className="tooltip tooltip--wrap">Reserved for Farming EXP ranks before the rest is planned</span>
          </span>
          <input
            type="number"
            min="0"
            className="farming-input"
            placeholder="e.g. 0"
            value={farmExpPoints}
            onChange={e => setFarmExpPoints(e.target.value)}
          />
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
        <p className="farming-note">
          {freePoints > 0
            ? <>Spend adds your <span className="farming-note-highlight">{freePoints.toLocaleString()}</span> unspent points on top of your current levels and never removes any. </>
            : <>No unspent points right now. </>}
          Full Reset replans all {totalRankPoints.toLocaleString()} points from scratch. Seed ranks are filled to Lv. {seedLevel} first.
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
              {plan.changes.map(({ goal, label, change }) => (
                <StatChip
                  key={goal}
                  label={label}
                  value={`${change > 0 ? '+' : ''}${formatDecimal(change, 2)}%`}
                  valueClass={change > 0 ? 'farming-chip-value--good' : 'farming-chip-value--bad'}
                />
              ))}
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

function CostRow({ cropId, have, cost }) {
  return (
    <div className="market-cost-row">
      <img
        src={cropId === null ? BEAN_IMG : cropImgPath(cropId)}
        alt=""
        className="market-cost-img"
        onError={hideBrokenImg}
      />
      <span className="market-cost-text">
        <span className={have >= cost ? 'market-cost-have' : 'market-cost-need'}>
          {formatBigNumber(have)}
        </span>
        {' / '}
        <span className="market-cost-amount">{formatBigNumber(cost)}</span>
      </span>
    </div>
  )
}

function MarketCard({ upgrade, level, costMulti, haveOf }) {
  const isMaxed = level >= upgrade.maxLvl
  const night = isNightMarket(upgrade)
  const headerCropId = marketCropId(upgrade, Math.min(level, upgrade.maxLvl - 1))
  const nextCropId = night ? null : marketCropId(upgrade, level)
  const upcoming = isMaxed ? [] : marketUpcomingCosts(upgrade, level, costMulti)
  // Night costs are one level per row, so the first row is the next level again
  const laterCosts = night ? upcoming.slice(1) : upcoming

  return (
    <div className={`market-card${isMaxed ? ' market-card--maxed' : ''}`}>
      <div className="market-card-header">
        <img
          src={night ? BEAN_IMG : cropImgPath(headerCropId)}
          alt=""
          className="market-crop-img"
          onError={hideBrokenImg}
        />
        <div className="market-card-title">
          <span className="market-card-name">{upgrade.label}</span>
          <span className="market-card-level">
            <span>{level}</span> / {upgrade.maxLvl}
          </span>
        </div>
      </div>
      <div className="market-card-body">
        <span className="market-card-bonus">
          {fillBonusText(upgrade.bonusText, level * upgrade.bonusPerLvl)}
        </span>
        {isMaxed ? (
          <span className="market-card-maxed-text">Maxed</span>
        ) : (
          <div className="market-costs">
            <span className="market-cost-label">Next level</span>
            <CostRow
              cropId={nextCropId}
              have={haveOf(nextCropId)}
              cost={marketLevelCost(upgrade, level, costMulti)}
            />
            {laterCosts.length > 0 && (
              <span className="market-cost-label">{night ? 'Following levels' : 'Upcoming crops'}</span>
            )}
            {laterCosts.map(({ cropId, cost }, i) => (
              <CostRow
                key={i}
                cropId={cropId}
                have={haveOf(cropId)}
                cost={cost}
              />
            ))}
          </div>
        )}
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
  const upgrades = night ? marketMap.slice(8) : marketMap.slice(0, 8)

  // Night Market costs magic beans (cropId null)
  const haveOf = cropId => cropId === null
    ? farming.beans ?? 0
    : cropDepot[String(cropId)]?.qty ?? 0

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
      <div className="market-grid">
        {upgrades.map(upgrade => (
          <MarketCard
            key={upgrade.index}
            upgrade={upgrade}
            level={marketLevels[upgrade.index] ?? 0}
            costMulti={costMulti}
            haveOf={haveOf}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// EXOTIC MARKET TAB
// ============================================================

function ExoticCard({ upgrade, inRotation }) {
  const value = calcExoticBonus(upgrade, upgrade.level, upgrade.organic)
  // Type 1 bonuses approach their cap; type 0 grow without one
  const capPct = upgrade.type === 1 ? (value / exoticCap(upgrade, upgrade.organic)) * 100 : null

  return (
    <div className={`exotic-card${inRotation ? ' exotic-card--rotation' : ''}`}>
      <div className="exotic-card-header">
        <img
          src={cropImgPath(upgrade.cropCostId)}
          alt=""
          className="exotic-crop-img"
          onError={hideBrokenImg}
        />
        <span className="exotic-card-name">{upgrade.label}</span>
        {upgrade.organic && (
          <span className="exotic-card-organic">Organic 2x</span>
        )}
      </div>
      <span className="exotic-card-level">
        Lv. <span>{upgrade.level}</span>
      </span>
      <span className="exotic-card-bonus">
        {fillBonusText(upgrade.bonusText, value)}
      </span>
      {capPct !== null && (
        <>
          <div className="exotic-card-progress">
            <div
              className="exotic-card-progress-fill"
              style={{ width: `${Math.min(100, capPct)}%` }}
            />
          </div>
          <span className="exotic-card-pct">{capPct.toFixed(1)}% of cap</span>
        </>
      )}
      <SeedTag seed={getSeedByCropId(upgrade.cropCostId)} />
    </div>
  )
}

function ExoticMarketTab({ farming, legendTalents }) {
  const { exoticLevels, organicExotics, cropDepot } = farming
  const buyOneGetOneLevel = getLegendTalentLevel(legendTalents, BUY_ONE_GET_ONE_TALENT)
  const [target, setTarget] = useState('')
  const targetLevels = parseInt(target) || 0

  // The rotation follows the real clock, so it stays right even with an old save
  const [now] = useState(() => Date.now() / 1000)

  const { onSale, offSale } = useMemo(() => {
    const rotation = getExoticRotation(now)
    const upgrades = exoticMarketMap
      .filter(Boolean)
      .map(u => ({
        ...u,
        level: exoticLevels?.[u.index] ?? 0,
        organic: (organicExotics ?? []).includes(u.index),
      }))
    return {
      onSale: rotation.map(i => upgrades.find(u => u.index === i)),
      offSale: upgrades.filter(u => !rotation.includes(u.index)),
    }
  }, [now, exoticLevels, organicExotics])

  const growOrder = useMemo(() => onSale
    .map(upgrade => {
      const haveQty = cropDepot?.[String(upgrade.cropCostId)]?.qty ?? 0
      const levels = exoticLevelsFromCrops(haveQty, farming, buyOneGetOneLevel)
      return {
        upgrade,
        haveQty,
        levels,
        status: targetLevels > 0 ? (levels >= targetLevels ? 'done' : 'needed') : null,
      }
    })
    .sort((a, b) => a.upgrade.cropCostId - b.upgrade.cropCostId),
  [onSale, cropDepot, farming, buyOneGetOneLevel, targetLevels])

  return (
    <div className="farming-tab">

      {/* ── Crop Grow Order ── */}
      <section className="farming-section">
        <div className="farming-group-label">Rotation Crop Grow Order</div>
        <div className="farming-input-row">
          <span className="farming-input-label">Target Levels per Upgrade</span>
          <input
            type="number"
            className="farming-input"
            placeholder="e.g. 130"
            value={target}
            onChange={e => setTarget(e.target.value)}
          />
          <span className="farming-input-hint">
            {targetLevels > 0
              ? `Highlights crops that can't buy ${targetLevels} levels yet`
              : 'Set a target to see which crops still need growing'}
          </span>
        </div>
        <div className="crop-path-list">
          {growOrder.map(({ upgrade, haveQty, levels, status }) => (
            <div
              key={upgrade.index}
              className={`crop-path-item${status ? ` crop-path-item--${status}` : ''}`}
            >
              <img
                src={cropImgPath(upgrade.cropCostId)}
                alt=""
                className="crop-path-crop-img"
                onError={hideBrokenImg}
              />
              <div className="crop-path-info">
                <span className="crop-path-upgrade-name">{upgrade.label}</span>
                <span className="crop-path-qty">
                  {formatBigNumber(haveQty)} · {levels} lvls
                </span>
              </div>
              <SeedTag seed={getSeedByCropId(upgrade.cropCostId)} />
            </div>
          ))}
        </div>
      </section>

      {/* ── This Week's Rotation ── */}
      <section className="farming-section">
        <div className="farming-group-label">
          This Week's Rotation
          <span className="farming-group-label-note">resets in {rotationTimeLeft(now)}</span>
        </div>
        <div className="exotic-grid">
          {onSale.map(upgrade => (
            <ExoticCard
              key={upgrade.index}
              upgrade={upgrade}
              inRotation
            />
          ))}
        </div>
      </section>

      {/* ── Off-Rotation ── */}
      <section className="farming-section">
        <div className="farming-group-label">Off-Rotation Upgrades</div>
        <div className="exotic-grid">
          {offSale.map(upgrade => (
            <ExoticCard
              key={upgrade.index}
              upgrade={upgrade}
            />
          ))}
        </div>
      </section>

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
          'Market costs include your Emperor discount and Better Day / Better Night exotics. Night Market upgrades cost magic beans.',
          'The Exotic Market rotation follows the real weekly reset. Set a target in the grow order to see which on-sale crops you still need — it accounts for Better Exotic and the Buy One Get One Free legend talent.',
          'Crop Evolution: each growth, every plot rolls once to evolve one crop up its seed (30% × the seed\'s decay per crop × your evo multi). A fresh plant climbs one crop per growth even when every roll is sure, so pushing for a new crop always costs that climb. Timings assume every unlocked plot is planted with the next crop\'s seed. Insta grows count as one extra roll each, all spent on one plot: it climbs fastest, and after that each one is another roll at the new crop. With Mass Irrigation an insta grow also grows every plot above and below, so they go on one column and roll for all of its plots.',
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

      {activeTab === 'landranks' && <LandRanksTab snapshot={snapshot} farming={farming} />}
      {activeTab === 'market' && <MarketTab snapshot={snapshot} farming={farming} />}
      {activeTab === 'exotic' && <ExoticMarketTab farming={farming} legendTalents={snapshot?.legendTalents} />}
      {activeTab === 'cropEvo' && <CropEvolutionTab
        snapshot={snapshot}
        tomePoints={tomePoints}
      />}
    </div>
  )
}
