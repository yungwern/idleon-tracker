import { useState } from 'react'
import { itemMap, refinerySalts, SKILL_MAIN_STATS, SKILL_SPECIALISTS } from '../../data'
import { toClassSlug } from '../../utils/appUtils'
import { formatBigNumber } from '../../utils/cogBoardUtils'
import { getPrintPlan, PRINT_PLAN_WINDOWS } from '../../utils/printPlanner'

// Printer > Salt Materials: the printable materials the refinery's salts use, and the fewest
// characters that can keep them printed. The full refinery view lives in the Refinery section.

const WINDOW_KEY = 'idleon_print_plan_window'

const STATUS_LABELS = {
  ok: 'Printing enough',
  short: 'Printing too little',
  notPrinting: 'Not printing',
  stocked: 'Stocked',
}

const ACTION_LABELS = {
  keep: 'Printing now',
  swap: 'In library',
  sample: 'New sample',
}

const SKILL_LABELS = {
  mining: 'Mining',
  fishing: 'Fishing',
  chopping: 'Choppin',
  catching: 'Catching',
  fighting: 'Monster drop',
}

const STAT_CLASSES = {
  STR: 'warrior',
  WIS: 'mage',
  AGI: 'archer',
}

function getItemName(item) {
  return itemMap[item] ?? item
}

function formatHours(hours) {
  if (!isFinite(hours)) return 'forever'
  if (hours < 48) return `${hours.toFixed(1)} h`
  if (hours < 24 * 365) return `${(hours / 24).toFixed(1)} days`
  return `${(hours / 24 / 365).toFixed(1)} years`
}

function loadWindow() {
  try {
    const saved = Number(localStorage.getItem(WINDOW_KEY))
    return PRINT_PLAN_WINDOWS.some(option => option.hours === saved) ? saved : 24 * 7
  } catch {
    return 24 * 7
  }
}

// Who samples this skill best, and how this character compares (slot.fit: 2 specialist, 1 main stat, 0 wrong class)
function getFitNote(slot) {
  const stat = SKILL_MAIN_STATS[slot.skill]
  if (stat === null) return 'Monster drop: any class can print.'
  const specialist = SKILL_SPECIALISTS[slot.skill]
  const best = `${SKILL_LABELS[slot.skill]} is best on the ${specialist.tab}`
  if (slot.fit === 2) return `${best}.`
  if (slot.fit === 1) return `${best}. This character is at least a ${stat} class.`
  return `${best} then any ${stat} (${STAT_CLASSES[stat]}) class. Wrong class, but the printer multis are huge.`
}

const ACTION_NOTES = {
  keep: 'Already printing',
  swap: 'Available: swap it into a printing chamber',
  sample: 'Take a new sample',
}

function PlanCard({ character, slotsPerCharacter }) {
  return (
    <div
      className="salt-plan-card"
      data-class={toClassSlug(character.class)}
    >
      <div className="salt-plan-header">
        <span className="salt-plan-class-icon" />
        <span className="salt-plan-name">{character.name}</span>
      </div>
      {character.slots.map((slot, i) => (
        <div
          key={i}
          className="salt-plan-slot tooltip-anchor"
        >
          <img
            className="salt-plan-img"
            src={`images/items/${slot.item}.png`}
            alt={getItemName(slot.item)}
          />
          <span className="salt-plan-item">{getItemName(slot.item)}</span>
          {slot.fit === 2 && <span className="salt-plan-fit">★</span>}
          <span className={`salt-plan-action salt-plan-action--${slot.action}${slot.fit === 0 ? ' salt-plan-action--misfit' : ''}`}>
            {ACTION_LABELS[slot.action]}{slot.fit === 0 ? ' ⚠' : ''}
          </span>
          <span className="tooltip tooltip--wrap buff-tooltip">
            <span className="buff-tooltip-name">{getItemName(slot.item)}</span>
            {slot.pinned && <span className="buff-tooltip-source">Vman: always prints Spore Caps (portal runs)</span>}
            <span className="buff-tooltip-line">{ACTION_NOTES[slot.action]}</span>
            <span className="buff-tooltip-line">{getFitNote(slot)}</span>
            {slot.warriorOffCopper && (
              <span className="buff-tooltip-warning">⚠ Warrior off Copper: nobody else in the plan had room</span>
            )}
          </span>
        </div>
      ))}
      {character.slots.length < slotsPerCharacter && (
        <div className="salt-plan-slot salt-plan-slot--spare">Spare chamber: print anything</div>
      )}
    </div>
  )
}

