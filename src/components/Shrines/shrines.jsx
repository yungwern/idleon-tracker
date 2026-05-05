import { shrineMap } from '../../data'
import './Shrines.css'
import { shrineLevelColor } from '../../utils/appUtils'

export default function Shrines({ snapshot }) {
  const shrines = snapshot?.shrines

  if (!shrines || shrines.length === 0) {
    return (
      <div className="page">
        <h2 className="page-title">Shrines</h2>
        <p className="page-empty">No shrine data — import a save to see your shrines.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h2 className="page-title">Shrines</h2>
      <div className="section-card">
        <div className="shrine-preview-grid">
          {shrines.map(({ id, level, xp, xpRequired }) => {
          const name = shrineMap[id] ?? `Shrine ${id}`
          const pct = xpRequired > 0 ? Math.min((xp / xpRequired) * 100, 100) : 0
          return (
            <div key={id} className="shrine-preview-item tooltip-anchor">
              <div className="shrine-icon-wrap">
                <img
                  src={`/images/shrines/ConTowerB${id}.png`}
                  alt={name}
                  className="shrine-preview-icon"
                />
              </div>
              <span className="shrine-preview-level" style={{ color: shrineLevelColor(level) }}>
                Lv {level}
              </span>
              <div className="shrine-xp-bar-track">
                <div className="shrine-xp-bar-fill" style={{ width: `${pct}%`, background: shrineLevelColor(level) }} />
              </div>
              <span className="tooltip shrine-tooltip">
                <span className="shrine-tooltip-name">{name}</span>
                <span className="shrine-tooltip-xp">{Math.floor(xp).toLocaleString()} / {xpRequired.toLocaleString()} ({pct.toFixed(1)}%)</span>
              </span>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}