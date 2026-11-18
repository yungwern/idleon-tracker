import { formatGamingNumber } from '../../utils/gamingUtils'

// Bit Multi Sources: owned multipliers as a table, the missing ones as one compact wrap of chips so a newer
// account's long missing list stays short
export default function BitMultiPanel({ bitMulti }) {
  // Weekly-vote bonuses stay in the table (dimmed when not this week) and never count as missing
  const listed = bitMulti.sources.filter(s => s.owned || s.weekly)
  const owned = bitMulti.sources.filter(s => s.owned)
  const missing = bitMulti.sources.filter(s => !s.owned && !s.weekly)

  return (
    <details className="dropdown-panel">
      <summary className="dropdown-panel-head">
        <span className="dropdown-panel-title">Bit Multi Sources</span>
        <span className="dropdown-panel-stat">{formatGamingNumber(bitMulti.total)}x total</span>
        <span className="dropdown-panel-chips">
          <span className="gaming-pill gaming-pill--good">{owned.length} active</span>
          {missing.length > 0 && <span className="gaming-pill gaming-pill--missing">{missing.length} missing</span>}
        </span>
      </summary>
      <div className="dropdown-panel-body">
        <div className="gaming-source-table">
          {listed.map(s => (
            <div
              key={s.id}
              className={`gaming-source-row${s.owned ? '' : ' gaming-source-row--off'}`}
            >
              <span className="gaming-source-name">
                {s.label}
                {s.note && <span className="gaming-source-note">{s.note}</span>}
              </span>
              <span className="gaming-source-system">{s.system}</span>
              <span className="gaming-source-multi">{formatGamingNumber(s.multi)}x</span>
            </div>
          ))}
        </div>
        {missing.length > 0 && (
          <div className="gaming-missing">
            <span className="gaming-missing-label">Not unlocked yet</span>
            <div className="gaming-missing-chips">
              {missing.map(s => (
                <span
                  key={s.id}
                  className="gaming-missing-chip tooltip-anchor"
                >
                  {s.label}
                  <span className="tooltip tooltip--wrap">{s.system}{s.hint ? `: ${s.hint}` : ''}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  )
}
