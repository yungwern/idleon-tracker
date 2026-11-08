import { useMemo } from 'react'
import { buildOutpostSummary, OUTPOST_UPGRADES, SUPPORT_CAMP_MODE, SAVAGE_STRONGHOLD_MODE, PURITY_RANK, formatOutpostExp } from '../../data'
import { optimizeOutposts, formatDuration, HORIZON_DAYS, BARRACKS_COST } from '../../utils/outpostOptimizer'
import { getOutpostNotices } from '../../utils/outpostNotices'
import InfoPanel from '../InfoPanel/InfoPanel'

import './RoyalOutposts.css'

const RG_IMG = 'images/masterclass/royal guardian'
const COMMANDER_IMG = `${RG_IMG}/RGcommander.png`
const PRIEST_IMG = `${RG_IMG}/RGpriest.png`
// Slot unit types: 0 Worker, 1 Trader, 2 Guard, 3 Surveyor (RGunit0-3)
const UNIT_NAMES = ['Worker', 'Trader', 'Guard', 'Surveyor']
const UNIT_IMG = type => `${RG_IMG}/RGunit${type}.png`
const UNIT_TRADER = 1
const UNIT_SURVEYOR = 3

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

function MobIcon({ mobKey }) {
  if (!mobKey) return null
  return <img src={`images/mobs/trimmed/${mobKey}.png`} alt="" className="mc-outpost-mob-img" />
}

// Glorified = blue (orblet) star, Purified = red star. Only the ones that are true are shown.
function OutpostStars({ glorified, purified }) {
  return (
    <span className="mc-outpost-stars">
      {glorified && (
        <span className="mc-outpost-star mc-outpost-star--glorified tooltip-anchor">
          ★<span className="tooltip">Glorified</span>
        </span>
      )}
      {purified && (
        <span className="mc-outpost-star mc-outpost-star--purified tooltip-anchor">
          ★<span className="tooltip">Purified</span>
        </span>
      )}
    </span>
  )
}

// One notice line, shared by world headers and outpost cards: icon column + text, coloured by kind.
//   kind: 'action' (something to change), 'spend' (PTS to spend), 'save' (hold PTS), 'info' (all good / what's next)
function Notice({ kind, icon, children, tip }) {
  return (
    <span className={`mc-outpost-notice mc-outpost-notice--${kind}${tip ? ' tooltip-anchor' : ''}`}>
      <span className="mc-outpost-notice-icon">{icon ?? <span className="mc-outpost-notice-dot" />}</span>
      <span className="mc-outpost-notice-text">{children}</span>
      {tip && <span className="tooltip mc-outpost-tip">{tip}</span>}
    </span>
  )
}

const UnitIcon = ({ type }) => <img src={UNIT_IMG(type)} alt="" className="mc-outpost-unit-sprite" />
const SpriteIcon = ({ src }) => <img src={src} alt="" className="mc-outpost-unit-img" />

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

// Unit slots like the in-game row: filled slots with their unit, empty ones dashed, locked ones (more Barracks) dim
function UnitSlots({ opt }) {
  const free = opt.passiveUnits
    .map((n, type) => n > 0 && plural(n, UNIT_NAMES[type]))
    .filter(Boolean)
  return (
    <div className="mc-outpost-slots tooltip-anchor">
      {Array.from({ length: opt.maxSlots }, (_, i) => {
        const type = opt.slotUnits[i]
        if (i >= opt.slots) return <span key={i} className="mc-outpost-slot mc-outpost-slot--locked" />
        if (type === undefined || type < 0) return <span key={i} className="mc-outpost-slot mc-outpost-slot--empty" />
        return (
          <span key={i} className={`mc-outpost-slot mc-outpost-slot--u${type}`}>
            <UnitIcon type={type} />
          </span>
        )
      })}
      <span className="tooltip mc-outpost-tip">
        {opt.slots} of {opt.maxSlots} unit slots unlocked (1 + Barracks LV).
        {free.length > 0 && ` Command rank also gives ${free.join(', ')} for free.`}
      </span>
    </div>
  )
}

