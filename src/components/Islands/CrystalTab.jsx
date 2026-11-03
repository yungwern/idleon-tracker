import { CRYSTAL_MAX_DAYS } from '../../data'
import { getCrystalMobs } from '../../utils/islandUtils'
import IslandOverview from './IslandOverview'

// Crystal Island: unclaimed days and how many Giant Crystal mobs they spawn

export default function CrystalTab({ snapshot, island, notices }) {
  const days = snapshot.islands.crystalDays
  const mobs = getCrystalMobs(days)
  const dayRows = Array.from({ length: CRYSTAL_MAX_DAYS }, (_, i) => i + 1)
  const best = Math.max(...dayRows.map(getCrystalMobs))

  return (
    <div className="islands-tab-body">
      <IslandOverview
        snapshot={snapshot}
        island={island}
        notices={notices}
      />

      <div className="islands-summary">
        <div className="islands-stat">
          <span className="islands-stat-value">{days} / {CRYSTAL_MAX_DAYS}</span>
          <span className="islands-stat-label">Unclaimed days</span>
        </div>
        <div className="islands-stat">
          <span className="islands-stat-value">{mobs}</span>
          <span className="islands-stat-label">Giant Crystals waiting</span>
        </div>
      </div>

      <div className="islands-card">
        <h3 className="islands-card-title">Mobs by unclaimed days</h3>
        <p className="islands-card-note">
          Each daily reset adds a day, up to {CRYSTAL_MAX_DAYS}. Visiting spawns the mobs and resets the count.
          At {CRYSTAL_MAX_DAYS} days the game switches formulas and spawns fewer, so visit by day {CRYSTAL_MAX_DAYS - 1}.
        </p>
        <div className="islands-crystal-days">
          {dayRows.map(day => {
            const count = getCrystalMobs(day)
            return (
              <div
                key={day}
                className={[
                  'islands-crystal-day',
                  day === days ? 'islands-crystal-day--current' : '',
                  count === best ? 'islands-crystal-day--best' : '',
                  day === CRYSTAL_MAX_DAYS ? 'islands-crystal-day--capped' : '',
                ].join(' ')}
              >
                <span className="islands-crystal-day-label">Day {day}</span>
                <span className="islands-crystal-day-mobs">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
