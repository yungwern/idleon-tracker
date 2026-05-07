import { useState, useMemo } from 'react'
import { breedingMap, geneMap, spiceMap } from '../../data/breedingMap'
import './Breeding.css'

// ============================================================
// CONSTANTS
// ============================================================

const FORMATION_LABELS = [
  'Earlygame',
  'Midgame',
  'Current Meta',
  'Current Meta (NBLB)',
]

const DEFAULT_FORMATION = 3 // Current Meta (NBLB)
const FORMATION_3_SPICE = 4
const FORMATION_1_SPICE = 5
const MAX_SHINY_LEVEL = 20

// ── Passive group order ───────────────────────────────────────────────────────
const PASSIVE_ORDER = [
  '+{%_Faster_Shiny_Mob_Lv_Up_Rate',
  '+{%_Bonuses_from_All_Meals',
  '+{%_Drop_Rate',
  '+{%_Multikill_Per_Tier',
  '+{_Base_Critters_per_Trap',
  '+{%_Farming_EXP_gain',
  '+{%_Summoning_EXP_gain',
  '+{%_Faster_Refinery_Speed',
  '+{%_Sail_Captain_EXP_Gain',
  '+{%_Lower_Minimum_Travel_Time_for_Sailing',
  '+{%_Higher_Artifact_Find_Chance',
  '+{%_Line_Width_in_Lab',
  '+{_Base_Efficiency_for_All_Skills',
  '+{%_Total_Damage',
  '+{_Infinite_Star_Signs',
  '+{_Base_STR',
  '+{_Base_AGI',
  '+{_Base_LUK',
  '+{_Base_WIS',
  '+{%_Class_EXP',
  '+{%_Skill_EXP',
  '+{_Tab_1_Talent_Pts',
  '+{_Tab_2_Talent_Pts',
  '+{_Tab_3_Talent_Pts',
  '+{_Tab_4_Talent_Pts',
  '+{_Star_Talent_Pts',
]

function formatPassiveLabel(passive) {
  return passive.replace('+{', '').replace(/_/g, ' ').trim()
}

// Maps individual passives to a shared category label
const PASSIVE_CATEGORIES = {
  '+{_Base_STR': 'Base Stats',
  '+{_Base_AGI': 'Base Stats',
  '+{_Base_LUK': 'Base Stats',
  '+{_Base_WIS': 'Base Stats',
  '+{_Tab_1_Talent_Pts': 'Talent Pts',
  '+{_Tab_2_Talent_Pts': 'Talent Pts',
  '+{_Tab_3_Talent_Pts': 'Talent Pts',
  '+{_Tab_4_Talent_Pts': 'Talent Pts',
  '+{_Star_Talent_Pts': 'Talent Pts',
}

function getCategoryKey(passive) {
  return PASSIVE_CATEGORIES[passive] ?? passive
}

