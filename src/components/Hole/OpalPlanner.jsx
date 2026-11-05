import { useState } from 'react'
import { holeVillagers } from '../../data'
import { formatHoleNumber } from '../../utils/holeUtils'
import { getFocusPlan, getTargetPlan } from '../../utils/opalOptimizer'
import { formatWait } from '../../utils/farmingUtils'

// Villagers > Opals: the best split of every opal for one of two goals (math in utils/opalOptimizer.js)

const LIBRARIAN = 4
const STORAGE_KEY = 'idleon_opal_planner'
const GOALS = [
  { id: 'focus', label: 'Max one villager', text: 'The most EXP / hr for one villager. Late game: Bolaia.' },
  { id: 'targets', label: 'Reach LV targets', text: 'Hit the villager LVs you need for an unlock, as soon as possible.' },
]
const SAME_SPLIT = 0.005 // within 0.5% = already the best split

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // storage blocked: settings just won't stick
  }
}

function VillagerCell({ villager }) {
  return (
    <span className="hole-opal-villager">
      <img
        className="hole-villager-icon"
        src={`images/hole/Villager_${villager.id}.png`}
        alt=""
      />
      {villager.name}
    </span>
  )
}

function OpalChange({ now, next }) {
  const diff = next - now
  return (
    <span className="hole-opal-count">
      <img
        className="hole-inline-icon"
        src="images/hole/Opal.png"
        alt=""
      />
      {next}
      {diff !== 0 && (
        <span className={`hole-opal-diff${diff > 0 ? ' hole-opal-diff--up' : ' hole-opal-diff--down'}`}>
          {diff > 0 ? `+${diff}` : diff}
        </span>
      )}
    </span>
  )
}

