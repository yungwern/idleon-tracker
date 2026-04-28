import { statueMap } from '../../data'
import { statueWorlds } from '../../data/statueWorlds'
import './Statues.css'
import { statueLevelColor } from '../../utils/appUtils.js'

function MobChip({ mob }) {
  return (
    <div className="statue-mob-chip" title={mob.name}>
      <img src={mob.image} alt={mob.name} className="statue-mob-icon" />
      <span className="statue-mob-name">{mob.name}</span>
    </div>
  )
}

function StatueItem({ id, level }) {
  const name = statueMap[id] ?? `Statue ${id}`
  return (
    <div className="statue-preview-item" title={name}>
      <div className="statue-icon-wrap">
        <img
          src={`/images/statues/StatueZ${id + 1}.png`}
          alt={name}
          className="statue-preview-icon"
        />
      </div>
      <span className="statue-preview-level" style={{ color: statueLevelColor(level) }}>
        Lv {level}
      </span>
    </div>
  )
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

  const statueById = Object.fromEntries(statues.map(s => [s.id, s]))

  return (
    <div className="page">
      <h2 className="page-title">Statues</h2>
      <div className="statue-worlds">
        {statueWorlds.map(({ world, color, statueIds, mobs, individual, special }) => (
          <div key={world} className="section-card statue-world-card">

            <div className="statue-world-header">
              <span className="statue-world-label" style={{ color }}>{world}</span>
              {mobs.length > 0 && (
                <div className="statue-mob-list">
                  {mobs.map(mob => <MobChip key={mob.name} mob={mob} />)}
                </div>
              )}
            </div>

            {statueIds.length > 0 && (
              <div className="statue-preview-grid">
                {statueIds.map(id => {
                  const s = statueById[id]
                  return s ? <StatueItem key={id} id={id} level={s.level} /> : null
                })}
              </div>
            )}

            {individual?.map(({ statueId, mobs: indMobs }) => {
              const s = statueById[statueId]
              if (!s) return null
              return (
                <div key={statueId} className="statue-individual-row">
                  <StatueItem id={statueId} level={s.level} />
                  <div className="statue-mob-list">
                    {indMobs.map(mob => <MobChip key={mob.name} mob={mob} />)}
                  </div>
                </div>
              )
            })}

            {special?.map(({ statueId, image, name, note }) => {
              const s = statueById[statueId]
              if (!s) return null
              return (
                <div key={statueId} className="statue-individual-row">
                  <StatueItem id={statueId} level={s.level} />
                  <div className="statue-mob-chip" title={note}>
                    <img src={image} alt={name} className="statue-mob-icon" />
                    <span className="statue-mob-name">{note}</span>
                  </div>
                </div>
              )
            })}

          </div>
        ))}
      </div>
    </div>
  )
}