function getCategoryLabel(categoryKey) {
  // If the key is a passive string, strip the +{% or +{_ prefix; otherwise it's already a label
  if (!categoryKey.startsWith('+{')) return categoryKey
  return categoryKey
    .replace(/^\+\{[%_]?/, '')
    .replace(/_/g, ' ')
    .trim()
}

// ============================================================
// GENE ICON
// ============================================================

function GeneIcon({ geneName }) {
  if (!geneName) {
    return <div className="breeding-gene-empty" />
  }

  const geneEntry = Object.entries(geneMap).find(([, v]) => v.name === geneName)
  const geneKey = geneEntry ? geneEntry[0] : null

  return (
    <div className="breeding-gene-slot tooltip-anchor">
      {geneKey ? (
        <img
          src={`/images/breeding/${geneKey}.png`}
          alt={geneName}
          className="breeding-gene-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <div className="breeding-gene-placeholder" />
      )}
      <span className="tooltip">{geneName.charAt(0).toUpperCase() + geneName.slice(1)}</span>
    </div>
  )
}

// ============================================================
// SPICE ROW
// ============================================================

function SpiceRow({ spiceKey, spice, formationIndex }) {
  const formation = spice.formations?.[formationIndex] ?? ['', '', '', '']

  return (
    <div className="breeding-spice-row">
      <div className="breeding-spice-info">
        <img
          src={`/images/breeding/${spiceKey}.png`}
          alt={spice.name}
          className="breeding-spice-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <span className="breeding-spice-name" style={{ color: spice.color }}>
          {spice.name}
        </span>
      </div>
      <div className="breeding-formation-slots">
        {formation.map((gene, i) => (
          <GeneIcon key={i} geneName={gene} />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// SINGLE SPICE GUIDE
// ============================================================

function SingleSpiceGuide({ spiceEntries }) {
  const getFormation = (formationIndex) => {
    const entry = spiceEntries.find(([, spice]) => {
      const formation = spice.formations?.[formationIndex] ?? []
      return formation.some(g => g !== '')
    })
    return entry ? entry[1].formations[formationIndex] : null
  }

  const bestFormation = getFormation(FORMATION_1_SPICE)
  const altFormation = getFormation(FORMATION_3_SPICE)

  if (!bestFormation && !altFormation) return null

  return (
    <div className="breeding-single-spice-guide">
      {bestFormation && (
        <>
          <p className="breeding-guide-text">Use this formation for the fastest single spice clear.</p>
          <div className="breeding-formation-slots breeding-formation-slots--static">
            {bestFormation.map((gene, i) => (
              <GeneIcon key={i} geneName={gene} />
            ))}
          </div>
        </>
      )}
      {altFormation && (
        <>
          <p className="breeding-guide-text">If the above formation isn't available, this alternative can fill the gap for your target spice.</p>
          <div className="breeding-static-formations-list">
            {spiceEntries
              .filter(([, spice]) => {
                const formation = spice.formations?.[FORMATION_3_SPICE] ?? []
                return formation.some(g => g !== '')
              })
              .map(([key, spice]) => {
                const formation = spice.formations[FORMATION_3_SPICE]
                return (
                  <div key={key} className="breeding-formation-slots breeding-formation-slots--static">
                    {formation.map((gene, i) => (
                      <GeneIcon key={i} geneName={gene} />
                    ))}
                  </div>
                )
              })}
          </div>
          <p className="breeding-guide-text">Place the spice you want to focus in the middle row.</p>
        </>
      )}
    </div>
  )
}

// ============================================================
// SPICE TABLE
// ============================================================

function SpiceTable({ title, spiceEntries, formationIndex }) {
  const filtered = spiceEntries.filter(([, spice]) => {
    const formation = spice.formations?.[formationIndex] ?? []
    return formation.some(g => g !== '')
  })

  if (!filtered.length) return null

  return (
    <div className="breeding-table">
      {filtered.map(([key, spice]) => (
        <SpiceRow key={key} spiceKey={key} spice={spice} formationIndex={formationIndex} />
      ))}
    </div>
  )
}

// ============================================================
// SHINY HELPERS
// ============================================================

function getShinyThreshold(index) {
  return Math.floor((1 + Math.pow(index + 1, 1.6)) * Math.pow(1.7, index + 1))
}

function getShinyLevel(shinyPetsLevels, worldIndex, petIndex) {
  const counter = shinyPetsLevels?.[worldIndex]?.[petIndex]
  const level = new Array(19).fill(1).reduce((sum, _, index) =>
    counter > getShinyThreshold(index) ? index + 2 : sum, 0)
  return counter === 0 ? 0 : level === 0 ? 1 : level
}

function getShinyProgress(shinyPetsLevels, worldIndex, petIndex) {
  const counter = shinyPetsLevels?.[worldIndex]?.[petIndex] ?? 0
  const level = getShinyLevel(shinyPetsLevels, worldIndex, petIndex)

  if (counter === 0) return { level: 0, counter, percent: 0, daysLeft: null, maxed: false }
  if (level >= MAX_SHINY_LEVEL) return { level, counter, percent: 100, daysLeft: null, maxed: true }

  const nextThreshold = getShinyThreshold(level - 1)
  const prevThreshold = level <= 1 ? 0 : getShinyThreshold(level - 2)
  const current = counter - prevThreshold
  const needed = nextThreshold - prevThreshold

  return {
    level,
    counter,
    percent: Math.min(100, (current / needed) * 100),
    daysLeft: nextThreshold - counter,
    maxed: false,
  }
}

function parseWorldCoords(worldStr) {
  const matches = [...worldStr.matchAll(/\[(\d+)\]/g)]
  return { worldIndex: parseInt(matches[0][1]), petIndex: parseInt(matches[1][1]) }
}

function formatDays(days) {
  if (days === null || days === undefined) return null
  if (days >= 1_000_000) return `${(days / 1_000_000).toFixed(2)}M`
  if (days >= 1_000) return `${(days / 1_000).toFixed(1)}K`
  return `${Math.floor(days)}`
}

// ============================================================
// SHINY PET COMPONENTS
// ============================================================

function formatPassiveBonus(passive, baseValue, level) {
  if (!passive || level === 0) return null
  const value = baseValue * level
  return passive
    .replace('+{', `+${value}`)
    .replace(/_/g, ' ')
    .trim()
}

function ProgressBar({ percent, maxed }) {
  return (
    <div className="breeding-progress-track">
      <div
        className={`breeding-progress-fill${maxed ? ' breeding-progress-maxed' : ''}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

function PetCard({ pet, petKey, shiny, fenceCount }) {
  const mobImageName = pet.name.replace(/ /g, '_')
  const geneEntry = Object.entries(geneMap).find(([, v]) => v.name === pet.gene)
  const geneKey = geneEntry ? geneEntry[0] : null
  const daysDisplay = shiny.maxed
    ? 'Maxed!'
    : shiny.daysLeft !== null
      ? `${formatDays(shiny.daysLeft)} days left`
      : '—'
  const passiveBonus = formatPassiveBonus(pet.passive, pet.baseValue, shiny.level)

  // Border state priority: warning > active > maxed > inactive
  const isActive = fenceCount > 0
  const showWarning = isActive && shiny.maxed
  let cardClass = 'breeding-card'
  if (shiny.level === 0) cardClass += ' breeding-card-inactive'
  if (showWarning) cardClass += ' breeding-card-warning'
  else if (isActive) cardClass += ' breeding-card-active'
  else if (shiny.maxed) cardClass += ' breeding-card-maxed'

  return (
    <div className={cardClass}>
      <div className="breeding-card-top">
        {fenceCount > 0 && (
          <span className="breeding-card-fence-count" title={`${fenceCount} in fence yard`}>
            {fenceCount}
          </span>
        )}
        <img
          src={`/images/breeding/${mobImageName}.png`}
          alt={pet.name}
          className="breeding-mob-img"
          onError={e => {
            if (!e.currentTarget.dataset.fallback) {
              e.currentTarget.dataset.fallback = 'true'
              e.currentTarget.src = `/images/breeding/${petKey}.png`
            } else {
              e.currentTarget.style.opacity = '0.3'
            }
          }}
        />
        {geneKey && (
          <img
            src={`/images/breeding/${geneKey}.png`}
            alt={pet.gene}
            className="breeding-card-gene-img"
            title={pet.gene}
          />
        )}
      </div>
      <div className="breeding-card-body">
        <span className="breeding-pet-name">{pet.name}</span>
        <span className="breeding-pet-level">Lv. {shiny.level === 0 ? '—' : shiny.level}</span>
        {passiveBonus && <span className="breeding-pet-bonus">{passiveBonus}</span>}
        <ProgressBar percent={shiny.percent} maxed={shiny.maxed} />
        <span className="breeding-days">{daysDisplay}</span>
      </div>
    </div>
  )
}

function sumGroupBonus(pets) {
  const first = pets.find(({ pet, shiny }) => pet.passive && pet.baseValue && shiny.level > 0)
  if (!first) return null
  const { pet } = first
  // All pets in a group share the same passive/baseValue
  const total = pets.reduce((sum, { pet: p, shiny }) => {
    if (shiny.level === 0) return sum
    return sum + p.baseValue * shiny.level
  }, 0)
  return { value: total, passive: pet.passive }
}

function formatGroupTotal(passive, total) {
  // Show just the value with a % suffix for percent-based passives
  const isPercent = passive.startsWith('+{%')
  return isPercent ? `+${total}%` : `+${total}`
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Breeding({ snapshot }) {
  const [activeTab, setActiveTab] = useState('spice')
  const [activeFormation, setActiveFormation] = useState(DEFAULT_FORMATION)
  const [hideMaxed, setHideMaxed] = useState(false)
  const [bonusFilter, setBonusFilter] = useState('')

  const spiceEntries = Object.entries(spiceMap)
  const shinyPetsLevels = snapshot?.breeding?.shinyPetsLevels ?? []
  const fencePets = snapshot?.breeding?.fencePets ?? {}

  const sortedPets = useMemo(() => {
    const allPets = Object.entries(breedingMap).map(([key, pet]) => {
      const { worldIndex: wi, petIndex: pi } = parseWorldCoords(pet.world)
      const shiny = getShinyProgress(shinyPetsLevels, wi, pi)
      const fenceCount = pet.rawName ? (fencePets[pet.rawName] ?? 0) : 0
      return { key, pet, shiny, fenceCount }
    })

    // Sort by passive order, then by world, then by pet index within world
    return allPets
      .filter(({ pet }) => PASSIVE_ORDER.includes(pet.passive))
      .sort((a, b) => {
        const passiveA = PASSIVE_ORDER.indexOf(a.pet.passive)
        const passiveB = PASSIVE_ORDER.indexOf(b.pet.passive)
        if (passiveA !== passiveB) return passiveA - passiveB
        const { worldIndex: wa, petIndex: pa } = parseWorldCoords(a.pet.world)
        const { worldIndex: wb, petIndex: pb } = parseWorldCoords(b.pet.world)
        return wa !== wb ? wa - wb : pa - pb
      })
  }, [shinyPetsLevels, fencePets])

  const { highlightedPets, otherGroups } = useMemo(() => {
    const groupByPassive = (pets) => {
      const groups = {}
      const categoryOrder = []

      pets.forEach(p => {
        const categoryKey = getCategoryKey(p.pet.passive)
        if (!groups[categoryKey]) {
          groups[categoryKey] = []
          // Track order based on first appearance (which follows PASSIVE_ORDER from sortedPets)
          categoryOrder.push(categoryKey)
        }
        groups[categoryKey].push(p)
      })

      return categoryOrder.map(categoryKey => ({
        passive: categoryKey,
        label: getCategoryLabel(categoryKey),
        pets: groups[categoryKey],
      }))
    }

    if (!bonusFilter) {
      const filtered = hideMaxed
        ? sortedPets.filter(({ shiny }) => !shiny.maxed)
        : sortedPets
      return { highlightedPets: [], otherGroups: groupByPassive(filtered) }
    }

    // Highlighted group always shows all matching pets, even if maxed
    const highlighted = sortedPets.filter(({ pet }) => pet.passive === bonusFilter)
    const others = sortedPets.filter(({ pet, shiny }) => {
      if (pet.passive === bonusFilter) return false
      if (hideMaxed && shiny.maxed) return false
      return true
    })
    return { highlightedPets: highlighted, otherGroups: groupByPassive(others) }
  }, [sortedPets, hideMaxed, bonusFilter])

  return (
    <div className="page breeding-page">
      <h2 className="page-title">Breeding</h2>

      {/* ── Nav Bar ── */}
      <div className="breeding-nav">
        <button
          className={`breeding-nav-btn${activeTab === 'spice' ? ' breeding-nav-btn--active' : ''}`}
          onClick={() => setActiveTab('spice')}
        >
          Spice Formations
        </button>
        <button
          className={`breeding-nav-btn${activeTab === 'shiny' ? ' breeding-nav-btn--active' : ''}`}
          onClick={() => setActiveTab('shiny')}
        >
          Shiny Levels
        </button>
      </div>

      {/* ── Spice Formations Tab ── */}
      {activeTab === 'spice' && (
        <>
          <SingleSpiceGuide spiceEntries={spiceEntries} />

          <div className="breeding-formation-selector">
            {FORMATION_LABELS.map((label, i) => (
              <button
                key={i}
                className={`breeding-formation-btn ${activeFormation === i ? 'breeding-formation-btn--active' : ''}`}
                onClick={() => setActiveFormation(i)}
              >
                {label}
              </button>
            ))}
          </div>

          <SpiceTable title="Spice" spiceEntries={spiceEntries} formationIndex={activeFormation} />
        </>
      )}

      {/* ── Shiny Levels Tab ── */}
      {activeTab === 'shiny' && (
        <>
          {!snapshot?.breeding ? (
            <p className="page-empty">No breeding data found. Import your save to get started.</p>
          ) : (
            <>
              <div className="breeding-shiny-controls">
                <label className="styled-checkbox">
                  <input
                    type="checkbox"
                    checked={hideMaxed}
                    onChange={e => setHideMaxed(e.target.checked)}
                  />
                  <span>Hide maxed pets</span>
                </label>
                <select
                  className="styled-select"
                  value={bonusFilter}
                  onChange={e => setBonusFilter(e.target.value)}
                >
                  <option value="">Filter by bonus...</option>
                  {PASSIVE_ORDER.map(passive => (
                    <option key={passive} value={passive}>
                      {formatPassiveLabel(passive)}
                    </option>
                  ))}
                </select>
              </div>

              {highlightedPets.length > 0 && (() => {
                const sum = sumGroupBonus(highlightedPets)
                return (
                  <div className="breeding-grid breeding-grid--highlighted">
                    {sum && (
                      <div className="breeding-highlighted-total">
                        {formatGroupTotal(sum.passive, sum.value)} total
                      </div>
                    )}
                    {highlightedPets.map(({ key, pet, shiny, fenceCount }) => (
                      <PetCard key={key} petKey={key} pet={pet} shiny={shiny} fenceCount={fenceCount} />
                    ))}
                  </div>
                )
              })()}

              {otherGroups.map(({ passive, label, pets }) => {
                const sum = sumGroupBonus(pets)
                return (
                  <div key={passive} className="breeding-passive-group">
                    <div className="breeding-passive-label">
                      {sum && (
                        <span className="breeding-passive-total">
                          {formatGroupTotal(sum.passive, sum.value)}
                        </span>
                      )}
                      {label}
                    </div>
                    <div className="breeding-grid">
                      {pets.map(({ key, pet, shiny, fenceCount }) => (
                        <PetCard key={key} petKey={key} pet={pet} shiny={shiny} fenceCount={fenceCount} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </>
      )}
    </div>
  )
}