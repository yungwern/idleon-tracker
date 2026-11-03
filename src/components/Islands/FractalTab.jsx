import { fractalBonusMap, NOTHING_TROPHY } from '../../data'
import { getFractalMilestones, getNothingTrophyOdds } from '../../utils/islandUtils'
import IslandOverview from './IslandOverview'

// Fractal Island: Nothing AFK hours and the timeline of bonuses they unlock

const HOURS_PER_DAY = 24

function formatHours(hours) {
  return Math.floor(hours).toLocaleString()
}

function formatChance(chance) {
  const percent = chance * 100
  return `${percent < 10 ? Math.round(percent * 10) / 10 : Math.round(percent)}%`
}

export default function FractalTab({ snapshot, island, notices }) {
  const hours = snapshot.islands.fractalHours
  const milestones = getFractalMilestones(snapshot.islands)
  const next = milestones.find(milestone => !milestone.reached)
  const max = fractalBonusMap[fractalBonusMap.length - 1].hours
  const reached = milestones.filter(milestone => milestone.reached).length
  const trophy = getNothingTrophyOdds(snapshot)

  return (
    <div className="islands-tab-body">
      <IslandOverview
        snapshot={snapshot}
        island={island}
        notices={notices}
      />

      <div className="islands-summary">
        <div className="islands-stat">
          <span className="islands-stat-value">{formatHours(hours)}</span>
          <span className="islands-stat-label">Nothing AFK hours</span>
        </div>
        <div className="islands-stat">
          <span className="islands-stat-value">{reached} / {milestones.length}</span>
          <span className="islands-stat-label">Bonuses unlocked</span>
        </div>
        <div className="islands-stat tooltip-anchor">
          <img
            className={`islands-stat-icon${trophy.owned ? '' : ' islands-trophy--locked'}`}
            src={NOTHING_TROPHY.img}
            alt=""
          />
          <span className={`islands-stat-value${trophy.owned ? ' islands-good' : ''}`}>{trophy.owned ? 'Unlocked' : 'Locked'}</span>
          <span className="islands-stat-label">{NOTHING_TROPHY.name}</span>
          <div className="tooltip tooltip--wrap islands-tooltip">
            <div className="islands-tooltip-title">1 in 100,000 per hour of Nothing AFK</div>
            {trophy.owned ? (
              <div className="islands-tooltip-line">
                Found! Even at your current {formatHours(trophy.hoursRolled)} rolled hours only {formatChance(trophy.chanceByNow)} of
                accounts would have it, so you got lucky.
              </div>
            ) : (
              <div className="islands-tooltip-line">
                After {formatHours(trophy.hoursRolled)} rolled hours, {formatChance(trophy.chanceByNow)} of accounts would have found it.
                {trophy.chanceByNow < 0.5
                  ? ' Not having it yet is normal.'
                  : ` You're on the unlucky side: ${formatChance(1 - trophy.chanceByNow)} would still be waiting.`}
              </div>
            )}
            <div className="islands-tooltip-line islands-tooltip-line--off">
              Half of accounts have it by {formatHours(trophy.halfwayHours)} hours. Hours count from the 24 h bonus.
            </div>
          </div>
        </div>
        {next && (
          <div className="islands-stat tooltip-anchor">
            <span className="islands-stat-value">{formatHours(next.hoursLeft)} h</span>
            <span className="islands-stat-label">To the next bonus</span>
            <div className="tooltip tooltip--wrap islands-tooltip">
              ≈ {Math.ceil(next.hoursLeft / HOURS_PER_DAY).toLocaleString()} days if one character sits on Nothing all day. Time candy used here counts too.
            </div>
          </div>
        )}
      </div>

      <div className="islands-card">
        <h3 className="islands-card-title">
          Nothing AFK timeline
          <span className="islands-card-title-stat">{Math.min(100, Math.floor((hours / max) * 100))}% of {formatHours(max)} h</span>
        </h3>
        <div className="islands-fractal">
          {milestones.map(milestone => (
            <div
              key={milestone.hours}
              className={[
                'islands-fractal-row',
                milestone.reached ? 'islands-fractal-row--reached' : '',
                milestone === next ? 'islands-fractal-row--next' : '',
              ].join(' ')}
            >
              <span className="islands-fractal-hours">{formatHours(milestone.hours)} h</span>
              <div className="islands-fractal-main">
                <span className="islands-fractal-effect">{milestone.effect}</span>
                <progress
                  className="islands-fractal-bar"
                  max={1}
                  value={milestone.progress}
                />
              </div>
              <span className="islands-fractal-left">
                {milestone.reached
                  ? 'Unlocked'
                  : `${formatHours(milestone.hoursLeft)} h left (≈ ${Math.ceil(milestone.hoursLeft / HOURS_PER_DAY).toLocaleString()} d)`}
              </span>
            </div>
          ))}
        </div>
        <p className="islands-card-note">Bars fill from the previous bonus. Days assume one character AFKing on Nothing around the clock.</p>
      </div>
    </div>
  )
}