const UPGRADE_KEYS = ['barracks', 'logistics', 'education']

// Upgrade levels as three stat boxes; a green +N shows what the unspent PTS buy
function UpgradeStats({ outpost, opt }) {
  const gains = {}
  opt?.ptsPlan.now.forEach(step => { gains[step.upgrade] = step.levels })
  return (
    <div className="mc-outpost-upgrades">
      {OUTPOST_UPGRADES.map((upg, i) => {
        if (outpost.upgrades[i] === 0 && i === 1) return null
        const gain = gains[UPGRADE_KEYS[i]]
        return (
          <span key={upg.name} className="mc-outpost-upgrade">
            <span className="mc-outpost-upgrade-label">{upg.short}</span>
            <span className="mc-outpost-upgrade-value">
              {outpost.upgrades[i]}
              {gain > 0 && <span className="mc-outpost-upgrade-gain">+{gain}</span>}
            </span>
          </span>
        )
      })}
    </div>
  )
}

// "Education to LV 74, then Barracks 6"
function upcomingText(upcoming) {
  return upcoming
    .map(step => (step.upgrade === 'barracks'
      ? `Barracks ${step.level}`
      : step.until ? `Education to LV ${step.until}` : 'Education'))
    .join(', then ')
}

// "Barracks +1 and Education +2"
function spendText(now) {
  return now.map(step => `${step.upgrade === 'barracks' ? 'Barracks' : 'Education'} +${step.levels}`).join(' and ')
}

function ptsReason(plan, educationUnlocked) {
  if (!educationUnlocked) return 'Greater Education isn\'t unlocked yet, so PTS go to Barracks.'
  if (plan.educationUntil === null) {
    return 'Barracks has every unit slot (7), so every PTS goes to Education. More Barracks levels only add Resource Collection Rate.'
  }
  return `Education raises every bar's EXP; a Barracks level adds a Trader slot for ${BARRACKS_COST} PTS. `
    + `Here Education is the better buy until LV ${plan.educationUntil}, then Barracks.`
}

// "Swap 5 Surveyors to Traders" / "Set 3 slots to Surveyors until Intel 40"
function swapText(swap) {
  const what = swap.from ? `Swap ${plural(swap.count, swap.from.slice(0, -1))} to ${swap.to}` : `Set ${plural(swap.count, 'slot')} to ${swap.to}`
  return swap.until ? `${what} until Intel ${swap.until}` : what
}

