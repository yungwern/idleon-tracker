import { useEffect, useState } from 'react'
import { geneMap, spiceMap, FORAGE_GENE_EFFECTS, COMBAT_GENE_IDS } from '../../data/breedingMap'

const CLAIM_OPTIONS = [
  6,
  12,
  24,
  48,
]
const DEFAULT_CLAIM_HOURS = 24
const TEAM_SIZE = 4
const COMBAT = new Set(COMBAT_GENE_IDS)

// ============================================================
// HELPERS
// ============================================================

const geneName = geneId => {
  const name = geneMap[`GeneReady${geneId}`]?.name
  if (!name) return geneId === 4 ? 'Breeder' : geneId === 5 ? 'Shiny' : 'Unknown'
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const geneEffect = geneId => FORAGE_GENE_EFFECTS[geneId]
  ?? (COMBAT.has(geneId) ? 'Combat pet: adds no foraging speed' : 'Adds no foraging speed')

function formatPower(power) {
  if (power >= 1e6) return `${(power / 1e6).toFixed(2)}M`
  if (power >= 1e3) return `${(power / 1e3).toFixed(1)}K`
  return `${Math.round(power)}`
}

function formatSpices(value) {
  if (value >= 100) return Math.round(value).toLocaleString()
  if (value >= 10) return value.toFixed(1)
  return value.toFixed(2)
}

function formatChange(change) {
  if (change === null) return 'New'
  const pct = change * 100
  return `${pct >= 0 ? '+' : ''}${Math.abs(pct) >= 100 ? Math.round(pct).toLocaleString() : pct.toFixed(1)}%`
}

// Which recommended genes aren't already on the current team (counting duplicates)
function newGeneSlots(recommended, current) {
  const left = [...current]
  return recommended.map(geneId => {
    const index = left.indexOf(geneId)
    if (index === -1) return true
    left.splice(index, 1)
    return false
  })
}

// ============================================================
// GENE SLOT
// ============================================================

function GeneSlot({ geneId, isNew }) {
  if (geneId === null || geneId === undefined) {
    return <div className="breeding-optimizer-slot breeding-optimizer-slot--empty" />
  }

  return (
    <div className={`breeding-optimizer-slot tooltip-anchor${isNew ? ' breeding-optimizer-slot--new' : ''}`}>
      <img
        src={`images/breeding/GeneReady${geneId}.png`}
        alt={geneName(geneId)}
        className="breeding-gene-img"
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
      <span className="tooltip buff-tooltip">
        <span className="buff-tooltip-name">{geneName(geneId)}</span>
        <span className="buff-tooltip-line">{geneEffect(geneId)}</span>
      </span>
    </div>
  )
}

function Team({ genes, newSlots, variant }) {
  const slots = [...genes]
  while (slots.length < TEAM_SIZE) slots.push(null)

  return (
    <div className={`breeding-optimizer-team breeding-optimizer-team--${variant}`}>
      {slots.map((geneId, i) => (
        <GeneSlot
          key={i}
          geneId={geneId}
          isNew={!!newSlots?.[i]}
        />
      ))}
    </div>
  )
}

// ============================================================
// TERRITORY ROW
// ============================================================

function TerritoryRow({ row }) {
  const spiceKey = `CookingSpice${row.row}`
  const spice = spiceMap[spiceKey]
  const currentGenes = row.currentTeam.filter(geneId => geneId !== null)
  let changeClass = 'breeding-optimizer-change'
  if (row.change === null || row.change > 0.005) changeClass += ' breeding-optimizer-change--up'
  else if (row.change < -0.005) changeClass += ' breeding-optimizer-change--down'

  return (
    <div className={`breeding-optimizer-row${row.changed ? '' : ' breeding-optimizer-row--same'}`}>
      <div className="breeding-optimizer-spice">
        <img
          src={`images/breeding/${spiceKey}.png`}
          alt={spice?.name}
          className="breeding-optimizer-spice-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <span className="breeding-optimizer-spice-name">{spice?.name ?? `Territory ${row.row + 1}`}</span>
      </div>

      <Team
        genes={row.currentTeam}
        variant="current"
      />
      <span className="breeding-optimizer-arrow">→</span>
      <Team
        genes={row.changed ? row.recommendedGenes : row.currentTeam}
        newSlots={row.changed ? newGeneSlots(row.recommendedGenes, currentGenes) : null}
        variant="recommended"
      />

      <div className="breeding-optimizer-numbers">
        {row.changed ? (
          <>
            <span className="breeding-optimizer-spices">
              {formatSpices(row.current)} → {formatSpices(row.recommended)}
            </span>
            <span className={changeClass}>{formatChange(row.change)}</span>
          </>
        ) : (
          <>
            <span className="breeding-optimizer-spices">{formatSpices(row.current)}</span>
            <span className="breeding-optimizer-change">Already best</span>
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================
// MAIN
// ============================================================

export default function SpiceOptimizer({ breeding }) {
  const [claimHours, setClaimHours] = useState(DEFAULT_CLAIM_HOURS)
  const [result, setResult] = useState(null)

  const territories = breeding?.territories
  const ownedPets = breeding?.ownedPets

  // The search takes a second or two, so it runs in a worker to keep the page responsive
  useEffect(() => {
    if (!territories?.length || !ownedPets?.length) return undefined
    const worker = new Worker(new URL('../../utils/spiceOptimizer.worker.js', import.meta.url), { type: 'module' })
    worker.onmessage = event => {
      setResult({
        claimHours,
        territories,
        data: event.data,
      })
    }
    worker.postMessage({
      territories,
      ownedPets,
      claimHours,
    })
    return () => worker.terminate()
  }, [territories, ownedPets, claimHours])

  if (!territories) {
    return (
      <p className="page-empty">
        Re-import your save to use Spice Formations. It needs your territory teams and pets, which older imports don't include.
      </p>
    )
  }

  if (!territories.some(t => t.unlocked)) {
    return <p className="page-empty">No territories unlocked yet. Win your first territory fight to start foraging spices.</p>
  }

  const ready = result && result.claimHours === claimHours && result.territories === territories
  const data = ready ? result.data : null

  return (
    <div className="breeding-optimizer">
      <div className="breeding-optimizer-controls">
        <label className="breeding-optimizer-claim">
          <span>Claim every</span>
          <select
            className="styled-select"
            value={claimHours}
            onChange={e => setClaimHours(Number(e.target.value))}
          >
            {CLAIM_OPTIONS.map(hours => (
              <option key={hours} value={hours}>{hours} hours</option>
            ))}
          </select>
        </label>

        {data && (
          <div className="breeding-optimizer-summary">
            <span className="breeding-optimizer-summary-label">Overall spice gain</span>
            <span className={`breeding-optimizer-summary-value${data.overall < 0.0005 ? ' breeding-optimizer-summary-value--flat' : ''}`}>
              {formatChange(data.overall)}
            </span>
            <span className="breeding-optimizer-summary-note">
              {data.changedCount === 0
                ? 'Every formation is already the best'
                : `${data.changedCount} of ${data.rows.length} formations change`}
            </span>
          </div>
        )}
      </div>

      {data && (
        <p className="breeding-optimizer-note">
          Uses the gene types you own, with every pet at your typical power ({formatPower(data.typicalPower)}).
          Highlighted genes are the ones to swap in.
        </p>
      )}

      {!ready && <p className="page-empty">Finding your best formations…</p>}
      {ready && !data && <p className="page-empty">No foraging pets found in your save yet.</p>}

      {data && (
        <div className="breeding-optimizer-table">
          <div className="breeding-optimizer-row breeding-optimizer-row--header">
            <span className="breeding-optimizer-spice">Spice</span>
            <span className="breeding-optimizer-team--current">Current</span>
            <span className="breeding-optimizer-team--recommended">Best</span>
            <span className="breeding-optimizer-numbers">Spices per day</span>
          </div>
          {data.rows.map(row => (
            <TerritoryRow
              key={row.row}
              row={row}
            />
          ))}
        </div>
      )}
    </div>
  )
}
