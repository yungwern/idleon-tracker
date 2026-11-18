import { useState } from 'react'
import { getPalette } from '../../utils/gamingBonusUtils'
import { PALETTE_HEX_POSITIONS, formatGamingNumber } from '../../utils/gamingUtils'
import PaletteLuckPanel from './PaletteLuckPanel'

// Palette tab: Palette Luck dropdown, then the game's hex board (or cards). Selected slots are ringed orange,
// the suggested colours (fastest to level, one per slot) yellow. Colours at a hidden cap are striped but
// can still be suggested: their LVs keep counting toward total palette LVs. Black Stars show as the game's
// sprite on each side of the LV.

const HEX = 64

function odds(chance) {
  return chance > 0 ? `1 in ${formatGamingNumber(Math.round(1 / chance))}` : null
}

const minX = Math.min(...PALETTE_HEX_POSITIONS.map(p => p.x))
const minY = Math.min(...PALETTE_HEX_POSITIONS.map(p => p.y))
const BOARD_WIDTH = Math.max(...PALETTE_HEX_POSITIONS.map(p => p.x)) - minX + HEX
const BOARD_HEIGHT = Math.max(...PALETTE_HEX_POSITIONS.map(p => p.y)) - minY + HEX

function BlackStar() {
  return (
    <img
      className="gaming-hex-star"
      src="images/gaming/BlackStar.png"
      alt="Black Star"
    />
  )
}

function ColourTags({ colour }) {
  return (
    <>
      {colour.active && <span className="gaming-pill gaming-pill--active">Selected</span>}
      {colour.suggested && <span className="gaming-pill gaming-pill--suggested">Suggested</span>}
      {colour.capped && <span className="gaming-pill gaming-pill--missing">At hidden cap</span>}
    </>
  )
}

function ColourDetails({ colour }) {
  return (
    <>
      <span className="gaming-colour-text">{colour.level > 0 ? colour.text : 'Not unlocked yet'}</span>
      {colour.chance > 0 && (
        <span className="gaming-muted">
          {colour.level > 0 ? 'Next LV' : 'Unlock'}: {odds(colour.chance)} per roll
        </span>
      )}
      {colour.blackStars > 0 && (
        <span className="gaming-muted">
          {colour.blackStars} Black Star{colour.blackStars > 1 ? 's' : ''}: {colour.blackStarMulti}x
        </span>
      )}
      {colour.nextStarText && colour.blackStars === 0 && (
        <span className="gaming-muted">With a Black Star: {colour.nextStarText}</span>
      )}
      {colour.doubler && (
        <span className={colour.doubler.owned ? 'gaming-good' : 'gaming-muted'}>
          {colour.doubler.name} superbit: {colour.doubler.owned ? '2x (owned)' : '2x when bought'}
        </span>
      )}
      {colour.cap && (
        <span className={colour.capped ? 'gaming-short' : 'gaming-muted'}>
          Hidden cap: shares a {colour.cap.cap}% cap with {colour.cap.with}
          {' '}({formatGamingNumber(colour.cap.total)}% now{colour.capped ? ': this bonus is maxed, but LVs still count toward total palette LVs' : ''})
        </span>
      )}
    </>
  )
}

export default function PaletteTab({ snapshot, tomePoints }) {
  const [view, setView] = useState('board')
  const palette = getPalette(snapshot, tomePoints)

  return (
    <div className="gaming-body">
      <PaletteLuckPanel luck={palette.luck} />

      <div className="gaming-summary gaming-summary--left">
        <div className="gaming-stat">
          <span className="gaming-stat-value">{palette.totalLevels.toLocaleString('en-US')}</span>
          <span className="gaming-stat-label">Total colour LVs</span>
        </div>
        <div className="gaming-stat">
          <span className="gaming-stat-value">{palette.slotCount}</span>
          <span className="gaming-stat-label">Selected slots</span>
        </div>
        {palette.blackStarsPlaced > 0 && (
          <div className="gaming-stat">
            <img
              className="gaming-stat-icon"
              src="images/gaming/BlackStar.png"
              alt=""
            />
            <span className="gaming-stat-value">{palette.blackStarsPlaced}</span>
            <span className="gaming-stat-label">Black Stars placed</span>
          </div>
        )}
      </div>

      <div className="gaming-toolbar">
        <div className="segmented-control">
          {[['board', 'Board'], ['cards', 'Cards']].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`segmented-control-btn${view === id ? ' segmented-control-btn--active' : ''}`}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="gaming-legend">
          <span className="gaming-legend-swatch gaming-legend-swatch--active" />Selected
          <span className="gaming-legend-swatch gaming-legend-swatch--suggested" />
          <span className="tooltip-anchor">
            Suggested<span className="info-icon" />
            <span className="tooltip tooltip--wrap">
              The {palette.slotCount === 1 ? 'colour' : `${palette.slotCount} colours`} most likely to level up per
              roll, one per selected slot. Capped colours can still be suggested: their bonus is maxed, but every
              LV still counts toward total palette LVs (Colourful Luck and other total-LV bonuses).
            </span>
          </span>
          <span className="gaming-legend-swatch gaming-legend-swatch--capped" />At hidden cap
        </span>
      </div>

      {view === 'board' ? (
        <div className="gaming-board-wrap">
          <div
            className="gaming-board"
            style={{ '--board-w': `${BOARD_WIDTH}px`, '--board-h': `${BOARD_HEIGHT}px` }}
          >
            {palette.colours.map(colour => {
              const pos = PALETTE_HEX_POSITIONS[colour.index]
              const owned = colour.level > 0
              const ring = colour.active ? ' gaming-hex--active' : colour.suggested ? ' gaming-hex--suggested' : ''
              return (
                <div
                  key={colour.index}
                  className={`gaming-hex tooltip-anchor${owned ? '' : ' gaming-hex--locked'}${colour.capped ? ' gaming-hex--capped' : ''}${ring}`}
                  style={{
                    '--hex-x': `${pos.x - minX}px`,
                    '--hex-y': `${pos.y - minY}px`,
                    '--hex-rgb': colour.rgb.join(', '),
                  }}
                >
                  <span className="gaming-hex-fill">
                    {owned && (
                      <span className="gaming-hex-level-row">
                        {colour.blackStars >= 1 && <BlackStar />}
                        <span className="gaming-hex-level">{colour.level}</span>
                        {colour.blackStars >= 2 && <BlackStar />}
                      </span>
                    )}
                    {colour.chance > 0 && <span className="gaming-hex-odds">{odds(colour.chance)}</span>}
                  </span>
                  <span className="tooltip tooltip--wrap gaming-tooltip">
                    <span className="gaming-tooltip-body">
                      <span className="gaming-tooltip-title">
                        {colour.name}{owned ? ` · LV ${colour.level}` : ''}
                        {' '}<ColourTags colour={colour} />
                      </span>
                      <ColourDetails colour={colour} />
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="gaming-card-grid">
          {palette.colours.map(colour => (
            <div
              key={colour.index}
              className={`gaming-card gaming-colour-card${colour.level > 0 ? '' : ' gaming-card--dim'}${colour.active ? ' gaming-card--active' : ''}`}
              style={{ '--hex-rgb': colour.rgb.join(', ') }}
            >
              <div className="gaming-card-title">
                <span className="gaming-colour-swatch" />
                {colour.name}
                <ColourTags colour={colour} />
                <span className="gaming-card-stat">{colour.level > 0 ? `LV ${colour.level}` : ''}</span>
              </div>
              <div className="gaming-colour-details">
                <ColourDetails colour={colour} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
