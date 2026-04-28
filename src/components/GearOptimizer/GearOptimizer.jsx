import { useState, useMemo } from 'react'
import { GEAR_BONUSES } from '../../data/gearBonuses'
import { itemMap } from '../../data/itemMap'
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

function scoreItem(itemBonuses, primary, secondary) {
  const getScore = (cat) => {
    const b = itemBonuses[cat]
    if (!b) return 0
    return b.type === 'multi' ? b.value + 10000 : b.value
  }
  return getScore(primary) * 100000 + (secondary ? getScore(secondary) : 0)
}

function optimize(primary, secondary) {
  const results = {}
  for (const slot of SLOTS) {
    const candidates = Object.entries(GEAR_BONUSES).filter(([id]) => SLOT_MAP[slot](id))
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
  return bonus.type === 'multi' ? `${bonus.value}x` : `+${bonus.value}%`
}

export default function GearOptimizer() {
  const [primary, setPrimary] = useState('')
  const [secondary, setSecondary] = useState('')
  const [searched, setSearched] = useState(false)

  const results = useMemo(() => {
    if (!primary || !searched) return {}
    return optimize(primary, secondary || null)
  }, [primary, secondary, searched])

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

      <div className="section-card go-card">

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