import { useState } from 'react'
import { MINIBOSSES, RANK_THRESHOLDS, getSkullIndex, rankColor, formatKills } from '../../data'
import './MiniBosses.css'

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