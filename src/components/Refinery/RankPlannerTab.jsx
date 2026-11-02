import { useState } from 'react'
import { itemMap } from '../../data'
import { formatBigNumber } from '../../utils/cogBoardUtils'
import { formatRefineryHours, getSaltRankPlan } from '../../utils/refineryUtils'

// Refinery > Rank Planner: how high each salt can rank before it eats more of the salt before it than
// that salt makes, and which full bars are safe to rank up right now (math in refineryUtils getSaltRankPlan)

const KEEP_KEY = 'idleon_refinery_keep_share'

const KEEP_OPTIONS = [
  { share: 0, label: 'Keep none' },
  { share: 0.1, label: 'Keep 10%' },
  { share: 0.25, label: 'Keep 25%' },
]

const VERDICT_LABELS = {
  free: 'Rank up',
  rankUp: 'Rank up',
  hold: 'Hold',
  over: 'Over-ranked',
  spare: 'Eats spare',
  maxed: 'Output maxed',
}

function loadKeepShare() {
  try {
    const saved = Number(localStorage.getItem(KEEP_KEY))
    return KEEP_OPTIONS.some(option => option.share === saved) ? saved : 0
  } catch {
    return 0
  }
}

function SaltIcon({ salt, className }) {
  return (
    <img
      className={className}
      src={`images/construction/${salt.rawName}.png`}
      alt={salt.name}
    />
  )
}

