import { getGambit, formatGambitTime } from '../../utils/holeCavernUtils'
import { formatHoleNumber } from '../../utils/holeUtils'

// Gambit (cavern 14): points (base × multi), every trial's best time, and the bonuses the points unlock.

function formatTotalTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  return hours > 0 ? `${hours}h ${formatGambitTime(seconds - 3600 * hours)}` : formatGambitTime(seconds)
}

export default function GambitPanel({ snapshot, lead }) {
  const gambit = getGambit(snapshot)
  const unlocked = gambit.bonuses.filter(bonus => bonus.unlocked).length

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Gambit Points</span>
          <span className="hole-stat-card-value">{Math.round(gambit.points).toLocaleString()}</span>
          <span className="hole-gambit-points">
            <span>Base points from survival time</span>
            <strong>{Math.round(gambit.basePoints).toLocaleString()}</strong>
            <span>PTS multi</span>
            <strong>{formatHoleNumber(gambit.multi)}x</strong>
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Total Gambit time</span>
          <span className="hole-stat-card-value">{formatTotalTime(gambit.totalTime)}</span>
          <span className="hole-stat-card-hint">Your best times on all 6 trials added up.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Summoning Doublers</span>
          <span className="hole-stat-card-value">{gambit.doublers.placed} / {gambit.doublers.total} placed</span>
          <span className="hole-stat-card-hint">From the first Gambit bonus, plus 10 from the event shop if bought.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Bonuses unlocked</span>
          <span className="hole-stat-card-value">{unlocked} / {gambit.bonuses.length}</span>
          <span className="hole-stat-card-hint">
            {gambit.nextBonus
              ? `Next at ${Math.ceil(gambit.nextBonus.req).toLocaleString()} points (${Math.ceil(gambit.nextBonus.req - gambit.points).toLocaleString()} to go).`
              : 'Every bonus unlocked. Bonuses that scale with points keep growing.'}
          </span>
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Trials</h3>
        <div className="hole-entries hole-entries--wide">
          {gambit.trials.map(trial => (
            <div
              key={trial.index}
              className={`hole-entry${trial.time > 0 ? '' : ' hole-entry--locked'}`}
            >
              <img
                className="hole-entry-icon"
                src={trial.image}
                alt=""
              />
              <div className="hole-entry-body">
                <div className="hole-entry-head">
                  <span className="hole-entry-name">{trial.name}</span>
                  <span className="hole-gambit-time">{trial.time > 0 ? formatGambitTime(trial.time) : 'Not played'}</span>
                </div>
                <span className="hole-entry-text hole-entry-text--quote">{trial.description}</span>
                <span className="hole-entry-meta">
                  {Math.round(trial.basePoints).toLocaleString()} base points ({trial.pointsPerSecond} per second survived, plus time bonuses)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Bonuses</h3>
        <p className="hole-text hole-text--note">
          ↑ bonuses keep growing with Gambit Points and never cap: they gain the same amount every time your points go
          up 10x. Summoning Doublers and Opals come at breakpoints, so they get a bar to the next one.
        </p>
        <div className="hole-list">
          {gambit.bonuses.map(bonus => (
            <div
              key={bonus.index}
              className={`hole-list-item hole-list-item--gambit${bonus.unlocked ? '' : ' hole-list-item--dim'}`}
            >
              <span className="hole-list-name hole-gambit-name">
                {bonus.text}
                {bonus.growth && <span className="hole-chip hole-chip--grows">↑ {bonus.growth.label}</span>}
              </span>
              <span className="hole-list-level">
                {bonus.unlocked ? '✓' : `${Math.ceil(bonus.req).toLocaleString()} pts`}
              </span>
              {bonus.description && <span className="hole-list-text">{bonus.description}</span>}
              {bonus.unlocked && bonus.growth?.next && (
                <span className="hole-gambit-next">
                  <progress
                    className="hole-cap-bar"
                    value={bonus.growth.next.progress}
                    max={1}
                  />
                  <span className="hole-text--note">
                    {bonus.growth.next.what} at {Math.ceil(bonus.growth.next.points).toLocaleString()} points
                    ({Math.ceil(bonus.growth.next.points - gambit.points).toLocaleString()} to go)
                  </span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
