import { formatGamingNumber } from '../../utils/gamingUtils'

// Palette Luck sources, as a dropdown like Bit Multi Sources: the multipliers, then the luck bonuses that
// add together into one of them
export default function PaletteLuckPanel({ luck }) {
  const multipliers = luck.sources.filter(s => !s.parts)
  const added = luck.sources.find(s => s.parts)
  // Weekly-vote bonuses are listed (dimmed when not this week), never counted as missing
  const listed = multipliers.filter(s => s.multi > 1.0000001 || s.weekly)
  const missing = multipliers.filter(s => s.multi <= 1.0000001 && !s.weekly)

  return (
    <details className="dropdown-panel">
      <summary className="dropdown-panel-head">
        <span className="dropdown-panel-title">Palette Luck</span>
        <span className="dropdown-panel-stat">{formatGamingNumber(luck.value)}x total</span>
        {missing.length > 0 && (
          <span className="dropdown-panel-chips">
            <span className="gaming-pill gaming-pill--missing">{missing.length} missing</span>
          </span>
        )}
      </summary>
      <div className="dropdown-panel-body">
        <div className="gaming-source-table">
          {listed.map(s => (
            <div
              key={s.label}
              className={`gaming-source-row gaming-source-row--two${s.multi > 1.0000001 ? '' : ' gaming-source-row--off'}`}
            >
              <span className="gaming-source-name">
                {s.label}
                {s.weekly && <span className="gaming-source-note">Only on weeks it wins the vote</span>}
              </span>
              <span className="gaming-source-multi">{formatGamingNumber(s.multi)}x</span>
            </div>
          ))}
          {added && (
            <>
              <div className="gaming-source-row gaming-source-row--two">
                <span className="gaming-source-name">{added.label}</span>
                <span className="gaming-source-multi">{formatGamingNumber(added.multi)}x</span>
              </div>
              {added.parts.map(part => (
                <div
                  key={part.label}
                  className="gaming-source-row gaming-source-row--two gaming-source-row--sub"
                >
                  <span className="gaming-source-name">{part.label}</span>
                  <span className="gaming-source-system">+{formatGamingNumber(part.value)}%</span>
                </div>
              ))}
            </>
          )}
        </div>
        {missing.length > 0 && (
          <div className="gaming-missing">
            <span className="gaming-missing-label">Not unlocked yet</span>
            <div className="gaming-missing-chips">
              {missing.map(s => (
                <span
                  key={s.label}
                  className="gaming-missing-chip"
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        )}
        {luck.needsTomePoints && (
          <p className="gaming-text gaming-text--note">
            Leaves out the Tome lore bonus until you enter your Tome points in Home &gt; Settings.
          </p>
        )}
      </div>
    </details>
  )
}
