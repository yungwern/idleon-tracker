import { getBitSpending } from '../../utils/gamingBonusUtils'
import { formatBits, getBitsImage } from '../../utils/gamingUtils'

// Things outside the Gaming garden that are paid for in bits
export default function BitSpendingPanel({ snapshot }) {
  const rows = getBitSpending(snapshot)
  const affordable = rows.filter(row => !row.locked && !row.maxed && row.cost <= row.have).length

  return (
    <details className="dropdown-panel">
      <summary className="dropdown-panel-head">
        <span className="dropdown-panel-title">Spend Bits Elsewhere</span>
        <span className="dropdown-panel-stat">Upgrades outside Gaming that cost bits</span>
        {affordable > 0 && (
          <span className="dropdown-panel-chips">
            <span className="gaming-pill gaming-pill--good">{affordable} affordable</span>
          </span>
        )}
      </summary>
      <div className="dropdown-panel-body gaming-spend-list">
        {rows.map(row => (
          <div
            key={row.id}
            className={`gaming-spend-row${row.locked ? ' gaming-spend-row--locked' : ''}`}
          >
            <img
              className="gaming-spend-img"
              src={row.image}
              alt=""
            />
            <div className="gaming-spend-main">
              <span className="gaming-spend-name">
                {row.name}
                <span className="gaming-spend-system">{row.system}</span>
              </span>
              <span className="gaming-spend-text">
                {row.locked ? 'Not unlocked yet' : row.text}
              </span>
            </div>
            <span className="gaming-spend-level">
              LV {row.level.toLocaleString('en-US')}
              {row.maxLevel && ` / ${row.maxLevel}`}
            </span>
            <span className="gaming-spend-cost">
              {row.locked ? (
                <span className="gaming-muted">—</span>
              ) : row.maxed ? (
                <span className="gaming-good">MAX</span>
              ) : (
                <span className={row.cost <= row.have ? 'gaming-good' : 'gaming-short'}>
                  {formatBits(row.cost)}
                  <img
                    className="gaming-bits-icon"
                    src={getBitsImage(row.cost)}
                    alt="bits"
                  />
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </details>
  )
}
