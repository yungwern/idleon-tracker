import { useMemo } from 'react'
import { buildOutpostSummary, OUTPOST_UPGRADES, SUPPORT_CAMP_MODE, SAVAGE_STRONGHOLD_MODE, PURITY_RANK, formatOutpostExp } from '../../data'
import { optimizeOutposts, formatDuration, HORIZON_DAYS, BARRACKS_COST } from '../../utils/outpostOptimizer'
import InfoPanel from '../InfoPanel/InfoPanel'

import './RoyalOutposts.css'

// What still needs doing on one outpost; only for features the account has unlocked.
// Purity needs a Priest recruited in the outpost's world before it can be raised.
function outpostNotices(outpost, summary) {
  const notices = []
  if (summary.glorifyUnlocked && !outpost.glorified) notices.push('Not Glorified')
  if (summary.purityUnlocked && summary.priestWorlds.has(outpost.world) && !outpost.purified) {
    notices.push('Not Purified')
  }
  return notices
}

function OutpostRankRow({ bar }) {
  return (
    <div className={`mc-outpost-rank mc-outpost-rank--${bar.name.toLowerCase()} tooltip-anchor`}>
      <span className="mc-outpost-rank-name">{bar.name}</span>
      <progress className="mc-outpost-rank-bar" max={1} value={bar.progress} />
      <span className="mc-outpost-rank-level">{bar.rank}</span>
      <span className="tooltip">
        {bar.name} Rank {bar.rank}: {formatOutpostExp(bar.exp)} / {formatOutpostExp(bar.next)} EXP to Rank {bar.rank + 1}
      </span>
    </div>
  )
}

const UPGRADE_KEYS = ['barracks', 'logistics', 'education']

// "Education to LV 74, then Barracks 6"
function upcomingText(upcoming) {
  return upcoming
    .map(step => (step.upgrade === 'barracks'
      ? `Barracks ${step.level}`
      : step.until ? `Education to LV ${step.until}` : 'Education'))
    .join(', then ')
}

// "Barracks +1, Education +2"
function spendText(now) {
  return now.map(step => `${step.upgrade === 'barracks' ? 'Barracks' : 'Education'} +${step.levels}`).join(', ')
}

function ptsReason(plan, educationUnlocked) {
  if (!educationUnlocked) return 'Greater Education isn\'t unlocked yet, so PTS go to Barracks.'
  if (plan.educationUntil === null) return 'Barracks is maxed at 6 unit slots, so every PTS goes to Education.'
  return `Education raises every bar's EXP; a Barracks level adds a Trader slot for ${BARRACKS_COST} PTS. `
    + `Here Education is the better buy until LV ${plan.educationUntil}, then Barracks.`
}

// Upgrade levels with what the unspent PTS should buy, so several can be spent at once
function OutpostUpgrades({ outpost, opt, educationUnlocked }) {
  const plan = opt?.ptsPlan
  const gains = {}
  plan?.now.forEach(step => { gains[step.upgrade] = step.levels })

  let line = null
  if (plan) {
    const tip = (
      <span className="tooltip mc-outpost-advice-tip">
        {opt.pts.left} of {opt.pts.total} PTS unspent. {ptsReason(plan, educationUnlocked)}
      </span>
    )
    if (plan.spend > 0) {
      line = (
        <p className="mc-outpost-pts-line mc-outpost-pts-line--spend tooltip-anchor">
          Spend {plan.spend} PTS: {spendText(plan.now)}
          {plan.saveFor && <span className="mc-outpost-pts-save"> · save rest for Barracks {plan.saveFor}</span>}
          {tip}
        </p>
      )
    } else if (plan.saveFor) {
      line = (
        <p className="mc-outpost-pts-line mc-outpost-pts-line--save tooltip-anchor">
          Saving for Barracks {plan.saveFor}: {opt.pts.left} / {BARRACKS_COST} PTS
          {tip}
        </p>
      )
    } else if (plan.upcoming.length > 0) {
      line = (
        <p className="mc-outpost-pts-line tooltip-anchor">
          Next PTS: {upcomingText(plan.upcoming)}
          {tip}
        </p>
      )
    }
  }

  return (
    <div className="mc-outpost-pts">
      <div className="mc-outpost-upgrades">
        {OUTPOST_UPGRADES.map((upg, i) => {
          if (outpost.upgrades[i] === 0 && i === 1) return null
          const gain = gains[UPGRADE_KEYS[i]]
          return (
            <span key={upg.name} className={`mc-outpost-upgrade${gain ? ' mc-outpost-upgrade--gain' : ''}`}>
              {upg.short} <strong>{outpost.upgrades[i]}</strong>
              {gain > 0 && <span className="mc-outpost-upgrade-gain">+{gain}</span>}
            </span>
          )
        })}
      </div>
      {line}
    </div>
  )
}

