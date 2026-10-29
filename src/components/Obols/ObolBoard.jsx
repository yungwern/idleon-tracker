import {
  obolByRawName,
  CHAR_OBOL_SHAPES,
  FAMILY_OBOL_SHAPES,
} from '../../data'
import { passesObolCheck, getObolRollNeeds, getEffectiveRolls, getObolBoardStats } from './ObolUtils'
import { getObolMiscMulti } from '../../utils/menagerieUtils.js'
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
// shape: 'circle' | 'square' | 'hexagon' | 'sparkle' (board slots, size 'socket'). Empty board slots show nothing,
// since the board art already has the socket.
export function ObolSlot({ rawName, stoneData: savedRolls, size = 'md', shape, checkMode, mainStat = null }) {
  const shapeClass = shape ? ` obol-slot--${shape}` : ''
  if (!rawName || rawName === 'Blank') {
    return (
      <div className={`obol-slot obol-slot--empty obol-slot--${size}${shapeClass}`} />
    )
  }
  const entry = obolByRawName[rawName]
  // Negative rolls on stats this obol doesn't have do nothing in game, so they're dropped here
  const stoneData = getEffectiveRolls(rawName, savedRolls)
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
    <div className={`obol-slot obol-slot--${size}${shapeClass} tooltip-anchor${slotState}`}>
      <img
        src={`images/obols/${rawName}.png`}
        alt={entry?.name ?? rawName}
        className="obol-slot-img"
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
      {checked && !passes && <span className="obol-slot-flag">!</span>}
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

// ── Board Totals ("What it gives") ────────────────────────────────────────────
// Sum of every equipped obol on one board (ObolUtils getObolBoardStats). obols: save-order slots.

function formatTotal(value, percent) {
  const rounded = Math.round(value * 10) / 10
  return `+${rounded.toLocaleString()}${percent ? '%' : ''}`
}

export function ObolStatsPanel({ obols, menagerie }) {
  const multi = getObolMiscMulti(menagerie)
  const rows = getObolBoardStats(obols, multi.value)
  const filled = obols.filter(slot => slot.rawName && slot.rawName !== 'Blank').length
  const hasMisc = rows.some(row => row.misc)

  return (
    <div className="obol-stats">
      <div className="obol-stats-head">
        <span className="obol-stats-title">What it gives</span>
        <span className="obol-stats-sub">{filled}/{obols.length} slots filled</span>
      </div>
      {rows.length === 0 && <p className="obol-stats-empty">No stats from obols</p>}
      {rows.map(row => (
        <div key={row.key} className="obol-stats-row">
          <span className="obol-stats-label">
            {row.label}
            {row.misc && multi.level > 0 && <span className="obol-stats-star">*</span>}
          </span>
          <span className="obol-stats-value">{formatTotal(row.value, row.percent)}</span>
        </div>
      ))}
      {hasMisc && multi.level > 0 && (
        <p className="obol-stats-note">* includes Silver Jellyfish ×{Math.round(multi.value * 100) / 100} (LV {multi.level})</p>
      )}
      {hasMisc && multi.missing && (
        <p className="obol-stats-note">Re-import your save to include the Silver Jellyfish bonus</p>
      )}
    </div>
  )
}

// ── Boards ────────────────────────────────────────────────────────────────────
// Slots sit at their in-game positions (obol-pos--char-N / fam-N in ObolBoard.css), in reading order.
// slots: rawNames in reading order; stoneDataMap: { readingIndex: stoneData } for a player's real board.

// Tooltip placement, so a container with overflow: hidden (the character card) can't clip them:
//   topRowSlots: slots in the top two rows open below the obol
//   edgeSlots: { left: [...], right: [...] } outer-column slots line the tooltip up with that side
function getTooltipPlacement(i, topRowSlots, edgeSlots) {
  return [
    i < topRowSlots ? ' obol-board-pos--below' : '',
    edgeSlots.left.includes(i) ? ' obol-board-pos--left' : '',
    edgeSlots.right.includes(i) ? ' obol-board-pos--right' : '',
  ].join('')
}

const CHAR_EDGE_SLOTS = {
  left: [0, 5, 9, 12, 16],
  right: [4, 8, 11, 15, 20],
}

const FAMILY_EDGE_SLOTS = {
  left: [0, 5, 10, 14, 19],
  right: [4, 9, 13, 18, 23],
}

function ObolBoardMap({ variant, shapes, topRowSlots, edgeSlots, slots, stoneDataMap, checkMode, mainStat }) {
  return (
    <div className={`obol-board-map obol-board-map--${variant}`}>
      {shapes.map((shape, i) => (
        <div
          key={i}
          className={`obol-board-pos obol-pos--${variant}-${i}${getTooltipPlacement(i, topRowSlots, edgeSlots)}`}
        >
          <ObolSlot
            rawName={slots[i] ?? 'Blank'}
            stoneData={stoneDataMap[i]}
            size="socket"
            shape={shape}
            checkMode={checkMode}
            mainStat={mainStat}
          />
        </div>
      ))}
    </div>
  )
}

// Family board: 24 slots, save order = reading order
export function AccountBoard({ slots, stoneDataMap = {}, checkMode, mainStat = null }) {
  return (
    <ObolBoardMap
      variant="fam"
      shapes={FAMILY_OBOL_SHAPES}
      topRowSlots={10}
      edgeSlots={FAMILY_EDGE_SLOTS}
      slots={slots}
      stoneDataMap={stoneDataMap}
      checkMode={checkMode}
      mainStat={mainStat}
    />
  )
}

// Character board: 21 slots in reading order (convert save order with CHAR_OBOL_SAVE_TO_DISPLAY first)
export function CharacterBoard({ slots, stoneDataMap = {}, checkMode, mainStat = null }) {
  return (
    <ObolBoardMap
      variant="char"
      shapes={CHAR_OBOL_SHAPES}
      topRowSlots={9}
      edgeSlots={CHAR_EDGE_SLOTS}
      slots={slots}
      stoneDataMap={stoneDataMap}
      checkMode={checkMode}
      mainStat={mainStat}
    />
  )
}
