import { formatHoleNumber } from '../../utils/holeUtils'

// A monument's bonuses (Bravery / Justice / Wisdom) like the in-game list: LV and bonus. Capped bonuses also get a
// bar toward the cap with 50 / 75 / 90 / 95 / 99% breakpoints (same chips as Spelunking > Lore > Breakpoints).

export default function MonumentBonusList({ bonuses }) {
  return (
    <div className="hole-card">
      <h3 className="hole-card-title">Bonuses</h3>
      <div className="hole-monument-list">
        {bonuses.map(bonus => (
          <div
            key={bonus.index}
            className={`hole-monument-row${bonus.dim ? ' hole-list-item--dim' : ''}`}
          >
            <div className="hole-monument-head">
              <span className="hole-list-level">LV {formatHoleNumber(bonus.level)}</span>
              <span className="hole-list-text">{bonus.text}</span>
            </div>
            {bonus.cap != null && (
              <>
                <progress
                  className="hole-cap-bar"
                  value={Math.min(1, bonus.progress)}
                  max={1}
                />
                <div className="hole-cap-row">
                  <span className="hole-text--note">
                    {Math.floor(bonus.progress * 100)}% of cap ({bonus.capText})
                  </span>
                  <span className="milestone-row">
                    {bonus.milestones.map(milestone => (
                      <span
                        key={milestone.percent}
                        className={`milestone tooltip-anchor${milestone.reached ? ' milestone--reached' : ''}`}
                      >
                        {milestone.percent}
                        <span className="tooltip tooltip--right">
                          {milestone.percent}% of cap at LV {milestone.level.toLocaleString()}
                          {milestone.reached ? ' ✓' : ` (${(milestone.level - bonus.level).toLocaleString()} to go)`}
                        </span>
                      </span>
                    ))}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
