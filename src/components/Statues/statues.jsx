import { statueMap } from '../../data'
import { statueWorlds } from '../../data/statueWorlds'
import './Statues.css'
import { statueLevelColor } from '../../utils/appUtils.js'

function StatueItem({ id, level }) {
  const name = statueMap[id] ?? `Statue ${id}`
  return (
    <div className="statue-preview-item tooltip-anchor" style={{ position: 'relative' }}>
      <div className="tooltip">{name}</div>
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

function MobCol({ mob, special = false }) {
  return (
    <div className="statue-mob-col">
      {mob ? (
        <>
          <img
            src={mob.image}
            alt={mob.name}
            className={`statue-mob-img${special ? ' statue-mob-img--special' : ''}`}
          />
          <span className="statue-mob-name">{mob.name}</span>
        </>
      ) : (
        <span className="statue-mob-name">—</span>
      )}
    </div>
  )
}

function isCrystal(mob) {
  return mob.name.toLowerCase().includes('crystal')
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
        {statueWorlds.map(({ world, color, statueIds, mobs, individual, special }) => {

          const rows = []

          // World-wide shared statues: one row using the world's best mob
          if (statueIds?.length > 0) {
            const bestMob = mobs?.find(m => !isCrystal(m)) ?? null
            rows.push({ mob: bestMob, ids: statueIds, special: false })
          }

          // Per-statue entries grouped by their best mob
          if (individual?.length > 0) {
            const grouped = {}
            for (const { statueId, mobs: indMobs } of individual) {
              const bestMob = indMobs?.find(m => !isCrystal(m)) ?? null
              const key = bestMob?.name ?? '__none__'
              if (!grouped[key]) grouped[key] = { mob: bestMob, ids: [], special: false }
              grouped[key].ids.push(statueId)
            }
            rows.push(...Object.values(grouped))
          }

          // Special entries — flagged so MobCol uses the smaller image size
          if (special?.length > 0) {
            for (const { statueId, image, name, note } of special) {
              rows.push({
                mob: { image, name: note ?? name },
                ids: [statueId],
                special: true,
              })
            }
          }

          return (
            <div key={world} className="statue-world-card">

              <div className="statue-world-header">
                <span className="statue-world-label" style={{ color }}>{world}</span>
              </div>

              <div className="statue-mob-rows">
                {rows.map((row, i) => (
                  <div key={i} className="statue-mob-row">
                    <MobCol mob={row.mob} special={row.special} />
                    <div className="statue-items-col">
                      {row.ids.map(id => {
                        const s = statueById[id]
                        return s ? <StatueItem key={id} id={id} level={s.level} /> : null
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}