import { useState, useMemo } from 'react'
import { GEAR_BONUSES } from '../../data/gearBonuses'
import { GEAR_SET_PIECES, GEAR_SETS } from '../../data/equipmentMap'
import { itemMap } from '../../data/itemMap'
import InfoPanel from '../InfoPanel/InfoPanel'

import './GearOptimizer.css'

const SLOT_MAP = {
  Helmet: id => id.startsWith('EquipmentHats'),
  Chest: id => id.startsWith('EquipmentShirts'),
  Pants: id => id.startsWith('EquipmentPants'),
  Boots: id => id.startsWith('EquipmentShoes'),
  Pendant: id => id.startsWith('EquipmentPendant'),
  Ring: id => id.startsWith('EquipmentRings'),
  Pickaxe: id => id.startsWith('EquipmentTools') && !id.startsWith('EquipmentToolsHatchet'),
  Hatchet: id => id.startsWith('EquipmentToolsHatchet'),
  'Fishing Rod': id => id.startsWith('FishingRod'),
  'Catching Net': id => id.startsWith('CatchingNet'),
  'Worship Skull': id => id.startsWith('WorshipSkull'),
  Traps: id => id.startsWith('TrapBoxSet'),
}

const SLOTS = Object.keys(SLOT_MAP)

const ALL_BONUS_TYPES = [...new Set(
  Object.values(GEAR_BONUSES).flatMap(bonuses => Object.keys(bonuses))
)].sort()

// Get the helmet image for a set
function getSetHelmetImage(setName) {
  const pieces = GEAR_SET_PIECES[setName]
  const helmet = pieces?.armors?.find(id => id.startsWith('EquipmentHats'))
  return helmet ? `/images/items/${helmet}.png` : null
}

function scoreItem(itemBonuses, primary, secondary) {
  const getScore = (cat) => {
    const b = itemBonuses[cat]
    if (!b) return 0
    return b.type === 'multi' ? b.value + 10000 : b.value
  }
  return getScore(primary) * 100000 + (secondary ? getScore(secondary) : 0)
}

function optimize(primary, secondary, enabledSets) {
  // Build a set of all piece IDs that belong to enabled sets
  const enabledPieces = new Set()
  for (const setName of enabledSets) {
    const pieces = GEAR_SET_PIECES[setName]
    if (!pieces) continue
    ;[...pieces.armors, ...pieces.tools, ...pieces.weapons].forEach(id => enabledPieces.add(id))
  }

  const results = {}
  for (const slot of SLOTS) {
    const candidates = Object.entries(GEAR_BONUSES).filter(([id]) =>
      SLOT_MAP[slot](id) && enabledPieces.has(id)
    )
    const relevant = candidates.filter(([, bonuses]) =>
      bonuses[primary] || (secondary && bonuses[secondary])
    )
    if (!relevant.length) continue
    const best = relevant.reduce((a, b) =>
      scoreItem(b[1], primary, secondary) > scoreItem(a[1], primary, secondary) ? b : a
    )
    results[slot] = { id: best[0], bonuses: best[1] }
  }
  return results
}

function summarize(results) {
  const additive = {}
  const multi = {}
  for (const { bonuses } of Object.values(results)) {
    for (const [cat, bonus] of Object.entries(bonuses)) {
      if (bonus.type === 'multi') {
        multi[cat] = (multi[cat] || 0) + bonus.value
      } else {
        additive[cat] = (additive[cat] || 0) + bonus.value
      }
    }
  }
  return { additive, multi }
}

function formatBonus(bonus) {
  if (!bonus) return null
  return bonus.type === 'multi' ? `+${bonus.value}%` : `+${bonus.value}%`
}

