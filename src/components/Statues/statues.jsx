import { statueMap, statueWorlds } from '../../data'
import { mapEnemyData } from '../../data/mobsMap'
import { statueLevelColor } from '../../utils/appUtils.js'
import InfoPanel from '../InfoPanel/InfoPanel'

import './Statues.css'

// ── Map Bonus Helpers ─────────────────────────────────────────────
const lavaLog = (num) => Math.log(Math.max(num, 1)) / 2.30259
const lavaLog2 = (num) => Math.log(Math.max(num, 1)) / Math.log(2)

function getMapMulti(kills) {
  return (
    (2 * Math.max(0, lavaLog(kills) - 3.5) + Math.max(0, lavaLog2(kills) - 12)) *
    (lavaLog(kills) / 2.5) +
    (Math.min(2, kills / 1e3) + Math.max(5 * (lavaLog(kills) - 5), 0))
  )
}

// Convert mob display name to mobKey format (e.g. 'Bored Bean' → 'Bored_Bean')
function nameToMobKey(name) {
  return name.replace(/ /g, '_')
}

// Look up DR kills for a mob name from the snapshot's mapBonuses
function getDRKills(mobName, mapBonuses) {
  if (!mapBonuses) return null
  const mobKey = nameToMobKey(mobName)
  const entry = mapEnemyData.find(e => e.mobKey === mobKey)
  if (!entry) return null
  const bonus = mapBonuses[entry.mapIndex]
  if (!bonus) return 0
  return bonus.dr ?? 0
}

function formatMulti(value) {
  return (Math.floor(value * 1000) / 1000).toFixed(3) + 'x'
}

// ── Components ────────────────────────────────────────────────────

function DRBonus({ mobName, mapBonuses }) {
  const kills = getDRKills(mobName, mapBonuses)
  if (kills === null) return null
  const multi = 1 + getMapMulti(kills) / 100

  return (
    <div className="statue-dr-bonus">
      <img
        src="/images/masterclass/StatusArc0.png"
        alt="Drop Rate"
        className="statue-dr-icon"
      />
      <span className="statue-dr-value">{formatMulti(multi)}</span>
    </div>
  )
}

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

function MobCol({ mob, special = false, mapBonuses }) {
  return (
    <div className="statue-mob-col">
      {mob ? (
        <>
          <DRBonus mobName={mob.name} mapBonuses={mapBonuses} />
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

// ── Page ──────────────────────────────────────────────────────────

export default function Statues({ snapshot }) {
  const statues = snapshot?.statues
  const mapBonuses = snapshot?.mapBonuses

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
      <InfoPanel
      intro="This page shows the best mob to farm in each world for each statue type."
      items={[
        'The bonus shown above each mob is your current Arcane Cultist DR Map Bonus.',
        'World 3 mobs (except Dedotated Ram) are best farmed with Elemental Sorcerer or AFK.',
        'World 5 mobs from "The Hole" are not compatible with Arcane Cultist, so no bonus is displayed.',
        'World 7 does not yet have a clearly defined best mob, though Eamsy Earl has a solid layout if you can consistently kill crystal mobs.'
      ]}
      />
      <div className="statue-worlds">
        {statueWorlds.map(({ world, statueIds, mobs, individual, special }) => {
        const worldColor = `var(--world-${world.replace('World ', '')}-color)`

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
                <span className="statue-world-label" style={{ color: worldColor }}>{world}</span>
              </div>
              <div className="statue-mob-rows">
                {rows.map((row, i) => (
                  <div key={i} className="statue-mob-row">
                    <MobCol mob={row.mob} special={row.special} mapBonuses={mapBonuses} />
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