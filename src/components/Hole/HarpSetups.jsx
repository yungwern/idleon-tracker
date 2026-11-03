import { useMemo, useState } from 'react'
import { HARP_GOALS, getHarpBestSetup } from '../../utils/harpOptimizer'
import { HARP_SETUP_MATCH, getHarpSetupCheck } from '../../utils/holeCavernUtils'

// The Harp > Best setup: one setup per goal, in pluck order, and how close the current harp is.
// Math in utils/harpOptimizer.js (works from the account's string LVs, so early and late accounts get different answers).

const GOAL_TEXT = {
  notes: 'Most notes over time: notes from every strum, plus what levelling each string type adds later.',
  level: 'Every string type levels as fast as it can, all counted the same.',
}

const COMPARE_TEXT = {
  notes: 'of its long-run notes',
  level: 'of its string EXP per type',
}

function countText(strings, letters) {
  const counts = new Map()
  strings.forEach(type => counts.set(type, (counts.get(type) ?? 0) + 1))
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .map(([type, count]) => `${count} ${letters[type]}`)
    .join(' · ')
}

// Why the Notes setup looks the way it does, from the setup itself (it moves from G-heavy to C-heavy as LVs grow)
function explainNotes(setup, harp) {
  const counts = harp.types.map(type => setup.strings.filter(t => t === type.index).length)
  const noteStrings = counts[0] + counts[3] + counts[5]
  const gStrings = counts[4]
  const top = harp.types
    .filter(type => type.unlocked)
    .reduce((best, type) => ((setup.worth[type.index] ?? 0) > (setup.worth[best.index] ?? 0) ? type : best), harp.types[0])
  const topText = `+${((setup.worth[top.index] ?? 0) * 100).toFixed(2)}% notes (${top.letter})`
  const lines = []
  if (harp.types.every(type => !type.unlocked || counts[type.index] > 0)) {
    lines.push('One of each type: every type keeps levelling, and each type on the harp adds +30% to every string (Variety Effect).')
  }
  if (gStrings > noteStrings) {
    lines.push(`Mostly G: your string LVs are still low, so one LV is worth up to ${topText}. A G pluck levels every type at once, which pays off more than the notes a C string makes.`)
  } else {
    lines.push(`Mostly C: at your string LVs one LV is worth at most ${topText}, and each LV costs 15% more EXP than the last (doubling a type's EXP adds about 5 LVs). The notes a C string makes every strum are worth more than extra EXP.`)
  }
  return lines
}

function formatWorth(worth) {
  const percent = worth * 100
  return `+${percent < 0.1 ? percent.toFixed(3) : percent.toFixed(2)}%`
}

export default function HarpSetups({ harp, snapshot }) {
  const check = getHarpSetupCheck(snapshot)
  const [goal, setGoal] = useState(check?.closest.id ?? 'notes')
  const letters = harp.types.map(type => type.letter)
  const key = JSON.stringify([goal, harp.strings, harp.optimizer])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setup = useMemo(() => getHarpBestSetup(goal, harp.strings, harp.optimizer), [key])
  if (!setup) return null
  const currentPercent = Math.min(100, Math.floor(setup.current * 1000) / 10)
  const onSetup = setup.current >= HARP_SETUP_MATCH

  return (
    <div className="hole-card">
      <h3 className="hole-card-title">
        Best setup
        {check && !check.matches && <span className="notice-badge hole-harp-setup-notice">Rearrange strings</span>}
      </h3>
      <div className="page-tabs page-tabs--sub hole-tabs">
        {HARP_GOALS.map(option => (
          <button
            key={option.id}
            type="button"
            className={`page-tab-btn${goal === option.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setGoal(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="hole-text">{GOAL_TEXT[goal]}</p>
      <div className="hole-harp-setup">
        <div className="hole-harp-setup-head">
          <span className="hole-harp-setup-name">{countText(setup.strings, letters)}</span>
          <span className={`hole-chip${onSetup ? ' hole-chip--active' : ''}`}>
            {onSetup ? 'Your harp is on this setup' : `Your harp: ${currentPercent}% ${COMPARE_TEXT[goal]}`}
          </span>
        </div>
        <div className="hole-harp-strings">
          {setup.strings.map((type, slot) => (
            <div
              key={slot}
              className={`hole-harp-string hole-harp--${type}`}
            >
              <span className="hole-harp-string-line" />
              <img
                className="hole-harp-string-letter"
                src={`images/hole/harp/string_${type}.png`}
                alt={letters[type] ?? '?'}
              />
            </div>
          ))}
        </div>
      </div>
      {goal === 'notes' && (
        <>
          <div className="hole-harp-worth">
            <span className="hole-text--note">+1 LV is worth, in notes:</span>
            {harp.types.map(type => (
              <span
                key={type.index}
                className={`hole-harp-worth-chip hole-harp--${type.index}`}
              >
                {type.letter} {formatWorth(setup.worth[type.index] ?? 0)}
              </span>
            ))}
          </div>
          {explainNotes(setup, harp).map(line => (
            <p
              key={line}
              className="hole-text hole-text--note"
            >
              {line}
            </p>
          ))}
          <p className="hole-text hole-text--note">
            This setup follows your string LVs: low LVs (early on) get mostly G to level everything, and as LVs grow it
            shifts to one of each plus C. Check back after big level jumps.
          </p>
        </>
      )}
      {goal === 'level' && (
        <p className="hole-text hole-text--note">
          G is the levelling string: one G pluck gives EXP to every type, any other string only to itself. The few other
          strings are there for Variety Effect (+30% per type on the harp) and a little EXP to their own type.
        </p>
      )}
      <p className="hole-text hole-text--note">
        {harp.optimizer.built.domino
          ? 'Pluck the strings left to right: order matters, since each string is worth +20% more than the one before it (Domino Effect), so the strings that matter most go last.'
          : 'Pluck order doesn\'t matter yet: it only starts to once the Domino Effect schematic is created.'}
      </p>
    </div>
  )
}
