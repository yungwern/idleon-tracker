import { obolByRawName } from '../../data'
import { isUpgraded } from './ObolUtils'
import './ObolBoard.css'

// ── Obol Slot ─────────────────────────────────────────────────────────────────

function formatUQ(txt, val) {
  if (!txt || !val) return null
  const hasPercent = txt.startsWith('%')
  let label = txt.replace(/^%_?|^_/, '').replace(/_/g, ' ')
  // Normalize game inconsistency: DROP CHANCE and DROP RATE are the same thing
  label = label.replace(/DROP CHANCE/i, 'DROP RATE')
  return hasPercent ? `${label}: +${val}%` : `${label}: +${val}`
}

// Stat colors live in ObolBoard.css (obol-tooltip-stat-chip--str, etc.)
function StatChip({ label, value }) {
  return (
    <span className={`obol-tooltip-stat-chip obol-tooltip-stat-chip--${label.toLowerCase()}`}>
      {label} +{value}
    </span>
  )
}

export function ObolSlot({ rawName, stoneData, size = 'md' }) {
  if (!rawName || rawName === 'Blank') {
    return <div className={`obol-slot obol-slot--empty obol-slot--${size}`} />
  }
  const entry = obolByRawName[rawName]
  const upgraded = stoneData !== undefined ? isUpgraded(stoneData) : false

  // Base stat chips
  const statChips = ['STR', 'AGI', 'WIS', 'LUK'].filter(s => entry?.[s] > 0)
  const otherStats = [
    entry?.def  > 0 && `DEF +${entry.def}`,
    entry?.wp   > 0 && `WP +${entry.wp}`,
  ].filter(Boolean)

  // Skill power
  const skillLines = entry?.skillPower
    ? Object.entries(entry.skillPower).filter(([, v]) => v > 0).map(([k, v]) => `${k} Power: ${v}`)
    : []

  // Unique bonuses
  const uqLines = [
    formatUQ(entry?.uq1, entry?.uq1val),
    formatUQ(entry?.uq2, entry?.uq2val),
  ].filter(Boolean)

  // Reroll bonuses
  const rerollLines = stoneData && typeof stoneData === 'object' ? [
    stoneData.STR  > 0 && `STR +${stoneData.STR} 🎲`,
    stoneData.AGI  > 0 && `AGI +${stoneData.AGI} 🎲`,
    stoneData.WIS  > 0 && `WIS +${stoneData.WIS} 🎲`,
    stoneData.LUK  > 0 && `LUK +${stoneData.LUK} 🎲`,
    stoneData.UQ1txt && stoneData.UQ1val > 0 && formatUQ(stoneData.UQ1txt, stoneData.UQ1val) + ' 🎲',
    stoneData.UQ2txt && stoneData.UQ2val > 0 && formatUQ(stoneData.UQ2txt, stoneData.UQ2val) + ' 🎲',
  ].filter(Boolean) : []

  return (
    <div className={`obol-slot obol-slot--${size} tooltip-anchor${upgraded ? ' obol-slot--upgraded' : ''}`}>
      <img
        src={`images/obols/${rawName}.png`}
        alt={entry?.name ?? rawName}
        className="obol-slot-img"
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
      <div className="obol-tooltip">
        <span className="obol-tooltip-name">{entry?.name ?? rawName}</span>
        {(statChips.length > 0 || otherStats.length > 0) && (
          <div className="obol-tooltip-stat-row">
            {statChips.map(s => <StatChip key={s} label={s} value={entry[s]} />)}
            {otherStats.map((s, i) => <span key={i} className="obol-tooltip-stat">{s}</span>)}
          </div>
        )}
        {skillLines.map((s, i) => <span key={i} className="obol-tooltip-stat">{s}</span>)}
        {uqLines.map((s, i) => <span key={i} className="obol-tooltip-stat">{s}</span>)}
        {rerollLines.map((s, i) => <span key={i} className={`obol-tooltip-stat obol-tooltip-reroll${i === 0 ? ' obol-tooltip-reroll--first' : ''}`}>{s}</span>)}
      </div>
    </div>
  )
}

// ── Account Board ─────────────────────────────────────────────────────────────
const ACCOUNT_BOARD_ROWS = [5, 5, 4, 5, 5]

function buildAccountRows(slots) {
  const rows = []
  let idx = 0
  for (const count of ACCOUNT_BOARD_ROWS) {
    rows.push(slots.slice(idx, idx + count))
    idx += count
  }
  return rows
}

export function AccountBoard({ slots, stoneDataMap = {} }) {
  const rows = buildAccountRows(slots)
  return (
    <div className="obol-board">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className={`obol-board-row${row.length === 4 ? ' obol-board-row--centered' : ''}`}
        >
          {row.map((rawName, slotIdx) => {
            const globalIdx = ACCOUNT_BOARD_ROWS.slice(0, rowIdx).reduce((a, b) => a + b, 0) + slotIdx
            return (
              <ObolSlot
                key={slotIdx}
                rawName={rawName}
                stoneData={stoneDataMap[globalIdx]}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Character Board ───────────────────────────────────────────────────────────
const CHAR_BOARD_ROWS = [3, 2, 2, 2, 3, 2, 2, 2, 3]

function buildCharRows(slots) {
  const rows = []
  let idx = 0
  for (const count of CHAR_BOARD_ROWS) {
    rows.push(slots.slice(idx, idx + count))
    idx += count
  }
  return rows
}

export function CharacterBoard({ slots, stoneDataMap = {} }) {
  const rows = buildCharRows(slots)
  return (
    <div className="obol-char-board">
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className={`obol-char-board-row obol-char-board-row--${row.length === 3 ? 'large' : 'small'}`}
        >
          {row.map((rawName, slotIdx) => {
            const globalIdx = CHAR_BOARD_ROWS.slice(0, rowIdx).reduce((a, b) => a + b, 0) + slotIdx
            return (
              <ObolSlot
                key={slotIdx}
                rawName={rawName}
                stoneData={stoneDataMap[globalIdx]}
                size={row.length === 3 ? 'lg' : 'sm'}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}