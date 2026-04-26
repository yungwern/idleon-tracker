import { useState } from 'react'
import './minibosses.css'

// Ordered by world, with original index preserved for kill count lookup
const MINIBOSSES = [
  {
    rawName: 'slimeB',    displayName: 'Glunko The Massive',  world: 'World 1', worldColor: '#86efac', index: 0,
    location: 'Slime', spawnItem: null,
  },
  {
    rawName: 'babayaga',  displayName: 'Baba Yaga',           world: 'World 1', worldColor: '#86efac', index: 2,
    location: 'Red Mushroom', spawnItem: null,
  },
  {
    rawName: 'poopBig',   displayName: 'Dr Defecaus',         world: 'World 2', worldColor: '#fcd34d', index: 1,
    location: 'Poop', spawnItem: null,
  },
  {
    rawName: 'babaHour',  displayName: 'Biggie Hours',        world: 'World 2', worldColor: '#fcd34d', index: 3,
    location: 'Mimic', spawnItem: { displayName: 'Googley Eyes', imageKey: 'Quest35' },
  },
  {
    rawName: 'babaMummy', displayName: 'King Doot',           world: 'World 2', worldColor: '#fcd34d', index: 4,
    location: 'Sand Giant', spawnItem: { displayName: 'Dootjat Eye', imageKey: 'Quest36' },
  },
  {
    rawName: 'mini3a',    displayName: 'Dilapidated Slush',   world: 'World 3', worldColor: '#93c5fd', index: 5,
    location: 'Bloque', spawnItem: { displayName: 'Bucket of Slush', imageKey: 'Quest68' },
  },
  {
    rawName: 'mini4a',    displayName: 'Mutated Mush',        world: 'World 4', worldColor: '#fb923c', index: 6,
    location: 'Purp Mushroom', spawnItem: { displayName: 'Toxic Sludge', imageKey: 'OilBarrel2' },
  },
  {
    rawName: 'mini5a',    displayName: 'Domeo Magmus',        world: 'World 5', worldColor: '#fca5a5', index: 7,
    location: 'Mister Brightside', spawnItem: null,
  },
  {
    rawName: 'mini6a',    displayName: 'Demented Spiritlord', world: 'World 6', worldColor: '#c4b5fd', index: 8,
    location: 'Mama Troll', spawnItem: null,
  },
]

const RANK_THRESHOLDS = [
  { kills: 100     },
  { kills: 250     },
  { kills: 1000    },
  { kills: 5000    },
  { kills: 25000   },
  { kills: 100000  },
  { kills: 1000000 },
]

function getSkullIndex(kills) {
  if (kills < 100)    return 0
  if (kills < 250)    return 1
  if (kills < 1000)   return 2
  if (kills < 5000)   return 3
  if (kills < 25000)  return 4
  if (kills < 100000) return 5
  return 6
}

function rankColor(skullIndex) {
  switch (skullIndex) {
    case 0:  return '#6b7280'
    case 1:  return '#cd7f32'
    case 2:  return '#94a3b8'
    case 3:  return '#fbbf24'
    case 4:  return '#34d399'
    case 5:  return '#60a5fa'
    case 6:  return '#f43f5e'
    default: return '#6b7280'
  }
}

function formatKills(kills) {
  if (kills == null || kills === 0) return '0'
  if (kills >= 1_000_000) return `${(kills / 1_000_000).toFixed(1)}M`
  if (kills >= 1_000) return `${(kills / 1_000).toFixed(1)}K`
  return kills.toLocaleString()
}

function KillBar({ kills }) {
  const skullIndex = getSkullIndex(kills)
  const nextThreshold = RANK_THRESHOLDS.find(t => kills < t.kills)
  const prevThreshold = [...RANK_THRESHOLDS].reverse().find(t => kills >= t.kills)

  const prevKills = prevThreshold ? prevThreshold.kills : 0
  const nextKills = nextThreshold ? nextThreshold.kills : null
  const progress = nextKills
    ? Math.min(((kills - prevKills) / (nextKills - prevKills)) * 100, 100)
    : 100

  const color = rankColor(skullIndex)

  return (
    <div className="mb-killbar-wrap">
      <div className="mb-killbar-track">
        <div
          className="mb-killbar-fill"
          style={{ width: `${progress}%`, background: color }}
        />
      </div>
      {nextThreshold && (
        <span className="mb-killbar-next">
          {formatKills(nextKills - kills)} to next skull
        </span>
      )}
    </div>
  )
}

function MinibossRow({ boss, kills }) {
  const [expanded, setExpanded] = useState(false)
  const skullIndex = getSkullIndex(kills ?? 0)
  const imagePath = `/images/mobs/${boss.displayName.replace(/ /g, '_')}.png`

  return (
    <div className={`mb-row-wrap ${expanded ? 'mb-row-wrap--open' : ''}`}>
      <div className="mb-row" onClick={() => setExpanded(e => !e)}>
        <div className="mb-icon-wrap">
          <img
            src={imagePath}
            alt={boss.displayName}
            className="mb-icon"
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>

        <div className="mb-info">
          <div className="mb-name-row">
            <span className="mb-name">{boss.displayName}</span>
            <span className="mb-world-tag" style={{ color: boss.worldColor }}>
              {boss.world}
            </span>
          </div>
          <KillBar kills={kills ?? 0} />
        </div>

        <div className="mb-right">
          <span className="mb-kills">{formatKills(kills ?? 0)}</span>
          {skullIndex > 0 ? (
            <img
              src={`/images/death note/StatusSkull${skullIndex}.png`}
              alt={`Skull ${skullIndex}`}
              className="mb-skull-icon"
            />
          ) : (
            <div className="mb-skull-empty" />
          )}
        </div>

        <span className="mb-chevron">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="mb-details">
          <div className="mb-detail-item">
            <span className="mb-detail-label">📍 Location</span>
            <div className="mb-detail-value">
              <img
                src={`/images/mobs/${boss.location.replace(/ /g, '_')}.png`}
                alt={boss.location}
                className="mb-detail-mob-icon"
                onError={e => { e.target.style.display = 'none' }}
              />
              <span>{boss.location}</span>
            </div>
          </div>

          <div className="mb-detail-divider" />

          <div className="mb-detail-item">
            <span className="mb-detail-label">🔮 Spawn Item</span>
            {boss.spawnItem ? (
              <div className="mb-detail-value">
                <img
                  src={`/images/items/${boss.spawnItem.imageKey}.png`}
                  alt={boss.spawnItem.displayName}
                  className="mb-detail-mob-icon"
                  onError={e => { e.target.style.display = 'none' }}
                />
                <span>{boss.spawnItem.displayName}</span>
              </div>
            ) : (
              <span className="mb-detail-none">No item required</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Minibosses({ snapshot }) {
  const miniBossesKills = snapshot?.miniBossesKills

  if (!miniBossesKills) {
    return (
      <div className="page">
        <h2 className="page-title">Minibosses</h2>
        <p className="page-empty">No miniboss data — import a save to see your kills.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h2 className="page-title">Minibosses</h2>
      <div className="section-card mb-card">
        <div className="mb-list">
          {MINIBOSSES.map((boss) => (
            <MinibossRow
              key={boss.rawName}
              boss={boss}
              kills={miniBossesKills[boss.index]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}