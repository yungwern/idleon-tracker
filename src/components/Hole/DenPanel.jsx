import { getDen } from '../../utils/holeCavernUtils'
import { formatHoleNumber } from '../../utils/holeUtils'

// The Den (cavern 3): best score, next opal, the score multi and every amplifier's charge, with a recommended
// setup (Eli's charges at a 7.16B best score) to start from.

export default function DenPanel({ snapshot, lead }) {
  const den = getDen(snapshot)
  const matches = den.amps.filter(amp => amp.level === amp.recommended).length

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">
            <img
              className="hole-inline-icon"
              src="images/hole/den/best.png"
              alt=""
            />
            Best score
          </span>
          <span className="hole-stat-card-value">{formatHoleNumber(den.bestScore)}</span>
          <span className="hole-stat-card-hint">Next opal at {formatHoleNumber(den.nextOpal)}</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Current multi</span>
          <span className="hole-stat-card-value">{den.multi.toFixed(2)}x</span>
          <span className="hole-stat-card-hint">Each amplifier charge raises the score multi.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Amplifiers unlocked</span>
          <span className="hole-stat-card-value">{den.ampsOwned} / {den.amps.length}</span>
          <span className="hole-stat-card-hint">More come from Engineer schematics.</span>
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">
          Amplifiers
          <span className="hole-card-title-stat">{matches} / {den.amps.length} match the recommended setup</span>
        </h3>
        <p className="hole-text hole-text--note">
          Recommended setup = a late-game run at a 7.16B best score. It's only a starting point for higher levels:
          tweak the charges to fit your account and the character you bring.
        </p>
        <div className="hole-den-amps">
          {den.amps.map(amp => (
            <div
              key={amp.index}
              className={`hole-den-amp${amp.owned ? '' : ' hole-den-amp--locked'}`}
            >
              <img
                className="hole-den-amp-icon"
                src={`images/hole/den/amp${amp.index}.png`}
                alt=""
              />
              <div className="hole-den-amp-body">
                <div className="hole-den-amp-head">
                  <span className="hole-list-name">{amp.name}</span>
                  <span className="hole-list-level">{amp.level} / {amp.max}</span>
                </div>
                <span className="hole-list-text">{amp.text}</span>
                <span className={`hole-den-amp-rec${amp.level === amp.recommended ? ' hole-den-amp-rec--ok' : ''}`}>
                  {amp.level === amp.recommended ? `Recommended ${amp.recommended} ✓` : `Recommended: ${amp.recommended}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
