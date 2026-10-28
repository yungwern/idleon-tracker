import { obolByRawName } from '../../data'
import { passesObolCheck, getObolRollNeeds } from './ObolUtils'
import './ObolBoard.css'

// ── Obol Slot ─────────────────────────────────────────────────────────────────

function uqLabel(txt) {
  // Normalize game inconsistency: DROP CHANCE and DROP RATE are the same thing
  return txt.replace(/^%_?|^_/, '').replace(/_/g, ' ').replace(/DROP CHANCE/i, 'DROP RATE')
}

function formatUQ(txt, val) {
  if (!txt || !val) return null
  const label = uqLabel(txt)
  return txt.startsWith('%') ? `${label}: +${val}%` : `${label}: +${val}`
}

// Reroll keys shown in the tooltip, with negative rolls too so a failed check can be explained
const REROLL_STATS = [
  ['STR', 'STR'],
  ['AGI', 'AGI'],
  ['WIS', 'WIS'],
  ['LUK', 'LUK'],
  ['Weapon_Power', 'WP'],
  ['Defence', 'DEF'],
]

function formatRoll(label, val) {
  if (typeof val !== 'number' || val === 0) return null
  return {
    text: `${label} ${val > 0 ? '+' : ''}${val} 🎲`,
    negative: val < 0,
  }
}

// Amber "?" lines for each roll the current mode still needs (ObolUtils getObolRollNeeds).
// uqNames: the obol's own unique bonuses (from obolMap), since a roll can only be one of those.
const ANY_STAT = 'STR/AGI/WIS/LUK'

function getMissingRollHints(stoneData, checkMode, mainStat, uqNames) {
  const uqText = uqNames.map(uqLabel).join(' / ')
  return getObolRollNeeds(stoneData, checkMode, mainStat).map(({ need, stat }) => {
    let text
    if (need === 'any') text = uqText ? `${uqText} or any stat ? 🎲` : `${ANY_STAT} or WP ? 🎲`
    if (need === 'uq') text = uqText ? `${uqText} ? 🎲` : 'No unique bonus to roll'
    if (need === 'mainStat') text = `${stat} ? 🎲`
    if (need === 'anyStat') text = `${ANY_STAT} ? 🎲`
    return {
      text,
      missing: true,
    }
  })
}

function formatUqRoll(txt, val) {
  if (typeof txt !== 'string' || typeof val !== 'number' || val === 0) return null
  const text = val > 0 ? formatUQ(txt, val) : formatUQ(txt, val).replace('+-', '-')
  return {
    text: `${text} 🎲`,
    negative: val < 0,
  }
}

// Stat colors live in ObolBoard.css (obol-tooltip-stat-chip--str, etc.)
function StatChip({ label, value }) {
  return (
    <span className={`obol-tooltip-stat-chip obol-tooltip-stat-chip--${label.toLowerCase()}`}>
      {label} +{value}
    </span>
  )
}

// stoneData is only passed for a player's real board (example boards have none).
// checkMode / mainStat: roll check (ObolUtils passesObolCheck). Passing obols glow, failing ones are marked.
export function ObolSlot({ rawName, stoneData, size = 'md', checkMode, mainStat = null }) {
  if (!rawName || rawName === 'Blank') {
    return <div className={`obol-slot obol-slot--empty obol-slot--${size}`} />
  }
  const entry = obolByRawName[rawName]
  const checked = stoneData !== undefined
  const passes = checked && passesObolCheck(stoneData, checkMode, mainStat)
  const slotState = checked ? (passes ? ' obol-slot--upgraded' : ' obol-slot--no-bonus') : ''

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
  const missingLines = checked && !passes
    ? getMissingRollHints(stoneData ?? {}, checkMode, mainStat, [entry?.uq1, entry?.uq2].filter(Boolean))
    : []
  const rerollLines = stoneData && typeof stoneData === 'object' ? [
    ...REROLL_STATS.map(([key, label]) => formatRoll(label, stoneData[key])),
    formatUqRoll(stoneData.UQ1txt, stoneData.UQ1val),
    formatUqRoll(stoneData.UQ2txt, stoneData.UQ2val),
    ...missingLines,
  ].filter(Boolean) : []

  return (
    <div className={`obol-slot obol-slot--${size} tooltip-anchor${slotState}`}>
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
        {rerollLines.map((roll, i) => (
          <span
            key={i}
            className={`obol-tooltip-stat obol-tooltip-reroll${i === 0 ? ' obol-tooltip-reroll--first' : ''}${roll.negative ? ' obol-tooltip-reroll--negative' : ''}${roll.missing ? ' obol-tooltip-reroll--missing' : ''}`}
          >
            {roll.text}
          </span>
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

export function AccountBoard({ slots, stoneDataMap = {}, checkMode, mainStat = null }) {
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
                checkMode={checkMode}
                mainStat={mainStat}
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

export function CharacterBoard({ slots, stoneDataMap = {}, checkMode, mainStat = null }) {
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
                checkMode={checkMode}
                mainStat={mainStat}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}