// Full bars split into safe to rank now (top of the chain first) and ones to leave alone
function RankNow({ plan }) {
  const safe = new Set(plan.rankNow.map(({ entry }) => entry.index))
  const leave = plan.salts.filter(salt => salt.barFull && !salt.outputMaxed && !safe.has(salt.index))
  if (plan.rankNow.length === 0 && leave.length === 0) {
    return (
      <div className="refinery-plan-now">
        <span className="refinery-plan-now-title">No bars are full yet</span>
      </div>
    )
  }
  return (
    <div className="refinery-plan-now">
      {plan.rankNow.length > 0 && (
        <>
          <span className="refinery-plan-now-title refinery-plan-now-title--go">Rank up now, in this order</span>
          <div className="refinery-plan-now-list">
            {plan.rankNow.map(({ entry, freedBy }, i) => (
              <div
                key={entry.rawName}
                className="refinery-plan-chip refinery-plan-chip--go"
              >
                <span className="refinery-plan-chip-step">{i + 1}</span>
                <SaltIcon
                  salt={entry}
                  className="refinery-plan-chip-img"
                />
                <span className="refinery-plan-chip-name">{entry.name}</span>
                {freedBy && <span className="refinery-plan-chip-note">after {freedBy}</span>}
              </div>
            ))}
          </div>
        </>
      )}
      {leave.length > 0 && (
        <>
          <span className="refinery-plan-now-title refinery-plan-now-title--stop">Bar full, don't rank up</span>
          <div className="refinery-plan-now-list">
            {leave.map(salt => (
              <div
                key={salt.rawName}
                className="refinery-plan-chip refinery-plan-chip--stop"
              >
                <SaltIcon
                  salt={salt}
                  className="refinery-plan-chip-img"
                />
                <span className="refinery-plan-chip-name">{salt.name}</span>
                {salt.feeder?.rankForNext && (
                  <span className="refinery-plan-chip-note">until {salt.feeder.name} is rank {salt.feeder.rankForNext}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function getVerdictText(salt, keepShare) {
  const { feeder } = salt
  const keepText = keepShare > 0 ? ` (keeping ${Math.round(keepShare * 100)}% of it spare)` : ''
  if (salt.verdict === 'maxed') return 'Output is at the 250,000 per cycle cap: more ranks only raise its costs.'
  if (salt.verdict === 'free') return 'Made from materials only, so it can always rank up. Every salt after it depends on its rank.'
  if (salt.verdict === 'rankUp') {
    return `Safe for ${salt.headroom.toLocaleString()} more rank${salt.headroom === 1 ? '' : 's'} with ${feeder.name} at rank ${feeder.rank}${keepText}.`
  }
  if (salt.verdict === 'hold') {
    return feeder.rankForNext
      ? `Rank ${salt.rank + 1} would eat more ${feeder.name} than it makes${keepText}. Rank ${feeder.name} to ${feeder.rankForNext} first.`
      : `Rank ${salt.rank + 1} would eat more ${feeder.name} than it can ever make.`
  }
  const deficit = feeder.eatsPerHour - feeder.makesPerHour
  const fix = feeder.rankForCurrent ? ` Balanced again once ${feeder.name} reaches rank ${feeder.rankForCurrent}.` : ''
  if (salt.verdict === 'spare') {
    return `Eats more than ${Math.round((1 - keepShare) * 100)}% of ${feeder.name}'s output, so less than ${Math.round(keepShare * 100)}% is left spare.${fix}`
  }
  return `Eats ${formatBigNumber(deficit)}/hr more ${feeder.name} than it makes: the ${formatBigNumber(feeder.stock)} stored lasts ${formatRefineryHours(feeder.hoursLeft)}, then both salts slow down.${fix}`
}

function getShareClass(salt) {
  if (salt.verdict === 'over') return 'over'
  if (salt.verdict === 'hold' || salt.verdict === 'spare') return 'hold'
  return 'ok'
}

function PlanRow({ salt, keepShare }) {
  const { feeder } = salt
  const barText = salt.barFull ? 'bar full' : `${Math.floor(salt.refined / salt.powerCap * 100)}% refined`
  return (
    <div className={`refinery-plan-row refinery-plan-row--${salt.verdict}${salt.active ? '' : ' refinery-plan-row--off'}`}>
      <div className="refinery-plan-head">
        <SaltIcon
          salt={salt}
          className="refinery-plan-img"
        />
        <div className="refinery-plan-title">
          <span className="refinery-plan-name">{salt.name}</span>
          <span className="refinery-plan-meta">
            Rank {salt.rank.toLocaleString()} · {barText}{salt.active ? '' : ' · off'}
          </span>
        </div>
        <div className="refinery-plan-safe">
          <span className="refinery-plan-safe-label">{feeder ? 'Safe up to' : 'Feeds'}</span>
          <span className="refinery-plan-safe-rank">
            {feeder ? `Rank ${salt.maxSafeRank.toLocaleString()}` : `${formatBigNumber(salt.outputPerHour)}/hr`}
          </span>
        </div>
        <span className={`refinery-plan-pill refinery-plan-pill--${salt.verdict}`}>{VERDICT_LABELS[salt.verdict]}</span>
      </div>
      {feeder && (
        <div className="refinery-plan-share">
          <SaltIcon
            salt={feeder}
            className="refinery-plan-share-img"
          />
          <progress
            className={`refinery-plan-bar refinery-plan-bar--${getShareClass(salt)}`}
            max={1}
            value={Math.min(1, feeder.share)}
          />
          <span className="refinery-plan-share-text">
            Eats {formatBigNumber(feeder.eatsPerHour)} of {formatBigNumber(feeder.makesPerHour)} {feeder.name}/hr ({Math.round(feeder.share * 100)}%)
          </span>
        </div>
      )}
      <span className="refinery-plan-text">{getVerdictText(salt, keepShare)}</span>
      {salt.printerLimit && salt.verdict !== 'over' && (
        <span className="refinery-plan-text refinery-plan-text--warn">
          Printing of {itemMap[salt.printerLimit.item] ?? salt.printerLimit.item} only covers rank {salt.printerLimit.maxRank.toLocaleString()}: the next rank drains its storage.
        </span>
      )}
    </div>
  )
}

export default function RankPlannerTab({ snapshot }) {
  const [keepShare, setKeepShare] = useState(loadKeepShare)
  const plan = getSaltRankPlan(snapshot, keepShare)
  if (!plan || plan.salts.length === 0) {
    return <p className="page-empty">No salts unlocked yet.</p>
  }

  function chooseKeepShare(share) {
    setKeepShare(share)
    try {
      localStorage.setItem(KEEP_KEY, String(share))
    } catch {
      // per-browser convenience only
    }
  }

  return (
    <>
      <div className="refinery-plan-options">
        <div className="segmented-control">
          {KEEP_OPTIONS.map(option => (
            <button
              key={option.share}
              type="button"
              className={`segmented-control-btn${keepShare === option.share ? ' segmented-control-btn--active' : ''}`}
              onClick={() => chooseKeepShare(option.share)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="refinery-plan-options-hint">Share of each salt to keep spare for buildings, Salt Lick and other costs</span>
      </div>
      <RankNow plan={plan} />
      <div className="refinery-plan-chain">
        {plan.salts.map(salt => (
          <PlanRow
            key={salt.rawName}
            salt={salt}
            keepShare={keepShare}
          />
        ))}
      </div>
    </>
  )
}
