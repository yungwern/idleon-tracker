import { statueMap, statueWorlds, statueCandyMobs } from '../../data'
import { mapEnemyData } from '../../data/mobsMap'
import { statueLevelColor } from '../../utils/appUtils.js'
import { getCappedMapMulti, getMapBonusCap } from '../../utils/mapBonusUtils.js'
import InfoPanel from '../InfoPanel/InfoPanel'

import './statues.css'

// ── Map Bonus Helpers ─────────────────────────────────────────────
// Convert mob display name to mobKey format (e.g. 'Bored Bean' → 'Bored_Bean')
function nameToMobKey(name) {
  return name.replace(/ /g, '_')
}

// Arcane Cultist map bonus types: key in snapshot.mapBonuses + icon (StatusArc{index})
const MAP_BONUS_TYPES = {
  dr: { label: 'Drop Rate', icon: 'images/masterclass/arcane cultist/StatusArc0.png' },
  afk: { label: 'AFK Gains', icon: 'images/masterclass/arcane cultist/StatusArc2.png' },
}

// Look up kills for one map bonus type (dr / exp / afk) for a mob name
function getMapBonusKills(mobName, mapBonuses, type) {
  if (!mapBonuses) return null
  const mobKey = nameToMobKey(mobName)
  const entry = mapEnemyData.find(e => e.mobKey === mobKey)
  if (!entry) return null
  const bonus = mapBonuses[entry.mapIndex]
  if (!bonus) return 0
  return bonus[type] ?? 0
}

function formatMulti(value) {
  return (Math.floor(value * 1000) / 1000).toFixed(3) + 'x'
}

// ── Components ────────────────────────────────────────────────────

function MapBonus({ mobName, mapBonuses, mapBonusCap, type }) {
  const kills = getMapBonusKills(mobName, mapBonuses, type)
  if (kills === null) return null
  const multi = 1 + getCappedMapMulti(kills, mapBonusCap) / 100
  const { label, icon } = MAP_BONUS_TYPES[type]

  return (
    <div className="statue-dr-bonus">
      <img
        src={icon}
        alt={label}
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
          src={`images/statues/EquipmentStatues${id + 1}.png`}
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

function ExtraItem({ name, image }) {
  return (
    <div className="statue-preview-item tooltip-anchor" style={{ position: 'relative' }}>
      <div className="tooltip">{name}</div>
      <div className="statue-icon-wrap">
        <img
          src={image}
          alt={name}
          className="statue-preview-icon"
        />
      </div>
      <span className="statue-preview-level">&nbsp;</span>
    </div>
  )
}

function MobCol({ mob, special = false, mapBonuses, mapBonusCap, bonusType = 'dr' }) {
  return (
    <div className="statue-mob-col">
      {mob ? (
        <>
          <MapBonus mobName={mob.name} mapBonuses={mapBonuses} mapBonusCap={mapBonusCap} type={bonusType} />
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

function StatueRow({ row, statueById, mapBonuses, mapBonusCap }) {
  return (
    <div className="statue-mob-row">
      <MobCol
        mob={row.mob}
        special={row.special}
        mapBonuses={mapBonuses}
        mapBonusCap={mapBonusCap}
        bonusType={row.bonusType ?? (row.afk ? 'afk' : 'dr')}
      />
      <div className="statue-items-col">
        {row.ids.map(id => {
          const s = statueById[id]
          return s ? <StatueItem key={id} id={id} level={s.level} /> : null
        })}
        {row.extras?.map(extra => (
          <ExtraItem key={extra.name} name={extra.name} image={extra.image} />
        ))}
        {row.afk && (
          <span className="statue-afk-tag tooltip-anchor">
            AFK
            <span className="tooltip">Best farmed while AFK instead of active</span>
          </span>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────

export default function Statues({ snapshot }) {
  const statues = snapshot?.statues
  const mapBonuses = snapshot?.mapBonuses
  const mapBonusCap = snapshot?.mapBonusCap

  if (!statues || statues.length === 0) {
    return (
      <div className="page">
        <h2 className="page-title">Statues</h2>
        <p className="page-empty">No statue data — import a save to see your statues.</p>
      </div>
    )
  }

  const statueById = Object.fromEntries(statues.map(s => [s.id, s]))
  const capNote = mapBonusCap
    ? [`Map bonuses are capped at ${(1 + getMapBonusCap(mapBonusCap) / 100).toFixed(3)}x (Overwhelming Energy Lv ${mapBonusCap.overwhelmingEnergy}, Beyond All Limits Lv ${mapBonusCap.beyondAllLimits}). Added talent levels aren't counted, so the in-game cap may be slightly higher.`]
    : []

  return (
    <div className="page">
      <h2 className="page-title">Statues</h2>
      <InfoPanel
      intro="This page shows the best mob to farm in each world for each statue type."
      items={[
        'The bonus shown above each mob is your current Arcane Cultist DR Map Bonus. The time candy section shows the AFK Map Bonus instead.',
        'World 5 mobs from "The Hole" are not compatible with Arcane Cultist, so no bonus is displayed.',
        'The Time Candy section shows the best mob to be at when popping Time Candy for each statue. It\'s best to be on a DB with an AFK Fighting setup. Remember to craft lower tier time candies into 12 hour candies for optimal candy usage.',
        'Rows tagged AFK are best farmed while AFK instead of active, so they show the AFK Map Bonus instead of DR.',
        'Any statue that is best farmed active should be done on a DK/RG with high drop rate. This even includes the World 3 statues that were previously best farmed with an ES.',
        ...capNote,
      ]}
      />
      <div className="statue-worlds">
        {statueWorlds.map(({ world, statueIds, extras, afk, mobs, individual, special }) => {
        const worldColor = `var(--world-${world.replace('World ', '')}-color)`

          const rows = []

          // World-wide shared statues: one row using the world's best mob
          if (statueIds?.length > 0) {
            const bestMob = mobs?.[0] ?? null
            rows.push({ mob: bestMob, ids: statueIds, extras, afk, special: false })
          }

          // Per-statue entries grouped by their best mob
          if (individual?.length > 0) {
            const grouped = {}
            for (const { statueId, afk: indAfk, mobs: indMobs } of individual) {
              const bestMob = indMobs?.[0] ?? null
              const key = bestMob?.name ?? '__none__'
              if (!grouped[key]) grouped[key] = { mob: bestMob, ids: [], special: false }
              grouped[key].ids.push(statueId)
              if (indAfk) grouped[key].afk = true
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
                  <StatueRow key={i} row={row} statueById={statueById} mapBonuses={mapBonuses} mapBonusCap={mapBonusCap} />
                ))}
              </div>
            </div>
          )
        })}
        <div className="statue-world-card">
          <div className="statue-world-header">
            <span className="statue-world-label statue-candy-label">Time Candy</span>
          </div>
          <div className="statue-mob-rows">
            {statueCandyMobs.map(({ mob, statueIds }) => (
              <StatueRow
                key={mob.name}
                row={{ mob, ids: statueIds, bonusType: 'afk' }}
                statueById={statueById}
                mapBonuses={mapBonuses}
                mapBonusCap={mapBonusCap}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}