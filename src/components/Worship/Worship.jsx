import { useState } from 'react'
import { worshipMap, soulsMap, prayerMap, towerMap, saltMap } from '../../data'
import InfoPanel from '../InfoPanel/InfoPanel'
import './Worship.css'

// ============================================================
// HELPERS
// ============================================================

const getSoulImageKey = (soulName) => {
  return Object.entries(soulsMap).find(([, name]) => name === soulName)?.[0] ?? null
}

const prayerIdByName = Object.fromEntries(
  Object.entries(prayerMap).map(([id, p]) => [p.name, parseInt(id)])
)

// ============================================================
// PRAYER ICON
// ============================================================

function PrayerIcon({ prayerId, wave, maxWave }) {
  const prayer = prayerMap[prayerId]
  if (!prayer) return null

  const unlocked = maxWave >= wave

  return (
    <div className={`worship-prayer-icon ${unlocked ? 'worship-prayer-icon--unlocked' : 'worship-prayer-icon--locked'}`}>
      <div className="worship-prayer-icon-img-wrap">
        <img
          src={`/images/prayers/Prayer${prayerId}.png`}
          alt={prayer.name}
          className="worship-prayer-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        {unlocked && <span className="worship-prayer-check">✓</span>}
      </div>
      <span className="worship-prayer-wave-label">Wave</span>
      <span className="worship-prayer-wave-num">{wave}</span>
    </div>
  )
}

// ============================================================
// TOTEM CARD
// ============================================================

