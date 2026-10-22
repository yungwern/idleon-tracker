import { useState } from 'react'
import { worshipMap, soulsMap, prayerMap, towerMap, saltMap } from '../../data'
import InfoPanel from '../InfoPanel/InfoPanel'
import './Worship.css'

// ============================================================
// HELPERS
// ============================================================

const TOTEMS = Object.entries(worshipMap)

const TABS = [
  { id: 'exp', label: 'EXP Tracker' },
  { id: 'setups', label: 'Example Setups' },
  { id: 'towers', label: 'Tower Guide' },
]

// Soul name → image key (Soul1..Soul8)
const soulKeyByName = Object.fromEntries(
  Object.entries(soulsMap).map(([key, name]) => [name, key])
)

const prayerIdByName = Object.fromEntries(
  Object.entries(prayerMap).map(([id, p]) => [p.name, Number(id)])
)

const hideBrokenImg = e => {
  e.currentTarget.style.display = 'none'
}

const getTotemStats = (worshipData, index) => {
  return worshipData?.totems?.[index] ?? {}
}

// ============================================================
// SHARED PIECES
// ============================================================

function TotemImage({ totemKey, name }) {
  return (
    <div className="worship-totem-left">
      <img
        src={`images/worship/${totemKey}.png`}
        alt={name}
        className="worship-totem-img"
        onError={hideBrokenImg}
      />
    </div>
  )
}

function Stat({ label, children }) {
  return (
    <div className="worship-totem-stat">
      <span className="worship-totem-stat-label">{label}</span>
      {children}
    </div>
  )
}

function StatValue({ children }) {
  return <span className="worship-totem-stat-value">{children}</span>
}