// Only the recommendations that need action; details live in the tooltips
function OutpostAdvice({ opt, world, worldCommanders, isBestCommand, commandersSettled }) {
  const { flexSlots, plan } = opt
  const best = opt.allTradersNow
    ? `${flexSlots} Traders`
    : `${flexSlots} Surveyors until Intel ${plan.switchAt}, then Traders`
  const unitsMatch = flexSlots === 0
    || (opt.allTradersNow ? opt.slotTraders === flexSlots : opt.slotSurveyors === flexSlots)
  const kept = [
    opt.slotWorkers > 0 && `${opt.slotWorkers} Worker${opt.slotWorkers === 1 ? '' : 's'}`,
    opt.slotGuards > 0 && `${opt.slotGuards} Guard${opt.slotGuards === 1 ? '' : 's'}`,
  ].filter(Boolean)
  const cmd = opt.command
  const commanders = Math.max(1, worldCommanders)

  return (
    <div className="mc-outpost-advice">
      {!unitsMatch && (
        <p className="mc-outpost-advice-line mc-outpost-advice-line--change tooltip-anchor">
          Swap to {best} (+{(opt.projectedBest - opt.projectedNow).toFixed(1)} Trade)
          <span className="tooltip mc-outpost-advice-tip">
            Now: {opt.slotTraders} Traders, {opt.slotSurveyors} Surveyors.
            Trade rank in {HORIZON_DAYS} days: {opt.projectedNow.toFixed(1)} as-is, {opt.projectedBest.toFixed(1)} after
            swapping.{kept.length > 0 && ` Your ${kept.join(' and ')} stay as they are.`}
          </span>
        </p>
      )}
      {isBestCommand && commandersSettled && (
        <p className="mc-outpost-advice-line mc-outpost-advice-line--settled tooltip-anchor">
          ★ Commanders Active ★
          <span className="tooltip mc-outpost-advice-tip">
            All of World {world}'s Commanders are on the right outpost. Command {cmd.rank} → {cmd.target} adds a{' '}
            {cmd.unit} in about {formatDuration(cmd.hoursPerCommander / commanders)}.
          </span>
        </p>
      )}
      {isBestCommand && !commandersSettled && (
        <p className="mc-outpost-advice-line mc-outpost-advice-line--best tooltip-anchor">
          ★ Send Commanders Here ★
          <span className="tooltip mc-outpost-advice-tip">
            Fastest free Trader in World {world}: Command {cmd.rank} → {cmd.target} adds a {cmd.unit} in about{' '}
            {formatDuration(cmd.hoursPerCommander / commanders)} with all {commanders} Commanders here.
          </span>
        </p>
      )}
    </div>
  )
}

