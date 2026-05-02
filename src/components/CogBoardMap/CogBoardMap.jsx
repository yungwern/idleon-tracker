import { BOARD_ROWS, BOARD_COLS, COG_PLACEMENTS, COG_BORDER_CLASS } from '../../data'
import './CogBoardMap.css'

// ============================================================
// BUILD BOARD
// ============================================================

function buildBoard() {
  const board = Array.from({ length: BOARD_ROWS * BOARD_COLS }, (_, i) => ({
    row: Math.floor(i / BOARD_COLS),
    col: i % BOARD_COLS,
    cog: 'CogCry2',
    border: COG_BORDER_CLASS.none,
  }))

  for (const { cog, positions, border } of COG_PLACEMENTS) {
    for (const [row, col] of positions) {
      board[row * BOARD_COLS + col] = { row, col, cog, border }
    }
  }

  return board
}

const BOARD = buildBoard()

const LEGEND = [
  { border: COG_BORDER_CLASS.green,   label: 'Row Boosters (Tracked Below)' },
  { border: COG_BORDER_CLASS.garnet,  label: 'Column Boosters (Tracked Below)' },
  { border: COG_BORDER_CLASS.purple,  label: 'Directional Player Construct EXP' },
  { border: COG_BORDER_CLASS.gemshop, label: 'Gem Shop Cog' },
  { border: COG_BORDER_CLASS.white,   label: 'Squire / Divine Knight' },
]

// ============================================================
// SUB-COMPONENTS
// ============================================================

function BoardCell({ cell }) {
  return (
    <div
      className="board-cell"
      style={{ borderColor: cell.border.color }}
    >
      <img src="/images/cogs/CogSq0.png" alt="" className="board-cell-bg" />
      <img
        src={`/images/cogs/${cell.cog}.png`}
        alt={cell.cog}
        className="board-cell-cog"
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CogBoardMap({ hideToggle = false }) {
  return (
    <div className="board-map-wrap">
      <div className="board-map">
        <div
          className="board-grid"
          style={{ gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)` }}
        >
          {BOARD.map((cell, i) => (
            <BoardCell key={i} cell={cell} />
          ))}
        </div>

        <div className="board-legend">
          {LEGEND.map(({ border, label }) => (
            <div key={border.class} className="legend-item">
              <div
                className="legend-swatch"
                style={{ borderColor: border.color }}
              />
              <span className="legend-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}