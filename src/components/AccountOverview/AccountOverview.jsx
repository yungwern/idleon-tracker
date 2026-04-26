import { useState } from 'react'
import { statueMap } from '../../data/statueMap'
import './AccountOverview.css'

function levelColor(level) {
  if (level >= 500) return '#e879f9' // Amethyst
  if (level >= 400) return '#67e8f9' // Sapphire
  if (level >= 300) return '#f43f5e' // Ruby
  if (level >= 200) return '#fbbf24' // Gold
  if (level >= 100) return '#94a3b8' // Silver
  return '#cd7f32'                   // Bronze
}

function StatuePreview({ statues }) {
  const [isOpen, setIsOpen] = useState(true)

  if (!statues || statues.length === 0) {
    return (
      <section className="overview-section">
        <h3 className="overview-section-title">Statues</h3>
        <p className="overview-empty">No statue data — import a save to see your statues.</p>
      </section>
    )
  }

  return (
    <section className={`overview-section ${isOpen ? '' : 'overview-section--collapsed'}`}>
      <div
        className="overview-section-header collapsible"
        onClick={() => setIsOpen(o => !o)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <h3 className="overview-section-title">Statues</h3>
        <span className="collapse-chevron">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
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
      )}
    </section>
  )
}

export default function AccountOverview({ snapshot }) {
  return (
    <div className="account-overview">
      <h2 className="account-overview-title">Account Overview</h2>
      <StatuePreview statues={snapshot?.statues} />
    </div>
  )
}