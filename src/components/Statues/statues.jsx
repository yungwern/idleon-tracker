import { statueMap } from '../../data/statueMap'
import './statues.css'

function levelColor(level) {
  if (level >= 500) return '#e879f9'
  if (level >= 400) return '#67e8f9'
  if (level >= 300) return '#f43f5e'
  if (level >= 200) return '#fbbf24'
  if (level >= 100) return '#94a3b8'
  return '#cd7f32'
}

export default function Statues({ snapshot }) {
  const statues = snapshot?.statues

  if (!statues || statues.length === 0) {
    return (
      <div className="page">
        <h2 className="page-title">Statues</h2>
        <p className="page-empty">No statue data — import a save to see your statues.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h2 className="page-title">Statues</h2>
      <div className="section-card">
        <div className="statue-preview-grid">
          {statues.map(({ id, level }) => {
          const name = statueMap[id] ?? `Statue ${id}`
          return (
            <div key={id} className="statue-preview-item" title={name}>
              <div className="statue-icon-wrap">
                <img
                  src={`/images/statues/StatueZ${id + 1}.png`}
                  alt={name}
                  className="statue-preview-icon"
                />
              </div>
              <span className="statue-preview-level" style={{ color: levelColor(level) }}>
                Lv {level}
              </span>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}