// Everything to do on this outpost, as notice lines (most important first)
function OutpostNotices({ outpost, opt, optimizer }) {
  const lines = []
  const swap = opt.unitSwap
  if (swap) {
    lines.push(
      <Notice
        key="swap"
        kind="action"
        icon={<UnitIcon type={swap.to === 'Traders' ? UNIT_TRADER : UNIT_SURVEYOR} />}
        tip={(
          <>
            Now: {plural(opt.slotTraders, 'Trader')}, {plural(opt.slotSurveyors, 'Surveyor')}.
            Trade rank in {HORIZON_DAYS} days: {opt.projectedNow.toFixed(1)} as-is, {opt.projectedBest.toFixed(1)} after
            swapping.
            {swap.until && ` Surveyors raise Intel, which boosts every bar; once Intel reaches ${swap.until}, swap them back to Traders.`}
            {(opt.slotWorkers > 0 || opt.slotGuards > 0) && ' Workers and Guards stay as they are.'}
          </>
        )}
      >
        {swapText(swap)} <span className="mc-outpost-notice-sub">+{swap.gain.toFixed(1)} Trade ranks in {HORIZON_DAYS} days</span>
      </Notice>,
    )
  } else if (!opt.allTradersNow && opt.slotSurveyors > 0) {
    lines.push(
      <Notice key="survey" kind="info" icon={<UnitIcon type={UNIT_SURVEYOR} />}>
        Keep Surveyors until Intel {opt.plan.switchAt}, then Traders
      </Notice>,
    )
  }

  // Commanders: only on the outpost they should be working
  const commanderAdvice = optimizer.commanderAdvice.get(outpost.world)
  if (commanderAdvice?.best.mapIndex === outpost.mapIndex) {
    const cmd = opt.command
    const eta = formatDuration(cmd.hoursPerCommander / Math.max(1, commanderAdvice.commanders))
    lines.push(commanderAdvice.needsMove ? (
      <Notice
        key="cmd"
        kind="action"
        icon={<SpriteIcon src={COMMANDER_IMG} />}
        tip={`Fastest free Trader in World ${outpost.world}: Command ${cmd.rank} to ${cmd.target} in about ${eta} with all ${commanderAdvice.commanders} Commanders here.`}
      >
        Send Commanders here
      </Notice>
    ) : (
      <Notice key="cmd" kind="info" icon={<SpriteIcon src={COMMANDER_IMG} />}>
        Commanders here <span className="mc-outpost-notice-sub">next Trader in {eta}</span>
      </Notice>
    ))
  }

  const plan = opt.ptsPlan
  const ptsTip = `${opt.pts.left} of ${opt.pts.total} PTS unspent. ${ptsReason(plan, optimizer.educationUnlocked)}`
  if (plan.spend > 0) {
    lines.push(
      <Notice key="pts" kind="spend" tip={ptsTip}>
        Spend {plan.spend} PTS: {spendText(plan.now)}
        {plan.saveFor && <span className="mc-outpost-notice-sub">then save for Barracks {plan.saveFor}</span>}
      </Notice>,
    )
  } else if (plan.saveFor) {
    lines.push(
      <Notice key="pts" kind="save" tip={ptsTip}>
        Saving for Barracks {plan.saveFor} <span className="mc-outpost-notice-sub">{opt.pts.left} / {BARRACKS_COST} PTS</span>
      </Notice>,
    )
  } else if (plan.upcoming.length > 0) {
    lines.push(
      <Notice key="pts" kind="info" tip={ptsTip}>
        <span className="mc-outpost-notice-sub">Next PTS: {upcomingText(plan.upcoming)}</span>
      </Notice>,
    )
  }

  return <div className="mc-outpost-notices">{lines}</div>
}

function OutpostCard({ outpost, summary, optimizer }) {
  const priestsHere = optimizer.priestAdvice.get(outpost.world)?.postedAt.get(outpost.mapIndex) ?? 0
  const isSupport = outpost.mode === SUPPORT_CAMP_MODE
  const opt = optimizer.byMap.get(outpost.mapIndex)
  // Purity only matters once the world has a Priest (or the outpost already has some)
  const showPurity = summary.priestWorlds.has(outpost.world) || outpost.purified
  const ranks = outpost.ranks.filter(bar => bar.unlocked && (bar.type !== PURITY_RANK || showPurity))

  return (
    <div className="mc-outpost-card">
      <div className="mc-outpost-head">
        <MobIcon mobKey={outpost.mobKey} />
        <span className="mc-outpost-name">{outpost.name}</span>
        <OutpostStars glorified={outpost.glorified} purified={outpost.purified} />
      </div>

      {(isSupport || outpost.mode === SAVAGE_STRONGHOLD_MODE || outpost.supportedBy.length > 0 || priestsHere > 0) && (
        <div className="mc-outpost-meta">
          {isSupport && (
            <span className="mc-outpost-meta-line mc-outpost-meta-line--support">
              {outpost.supportTargets.length > 0
                ? <>Support Camp for <strong>{outpost.supportTargets.map(summary.nameOf).join(', ')}</strong></>
                : 'Support Camp, not linked'}
            </span>
          )}
          {outpost.mode === SAVAGE_STRONGHOLD_MODE && (
            <span className="mc-outpost-meta-line mc-outpost-meta-line--savage">Savage Stronghold</span>
          )}
          {outpost.supportedBy.length > 0 && (
            <span className="mc-outpost-meta-line mc-outpost-meta-line--support tooltip-anchor">
              Boosted{opt ? <> <strong>+{Math.round(opt.supportBoost)}%</strong></> : ''} by{' '}
              {plural(outpost.supportedBy.length, 'Support Camp')}
              <span className="tooltip mc-outpost-tip">{outpost.supportedBy.map(summary.nameOf).join(', ')}</span>
            </span>
          )}
          {priestsHere > 0 && (
            <span className="mc-outpost-meta-line mc-outpost-meta-line--priest">
              <SpriteIcon src={PRIEST_IMG} />
              {plural(priestsHere, 'Priest')} purifying
            </span>
          )}
        </div>
      )}

      {opt && <UnitSlots opt={opt} />}

      <div className="mc-outpost-ranks">
        {ranks.map(bar => <OutpostRankRow key={bar.type} bar={bar} />)}
      </div>

      <UpgradeStats outpost={outpost} opt={opt} />

      {opt && <OutpostNotices outpost={outpost} opt={opt} optimizer={optimizer} />}
    </div>
  )
}

