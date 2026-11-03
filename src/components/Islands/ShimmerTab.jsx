import { DUMMY_TALENT, shimmerTrials, SHIMMER_REQ_TIERS, SHIMMER_WEEKLY_MAX } from '../../data'
import { formatBigNumber } from '../../utils/cogBoardUtils'
import { getShimmerMulti, getShimmerShop } from '../../utils/islandUtils'
import IslandOverview from './IslandOverview'

// Shimmer Island: this week's trial and the score it needs for 1 / 10 / 40 shimmer, shimmer, the shop and every trial

function formatMulti(value) {
  return `${Math.round(value * 100) / 100}x`
}

export default function ShimmerTab({ snapshot, island, notices }) {
  const islands = snapshot.islands
  const shop = getShimmerShop(snapshot)
  const multi = getShimmerMulti(snapshot)
  const bestDps = islands.shimmerBestDps
  const dpsPow = bestDps >= 1 ? Math.floor(Math.log10(bestDps)) : 0
  const trial = shimmerTrials[islands.shimmerTrial]

  return (
    <div className="islands-tab-body">
      <IslandOverview
        snapshot={snapshot}
        island={island}
        notices={notices}
      />

      <div className="islands-card islands-trial">
        <div className="islands-trial-head">
          <span className="islands-trial-label">This week's trial</span>
          <span className="islands-trial-name">{trial?.name ?? 'Unknown'}</span>
          <span className={`islands-trial-done${islands.shimmerDoneThisWeek ? ' islands-good' : ''}`}>
            {islands.shimmerDoneThisWeek ? 'Done this week' : 'Not done this week'}
          </span>
        </div>
        {trial && (
          <div className="islands-trial-reqs">
            {SHIMMER_REQ_TIERS.map((shimmer, i) => (
              <div
                key={shimmer}
                className={`islands-trial-req${shimmer === SHIMMER_WEEKLY_MAX ? ' islands-trial-req--max' : ''}`}
              >
                <span className="islands-trial-req-score">{trial.req[i]}</span>
                <span className="islands-trial-req-label">
                  <img
                    className="islands-shimmer-cost-icon"
                    src="images/islands/Shimmer_Currency.png"
                    alt=""
                  />
                  {shimmer} shimmer{shimmer === SHIMMER_WEEKLY_MAX && ' (weekly max)'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="islands-summary">
        <div className="islands-stat">
          <img
            className="islands-stat-icon islands-stat-icon--small"
            src="images/islands/Shimmer_Currency.png"
            alt=""
          />
          <span className="islands-stat-value">{islands.shimmer.toLocaleString()}</span>
          <span className="islands-stat-label">Shimmer</span>
        </div>
        <div className="islands-stat tooltip-anchor">
          <span className="islands-stat-value">{formatMulti(multi)}</span>
          <span className="islands-stat-label">Shim Lantern</span>
          <div className="tooltip tooltip--wrap islands-tooltip">
            The Shim Lantern sailing artifact multiplies every Shimmer bonus (2x, then +1x per higher form, max 4x).
          </div>
        </div>
        <div className="islands-stat tooltip-anchor">
          <span className="islands-stat-value">{formatBigNumber(bestDps)}</span>
          <span className="islands-stat-label">Best DPS ever (POW {dpsPow})</span>
          <div className="tooltip tooltip--wrap islands-tooltip">
            {DUMMY_TALENT.name}: {DUMMY_TALENT.desc}.
          </div>
        </div>
      </div>

      <div className="islands-card">
        <h3 className="islands-card-title">Shimmer shop</h3>
        <div className="islands-shop">
          {shop.map(item => (
            <div
              key={item.name}
              className={`islands-shimmer-row${islands.shimmer >= item.cost ? ' islands-shimmer-row--affordable' : ''}`}
            >
              <img
                className="islands-shop-icon"
                src={item.img}
                alt=""
              />
              <span className="islands-shop-name">
                {item.name}
                <span className="islands-shop-sub">
                  LV {item.level}{multi > 1 && ` × ${formatMulti(multi)} Shim Lantern`}
                </span>
              </span>
              <span className="islands-shimmer-total">
                +{(Math.round(item.bonus * 100) / 100).toLocaleString()}{item.unit}
              </span>
              <span className="islands-shimmer-cost">
                <img
                  className="islands-shimmer-cost-icon"
                  src="images/islands/Shimmer_Currency.png"
                  alt=""
                />
                {item.cost}
              </span>
            </div>
          ))}
        </div>
        <p className="islands-card-note">Cost = 1 + one more shimmer every few levels.</p>
      </div>

      <details className="dropdown-panel">
        <summary className="dropdown-panel-head">
          <span className="dropdown-panel-title">All trials</span>
          <span className="dropdown-panel-stat">{shimmerTrials.length} trials</span>
        </summary>
        <div className="dropdown-panel-body">
          <p className="islands-card-note islands-trials-note">
            Your save only says which trial is on this week, not how the next one is picked, so this list isn't a schedule.
          </p>
          <ol className="islands-trials">
            {shimmerTrials.map((entry, i) => (
              <li
                key={entry.name}
                className={i === islands.shimmerTrial ? 'islands-trials-current' : ''}
              >
                <span className="islands-trials-name">{entry.name}</span>
                <span className="islands-trials-max">{entry.req[SHIMMER_REQ_TIERS.indexOf(SHIMMER_WEEKLY_MAX)]} for {SHIMMER_WEEKLY_MAX}</span>
              </li>
            ))}
          </ol>
        </div>
      </details>
    </div>
  )
}