function FocusResult({ result, focus }) {
  const now = result.current[focus].rate
  const next = result.plan[focus].rate
  const gain = now > 0 ? next / now - 1 : Infinity
  const villager = holeVillagers[focus]
  return (
    <>
      <p className="hole-text">
        {gain <= SAME_SPLIT
          ? <span className="hole-good">Your split is already the best for {villager.name}.</span>
          : <>Moving opals gives {villager.name} <strong>{Number.isFinite(gain) ? `+${formatHoleNumber(gain * 100)}%` : 'way more'}</strong> EXP / hr.</>}
        {' '}
        {result.model.equalSpread > 0
          ? `The others keep ${result.equalSpreadOpals} opals each: that's what Equal Spread pays for (+${result.model.equalSpread}% for everyone per 5 opals in the emptiest villager).`
          : 'Equal Spread (Villager Majik) isn\'t bought yet, so the others don\'t need opals.'}
      </p>
      <div className="hole-opal-table">
        <span className="hole-opal-head">Villager</span>
        <span className="hole-opal-head">Opals</span>
        <span className="hole-opal-head">EXP / hr now</span>
        <span className="hole-opal-head">With this split</span>
        {result.plan.filter(row => result.model.unlocked[row.id]).map(row => (
          <div
            key={row.id}
            className={`hole-opal-row${row.id === focus ? ' hole-opal-row--focus' : ''}`}
          >
            <VillagerCell villager={holeVillagers[row.id]} />
            <OpalChange
              now={result.current[row.id].opals}
              next={row.opals}
            />
            <span>{formatHoleNumber(result.current[row.id].rate)}</span>
            <span>{formatHoleNumber(row.rate)}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function TargetResult({ result }) {
  if (!result) {
    return <p className="hole-text hole-text--note hole-empty">Set a target LV above a villager's current LV.</p>
  }
  const faster = result.currentHours > 0 ? 1 - result.hours / result.currentHours : 0
  return (
    <>
      <p className="hole-text">
        Every target reached in <strong>{formatWait(result.hours * 3600)}</strong>
        {faster > SAME_SPLIT
          ? <> (your split now: {formatWait(result.currentHours * 3600)})</>
          : <span className="hole-good"> · your split is already the fastest</span>}.
        {result.equalSpreadOpals > 0 && ` Villagers without a target keep ${result.equalSpreadOpals} opals for Equal Spread.`}
      </p>
      <div className="hole-opal-table">
        <span className="hole-opal-head">Villager</span>
        <span className="hole-opal-head">Opals</span>
        <span className="hole-opal-head">Time now</span>
        <span className="hole-opal-head">With this split</span>
        {result.plan.filter(row => result.model.unlocked[row.id]).map(row => (
          <div
            key={row.id}
            className="hole-opal-row"
          >
            <VillagerCell villager={holeVillagers[row.id]} />
            <OpalChange
              now={result.current[row.id].opals}
              next={row.opals}
            />
            <span>{row.hours == null ? '—' : formatWait(result.current[row.id].hours * 3600)}</span>
            <span>{row.hours == null ? '—' : `LV ${row.target} in ${formatWait(row.hours * 3600)}`}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default function OpalPlanner({ snapshot, tomePoints }) {
  const levels = snapshot?.caverns?.villagerLevels ?? []
  const unlocked = holeVillagers.filter(villager => (levels[villager.id] ?? 0) >= 1)
  const [settings, setSettings] = useState(() => {
    const saved = loadSettings()
    const librarianOpen = (levels[LIBRARIAN] ?? 0) >= 1
    return {
      goal: saved.goal ?? (librarianOpen ? 'focus' : 'targets'),
      focus: saved.focus ?? (librarianOpen ? LIBRARIAN : 1),
      targets: saved.targets ?? {},
    }
  })
  const update = changes => {
    setSettings(prev => {
      const next = { ...prev, ...changes }
      saveSettings(next)
      return next
    })
  }
  const setTarget = (id, value) => {
    const targets = { ...settings.targets }
    const level = Math.floor(Number(value))
    if (value === '' || !Number.isFinite(level) || level <= 0) delete targets[id]
    else targets[id] = level
    update({ targets })
  }

  const focus = unlocked.some(villager => villager.id === settings.focus) ? settings.focus : unlocked.at(-1)?.id
  const activeTargets = Object.fromEntries(Object.entries(settings.targets)
    .filter(([id, level]) => level > (levels[id] ?? 0) && unlocked.some(villager => villager.id === Number(id))))
  const focusResult = settings.goal === 'focus' && focus != null ? getFocusPlan(snapshot, tomePoints, focus) : null
  const targetResult = settings.goal === 'targets' ? getTargetPlan(snapshot, tomePoints, activeTargets) : null
  const result = focusResult ?? targetResult
  const pool = result?.pool ?? null

  return (
    <div className="hole-body">
      <div className="hole-card">
        <h3 className="hole-card-title">
          <img
            className="hole-majik-icon"
            src="images/hole/Opal.png"
            alt=""
          />
          Opal Planner
          {pool != null && <span className="hole-card-title-stat">{pool.toLocaleString()} opals to split</span>}
        </h3>
        <p className="hole-text hole-text--note">
          Splits every opal you have (invested + unspent; opals can be reset and reinvested). Late game only
          Bolaia's LVs still matter (study rate), so max him. Early on, set the villager LVs you need for an
          unlock and it finds the split that gets there soonest.
        </p>
        <div className="hole-opal-goals">
          {GOALS.map(goal => (
            <button
              key={goal.id}
              type="button"
              className={`hole-opal-goal${settings.goal === goal.id ? ' hole-opal-goal--active' : ''}`}
              onClick={() => update({ goal: goal.id })}
            >
              <span className="hole-opal-goal-label">{goal.label}</span>
              <span className="hole-opal-goal-text">{goal.text}</span>
            </button>
          ))}
        </div>
        {settings.goal === 'focus' && (
          <div className="hole-opal-picks">
            {unlocked.map(villager => (
              <button
                key={villager.id}
                type="button"
                className={`hole-opal-pick${focus === villager.id ? ' hole-opal-pick--active' : ''}`}
                onClick={() => update({ focus: villager.id })}
              >
                <img
                  className="hole-opal-pick-icon"
                  src={`images/hole/Villager_${villager.id}.png`}
                  alt=""
                />
                {villager.name}
              </button>
            ))}
          </div>
        )}
        {settings.goal === 'targets' && (
          <div className="hole-opal-targets">
            <span className="hole-opal-head">Villager</span>
            <span className="hole-opal-head">Now</span>
            <span className="hole-opal-head">Target LV</span>
            <span className="hole-opal-head" />
            {unlocked.map(villager => {
              const level = levels[villager.id] ?? 0
              const target = settings.targets[villager.id]
              return (
                <div
                  key={villager.id}
                  className={`hole-opal-target${target > level ? ' hole-opal-target--set' : ''}`}
                >
                  <VillagerCell villager={villager} />
                  <span>LV {level}</span>
                  <input
                    className="hole-opal-input"
                    type="number"
                    min={level + 1}
                    placeholder="none"
                    aria-label={`${villager.name} target LV`}
                    value={target ?? ''}
                    onChange={event => setTarget(villager.id, event.target.value)}
                  />
                  <span className="hole-opal-target-gain">
                    {target > level ? `+${target - level} LV` : target ? 'already there' : ''}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        {settings.goal === 'targets' && Object.keys(settings.targets).length > 0 && (
          <button
            type="button"
            className="hole-opal-clear"
            onClick={() => update({ targets: {} })}
          >
            Clear targets
          </button>
        )}
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Best split</h3>
        {settings.goal === 'focus'
          ? focusResult && <FocusResult
            result={focusResult}
            focus={focus}
          />
          : <TargetResult result={targetResult} />}
        {result?.model.missing.length > 0 && (
          <p className="hole-text hole-text--note">
            EXP / hr leaves out: {result.model.missing.join(', ')}. These change the times; the split barely moves.
          </p>
        )}
      </div>
    </div>
  )
}
