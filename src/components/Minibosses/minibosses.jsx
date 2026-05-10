import { useMemo } from 'react'
import { MINIBOSSES, RANK_THRESHOLDS, getSkullIndex, rankColor, formatKills, characters } from '../../data'
import InfoPanel from '../InfoPanel/InfoPanel'
import './MiniBosses.css'

const BONE_JOE_KEY = 'BoneJoePickle'

function formatMultiplier(value) {
  if (value >= 1e15) return (value / 1e15).toFixed(2) + 'Q'
  if (value >= 1e12) return (value / 1e12).toFixed(2) + 'T'
  if (value >= 1e9)  return (value / 1e9).toFixed(2) + 'B'
  if (value >= 1e6)  return (value / 1e6).toFixed(2) + 'M'
  if (value >= 1e3)  return (value / 1e3).toFixed(2) + 'K'
  return value.toFixed(2)
}

function BoneJoePickleTracker({ snapshot }) {
  const { total, inventoryTotal, multiplier, breakdown } = useMemo(() => {
    const lines = []
    const storageQty = snapshot?.storage?.items?.[BONE_JOE_KEY] ?? 0
    if (storageQty > 0) lines.push({ label: 'Storage', qty: storageQty, inStorage: true })

    ;(snapshot?.characters ?? []).forEach((char, i) => {
      const qty = char?.inventory?.[BONE_JOE_KEY]?.qty ?? 0
      if (qty > 0) lines.push({ label: characters[i]?.name ?? `Character ${i + 1}`, qty, inStorage: false })
    })

    const total = lines.reduce((sum, l) => sum + l.qty, 0)
    const inventoryTotal = lines.filter(l => !l.inStorage).reduce((sum, l) => sum + l.qty, 0)
    const multiplier = Math.pow(1.10, inventoryTotal)

    return { total, inventoryTotal, multiplier, breakdown: lines }
  }, [snapshot])

  return (
    <div className="bjp-wrapper tooltip-anchor">
      <div className="bjp-tracker">
        <div className="bjp-row">
          <img src={`/images/items/${BONE_JOE_KEY}.png`} alt="Bone Joe Pickle" className="bjp-icon" />
          <span className="bjp-label">Bone Joe Pickles</span>
          <span className="bjp-count">{total.toLocaleString()}</span>
        </div>
        {inventoryTotal > 0 && (
          <div className="bjp-row bjp-row--divider">
            <img src="/images/spelunking/CaveElix10.png" alt="HP Multiplier" className="bjp-icon" />
            <span className="bjp-label">Miniboss HP Multi</span>
            <span className="bjp-multiplier">{formatMultiplier(multiplier)}</span>
          </div>
        )}
      </div>
      <div className="tooltip bjp-tooltip">
        {breakdown.map(({ label, qty, inStorage }) => {
          const charMultiplier = !inStorage ? Math.pow(1.10, qty) : null
          return (
            <div key={label} className="bjp-tooltip-row">
              <span className="bjp-tooltip-source">{label}</span>
              <span className="bjp-tooltip-qty">{qty.toLocaleString()}</span>
              {charMultiplier && (
                <span className="bjp-tooltip-multi">{formatMultiplier(charMultiplier)}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
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
          {formatKills(nextKills - kills)} to next
        </span>
      )}
    </div>
  )
}

function MinibossCard({ boss, kills }) {
  const skullIndex = getSkullIndex(kills ?? 0)
  const imagePath = `/images/mobs/${boss.displayName.replace(/ /g, '_')}.png`

  return (
    <div className="mb-card">
      <div className="mb-card-top">
        <img
          src={imagePath}
          alt={boss.displayName}
          className="mb-card-img"
          onError={e => { e.currentTarget.style.opacity = '0.3' }}
        />
        {skullIndex > 0 && (
          <img
            src={`/images/death note/StatusSkull${skullIndex - 1}.png`}
            alt={`Skull ${skullIndex}`}
            className="mb-card-skull"
          />
        )}
      </div>
      <div className="mb-card-body">
        <span className="mb-card-name">{boss.displayName}</span>
        <span className="mb-card-world" style={{ color: boss.worldColor }}>
          {boss.world}
        </span>
        <span className="mb-card-kills">{formatKills(kills ?? 0)} kills</span>
        <KillBar kills={kills ?? 0} />
        {boss.location && (
          <div className="mb-card-detail">
            <span className="mb-card-detail-label">📍</span>
            <span className="mb-card-detail-value">{boss.location}</span>
          </div>
        )}
        {boss.spawnItem && (
          <div className="mb-card-detail">
            <img
              src={`/images/items/${boss.spawnItem.imageKey}.png`}
              alt={boss.spawnItem.displayName}
              className="mb-card-spawn-icon"
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
            <span className="mb-card-detail-value">{boss.spawnItem.displayName}</span>
          </div>
        )}
      </div>
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
      <InfoPanel
        intro="Use this section to track your Death Note skull progress for each Miniboss. A few things to keep in mind:"
        items={[
          'Bone Joe Pickles are tracked across all characters and storage.',
          'Each Bone Joe Pickle in your inventory (not storage) multiplies Miniboss HP by 1.10x and adds one additional Death Note kill. For example, 23 pickles means 9x HP and 24 kills credited.',
          'This bonus only applies after unlocking Revenge of the Pickle in World 6 at the Jade Emporium.',
          'It is recommended to consolidate all pickles onto a single character, as long as you can still comfortably kill the boss.',
        ]}
      />
      <BoneJoePickleTracker snapshot={snapshot} />
      <div className="mb-card-grid">
        {MINIBOSSES.map((boss) => (
          <MinibossCard
            key={boss.rawName}
            boss={boss}
            kills={miniBossesKills[boss.index]}
          />
        ))}
      </div>
    </div>
  )
}