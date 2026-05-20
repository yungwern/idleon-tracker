import { obolByRawName } from '../../data'
import { isUpgraded } from './obolUtils'
import './ObolBoard.css'

// ── Obol Slot ─────────────────────────────────────────────────────────────────

function formatStatLine(entry, stoneData) {
  if (!entry) return null
  const lines = []

  // Base stats (non-zero only)
  const baseStats = [
    entry.STR  > 0 && `STR +${entry.STR}`,
    entry.AGI  > 0 && `AGI +${entry.AGI}`,
    entry.WIS  > 0 && `WIS +${entry.WIS}`,
    entry.LUK  > 0 && `LUK +${entry.LUK}`,
    entry.def  > 0 && `DEF +${entry.def}`,
    entry.wp   > 0 && `WP +${entry.wp}`,
  ].filter(Boolean)

  if (baseStats.length) lines.push(baseStats.join(' | '))

  // Skill power
  if (entry.skillPower) {
    for (const [skill, val] of Object.entries(entry.skillPower)) {
      if (val > 0) lines.push(`${skill} Power: ${val}`)
    }
  }

  // Unique bonuses
  if (entry.uq1 && entry.uq1val > 0) {
    lines.push(`${entry.uq1.replace(/_/g, ' ').replace(/%/g, '%')}: ${entry.uq1val}`)
  }
  if (entry.uq2 && entry.uq2val > 0) {
    lines.push(`${entry.uq2.replace(/_/g, ' ').replace(/%/g, '%')}: ${entry.uq2val}`)
  }

  // Reroll bonuses from stoneData
  if (stoneData && typeof stoneData === 'object') {
    const rerollStats = [
      stoneData.STR  > 0 && `STR +${stoneData.STR} (reroll)`,
      stoneData.AGI  > 0 && `AGI +${stoneData.AGI} (reroll)`,
      stoneData.WIS  > 0 && `WIS +${stoneData.WIS} (reroll)`,
      stoneData.LUK  > 0 && `LUK +${stoneData.LUK} (reroll)`,
      stoneData.UQ1txt && stoneData.UQ1val > 0 && `${stoneData.UQ1txt.replace(/_/g, ' ')}: +${stoneData.UQ1val} (reroll)`,
      stoneData.UQ2txt && stoneData.UQ2val > 0 && `${stoneData.UQ2txt.replace(/_/g, ' ')}: +${stoneData.UQ2val} (reroll)`,
    ].filter(Boolean)
    if (rerollStats.length) lines.push(...rerollStats)
  }

  return lines
}

export function ObolSlot({ rawName, stoneData, size = 'md' }) {
  if (!rawName || rawName === 'Blank') {
    return <div className={`obol-slot obol-slot--empty obol-slot--${size}`} />
  }
  const entry = obolByRawName[rawName]
  const upgraded = stoneData !== undefined ? isUpgraded(stoneData) : false
  const statLines = formatStatLine(entry, stoneData)

  return (
    <div className={`obol-slot obol-slot--${size} tooltip-anchor${upgraded ? ' obol-slot--upgraded' : ''}`}>
      <img
        src={`/images/obols/${rawName}.png`}
        alt={entry?.name ?? rawName}
        className="obol-slot-img"
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
      <div className="obol-tooltip">
        <span className="obol-tooltip-name">{entry?.name ?? rawName}</span>
        {statLines && statLines.map((line, i) => (
          <span key={i} className="obol-tooltip-stat">{line}</span>
        ))}
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