import { getResetTiles, formatCountdown, formatResetDate } from '../../utils/resetUtils'

// Row of reset countdowns (utils/resetUtils.js): Daily, Weekly, Server weekly, all the same size.
// The tooltip gives the exact time and, for Server weekly, what it resets.
export default function ResetTimers({ snapshot, now }) {
  const tiles = getResetTiles(snapshot, now)
  return (
    <div className="home-resets">
      {tiles.map(tile => {
        const missing = tile.time == null
        return (
          <div
            key={tile.id}
            className={`home-reset tooltip-anchor${missing ? ' home-reset--missing' : ''}`}
          >
            <img
              className="home-reset-icon"
              src={tile.icon}
              alt=""
            />
            <div className="home-reset-body">
              <span className="home-reset-label">{tile.label}</span>
              <span className="home-reset-time">
                {missing ? (snapshot ? 'Re-import save' : 'Needs a save') : formatCountdown(tile.time - now)}
              </span>
            </div>
            <span className="tooltip tooltip--wrap">
              {missing
                ? (snapshot
                  ? 'This save has no reset data yet. Re-import it to see this timer.'
                  : 'Import a save to see your account\'s own reset.')
                : (
                  <>
                    <span className="home-reset-tip-date">{tile.label} reset: {formatResetDate(tile.time)}</span>
                    {tile.covers.length > 0 && (
                      <span className="home-reset-tip-list">
                        {tile.covers.map(label => <span key={label}>{label}</span>)}
                      </span>
                    )}
                  </>
                )}
            </span>
          </div>
        )
      })}
    </div>
  )
}