// Splits a world's unspent PTS into: outposts that spend it all on Education (one total) and outposts that
// buy a Barracks level now or hold PTS for the next one (these need names)
function worldPtsNotices(outposts, optimizer) {
  const education = []
  const buy = []
  const save = []
  outposts.forEach(outpost => {
    const opt = optimizer.byMap.get(outpost.mapIndex)
    const plan = opt?.ptsPlan
    if (!plan || (plan.spend === 0 && !plan.saveFor)) return
    const row = { outpost, opt, plan }
    if (plan.now.some(step => step.upgrade === 'barracks')) buy.push(row)
    else if (plan.saveFor) save.push(row)
    else education.push(row)
  })
  // Closest to the next Barracks level first
  save.sort((a, b) => (b.opt.pts.left - b.plan.spend) - (a.opt.pts.left - a.plan.spend))
  return {
    educationPts: education.reduce((sum, r) => sum + r.plan.spend, 0),
    educationCount: education.length,
    buy,
    save,
  }
}

// Names inline while they fit on a line; past that, a count with the names in the tooltip
const MAX_INLINE_NAMES = 3

function NameRun({ names }) {
  if (names.length > MAX_INLINE_NAMES) return <strong>{plural(names.length, 'outpost')}</strong>
  return names.map((name, i) => (
    <span key={name}>
      <strong>{name}</strong>
      {i < names.length - 1 && ', '}
    </span>
  ))
}

