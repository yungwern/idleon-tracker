import { useMemo } from 'react'
import {
  MINIBOSSES,
  RANK_THRESHOLDS,
  getSkullIndex,
  rankColor,
  formatKills,
  getAvailableKills,
  getDaysForKills,
  getOptimalKills,
} from '../../data'
import InfoPanel from '../InfoPanel/InfoPanel'
import './minibosses.css'

const BONE_JOE_KEY = 'BoneJoePickle'

function formatMultiplier(value) {
  if (value >= 1e18) return value.toExponential(2)
  if (value >= 1e15) return (value / 1e15).toFixed(2) + 'Q'
  if (value >= 1e12) return (value / 1e12).toFixed(2) + 'T'
  if (value >= 1e9)  return (value / 1e9).toFixed(2) + 'B'
  if (value >= 1e6)  return (value / 1e6).toFixed(2) + 'M'
  if (value >= 1e3)  return (value / 1e3).toFixed(2) + 'K'
  return value.toFixed(2)
}

function countPickles(snapshot) {
  const lines = []
  const storageQty = snapshot?.storage?.items?.[BONE_JOE_KEY] ?? 0
  if (storageQty > 0) lines.push({ label: 'Storage', qty: storageQty, inStorage: true })

  ;(snapshot?.characters ?? []).forEach((char, i) => {
    const qty = char?.inventory?.[BONE_JOE_KEY]?.qty ?? 0
    if (qty > 0) lines.push({ label: char?.name ?? `Character ${i + 1}`, qty, inStorage: false })
  })

  const total = lines.reduce((sum, l) => sum + l.qty, 0)
  const inventoryTotal = lines.filter(l => !l.inStorage).reduce((sum, l) => sum + l.qty, 0)

  return {
    total,
    inventoryTotal,
    multiplier: Math.pow(1.10, inventoryTotal),
    breakdown: lines,
  }
}

function BoneJoePickleTracker({ pickles }) {
  const { total, inventoryTotal, multiplier, breakdown } = pickles

  return (
    <div className="bjp-wrapper tooltip-anchor">
      <div className="bjp-tracker">
        <div className="bjp-row">
          <img src={`images/items/${BONE_JOE_KEY}.png`} alt="Bone Joe Pickle" className="bjp-icon" />
          <span className="bjp-label">Bone Joe Pickles</span>
          <span className="bjp-count">{total.toLocaleString()}</span>
        </div>
        {inventoryTotal > 0 && (
          <div className="bjp-row bjp-row--divider">
            <img src="images/spelunking/CaveElix10.png" alt="HP Multiplier" className="bjp-icon" />
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

function KillBar({ kills, killsPerKill }) {
  const skullIndex = getSkullIndex(kills)
  const nextThreshold = RANK_THRESHOLDS.find(t => kills < t.kills)
  const prevThreshold = [...RANK_THRESHOLDS].reverse().find(t => kills >= t.kills)

  const prevKills = prevThreshold ? prevThreshold.kills : 0
  const nextKills = nextThreshold ? nextThreshold.kills : null
  const progress = nextKills
    ? Math.min(((kills - prevKills) / (nextKills - prevKills)) * 100, 100)
    : 100

  const remaining = nextKills ? nextKills - kills : 0
  const actualKills = Math.ceil(remaining / killsPerKill)
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
          {formatKills(remaining)} to next
        </span>
      )}
      {nextThreshold && killsPerKill > 1 && (
        <span className="mb-killbar-actual">
          ≈ {formatKills(actualKills)} kills w/ pickles
        </span>
      )}
    </div>
  )
}

function bossImage(boss) {
  return `images/mobs/${boss.displayName.replace(/ /g, '_')}.png`
}

function SpawnChip({ boss, days }) {
  const timer = boss.spawnTimer
  const available = getAvailableKills(timer, days)
  const optimal = getOptimalKills(timer)
  const optimalDay = getDaysForKills(timer, optimal)

  let status
  let statusClass
  if (available >= timer.max) {
    status = 'Max'
    statusClass = 'mb-spawn-status--maxed'
  } else if (available >= optimal) {
    status = 'Kill'
    statusClass = 'mb-spawn-status--ready'
  } else {
    status = `${optimalDay - days}d`
    statusClass = 'mb-spawn-status--waiting'
  }

  return (
    <div className="mb-spawn-chip tooltip-anchor">
      <img
        src={bossImage(boss)}
        alt={boss.displayName}
        className="mb-spawn-img"
      />
      <span className="mb-spawn-count">{available}/{timer.max}</span>
      <span className={`mb-spawn-status ${statusClass}`}>{status}</span>
      <div className="tooltip mb-spawn-tooltip">
        <strong>{boss.displayName}</strong>
        <br />
        {days} days since last spawn. Best rate is spawning at {optimal} stacked (day {optimalDay}).
      </div>
    </div>
  )
}

function SpawnBar({ spawnDays }) {
  if (!spawnDays) {
    return (
      <div className="mb-spawn-bar">
        <span className="mb-spawn-bar-label">Spawns — re-import your save to see stacked spawns</span>
      </div>
    )
  }

  const spawnable = MINIBOSSES.filter(boss => boss.spawnTimer && spawnDays[boss.rawName] != null)

  return (
    <div className="mb-spawn-bar">
      <span className="mb-spawn-bar-label">Spawns</span>
      {spawnable.map(boss => (
        <SpawnChip
          key={boss.rawName}
          boss={boss}
          days={spawnDays[boss.rawName]}
        />
      ))}
    </div>
  )
}

function MinibossCard({ boss, kills, killsPerKill }) {
  const skullIndex = getSkullIndex(kills ?? 0)
  const imagePath = bossImage(boss)

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
            src={`images/death note/StatusSkull${skullIndex - 1}.png`}
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
        <KillBar kills={kills ?? 0} killsPerKill={killsPerKill} />
        {boss.location && (
          <div className="mb-card-detail">
            <span className="mb-card-detail-label">📍</span>
            <span className="mb-card-detail-value">{boss.location}</span>
          </div>
        )}
        {boss.spawnItem && (
          <div className="mb-card-detail">
            <img
              src={`images/items/${boss.spawnItem.imageKey}.png`}
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
  const pickles = useMemo(() => countPickles(snapshot), [snapshot])

  if (!miniBossesKills) {
    return (
      <div className="page">
        <h2 className="page-title">Minibosses</h2>
        <p className="page-empty">No miniboss data — import a save to see your kills.</p>
      </div>
    )
  }

  const killsPerKill = pickles.total + 1

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
          'World 3–6 minibosses stack spawns over time. The most kills per day comes from spawning them once 2 are stacked (every 7 days). The Spawns bar shows how many are stacked as of your last save import: Kill = ready, Max = capped, or days until 2 are stacked.',
          'The "kills w/ pickles" estimate on each card assumes every pickle you own (storage included) is on the character doing the killing.',
        ]}
      />
      <div className="mb-top-row">
        <BoneJoePickleTracker pickles={pickles} />
        <SpawnBar spawnDays={snapshot?.miniBossDays} />
      </div>
      <div className="mb-card-grid">
        {MINIBOSSES.map((boss) => (
          <MinibossCard
            key={boss.rawName}
            boss={boss}
            kills={miniBossesKills[boss.index]}
            killsPerKill={killsPerKill}
          />
        ))}
      </div>
    </div>
  )
}