function MaterialRow({ entry, needed }) {
  const status = entry.status === 'notPrinting' && !needed ? 'stocked' : entry.status
  const unprinted = entry.stored / entry.neededPerHour
  return (
    <div className={`printer-refinery-row printer-refinery-row--${status}`}>
      <img
        className="printer-refinery-img"
        src={`images/items/${entry.item}.png`}
        alt={getItemName(entry.item)}
      />
      <div className="printer-refinery-text">
        <span className="printer-refinery-name">{getItemName(entry.item)}</span>
        <span className="printer-refinery-salts">
          {SKILL_LABELS[entry.skill]}{entry.salts.length > 1 ? ` · also ${entry.salts.slice(1).join(', ')}` : ''}
        </span>
      </div>
      <div className="printer-refinery-rates">
        <span className="printer-refinery-need">{formatBigNumber(entry.neededPerHour)}/hr needed</span>
        <span className="printer-refinery-printers">
          {entry.printers.length > 0
            ? `${entry.printers.join(', ')}: ${formatBigNumber(entry.printedPerHour)}/hr`
            : `Storage lasts ${formatHours(unprinted)}`}
        </span>
      </div>
      <span className={`printer-refinery-pill printer-refinery-pill--${status}`}>
        {STATUS_LABELS[status]}
      </span>
    </div>
  )
}

export default function SaltMaterialsTab({ snapshot }) {
  const [windowHours, setWindowHours] = useState(loadWindow)
  const plan = getPrintPlan(snapshot, windowHours)
  if (!plan) {
    return <p className="page-empty">No refinery data. Re-import your save to see what the salts need.</p>
  }

  function changeWindow(event) {
    const hours = Number(event.target.value)
    setWindowHours(hours)
    try {
      localStorage.setItem(WINDOW_KEY, String(hours))
    } catch {
      // per-browser convenience only
    }
  }

  const neededItems = new Set(plan.needed.map(entry => entry.item))
  const bySalt = refinerySalts
    .map((salt, index) => ({
      ...salt,
      entries: plan.list.filter(entry => entry.saltIndex === index),
    }))
    .filter(salt => salt.entries.length > 0)

  return (
    <div className="printer-refinery">
      <div className="salt-plan-controls">
        <label className="salt-plan-label">
          Print materials whose storage runs out within
          <select
            className="styled-select"
            value={windowHours}
            onChange={changeWindow}
          >
            {PRINT_PLAN_WINDOWS.map(option => (
              <option
                key={option.label}
                value={option.hours}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <span className="salt-plan-summary">
          {plan.needed.length === 0
            ? 'Nothing runs out that soon: every character is free.'
            : `${plan.plan.length} characters cover ${plan.needed.length} materials (${plan.printingNow} print salt materials now). ${plan.free.length} free for other prints.`}
        </span>
      </div>

      {plan.plan.length > 0 && (
        <div className="salt-plan-grid">
          {plan.plan.map(character => (
            <PlanCard
              key={character.index}
              character={character}
              slotsPerCharacter={plan.slotsPerCharacter}
            />
          ))}
        </div>
      )}

      {plan.free.length > 0 && (
        <div className="salt-plan-free">
          <span className="salt-plan-free-title">Free: Copper Ore for atoms, or anything else you need</span>
          {plan.copperByFree && (
            <span className="salt-plan-free-note">Copper Ore prints also cover Redox Salts, so copper takes no slot above.</span>
          )}
          <div className="salt-plan-free-list">
            {[...plan.free].sort((a, b) => Number(b.warrior) - Number(a.warrior)).map(character => (
              <span
                key={character.index}
                className="salt-plan-free-chip tooltip-anchor"
                data-class={toClassSlug(character.class)}
              >
                <span className="salt-plan-class-icon" />
                {character.name}
                {character.hasCopper && (
                  <img
                    className="salt-plan-free-copper"
                    src="images/items/Copper.png"
                    alt="Has a Copper Ore sample"
                  />
                )}
                <span className="tooltip">
                  {character.hasCopper
                    ? 'Has a Copper Ore sample'
                    : character.warrior ? 'No Copper Ore sample yet' : 'Copper Ore / Other Needed Items'}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="salt-materials">
        {bySalt.map(salt => (
          <div
            key={salt.rawName}
            className="salt-materials-group"
          >
            <div className="salt-materials-header">
              <img
                className="salt-materials-salt-img"
                src={`images/construction/${salt.rawName}.png`}
                alt=""
              />
              {salt.name}
            </div>
            {salt.entries.map(entry => (
              <MaterialRow
                key={entry.item}
                entry={entry}
                needed={neededItems.has(entry.item)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
