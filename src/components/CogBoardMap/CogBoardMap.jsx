import { BOARD_ROWS, BOARD_COLS, COG_PLACEMENTS, COG_BORDER_CLASS } from '../../data'
import {
  getCogDisplayName,
  getCogBorder,
  getCogImage,
  formatBigNumber,
  COG_PATTERN_LABELS,
} from '../../utils/cogBoardUtils'
import './CogBoardMap.css'

// ============================================================
// BUILD BOARDS
// ============================================================

function buildOptimalBoard() {
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

const OPTIMAL_BOARD = buildOptimalBoard()

function buildUserBoard(board, highlights) {
  return board.map(cell => ({
    ...cell,
    highlight: highlights[cell.index] ?? null,
    cog: getCogImage(cell.name),
    border: getCogBorder(cell),
    displayName: getCogDisplayName(cell.name),
    isPlayer: cell.name.startsWith('Player_'),
    total: cell.bonusConstructExp + cell.playerConstructExp,
  }))
}

const LEGEND = [
  { border: COG_BORDER_CLASS.green,   label: 'Row Boosters' },
  { border: COG_BORDER_CLASS.garnet,  label: 'Column Boosters' },
  { border: COG_BORDER_CLASS.purple,  label: 'Directional Player Construct EXP' },
  { border: COG_BORDER_CLASS.gemshop, label: 'Gem Shop Cog' },
  { border: COG_BORDER_CLASS.white,   label: 'Squire / Divine Knight' },
]

// Compare tool highlights — keyed by board index, passed in by Construction
const HIGHLIGHT_NOTES = {
  replace: 'Gets replaced by the new cog',
  'cant-beat': 'Your weakest slot of this type',
  new: 'Swapped in by Compare New Cog',
}

// Keeps edge tooltips from running off the board
function tooltipSide(col) {
  if (col <= 1) return 'board-tooltip-left'
  if (col >= BOARD_COLS - 2) return 'board-tooltip-right'
  return ''
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function CellArt({ cell }) {
  return (
    <>
      <img src="images/construction/CogSq0.png" alt="" className="board-cell-bg" />
      {cell.cog && (
        <img
          src={`images/construction/${cell.cog}.png`}
          alt={cell.displayName ?? cell.cog}
          className="board-cell-cog"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      )}
    </>
  )
}

function OptimalCell({ cell }) {
  return (
    <div className={`board-cell ${cell.border.class}`}>
      <CellArt cell={cell} />
    </div>
  )
}

function UserCell({ cell }) {
  const expLabel = cell.isPlayer
    ? (cell.buildRate > 0 ? formatBigNumber(cell.buildRate) : null)
    : (cell.total > 0 ? `+${cell.total}%` : null)

  return (
    <div className="tooltip-anchor board-cell-anchor">
      <div className={`board-cell ${cell.border.class} ${cell.highlight ? `board-cell-highlight-${cell.highlight}` : ''}`}>
        <CellArt cell={cell} />
        {expLabel && (
          <span className={`board-cell-exp ${cell.isPlayer ? 'board-cell-exp-player' : ''}`}>
            {expLabel}
          </span>
        )}
      </div>

      {cell.name !== 'Blank' && (
        <div className={`tooltip board-tooltip ${tooltipSide(cell.col)}`}>
          <div className="board-tooltip-name">{cell.displayName}</div>
          {cell.isPlayer ? (
            <>
              <div>{formatBigNumber(cell.buildRate)} Build Rate/hr</div>
              <div>{formatBigNumber(cell.expPerHour)} Construct EXP/hr</div>
            </>
          ) : (
            <>
              {cell.bonusConstructExp > 0 && (
                <div>+{cell.bonusConstructExp}% Bonus Construct EXP</div>
              )}
              {cell.playerConstructExp > 0 && (
                <div>+{cell.playerConstructExp}% Player Construct XP</div>
              )}
              {cell.total === 0 && (
                <div className="board-tooltip-muted">No EXP bonus</div>
              )}
            </>
          )}
          {cell.pattern && COG_PATTERN_LABELS[cell.pattern] && (
            <div className="board-tooltip-muted">{COG_PATTERN_LABELS[cell.pattern]}</div>
          )}
          {cell.highlight && (
            <div className={`board-tooltip-note-${cell.highlight}`}>{HIGHLIGHT_NOTES[cell.highlight]}</div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

// No `board` prop → Optimal Cog Layout. Pass snapshot.construction.board → the player's real board;
// `highlights` ({ boardIndex: 'replace' | 'cant-beat' | 'new' }) marks cells for the compare tool.
export default function CogBoardMap({ board = null, highlights = {}, title = null }) {
  const cells = board ? buildUserBoard(board, highlights) : OPTIMAL_BOARD

  return (
    <div className="board-map-wrap">
      <div className="board-map">
        {title && <div className="board-map-title">{title}</div>}

        <div className="board-grid">
          {cells.map((cell, i) => (
            board
              ? <UserCell key={i} cell={cell} />
              : <OptimalCell key={i} cell={cell} />
          ))}
        </div>

        <div className="board-legend">
          {LEGEND.map(({ border, label }) => (
            <div key={border.class} className="legend-item">
              <div className={`legend-swatch ${border.class}`} />
              <span className="legend-label">{label}</span>
            </div>
          ))}
          {board && (
            <div className="legend-item">
              <span className="legend-label">
                Cells show Bonus + Player Construct EXP %. Characters show Build Rate/hr. Hover a cog for the breakdown.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