// ── Set Toggle Selector ──────────────────────────────────────
function SetToggleSelector({ unlockedSets, lockedSets, enabledSets, onToggle }) {
  const hasLockedEnabled = lockedSets.some(s => enabledSets.has(s))

  return (
    <div className="go-set-selector">
      {/* Unlocked Sets */}
      <div className="go-set-group">
        <span className="go-set-group-label">Unlocked Sets</span>
        <div className="go-set-toggles">
          {unlockedSets.map(setName => {
            const set = GEAR_SETS[setName]
            const img = getSetHelmetImage(setName)
            const active = enabledSets.has(setName)
            return (
            <button
              key={setName}
              className={`go-set-btn tooltip-anchor ${active ? 'go-set-btn--active' : 'go-set-btn--inactive'}`}
              onClick={() => onToggle(setName)}
            >
              {img && <img src={img} alt={set?.name ?? setName} className="go-set-btn-img" />}
              <span className="tooltip">{set?.name ?? setName}</span>
            </button>
            )
          })}
        </div>
      </div>

      {/* Locked Sets */}
      {lockedSets.length > 0 && (
        <div className="go-set-group">
          <span className="go-set-group-label">Unowned Sets</span>
          <div className="go-set-toggles">
            {lockedSets.map(setName => {
              const set = GEAR_SETS[setName]
              const img = getSetHelmetImage(setName)
              const active = enabledSets.has(setName)
              return (
                <button
                  key={setName}
                  className={`go-set-btn ${active ? 'go-set-btn--active go-set-btn--locked' : 'go-set-btn--inactive'}`}
                  onClick={() => onToggle(setName)}
                  title={`${set?.name ?? setName}: ${set?.description ?? ''}`}
                >
                  {img && <img src={img} alt={set?.name ?? setName} className="go-set-btn-img" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Warning banner */}
      {hasLockedEnabled && (
        <div className="go-set-warning">
          ⚠ One or more unowned sets are enabled. Results may include gear you don't have access to yet.
        </div>
      )}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────
export default function GearOptimizer({ snapshot }) {
  const [primary, setPrimary] = useState('')
  const [secondary, setSecondary] = useState('')
  const [searched, setSearched] = useState(false)

  // Derive unlocked/locked sets from snapshot
  const unlockedSetNames = useMemo(() => {
    const unlocked = new Set(snapshot?.armorSmithySets ?? [])
    return Object.keys(GEAR_SETS).filter(s => unlocked.has(s))
  }, [snapshot?.armorSmithySets])

  const lockedSetNames = useMemo(() => {
    const unlocked = new Set(snapshot?.armorSmithySets ?? [])
    return Object.keys(GEAR_SETS).filter(s => !unlocked.has(s))
  }, [snapshot?.armorSmithySets])

  // Default enabled: all unlocked on, all locked off
  const [enabledSets, setEnabledSets] = useState(null)

  const resolvedEnabledSets = useMemo(() => {
    if (enabledSets !== null) return enabledSets
    return new Set(snapshot?.armorSmithySets ?? [])
  }, [enabledSets, snapshot?.armorSmithySets])

  function handleToggle(setName) {
    setEnabledSets(prev => {
      const next = new Set(prev ?? resolvedEnabledSets)
      if (next.has(setName)) next.delete(setName)
      else next.add(setName)
      return next
    })
    setSearched(false)
  }

  const results = useMemo(() => {
    if (!primary || !searched) return {}
    return optimize(primary, secondary || null, resolvedEnabledSets)
  }, [primary, secondary, searched, resolvedEnabledSets])

  const summary = useMemo(() => summarize(results), [results])

  const hasResults = Object.keys(results).length > 0

  const handleSearch = () => {
    if (primary) setSearched(true)
  }

  const handleReset = () => {
    setPrimary('')
    setSecondary('')
    setSearched(false)
  }

  const handlePrimaryChange = (e) => {
    setPrimary(e.target.value)
    setSearched(false)
  }

  const handleSecondaryChange = (e) => {
    setSecondary(e.target.value)
    setSearched(false)
  }

  return (
    <div className="page">
      <h2 className="page-title">Gear Optimizer</h2>
      <InfoPanel
      intro="Use this section to optimize your currently equipped gear set. A few things to keep in mind:"
      items={[
        'Use the set toggles at the top to control which gear sets are included in the optimization. Unlocked sets default to on, and unowned sets default to off.',
        'If you enable an unowned set, a warning will appear to let you know the results may include gear you don\'t currently have access to.',
        'When optimizing for multiple bonuses, set the primary bonus to whichever category has fewer available pieces. This ensures those pieces are prioritized first, with the remaining slots filled by the secondary bonus.',
        'Example: When optimizing for DR and Monster Respawn together, set Monster Respawn as the primary. The limited Monster Respawn pieces will be locked in first, and the rest of the set will fill with DR gear.',
      ]}
      />

      <div className="section-card go-card">

        {/* Set Toggles */}
        <SetToggleSelector
          unlockedSets={unlockedSetNames}
          lockedSets={lockedSetNames}
          enabledSets={resolvedEnabledSets}
          onToggle={handleToggle}
        />

        {/* Search */}
        <div className="go-search-row">
          <div className="go-select-group">
            <label className="go-label">Primary bonus</label>
            <select
              className="go-select"
              value={primary}
              onChange={handlePrimaryChange}
            >
              <option value="">Select a bonus...</option>
              {ALL_BONUS_TYPES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="go-select-group">
            <label className="go-label">
              Secondary bonus <span className="go-label-optional">(optional)</span>
            </label>
            <select
              className="go-select"
              value={secondary}
              onChange={handleSecondaryChange}
              disabled={!primary}
            >
              <option value="">None</option>
              {ALL_BONUS_TYPES.filter(b => b !== primary).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="go-button-group">
            <button
              className="go-btn-search"
              onClick={handleSearch}
              disabled={!primary}
            >
              Optimize
            </button>
            {searched && (
              <button className="go-btn-reset" onClick={handleReset}>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* No results */}
        {searched && !hasResults && (
          <p className="page-empty">No gear found with that bonus.</p>
        )}

        {/* Results */}
        {hasResults && (
          <>
            <div className="go-section-label">Best in slot</div>
            <div className="go-results-grid">
              {SLOTS.map(slot => {
                const result = results[slot]
                if (!result) return (
                  <div key={slot} className="go-slot-card go-slot-card--empty">
                    <span className="go-slot-name">{slot}</span>
                    <span className="go-slot-none">No bonus for this slot</span>
                  </div>
                )

                const { id, bonuses } = result
                const name = itemMap?.[id] || id
                const primaryBonus = bonuses[primary]
                const secondaryBonus = secondary ? bonuses[secondary] : null
                const otherBonuses = Object.entries(bonuses).filter(
                  ([cat]) => cat !== primary && cat !== secondary
                )

                return (
                  <div key={slot} className="go-slot-card">
                    <span className="go-slot-name">{slot}</span>
                    <div className="go-item-header">
                      <img
                        src={`/images/items/${id}.png`}
                        alt={name}
                        className="go-item-icon"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                      <span className="go-item-name">{name}</span>
                    </div>
                    <div className="go-pill-list">
                      {primaryBonus && (
                        <span className="go-pill go-pill--primary">
                          {primary}: {formatBonus(primaryBonus)}
                        </span>
                      )}
                      {secondaryBonus && (
                        <span className="go-pill go-pill--secondary">
                          {secondary}: {formatBonus(secondaryBonus)}
                        </span>
                      )}
                      {otherBonuses.map(([cat, bonus]) => (
                        <span key={cat} className="go-pill go-pill--other">
                          {cat}: {formatBonus(bonus)}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="go-section-label">Loadout totals</div>
            <div className="go-summary-grid">
              {Object.entries(summary.additive).map(([cat, total]) => (
                <div key={cat} className="go-summary-card">
                  <span className="go-summary-label">{cat}</span>
                  <span className="go-summary-value">+{total}%</span>
                </div>
              ))}
              {Object.entries(summary.multi).map(([cat, total]) => (
                <div key={cat} className="go-summary-card go-summary-card--multi">
                  <span className="go-summary-label">{cat}</span>
                  <span className="go-summary-value">{total}x</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}