// Name + map row, then stats separated by dividers
function CardHeader({ name, map, stats }) {
  return (
    <div className="worship-totem-header">
      <div className="worship-totem-title-row">
        <span className="worship-totem-name">{name}</span>
        {map && <span className="worship-totem-map">{map}</span>}
      </div>
      <div className="worship-totem-stats">
        {stats.map((stat, i) => (
          <div key={stat.label} className="worship-totem-stat-group">
            {i > 0 && <div className="worship-totem-stat-divider" />}
            <Stat label={stat.label}>
              {stat.content ?? <StatValue>{stat.value}</StatValue>}
            </Stat>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// PRAYER ICON
// ============================================================

function PrayerIcon({ prayerId, wave, maxWave }) {
  const prayer = prayerMap[prayerId]
  if (!prayer) return null

  const unlocked = maxWave >= wave

  return (
    <div className={`worship-prayer-icon ${unlocked ? 'worship-prayer-icon--unlocked' : 'worship-prayer-icon--locked'}`}>
      <div className="worship-prayer-icon-img-wrap tooltip-anchor">
        <img
          src={`images/prayers/Prayer${prayerId}.png`}
          alt={prayer.name}
          className="worship-prayer-img"
          onError={hideBrokenImg}
        />
        {unlocked && <span className="worship-prayer-check">✓</span>}
        <span className="tooltip">{prayer.name}</span>
      </div>
      <span className="worship-prayer-wave-label">Wave</span>
      <span className="worship-prayer-wave-num">{wave}</span>
    </div>
  )
}

// ============================================================
// TOTEM CARD
// ============================================================

function TotemCard({ totemKey, totemData, stats }) {
  const { maxWave = 0, expPerCharge = 0 } = stats
  const soulKey = soulKeyByName[totemData.soul]
  const prayers = totemData.prayers ?? []

  return (
    <div className={`worship-totem-card ${maxWave === 0 ? 'worship-totem-card--inactive' : ''}`}>

      {/* ── Soul: top right corner ── */}
      {soulKey && (
        <div className="worship-soul-anchor tooltip-anchor">
          <img
            src={`images/worship/${soulKey}.png`}
            alt={totemData.soul}
            className="worship-soul-img"
            onError={hideBrokenImg}
          />
          <span className="tooltip">{totemData.soul}</span>
        </div>
      )}

      <TotemImage
        totemKey={totemKey}
        name={totemData.name}
      />

      <div className="worship-totem-right">
        <CardHeader
          name={totemData.name}
          map={totemData.map}
          stats={[
            { label: 'Max Wave', value: maxWave },
            { label: 'EXP Per Charge', value: expPerCharge.toLocaleString() },
            { label: 'Soul', value: totemData.soul },
          ]}
        />

        {prayers.length > 0 && (
          <div className="worship-prayers">
            <div className="worship-prayers-label">Prayer Unlocks</div>
            <div className="worship-prayers-strip">
              {prayers.map(({ name, wave }) => {
                const prayerId = prayerIdByName[name]
                if (prayerId === undefined) return null
                return (
                  <PrayerIcon
                    key={name}
                    prayerId={prayerId}
                    wave={wave}
                    maxWave={maxWave}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// TOTEM SUMMARY STRIP
// ============================================================

function TotemSummary({ worshipData }) {
  return (
    <div className="worship-summary-wrap">
      <span className="worship-sub-label">Max Waves</span>
      <div className="worship-summary-strip">
        {TOTEMS.map(([totemKey, totemData], index) => {
          const maxWave = getTotemStats(worshipData, index).maxWave ?? 0
          return (
            <div
              key={totemKey}
              className={`worship-summary-totem tooltip-anchor ${maxWave === 0 ? 'worship-summary-totem--inactive' : ''}`}
            >
              <img
                src={`images/worship/${totemKey}.png`}
                alt={totemData.name}
                className="worship-summary-img"
                onError={hideBrokenImg}
              />
              <span className="worship-summary-wave">{maxWave}</span>
              <span className="tooltip">{totemData.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// BEST EXP CARD
// ============================================================

function BestExpCard({ worshipData }) {
  const totems = worshipData?.totems ?? []

  const bestIndex = totems.reduce((best, t, i) => {
    return (t.expPerCharge ?? 0) > (totems[best]?.expPerCharge ?? 0) ? i : best
  }, 0)

  const [totemKey, bestTotem] = TOTEMS[bestIndex] ?? []
  const bestData = totems[bestIndex] ?? {}

  if (!bestTotem || !bestData.expPerCharge) return null

  return (
    <div className="worship-best-wrap">
      <span className="worship-sub-label">Best EXP</span>
      <div className="worship-best-card">
        <TotemImage
          totemKey={totemKey}
          name={bestTotem.name}
        />
        <div className="worship-totem-right">
          <CardHeader
            name={bestTotem.name}
            map={bestTotem.map}
            stats={[
              { label: 'Max Wave', value: bestData.maxWave },
              { label: 'EXP Per Charge', value: bestData.expPerCharge.toLocaleString() },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// EXP TRACKER TAB
// ============================================================

function ExpTrackerTab({ worshipData }) {
  return (
    <>
      <div className="worship-section-label">At a Glance</div>
      <div className="worship-summary-row">
        <TotemSummary worshipData={worshipData} />
        <BestExpCard worshipData={worshipData} />
      </div>

      <div className="worship-totem-list">
        <div className="worship-section-label">Totem Overview</div>
        {TOTEMS.map(([totemKey, totemData], index) => (
          <TotemCard
            key={totemKey}
            totemKey={totemKey}
            totemData={totemData}
            stats={getTotemStats(worshipData, index)}
          />
        ))}
      </div>
    </>
  )
}

// ============================================================
// EXAMPLE SETUPS TAB
// ============================================================

function SetupsTab({ worshipData }) {
  const [selected, setSelected] = useState(0)
  const [totemKey, totemData] = TOTEMS[selected]
  const maxWave = getTotemStats(worshipData, selected).maxWave ?? 0
  const setupSrc = `images/worship/setups/${totemKey}.webp`

  return (
    <div className="worship-setups">
      <div className="worship-setup-picker">
        {TOTEMS.map(([key, data], index) => (
          <button
            key={key}
            type="button"
            className={`worship-setup-pick${index === selected ? ' worship-setup-pick--active' : ''}`}
            onClick={() => setSelected(index)}
          >
            <img
              src={`images/worship/${key}.png`}
              alt=""
              className="worship-setup-pick-img"
              onError={hideBrokenImg}
            />
            <span className="worship-setup-pick-name">{data.name}</span>
          </button>
        ))}
      </div>

      <div className="worship-setup-view">
        <div className="worship-setup-view-header">
          <CardHeader
            name={totemData.name}
            map={totemData.map}
            stats={[
              { label: 'Setup Wave', value: totemData.setupWave ?? '—' },
              { label: 'Your Max Wave', value: maxWave },
            ]}
          />
        </div>
        <a
          href={setupSrc}
          target="_blank"
          rel="noreferrer"
          className="worship-setup-img-link"
        >
          <img
            src={setupSrc}
            alt={`${totemData.name} example setup`}
            className="worship-setup-img"
          />
        </a>
        <span className="worship-setup-hint">Click the image to open it full size</span>
      </div>
    </div>
  )
}

// ============================================================
// TOWER CARD
// ============================================================

function TowerCard({ towerKey, towerData, level }) {
  const salt = saltMap[towerData.upgReq]
  const bonusAt = (inc) => (level > 0 ? `${Math.floor(inc * (level - 1))}%` : '—')
  const nextCost = Math.floor(towerData.amount * (level + 1) / 3.21).toLocaleString()
  const setups = towerData.setup ?? []

  const nextUpgrade = salt ? (
    <div className="worship-salt-row">
      <div className="tooltip-anchor worship-salt-anchor">
        <img
          src={`images/construction/${towerData.upgReq}.png`}
          alt={salt.name}
          className="worship-salt-img"
          onError={hideBrokenImg}
        />
        <span className="tooltip">{salt.name}</span>
      </div>
      <StatValue>{nextCost}</StatValue>
    </div>
  ) : (
    <StatValue>{towerData.upgReq}</StatValue>
  )

  return (
    <div className={`worship-totem-card ${level === 0 ? 'worship-totem-card--inactive' : ''}`}>

      <TotemImage
        totemKey={towerKey}
        name={towerData.name}
      />

      <div className="worship-totem-right">
        <CardHeader
          name={towerData.name}
          stats={[
            { label: 'Level', value: level },
            { label: towerData.bonus, value: bonusAt(towerData.costInc[0]) },
            { label: 'Lower Upg. Cost', value: bonusAt(towerData.costInc[1]) },
            { label: 'Next Upgrade', content: nextUpgrade },
          ]}
        />

        {/* Traits & Setup */}
        <div className="worship-tower-setup">
          <div className="worship-prayers-label">Traits &amp; Upgrade Paths</div>
          <div className="worship-tower-traits">
            {['a', 'b'].map(trait => (
              <div key={trait} className="worship-tower-trait">
                <span className={`worship-tower-trait-badge worship-tower-trait-badge--${trait}`}>
                  {trait.toUpperCase()}
                </span>
                <span className="worship-tower-trait-text">{towerData.traits[trait]}</span>
              </div>
            ))}
          </div>
          {setups.length > 0 && (
            <div className="worship-tower-setups">
              {setups.map((s, i) => (
                <div key={s} className="worship-tower-setup-row">
                  <span className="worship-tower-setup-chip">{s}</span>
                  {towerData.setupDesc?.[i] && (
                    <span className="worship-tower-setup-desc">{towerData.setupDesc[i]}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// TOWER GUIDE TAB
// ============================================================

function TowerGuideTab({ towerLevels }) {
  return (
    <div className="worship-totem-list">
      <div className="worship-section-label">Tower Overview</div>
      <InfoPanel
        items={[
          'Pulse Mage, Fireball Lobber, and Boulder Roller are early-game towers used before the more powerful options become available. They are not included in end-game setups.',
          'Actual guides for specific tower placements and upgrade paths can be found in the main IdleOn Discord.',
        ]}
      />
      {Object.entries(towerMap).map(([towerKey, towerData]) => (
        <TowerCard
          key={towerKey}
          towerKey={towerKey}
          towerData={towerData}
          // ConTower9 → Tower[9], so the key number is the save index
          level={towerLevels[Number(towerKey.replace('ConTower', ''))] ?? 0}
        />
      ))}
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Worship({ snapshot }) {
  const [activeTab, setActiveTab] = useState('exp')
  const worshipData = snapshot?.worship ?? {}
  const towerLevels = snapshot?.towerLevels ?? []

  return (
    <div className="page worship-page">
      <h2 className="page-title">Worship</h2>

      <InfoPanel
        intro="This page tracks your Worship totems and gives insight on prayer unlocks."
        items={[
          'Max Wave is the highest wave you have reached at each totem. Higher waves yield more EXP.',
          'Prayers are unlocked by reaching the required wave threshold at the corresponding totem. Unlocked prayers are shown in full color, locked prayers are dimmed.',
          'Use the Best EXP totem mainly to level Worship on your Vman. You\'ll want to make sure he stays higher level than your other characters and this is a good way to do that.',
          'The Example Setups tab shows a working tower layout for every totem, and the Tower Guide tab shows common upgrade paths for each Worship Tower.',
        ]}
      />

      <div className="page-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`page-tab-btn${activeTab === tab.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'exp' && <ExpTrackerTab worshipData={worshipData} />}
      {activeTab === 'setups' && <SetupsTab worshipData={worshipData} />}
      {activeTab === 'towers' && <TowerGuideTab towerLevels={towerLevels} />}
    </div>
  )
}