function OutpostCard({ outpost, summary, optimizer }) {
  const notices = outpostNotices(outpost, summary)
  const isSupport = outpost.mode === SUPPORT_CAMP_MODE
  const opt = optimizer.byMap.get(outpost.mapIndex)
  // Purity only matters once the world has a Priest (or the outpost already has some)
  const showPurity = summary.priestWorlds.has(outpost.world) || outpost.purified
  const ranks = outpost.ranks.filter(bar => bar.unlocked && (bar.type !== PURITY_RANK || showPurity))
  const tags = [
    isSupport && { key: 'support', label: 'Support Camp', mod: 'support' },
    outpost.mode === SAVAGE_STRONGHOLD_MODE && { key: 'savage', label: 'Savage Stronghold', mod: 'savage' },
    outpost.purified && { key: 'purified', label: 'Purified', mod: 'purified' },
    ...notices.map(n => ({ key: n, label: `! ${n}`, mod: 'notice' })),
  ].filter(Boolean)

  return (
    <div className={`mc-outpost-card${notices.length ? ' mc-outpost-card--notice' : ''}`}>
      <div className="mc-outpost-head">
        <span className="mc-outpost-name">
          {outpost.glorified && <span className="mc-outpost-glorified tooltip-anchor">★<span className="tooltip">Glorified</span></span>}
          {outpost.name}
        </span>
        {tags.length > 0 && (
          <div className="mc-outpost-tags">
            {tags.map(tag => (
              <span key={tag.key} className={`mc-outpost-tag mc-outpost-tag--${tag.mod}`}>{tag.label}</span>
            ))}
          </div>
        )}
      </div>

      <div className="mc-outpost-ranks">
        {ranks.map(bar => <OutpostRankRow key={bar.type} bar={bar} />)}
      </div>

      {isSupport && (
        <p className="mc-outpost-link">
          {outpost.supportTargets.length > 0
            ? <>Supports <strong>{outpost.supportTargets.map(summary.nameOf).join(', ')}</strong></>
            : 'Not linked to an outpost'}
        </p>
      )}
      {outpost.supportedBy.length > 0 && (
        <p className="mc-outpost-link tooltip-anchor">
          Boosted{opt ? <> <strong>+{Math.round(opt.supportBoost)}%</strong></> : ''} by{' '}
          {outpost.supportedBy.length} Support Camp{outpost.supportedBy.length === 1 ? '' : 's'}
          <span className="tooltip mc-outpost-advice-tip">
            {outpost.supportedBy.map(summary.nameOf).join(', ')}
          </span>
        </p>
      )}

      <OutpostUpgrades outpost={outpost} opt={opt} educationUnlocked={optimizer.educationUnlocked} />

      {opt && (
        <OutpostAdvice
          opt={opt}
          world={outpost.world}
          worldCommanders={optimizer.commandersByWorld.get(outpost.world) ?? 0}
          isBestCommand={optimizer.bestCommandTarget.get(outpost.world) === outpost.mapIndex}
          commandersSettled={optimizer.commanderAdvice.get(outpost.world)?.needsMove === false}
        />
      )}
    </div>
  )
}

function OutpostWorld({ group, summary, optimizer }) {
  const noticeCount = group.outposts.filter(o => outpostNotices(o, summary).length > 0).length
  // Outposts with unspent PTS: savers (holding PTS for a Barracks level) first, then plain spenders.
  // Anything not marked as saving can simply spend everything it has.
  const ptsRows = group.outposts
    .map(o => ({ outpost: o, opt: optimizer.byMap.get(o.mapIndex) }))
    .filter(({ opt }) => opt && (opt.ptsPlan.spend > 0 || opt.ptsPlan.saveFor))
    .sort((a, b) => Boolean(b.opt.ptsPlan.saveFor) - Boolean(a.opt.ptsPlan.saveFor))
  const ptsToSpend = ptsRows.reduce((sum, { opt }) => sum + opt.ptsPlan.spend, 0)
  const saving = ptsRows.filter(({ opt }) => opt.ptsPlan.saveFor).length
  const ptsChip = [
    ptsToSpend > 0 && `${ptsToSpend} PTS to spend`,
    saving > 0 && `${saving} saving for Barracks`,
  ].filter(Boolean).join(' · ')
  const commanderAdvice = optimizer.commanderAdvice.get(group.world)
  const postedAt = commanderAdvice
    ? [...commanderAdvice.postedAt].map(([mapIndex, n]) => `${n} at ${mapIndex >= 0 ? summary.nameOf(mapIndex) : 'no outpost'}`).join(', ')
    : ''

  return (
    <details className={`mc-outpost-world mc-outpost-world--w${group.world}`}>
      <summary className="mc-outpost-world-head">
        <span className="mc-outpost-world-title">World {group.world}</span>
        <span className="mc-outpost-world-stat">{group.outposts.length} outposts</span>
        <span className="mc-outpost-world-chips">
          {ptsRows.length > 0 && (
            <span className={`mc-outpost-world-chip mc-outpost-world-chip--pts${saving > 0 ? ' mc-outpost-world-chip--save' : ''} tooltip-anchor`}>
              {ptsChip}
              <span className="tooltip mc-outpost-world-tip">
                {ptsRows.map(({ outpost, opt }) => {
                  const plan = opt.ptsPlan
                  const kept = opt.pts.left - plan.spend
                  return plan.saveFor ? (
                    <span key={outpost.mapIndex} className="mc-outpost-world-tip-row mc-outpost-world-tip-row--save">
                      ⚠ <strong>{outpost.name}</strong>:{' '}
                      {plan.spend > 0 ? `${spendText(plan.now)}, then save` : 'Save'}{' '}
                      {kept} / {BARRACKS_COST} PTS for Barracks {plan.saveFor}
                    </span>
                  ) : (
                    <span key={outpost.mapIndex} className="mc-outpost-world-tip-row">
                      <strong>{outpost.name}</strong>: {spendText(plan.now)}
                    </span>
                  )
                })}
                {saving === 0 && (
                  <span className="mc-outpost-world-tip-row mc-outpost-world-tip-note">No Barracks to save for: spend everything.</span>
                )}
              </span>
            </span>
          )}
          {commanderAdvice?.needsMove && (
            <span className="mc-outpost-world-chip mc-outpost-world-chip--notice tooltip-anchor">
              Move Commanders → {summary.nameOf(commanderAdvice.best.mapIndex)}
              <span className="tooltip mc-outpost-world-tip">
                Now: {postedAt}. {summary.nameOf(commanderAdvice.best.mapIndex)} reaches its next free{' '}
                {commanderAdvice.best.unit} fastest.
              </span>
            </span>
          )}
          {noticeCount > 0 && (
            <span className="mc-outpost-world-chip mc-outpost-world-chip--notice">
              {noticeCount} {noticeCount === 1 ? 'needs' : 'need'} attention
            </span>
          )}
        </span>
      </summary>
      {group.outposts.length === 0 ? (
        <p className="mc-outpost-empty">No outposts built in this world yet.</p>
      ) : (
        <div className="mc-outpost-grid">
          {group.outposts.map(o => (
            <OutpostCard key={o.mapIndex} outpost={o} summary={summary} optimizer={optimizer} />
          ))}
        </div>
      )}
    </details>
  )
}

