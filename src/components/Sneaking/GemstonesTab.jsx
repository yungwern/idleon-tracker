import { getGemstones, formatSneakingNumber } from '../../utils/sneakingUtils'

// Sneaking > Gemstones: each gem's counter (OptLacc[233 + i]) and bonus. The bar fills toward the bonus at a
// full 10M counter; breakpoints mark where the counter-driven part reaches 50% ... 99.9% of itself.
function bonusText(gem, value) {
  return gem.isFlat ? `+${formatSneakingNumber(value)}` : `${formatSneakingNumber(value)}%`
}

function shareLabel(share) {
  return `${Math.round(share * 1000) / 10}%`
}

export default function GemstonesTab({ snapshot }) {
  const gems = getGemstones(snapshot)
  return (
    <div className="sneaking-gems">
      {gems.map(gem => (
        <div
          key={gem.index}
          className={`sneaking-gem${gem.unlocked ? '' : ' sneaking-card--locked'}`}
        >
          <div className="sneaking-card-top">
            <span className="sneaking-card-icon-box">
              <img
                className="sneaking-card-icon"
                src={`images/sneaking/${gem.img}.png`}
                alt=""
              />
            </span>
            <span className="sneaking-card-name">{gem.name}</span>
            <span className="sneaking-gem-counter">{formatSneakingNumber(gem.counter)} gems</span>
          </div>
          <p className="sneaking-card-desc">{gem.label}</p>
          <div
            className="sneaking-gem-bar"
            style={{ '--gem-percent': `${gem.percent}%` }}
          >
            <div className="sneaking-gem-bar-fill" />
            {gem.breakpoints.map(point => (
              <span
                key={point.share}
                className={`sneaking-gem-tick${point.reached ? ' sneaking-gem-tick--reached' : ''}`}
                style={{ '--tick-at': `${point.percent}%` }}
              />
            ))}
          </div>
          <div className="sneaking-gem-values">
            <span>{bonusText(gem, gem.displayBonus)}</span>
            <span className="sneaking-gem-max">Max {bonusText(gem, gem.displayMaxBonus)}</span>
          </div>
          <div className="milestone-row sneaking-gem-breakpoints">
            {gem.breakpoints.map(point => (
              <span
                key={point.share}
                className={`milestone tooltip-anchor${point.reached ? ' milestone--reached' : ''}`}
              >
                {shareLabel(point.share)}
                <span className="tooltip">
                  {formatSneakingNumber(point.counter)} gems: {bonusText(gem, point.displayBonus)}
                </span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
