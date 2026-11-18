import { useState } from 'react'
import { getSnailOdds, getEncouragementFor, formatGamingNumber } from '../../utils/gamingUtils'
import { formatSnailChance } from '../../utils/gamingBonusUtils'

// Immortal Snail odds: what one upgrade attempt does at each encouragement, for the snail's LV (or another LV
// the player types in to plan ahead)

const ROWS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50]

function pct(value) {
  if (value <= 0) return '0%'
  if (value >= 1) return '100%'
  return `${formatGamingNumber(value * 100)}%`
}

export default function SnailPlanner({ snail }) {
  const [plannedLevel, setPlannedLevel] = useState(null)
  const level = plannedLevel ?? snail.level
  const planning = plannedLevel !== null && plannedLevel !== snail.level
  const encouragement = planning ? null : snail.encouragement
  const rows = [...new Set([...ROWS, ...(encouragement !== null ? [encouragement] : [])])]
    .sort((a, b) => a - b)
    .map(value => getSnailOdds(level, value, snail.holeBonus))
  const for90 = getEncouragementFor(level, 0.9, snail.holeBonus)
  const maxSuccess = getSnailOdds(level, 1000, snail.holeBonus).success
  const atMax = level >= snail.maxLevel

  return (
    <section className="gaming-card gaming-snail">
      <div className="gaming-card-title">
        Immortal Snail odds
        <span className="gaming-card-stat">LV {snail.level} / {snail.maxLevel}</span>
      </div>
      <p className="gaming-text gaming-text--note">
        Each upgrade attempt either levels the snail up, resets it to LV 0, or does nothing. Encouragement raises
        the level-up odds and lowers the reset odds. Your encouragement right now: {formatGamingNumber(snail.encouragement)}.
        {snail.holeBonus > 0 && ` Includes +${formatGamingNumber(snail.holeBonus)}% success from The Hole schematic.`}
      </p>

      <label className="gaming-snail-input">
        Plan for snail LV
        <input
          type="number"
          className="gaming-number-input"
          min={0}
          max={snail.maxLevel}
          value={level}
          onChange={event => {
            const value = Math.max(0, Math.min(snail.maxLevel, Math.floor(Number(event.target.value) || 0)))
            setPlannedLevel(value)
          }}
        />
        {planning && (
          <button
            type="button"
            className="gaming-link-btn"
            onClick={() => setPlannedLevel(null)}
          >
            Back to LV {snail.level}
          </button>
        )}
      </label>

      <p className="gaming-text">
        {atMax
          ? 'The snail is at its max LV. Superbits Snail Genesis, Omega and Zenith raise the cap.'
          : maxSuccess <= 0
            ? `At LV ${level} the level-up chance is negative no matter how much you encourage (${formatSnailChance(getSnailOdds(level, encouragement ?? 0, snail.holeBonus).successShown)} at your encouragement), same as in game: the snail is held at this LV for now.`
            : for90 !== null
              ? <>For a 90% level-up chance at LV {level}, encourage <strong>{for90}</strong> times.</>
              : `At LV ${level} the level-up chance tops out at ${pct(maxSuccess)}, even with lots of encouragement.`}
      </p>

      <div className="gaming-snail-table">
        <div className="gaming-snail-head">
          <span>Encouragement</span>
          <span>Level up</span>
          <span>Reset to LV 0</span>
          <span>Nothing</span>
          <span className="tooltip-anchor">
            Up before reset<span className="info-icon" />
            <span className="tooltip tooltip--wrap">If you keep trying at this encouragement until something happens: the chance it levels up before it resets.</span>
          </span>
        </div>
        {rows.map(row => (
          <div
            key={row.encouragement}
            className={`gaming-snail-row${row.encouragement === encouragement ? ' gaming-snail-row--current' : ''}${row.encouragement === for90 ? ' gaming-snail-row--target' : ''}`}
          >
            <span>
              {row.encouragement}
              {row.encouragement === encouragement && <span className="gaming-pill gaming-pill--current">now</span>}
            </span>
            <span className={row.successShown < 0 ? 'gaming-short' : 'gaming-good'}>
              {row.successShown < 0 ? formatSnailChance(row.successShown) : pct(row.success)}
            </span>
            <span className={row.reset > 0 ? 'gaming-short' : ''}>{pct(row.reset)}</span>
            <span className="gaming-muted">{pct(row.stay)}</span>
            <span>{row.success > 0 ? pct(row.winBeforeReset) : '—'}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