export default function RoyalOutposts({ snapshot }) {
  const rg = snapshot?.royalGuardian
  const summary = useMemo(() => buildOutpostSummary(rg), [rg])
  // Simulates every outpost; only re-runs when a new save is imported
  const optimizer = useMemo(() => optimizeOutposts(rg, summary.outposts), [rg, summary])

  if (snapshot && !rg?.outposts) {
    return <p>Re-import your save to see your outposts.</p>
  }

  // "done / goal" while there's work left, then a single green number
  const progressStat = (label, done, goal) => (done >= goal
    ? { label, value: done, done: true }
    : { label, value: `${done} / ${goal}` })

  const stats = [
    // Built / every map the Kingdom has expanded into
    progressStat('Outposts', summary.total, summary.total + summary.toClear),
    summary.glorifyUnlocked && progressStat('Glorified', summary.glorified, summary.total),
    summary.purityUnlocked && progressStat('Purified', summary.purified, summary.total),
  ].filter(Boolean)

  return (
    <div className="mc-outposts">
      <InfoPanel
        intro="Your Kingdom's outposts by world. Click a world to open it."
        items={[
          `Orange lines are suggested changes, worked out by simulating each outpost ${HORIZON_DAYS} days ahead for the most Trade ranks (PTS).`,
          'Hover a rank bar or suggestion for the details.',
        ]}
      />

      <div className="mc-outpost-summary">
        {stats.map(s => (
          <span key={s.label} className="mc-outpost-stat">
            <span className="mc-outpost-stat-label">{s.label}</span>
            <span className={`mc-outpost-stat-value${s.done ? ' mc-outpost-stat-value--done' : ''}`}>{s.value}</span>
          </span>
        ))}
      </div>

      {summary.compounding && (
        <div className="mc-outpost-compounding">
          <span className="mc-outpost-compounding-title">Compounding Outposting</span>
          <div className="mc-outpost-compounding-options">
            {summary.compounding.map(opt => (
              <span
                key={opt.name}
                className={`mc-outpost-compounding-option${opt.active ? ' mc-outpost-compounding-option--active' : ''}`}
              >
                <strong>{opt.multi.toFixed(2)}x</strong> {opt.name}
                {opt.active && <span className="mc-outpost-compounding-badge">Active</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {summary.worlds.map(group => (
        <OutpostWorld key={group.world} group={group} summary={summary} optimizer={optimizer} />
      ))}
    </div>
  )
}
