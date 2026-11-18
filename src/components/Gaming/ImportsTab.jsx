import { getImports } from '../../utils/gamingBonusUtils'
import { formatBits, getBitsImage, formatGamingNumber, formatGamingDuration } from '../../utils/gamingUtils'
import SnailPlanner from './SnailPlanner'

// Imports tab: one card per garden import (timers count on from the save),
// then the Immortal Snail odds

function BitsCost({ cost, have }) {
  return (
    <span className={`gaming-cost ${cost <= have ? 'gaming-good' : 'gaming-short'}`}>
      {formatBits(cost)}
      <img
        className="gaming-bits-icon"
        src={getBitsImage(cost)}
        alt="bits"
      />
    </span>
  )
}

function FactValue({ value }) {
  if (value && typeof value === 'object' && 'seconds' in value) return formatGamingDuration(value.seconds)
  if (value && typeof value === 'object' && 'countdown' in value) return formatGamingDuration(value.countdown)
  return value
}

function ShopTable({ shop }) {
  return (
    <div className="gaming-shop">
      <div className="gaming-shop-head">
        <span>Upgrade</span>
        <span>LV</span>
        <span>Next ({shop.currency})</span>
      </div>
      {shop.rows.map(row => (
        <div
          key={row.label ?? row.name}
          className="gaming-shop-row"
        >
          <span className="gaming-shop-name">
            {row.label && <strong>{row.label}</strong>}
            {row.name}
          </span>
          <span>{formatGamingNumber(row.level)}</span>
          <span className="gaming-shop-cost">
            {formatGamingNumber(Math.ceil(row.cost))}
            {row.hoursToAfford !== undefined && row.hoursToAfford !== null && (
              <span className={row.hoursToAfford === 0 ? 'gaming-good' : 'gaming-muted'}>
                {row.hoursToAfford === 0 ? 'affordable' : `in ${formatGamingDuration(row.hoursToAfford * 3600)}`}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ImportsTab({ snapshot, now }) {
  const bits = snapshot.gaming.bits
  const imports = getImports(snapshot, now)
  const snail = imports.find(item => item.snail)?.snail

  return (
    <div className="gaming-body">
      <section>
        <div className="gaming-group-label">Imports</div>
        <div className="gaming-card-grid">
          {imports.map(item => (
            <div
              key={item.index}
              className={`gaming-card${item.owned ? '' : ' gaming-card--dim'}`}
            >
              <div className="gaming-import-head">
                <img
                  className="gaming-import-img"
                  src={`images/gaming/${item.image}.png`}
                  alt=""
                />
                <div className="gaming-import-head-text">
                  <div className="gaming-card-title">
                    {item.name}
                    <span className="gaming-card-stat">{item.owned ? `LV ${formatGamingNumber(item.level)}` : 'Not bought'}</span>
                  </div>
                  <div className="gaming-muted gaming-small">{item.boxName}</div>
                </div>
              </div>
              {item.majorLines.map(line => (
                <p
                  key={line}
                  className="gaming-text"
                >
                  {line}
                </p>
              ))}
              <p className="gaming-text gaming-text--accent">{item.minorText}</p>

              {item.facts.length > 0 && (
                <div className="gaming-facts">
                  {item.facts.map(fact => (
                    <div
                      key={fact.label}
                      className={`gaming-fact${fact.tip ? ' tooltip-anchor' : ''}`}
                    >
                      <span className="gaming-fact-label">{fact.label}{fact.tip && <span className="info-icon" />}</span>
                      <span className="gaming-fact-value"><FactValue value={fact.value} /></span>
                      {fact.tip && <span className="tooltip tooltip--wrap">{fact.tip}</span>}
                    </div>
                  ))}
                </div>
              )}

              {item.shell && item.shell.next !== null && (
                <div className="gaming-progress">
                  <div className="gaming-progress-track">
                    <div
                      className="gaming-progress-fill"
                      style={{ '--progress': `${(item.shell.progress * 100).toFixed(2)}%` }}
                    />
                  </div>
                  <span className="gaming-progress-label">
                    {formatGamingNumber(item.shell.evolved)} / {formatGamingNumber(item.shell.next)} evolved
                    {' '}({formatGamingNumber(Math.floor(item.shell.progress * 1000) / 10)}%)
                  </span>
                </div>
              )}
              {item.shell && item.shell.next === null && (
                <p className="gaming-text gaming-text--note">Past rank 45 the next requirement isn't known yet.</p>
              )}

              {item.snail && (
                <p className="gaming-text gaming-text--note">Odds at every encouragement: see the Immortal Snail table below.</p>
              )}

              {item.shop && <ShopTable shop={item.shop} />}

              <div className="gaming-card-foot">
                <span className="gaming-muted">{item.owned ? 'Next LV' : 'Buy'}</span>
                <BitsCost
                  cost={item.cost}
                  have={bits}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {snail && <SnailPlanner snail={snail} />}
    </div>
  )
}