function TotemCard({ totemKey, totemData, worshipData }) {
  const index = parseInt(totemKey.replace('totem_', ''))
  const { maxWave = 0, expPerCharge = 0 } = worshipData?.totems?.[index] ?? {}
  const soulKey = getSoulImageKey(totemData.soul)

  return (
    <div className={`worship-totem-card ${maxWave === 0 ? 'worship-totem-card--inactive' : ''}`}>

      {/* ── Soul: top right corner ── */}
      {soulKey && (
        <div className="worship-soul-anchor tooltip-anchor">
          <img
            src={`/images/worship/${soulKey}.png`}
            alt={totemData.soul}
            className="worship-soul-img"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
          <span className="tooltip">{totemData.soul}</span>
        </div>
      )}

      {/* ── Left: totem image ── */}
      <div className="worship-totem-left">
        <img
          src={`/images/worship/${totemKey}.png`}
          alt={totemData.name}
          className="worship-totem-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      </div>

      {/* ── Right: info + prayers ── */}
      <div className="worship-totem-right">

        {/* Header */}
        <div className="worship-totem-header">
          <div className="worship-totem-title-row">
            <span className="worship-totem-name">{totemData.name}</span>
            <span className="worship-totem-map">{totemData.map}</span>
          </div>
          <div className="worship-totem-stats">
            <div className="worship-totem-stat">
              <span className="worship-totem-stat-label">Max Wave</span>
              <span className="worship-totem-stat-value">{maxWave}</span>
            </div>
            <div className="worship-totem-stat-divider" />
            <div className="worship-totem-stat">
              <span className="worship-totem-stat-label">EXP Per Charge</span>
              <span className="worship-totem-stat-value">{expPerCharge.toLocaleString()}</span>
            </div>
            {totemData.soul && (
              <>
                <div className="worship-totem-stat-divider" />
                <div className="worship-totem-stat">
                  <span className="worship-totem-stat-label">Soul</span>
                  <span className="worship-totem-stat-value">{totemData.soul}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Prayers */}
        {totemData.prayers && totemData.prayers.length > 0 && (
          <div className="worship-prayers">
            <div className="worship-prayers-label">Prayer Unlocks</div>
            <div className="worship-prayers-strip">
              {totemData.prayers.map(({ name, wave }) => {
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
  const totems = worshipData?.totems ?? []

  return (
    <div className="worship-summary-wrap">
      <span className="worship-sub-label">Max Waves</span>
      <div className="worship-summary-strip">
        {Object.entries(worshipMap).map(([totemKey, totemData], index) => {
          const maxWave = totems[index]?.maxWave ?? 0
          return (
            <div key={totemKey} className={`worship-summary-totem ${maxWave === 0 ? 'worship-summary-totem--inactive' : ''}`}>
              <img
                src={`/images/worship/${totemKey}.png`}
                alt={totemData.name}
                className="worship-summary-img"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
              <span className="worship-summary-wave">{maxWave}</span>
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

  const bestTotem = Object.values(worshipMap)[bestIndex]
  const bestData = totems[bestIndex] ?? {}
  const totemKey = Object.keys(worshipMap)[bestIndex]

  if (!bestTotem || !bestData.expPerCharge) return null

  return (
    <div className="worship-best-wrap">
      <span className="worship-sub-label">Best EXP</span>
      <div className="worship-best-card">
        <div className="worship-totem-left">
          <img
            src={`/images/worship/${totemKey}.png`}
            alt={bestTotem.name}
            className="worship-totem-img"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        </div>
        <div className="worship-totem-right">
          <div className="worship-totem-header">
            <div className="worship-totem-title-row">
              <span className="worship-totem-name">{bestTotem.name}</span>
              <span className="worship-totem-map">{bestTotem.map}</span>
            </div>
            <div className="worship-totem-stats">
              <div className="worship-totem-stat">
                <span className="worship-totem-stat-label">Max Wave</span>
                <span className="worship-totem-stat-value">{bestData.maxWave}</span>
              </div>
              <div className="worship-totem-stat-divider" />
              <div className="worship-totem-stat">
                <span className="worship-totem-stat-label">EXP Per Charge</span>
                <span className="worship-totem-stat-value">{bestData.expPerCharge.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// TOWER CARD
// ============================================================

function TowerCard({ towerKey, towerData, level }) {
  const salt = saltMap[towerData.upgReq]

  return (
    <div className={`worship-totem-card ${level === 0 ? 'worship-totem-card--inactive' : ''}`}>

      {/* ── Left: tower image ── */}
      <div className="worship-totem-left">
        <img
          src={`/images/worship/${towerKey}.png`}
          alt={towerData.name}
          className="worship-totem-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      </div>

      {/* ── Right: info ── */}
      <div className="worship-totem-right">

        {/* Header */}
        <div className="worship-totem-header">
          <div className="worship-totem-title-row">
            <span className="worship-totem-name">{towerData.name}</span>
          </div>
          <div className="worship-totem-stats">
            <div className="worship-totem-stat">
              <span className="worship-totem-stat-label">Level</span>
              <span className="worship-totem-stat-value">{level}</span>
            </div>
            <div className="worship-totem-stat-divider" />
            <div className="worship-totem-stat">
              <span className="worship-totem-stat-label">{towerData.bonus}</span>
              <span className="worship-totem-stat-value">
                {level > 0 ? `${Math.floor(towerData.costInc[0] * (level - 1))}%` : '—'}
              </span>
            </div>
            <div className="worship-totem-stat-divider" />
            <div className="worship-totem-stat">
              <span className="worship-totem-stat-label">Lower Upg. Cost</span>
              <span className="worship-totem-stat-value">
                {level > 0 ? `${Math.floor(towerData.costInc[1] * (level - 1))}%` : '—'}
              </span>
            </div>
            <div className="worship-totem-stat-divider" />
            <div className="worship-totem-stat">
              <span className="worship-totem-stat-label">Next Upgrade</span>
              {salt ? (
                <div className="worship-salt-row">
                  <div className="tooltip-anchor worship-salt-anchor">
                    <img
                      src={`/images/construction/${towerData.upgReq}.png`}
                      alt={salt.name}
                      className="worship-salt-img"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                    <span className="tooltip">{salt.name}</span>
                  </div>
                  <span className="worship-totem-stat-value">
                    {Math.floor(towerData.amount * (level + 1) / 3.21).toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="worship-totem-stat-value">{towerData.upgReq}</span>
              )}
            </div>
          </div>
        </div>

        {/* Traits & Setup */}
        <div className="worship-tower-setup">
          <div className="worship-prayers-label">Traits &amp; Upgrade Paths</div>
          <div className="worship-tower-traits">
            <div className="worship-tower-trait">
              <span className="worship-tower-trait-badge worship-tower-trait-badge--a">A</span>
              <span className="worship-tower-trait-text">{towerData.traits.a}</span>
            </div>
            <div className="worship-tower-trait">
              <span className="worship-tower-trait-badge worship-tower-trait-badge--b">B</span>
              <span className="worship-tower-trait-text">{towerData.traits.b}</span>
            </div>
          </div>
          {towerData.setup && towerData.setup.length > 0 && (
            <div className="worship-tower-setups">
              {towerData.setup.map((s, i) => (
                <div key={i} className="worship-tower-setup-row">
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
  // Worship towers are indices 9–17
  const worshipTowerLevels = towerLevels.slice(9, 18)

  return (
    <div className="worship-totem-list">
      <div className="worship-section-label">Tower Overview</div>
      <InfoPanel
        items= {[
            "Pulse Mage, Fireball Lobber, and Boulder Roller are early-game towers used before the more powerful options become available. They are not included in end-game setups."
        ]}
      />
      {Object.entries(towerMap).map(([towerKey, towerData], i) => {
        const level = worshipTowerLevels[i] ?? 0
        return (
          <TowerCard
            key={towerKey}
            towerKey={towerKey}
            towerData={towerData}
            level={level}
          />
        )
      })}
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
          'The Tower Guide tab shows common upgrade setups for each Worship Tower to help maximize your wave count.',
        ]}
      />

      {/* ── Nav Bar ── */}
      <div className="worship-nav">
        <button
          className={`worship-nav-btn${activeTab === 'exp' ? ' worship-nav-btn--active' : ''}`}
          onClick={() => setActiveTab('exp')}
        >
          EXP Tracker
        </button>
        <button
          className={`worship-nav-btn${activeTab === 'towers' ? ' worship-nav-btn--active' : ''}`}
          onClick={() => setActiveTab('towers')}
        >
          Tower Guide
        </button>
      </div>

      {/* ── EXP Tracker Tab ── */}
      {activeTab === 'exp' && (
        <>
          <div className="worship-section-label">At a Glance</div>
          <div className="worship-summary-row">
            <TotemSummary worshipData={worshipData} />
            <BestExpCard worshipData={worshipData} />
          </div>

          <div className="worship-totem-list">
            <div className="worship-section-label">Totem Overview</div>
            {Object.entries(worshipMap).map(([totemKey, totemData]) => (
              <TotemCard
                key={totemKey}
                totemKey={totemKey}
                totemData={totemData}
                worshipData={worshipData}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Tower Guide Tab ── */}
      {activeTab === 'towers' && (
        <TowerGuideTab towerLevels={towerLevels} />
      )}
    </div>
  )
}