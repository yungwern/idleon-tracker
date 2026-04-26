import { shrineMap } from '../../data/shrineMap'
import './shrines.css'

function levelColor(level) {
  if (level >= 500) return '#e879f9'
  if (level >= 400) return '#67e8f9'
  if (level >= 300) return '#f43f5e'
  if (level >= 200) return '#fbbf24'
  if (level >= 100) return '#94a3b8'
  return '#cd7f32'
}

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
            <div
              key={id}
              className="shrine-preview-item"
              title={`${name}\n${Math.floor(xp).toLocaleString()} / ${xpRequired.toLocaleString()}`}
            >
              <div className="shrine-icon-wrap">
                <img
                  src={`/images/shrines/ConTowerB${id}.png`}
                  alt={name}
                  className="shrine-preview-icon"
                />
              </div>
              <span className="shrine-preview-level" style={{ color: levelColor(level) }}>
                Lv {level}
              </span>
              <div className="shrine-xp-bar-track">
                <div className="shrine-xp-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}