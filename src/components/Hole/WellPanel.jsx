import { getWell, WELL_BAR_TIERS } from '../../utils/holeCavernUtils'
import { formatHoleNumber, getHoleResourceImage } from '../../utils/holeUtils'

// The Well (cavern 1): Gravel → opal trade, the buckets (what each fills, golden ones) and one bar per sediment.
// Bars are drawn top to bottom like the game (last sediment first). The outline colour shows bar expansions:
// each colour grows across the outline as the bar gets expanded (WELL_BAR_TIERS, ends on green).

// In-game bucket order, left to right: 9, 7, 5, 3, 1 | 2, 4, 6, 8, 10 (1st bucket just left of the sign)
function getBucketOrder(count) {
  const left = []
  const right = []
  for (let i = 0; i < count; i++) {
    if (i % 2 === 0) left.unshift(i)
    else right.push(i)
  }
  return [...left, ...right]
}

export default function WellPanel({ snapshot, lead }) {
  const well = getWell(snapshot)
  const buckets = getBucketOrder(well.buckets.length).map(i => well.buckets[i])
  const sediments = [...well.sediments].reverse()

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Next opal (trade {well.sediments[0].name})</span>
          <span className={`hole-stat-card-value hole-cost${well.gravel >= well.opalCost ? ' hole-cost--ok' : ''}`}>
            <img
              className="hole-cost-icon hole-cost-icon--big"
              src={getHoleResourceImage(0)}
              alt=""
            />
            {formatHoleNumber(well.gravel)} / {formatHoleNumber(well.opalCost)}
          </span>
          <span className="hole-stat-card-hint">The price goes up with every opal you trade for.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Fill rate (all buckets)</span>
          <span className="hole-stat-card-value">{formatHoleNumber(well.totalRate)} / hr</span>
          <span className="hole-stat-card-hint">
            Golden buckets fill {formatHoleNumber(well.goldenMulti)}x faster (Fountain Golden Bucket Boost).
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Bar expansions</span>
          <span className="hole-stat-card-value">{well.expansions.toLocaleString()}</span>
          <span className="hole-stat-card-hint">Expand Full Bars: {well.expandWhenFull ? 'On' : 'Off'}</span>
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">
          Buckets
          <span className="hole-card-title-stat">{well.buckets.length} buckets</span>
        </h3>
        <div className="hole-well-buckets">
          {buckets.map(bucket => (
            <div
              key={bucket.index}
              className="hole-well-bucket tooltip-anchor"
            >
              <img
                className="hole-well-bucket-img"
                src={`images/hole/well/bucket${bucket.golden ? '-gold' : ''}-${bucket.rocks ? 'rocks' : bucket.sediment}.png`}
                alt=""
              />
              <span className="hole-well-bucket-rate">{formatHoleNumber(bucket.rate)}/hr</span>
              <span className="tooltip tooltip--wrap hole-tooltip">
                <span className="hole-tooltip-title">Bucket {bucket.index + 1}{bucket.golden ? ' (golden)' : ''}</span>
                <span className="hole-tooltip-text">
                  {bucket.rocks ? 'Digging through the rock layer' : `Filling ${bucket.sedimentName}`}
                  {' '}at {formatHoleNumber(bucket.rate)} / hr
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Sediments</h3>
        <div className="hole-well-bars">
          {sediments.map(sediment => (
            <div
              key={sediment.index}
              className="hole-well-row"
            >
              <img
                className="hole-well-icon"
                src={getHoleResourceImage(sediment.index)}
                alt=""
              />
              <span className="hole-well-name">{sediment.name}</span>
              <span className="hole-well-amount">
                {sediment.locked
                  ? `${formatHoleNumber(-sediment.current)} rock`
                  : `${formatHoleNumber(sediment.current)}/${formatHoleNumber(sediment.max)}`}
              </span>
              <div
                className={`hole-well-bar tooltip-anchor hole-well-bar--new-${WELL_BAR_TIERS[sediment.tier]} hole-well-bar--old-${WELL_BAR_TIERS[sediment.previous]}`}
                style={{
                  '--well-outline': `${Math.round(sediment.fill * 100)}%`,
                  '--well-fill': `${sediment.locked ? 0 : Math.min(100, Math.round((sediment.current / sediment.max) * 100))}%`,
                }}
              >
                <div className="hole-well-bar-inner">
                  <div className={`hole-well-bar-fill hole-well-sedi--${sediment.index}`} />
                </div>
                <span className="tooltip tooltip--wrap hole-tooltip">
                  <span className="hole-tooltip-title">{sediment.name}</span>
                  <span className="hole-tooltip-text">
                    {sediment.expansions} bar expansions ({WELL_BAR_TIERS[sediment.tier]} outline
                    {sediment.tier === sediment.previous ? ', complete' : ` ${Math.round(sediment.fill * 100)}% of the way`})
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
