import { getTemple } from '../../utils/holeCavernUtils'
import { formatHoleNumber } from '../../utils/holeUtils'

// The Temple (cavern 15): torches, the Sanctum you're on, and the three torch buys like the in-game boxes
// (bonus as the big number, LV and cost along the bottom).

export default function TemplePanel({ snapshot, lead }) {
  const temple = getTemple(snapshot)
  const extraTorches = 1 + Math.floor(temple.extraTorchChance / 100)

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Sanctum</span>
          <span className="hole-stat-card-value">{temple.sanctum}</span>
          <span className="hole-stat-card-hint">The Temple layer you're on.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">
            <img
              className="hole-inline-icon"
              src="images/hole/temple/torch.png"
              alt=""
            />
            Torches
          </span>
          <span className="hole-stat-card-value">{formatHoleNumber(temple.torches)}</span>
          <span className="hole-stat-card-hint">Dropped by Ancient Golems.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Extra torch chance</span>
          <span className="hole-stat-card-value">{formatHoleNumber(temple.extraTorchChance)}%</span>
          <span className="hole-stat-card-hint">
            Each pickup gives {extraTorches} or {extraTorches + 1}x torches (Bell, Temple study, Roaring Flame).
          </span>
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Torch upgrades</h3>
        <div className="hole-temple-buys">
          {temple.buys.map(buy => (
            <div
              key={buy.index}
              className="hole-temple-buy"
            >
              <span className="hole-temple-buy-name">{buy.name}</span>
              <span className="hole-temple-buy-value">{buy.value}</span>
              <span className="hole-temple-buy-label">{buy.label}</span>
              <div className="hole-temple-buy-foot">
                <span className={`hole-temple-buy-level${buy.level == null ? ' hole-temple-buy-level--note' : ''}`}>
                  {buy.level != null ? `LV ${buy.level.toLocaleString()}` : '¼ of your torches'}
                </span>
                <span className={`hole-temple-buy-cost${buy.affordable ? ' hole-temple-buy-cost--ok' : ''}`}>
                  {formatHoleNumber(buy.cost)}
                  <img
                    className="hole-temple-buy-torch"
                    src="images/hole/temple/torch.png"
                    alt="torches"
                  />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