function OutpostWorld({ group, summary, optimizer, notices }) {
  const pts = worldPtsNotices(group.outposts, optimizer)
  const describePosts = postedAt => [...postedAt]
    .map(([mapIndex, n]) => `${n} at ${mapIndex >= 0 ? summary.nameOf(mapIndex) : 'no outpost'}`)
    .join(', ')
  const swapsTo = to => notices?.swaps.filter(row => row.swap.to === to) ?? []
  const nameOf = row => row.outpost.name
  const lines = []

  if (notices?.commander) {
    const target = notices.commander.best.mapIndex
    lines.push(
      <Notice
        key="cmd"
        kind="action"
        icon={<SpriteIcon src={COMMANDER_IMG} />}
        tip={`Now: ${describePosts(notices.commander.postedAt)}. ${summary.nameOf(target)} reaches its next free ${notices.commander.best.unit} fastest.`}
      >
        Move Commanders to <MobIcon mobKey={summary.mobOf(target)} /><strong>{summary.nameOf(target)}</strong>
      </Notice>,
    )
  }
  if (notices?.priest) {
    const target = notices.priest.target
    lines.push(
      <Notice
        key="priest"
        kind="action"
        icon={<SpriteIcon src={PRIEST_IMG} />}
        tip={(
          <>
            Now: {describePosts(notices.priest.postedAt)}.{' '}
            {notices.priest.global
              ? `Purifying ${summary.nameOf(target)} triples the ${target === 1 ? 'Intel' : 'Command'} bar on every outpost, so it comes first.`
              : 'Priests on one outpost purify it sooner than spread out; this is the closest to Purity Rank 1.'}
          </>
        )}
      >
        Move Priests to <MobIcon mobKey={summary.mobOf(target)} /><strong>{summary.nameOf(target)}</strong>
      </Notice>,
    )
  }
  if (notices?.camps.length > 0) {
    const target = optimizer.priestAdvice.get(group.world).target
    lines.push(
      <Notice
        key="camps"
        kind="action"
        icon={<SpriteIcon src={PRIEST_IMG} />}
        tip={(
          <>
            {notices.camps.map(camp => (
              <span key={camp.mapIndex} className="mc-outpost-tip-row">
                <strong>{camp.name}</strong>
                {camp.supportTargets.length > 0
                  ? ` (now boosts ${camp.supportTargets.map(summary.nameOf).join(', ')})`
                  : ' (not linked)'}
              </span>
            ))}
            <span className="mc-outpost-tip-row mc-outpost-tip-note">
              The Priests are purifying {summary.nameOf(target)}. Support Camps speed up Purity like any other rank, and
              every Purified Map adds Collection Rate to all outposts, so it's worth what the old link was helping.
            </span>
          </>
        )}
      >
        Link {plural(notices.camps.length, 'Support Camp')} to <MobIcon mobKey={summary.mobOf(target)} />
        <strong>{summary.nameOf(target)}</strong>
      </Notice>,
    )
  }
  ;[['Surveyors', UNIT_SURVEYOR], ['Traders', UNIT_TRADER]].forEach(([to, type]) => {
    const rows = swapsTo(to)
    if (rows.length === 0) return
    lines.push(
      <Notice
        key={`swap-${to}`}
        kind="action"
        icon={<UnitIcon type={type} />}
        tip={(
          <>
            {rows.map(({ outpost, swap }) => (
              <span key={outpost.mapIndex} className="mc-outpost-tip-row">
                <strong>{outpost.name}</strong>: {swapText(swap)} (+{swap.gain.toFixed(1)} Trade ranks)
              </span>
            ))}
            <span className="mc-outpost-tip-row mc-outpost-tip-note">
              {to === 'Surveyors'
                ? 'More Intel raises every bar on the outpost, so Surveyors win for a while before Traders take over.'
                : 'Intel is high enough that Traders now earn more Trade ranks (PTS) than more Intel would.'}
            </span>
          </>
        )}
      >
        {to === 'Surveyors' ? 'Switch to Surveyors' : 'Switch to Traders'}: <NameRun names={rows.map(nameOf)} />
      </Notice>,
    )
  })
  if (pts.buy.length > 0) {
    lines.push(
      <Notice
        key="buy"
        kind="spend"
        tip={(
          <>
            {pts.buy.map(({ outpost, plan }) => (
              <span key={outpost.mapIndex} className="mc-outpost-tip-row">
                <strong>{outpost.name}</strong>: {spendText(plan.now)}
              </span>
            ))}
          </>
        )}
      >
        Buy Barracks: <NameRun names={pts.buy.map(nameOf)} />
      </Notice>,
    )
  }
  if (pts.educationPts > 0) {
    lines.push(
      <Notice
        key="edu"
        kind="spend"
        tip={`Spend every unspent PTS on Greater Education (${plural(pts.educationCount, 'outpost')}).${pts.save.length + pts.buy.length > 0 ? ' The Barracks outposts are the exception.' : ''}`}
      >
        Spend {pts.educationPts} PTS on Education <span className="mc-outpost-notice-sub">{plural(pts.educationCount, 'outpost')}</span>
      </Notice>,
    )
  }
  if (pts.save.length > 0) {
    lines.push(
      <Notice
        key="save"
        kind="save"
        tip={(
          <>
            <span className="mc-outpost-tip-row">Don't spend PTS here yet:</span>
            {pts.save.map(({ outpost, opt, plan }) => (
              <span key={outpost.mapIndex} className="mc-outpost-tip-row">
                <strong>{outpost.name}</strong>: {opt.pts.left - plan.spend} / {BARRACKS_COST} PTS for Barracks {plan.saveFor}
              </span>
            ))}
          </>
        )}
      >
        Saving for Barracks: <NameRun names={pts.save.map(nameOf)} />
      </Notice>,
    )
  }

  const showGlorified = summary.glorifyUnlocked
  const showPurified = summary.purityUnlocked
  return (
    <details className={`mc-outpost-world mc-outpost-world--w${group.world}`}>
      <summary className="mc-outpost-world-head">
        <span className="mc-outpost-world-top">
          <span className="mc-outpost-world-title">World {group.world}</span>
          <span className="mc-outpost-world-stat">{plural(group.outposts.length, 'outpost')}</span>
          {notices?.count > 0 && <span className="notice-badge">{notices.count}</span>}
          {group.outposts.length > 0 && (showGlorified || showPurified) && (
            <span className="mc-outpost-world-stars">
              {showGlorified && (
                <span className="mc-outpost-world-star-count tooltip-anchor">
                  <span className="mc-outpost-star mc-outpost-star--glorified">★</span>
                  {group.glorified}/{group.outposts.length}
                  <span className="tooltip">Glorified</span>
                </span>
              )}
              {showPurified && (
                <span className="mc-outpost-world-star-count tooltip-anchor">
                  <span className="mc-outpost-star mc-outpost-star--purified">★</span>
                  {group.purified}/{group.outposts.length}
                  <span className="tooltip">Purified</span>
                </span>
              )}
            </span>
          )}
        </span>
        {lines.length > 0 && <span className="mc-outpost-notices mc-outpost-world-notices">{lines}</span>}
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
  // Per-world notices (same source as the sidebar badge)
  const notices = useMemo(() => getOutpostNotices(rg, summary.outposts), [rg, summary])

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
        intro="Your Kingdom's outposts by world."
        items={[
          `Units (Traders vs Surveyors) and PTS (Barracks vs Education) are suggested by simulating each outpost ${HORIZON_DAYS} days ahead for the most Trade ranks (PTS).`,
          'Everything to change is listed under each World heading; open a World to see each outpost.',
          'Blue star = Glorified, red star = Purified. Barracks unlocks up to 7 unit slots; levels past that only add Resource Collection Rate.',
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

      {summary.propaganda && (
        <div className="mc-outpost-compounding">
          <span className="mc-outpost-compounding-title">
            State-Wide Propoganda: <strong>{summary.propaganda.multi.toFixed(2)}x</strong> EXP to one Rank Type
          </span>
          <div className="mc-outpost-compounding-options">
            {summary.propaganda.options.map(opt => (
              <span
                key={opt.name}
                className={`mc-outpost-compounding-option${opt.active ? ' mc-outpost-compounding-option--active' : ''}`}
              >
                {opt.name}
                {opt.active && <span className="mc-outpost-compounding-badge">Active</span>}
              </span>
            ))}
          </div>
          <span className="mc-outpost-compounding-note">
            The game doesn't apply this boost right now: it reads its value from the wrong list (found by IdleOn Toolbox),
            so the suggestions on this page leave it out.
          </span>
        </div>
      )}

      {summary.worlds.map(group => (
        <OutpostWorld
          key={group.world}
          group={group}
          summary={summary}
          optimizer={optimizer}
          notices={notices.byWorld.get(group.world)}
        />
      ))}
    </div>
  )
}
