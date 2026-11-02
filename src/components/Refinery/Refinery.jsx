import { useState } from 'react'
import { itemMap } from '../../data'
import { formatBigNumber } from '../../utils/cogBoardUtils'
import { formatRefineryHours, getRefineryMaterialNeeds } from '../../utils/refineryUtils'
import InfoPanel from '../InfoPanel/InfoPanel'
import RankPlannerTab from './RankPlannerTab'

import './Refinery.css'

// Refinery (World 3): cycle times, and every salt's inputs per hour at its current rank next to what
// the printers make of them (or how long storage lasts for the ones that can't be printed)

const STATUS_LABELS = {
  ok: 'Covered',
  short: 'Short',
  notPrinting: 'Not printing',
  unprintable: "Can't print",
  idle: 'Salt off',
}

const CYCLES = [
  { key: 'combustion', label: 'Combustion', salts: 'Salts 1-3' },
  { key: 'synthesis', label: 'Synthesis', salts: 'Salts 4-6' },
  { key: 'polymerize', label: 'Polymerize', salts: 'Salts 7+' },
]

function formatSeconds(seconds) {
  const whole = Math.ceil(seconds)
  if (whole < 60) return `${whole}s`
  const minutes = Math.floor(whole / 60)
  return `${minutes}m ${String(whole % 60).padStart(2, '0')}s`
}

const formatHours = formatRefineryHours

const TABS = [
  { id: 'ranks', label: 'Rank Planner' },
  { id: 'materials', label: 'Materials' },
]

// Storage that runs out within a day is urgent, within a week a warning
const URGENT_HOURS = 24
const WARNING_HOURS = 24 * 7

function getUrgency(hoursLeft) {
  if (hoursLeft < URGENT_HOURS) return 'urgent'
  if (hoursLeft < WARNING_HOURS) return 'warning'
  return 'fine'
}

function getItemName(item) {
  return itemMap[item] ?? item
}

function ItemIcon({ item, className }) {
  return (
    <img
      className={className}
      src={`images/items/${item}.png`}
      alt={getItemName(item)}
    />
  )
}

// Cycle times strip with the speed breakdown on hover
function CycleTimes({ cycleTimes }) {
  return (
    <div className="refinery-cycles tooltip-anchor">
      {CYCLES.map(cycle => (
        <div
          key={cycle.key}
          className="refinery-cycle"
        >
          <span className="refinery-cycle-label">{cycle.label}</span>
          <span className="refinery-cycle-time">{formatSeconds(cycleTimes[cycle.key])}</span>
          <span className="refinery-cycle-salts">{cycle.salts}</span>
        </div>
      ))}
      <span className="tooltip tooltip--wrap buff-tooltip">
        <span className="buff-tooltip-name">Refinery speed +{Math.round(cycleTimes.speed).toLocaleString()}%</span>
        {cycleTimes.speedSources.filter(source => source.value > 0).map(source => (
          <span
            key={source.name}
            className="buff-tooltip-line"
          >
            {source.name}: +{Math.round(source.value * 10) / 10}%
          </span>
        ))}
        <span className="buff-tooltip-line">× {cycleTimes.labMulti} Gilded Cyclical Tubing (lab) · × {(1 + cycleTimes.legend / 100).toFixed(2)} More Soot More Salt</span>
        <span className="buff-tooltip-line">Polymerize also +{Math.round(cycleTimes.polymerBonus)}% (meal + research)</span>
        {cycleTimes.partial && <span className="buff-tooltip-warning">⚠ The vote bonus or Chilled Yarn meritocracy is active this week and isn't counted</span>}
      </span>
    </div>
  )
}

// Printable materials the refinery needs that nobody prints (or that print too slowly), soonest to
// run out first. Shortfalls drain storage at (needed - printed) per hour.
function PrintTodo({ salts }) {
  const todo = []
  for (const salt of salts) {
    for (const material of salt.materials) {
      if (material.status !== 'notPrinting' && material.status !== 'short') continue
      const existing = todo.find(entry => entry.item === material.item)
      if (existing) {
        existing.neededPerHour += material.neededPerHour
        existing.salts.push(salt.name)
      } else {
        todo.push({
          ...material,
          salts: [salt.name],
        })
      }
    }
  }
  for (const entry of todo) {
    entry.hoursLeft = entry.stored / Math.max(entry.neededPerHour - entry.printedPerHour, 1e-9)
  }
  todo.sort((a, b) => a.hoursLeft - b.hoursLeft)
  return (
    <div className={`refinery-todo${todo.length === 0 ? ' refinery-todo--done' : ''}`}>
      <span className="refinery-todo-title">
        {todo.length === 0 ? 'Every printable material the refinery uses is being printed' : 'Not being printed'}
      </span>
      {todo.length > 0 && (
        <div className="refinery-todo-list">
          {todo.map(entry => (
            <div
              key={entry.item}
              className={`refinery-todo-chip refinery-todo-chip--${getUrgency(entry.hoursLeft)} tooltip-anchor`}
            >
              <ItemIcon
                item={entry.item}
                className="refinery-todo-img"
              />
              <span className="refinery-todo-name">{getItemName(entry.item)}</span>
              <span className="refinery-todo-rate">lasts {formatHours(entry.hoursLeft)}</span>
              <span className="tooltip tooltip--wrap buff-tooltip">
                <span className="buff-tooltip-name">{getItemName(entry.item)}</span>
                <span className="buff-tooltip-line">Used by {entry.salts.join(', ')}: {formatBigNumber(entry.neededPerHour)}/hr</span>
                <span className="buff-tooltip-line">
                  {entry.status === 'short'
                    ? `Printing only ${formatBigNumber(entry.printedPerHour)}/hr.`
                    : 'Nobody prints it.'} {formatBigNumber(entry.stored)} in storage lasts {formatHours(entry.hoursLeft)}.
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MaterialRow({ material }) {
  const { item, neededPerHour, printedPerHour, stored, status } = material
  let detail = ''
  if (status === 'ok') detail = `${formatBigNumber(printedPerHour)}/hr printed`
  const hoursLeft = stored / Math.max(neededPerHour - printedPerHour, 1e-9)
  if (status === 'short' || status === 'notPrinting' || status === 'unprintable') {
    detail = `${status === 'short' ? `${formatBigNumber(printedPerHour)}/hr printed · ` : ''}${formatBigNumber(stored)} stored · lasts ${formatHours(hoursLeft)}`
  }
  const urgency = status === 'ok' || status === 'idle' ? '' : ` refinery-material--${getUrgency(hoursLeft)}`
  return (
    <div className={`refinery-material refinery-material--${status}${urgency}`}>
      <ItemIcon
        item={item}
        className="refinery-material-img"
      />
      <div className="refinery-material-text">
        <span className="refinery-material-name">{getItemName(item)}</span>
        <span className="refinery-material-need">
          {status === 'idle' ? '—' : `${formatBigNumber(neededPerHour)}/hr needed`}
        </span>
      </div>
      <div className="refinery-material-status">
        <span className={`refinery-pill refinery-pill--${status}`}>{STATUS_LABELS[status]}</span>
        {detail && <span className="refinery-material-detail">{detail}</span>}
      </div>
    </div>
  )
}

function SaltCard({ salt }) {
  const classes = [
    'refinery-salt',
    !salt.unlocked ? 'refinery-salt--locked' : '',
    salt.unlocked && !salt.running ? 'refinery-salt--off' : '',
  ].filter(Boolean).join(' ')
  return (
    <div className={classes}>
      <div className="refinery-salt-header">
        <img
          className="refinery-salt-img"
          src={`images/construction/${salt.rawName}.png`}
          alt={salt.name}
        />
        <div className="refinery-salt-title">
          <span className="refinery-salt-name">{salt.name}</span>
          <span className="refinery-salt-meta">
            {!salt.unlocked ? 'Locked' : `Rank ${salt.rank} · ${formatSeconds(salt.cycleSeconds)} cycle${salt.running ? '' : ' · off'}`}
          </span>
        </div>
      </div>
      {salt.unlocked && (
        <div className="refinery-salt-materials">
          {salt.materials.map(material => (
            <MaterialRow
              key={material.item}
              material={material}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Refinery({ snapshot }) {
  const [activeTab, setActiveTab] = useState('ranks')
  const needs = getRefineryMaterialNeeds(snapshot)
  if (!needs) {
    return (
      <div className="page">
        <h2 className="page-title">Refinery</h2>
        <p className="page-empty">No refinery data. Import (or re-import) a save to see your refinery.</p>
      </div>
    )
  }
  return (
    <div className="page">
      <h2 className="page-title">Refinery</h2>
      <InfoPanel
        intro="Every salt after Redox is made from the salt before it, and ranking a salt up raises how much of that salt it eats per cycle. Rank one too far and it eats its feeder faster than the feeder makes it, until the feeder runs dry. The Rank Planner keeps every salt below that point; Materials shows each salt's other inputs next to what your printers make."
        items={[
          'Rank Planner: "Safe up to" is the highest rank a salt can reach before it eats all of its feeder\'s output at the feeder\'s current rank. Ranking a feeder up raises that limit for the salt after it, so rank up from the top of the chain down.',
          'Rank up now lists the full bars that are safe to rank in that order (one that is only safe after its feeder ranks up says so). Bars to leave alone show the feeder rank they wait for.',
          'Same-speed salts that cost 2 of the salt before them balance at equal ranks (with Panda\'s 2x). Dioxide Synthesis runs on slower synthesis cycles fed by fast combustion ones, so it can go far past Spontaneity.',
          'Keep 10% / 25% leaves that share of each salt unused, for building costs, Salt Lick and the like. Keep none lets the next salt eat everything.',
          'Over-ranked salts show how long the feeder\'s storage lasts. After that both slow down, and the slowdown carries down the chain.',
          'Materials: printed amounts include every printer multi (the account Total from the Printer page, plus Wired In 2x and Harriep 3x per character). Not being printed lists printable materials nobody prints (or that print too slowly), soonest to run out first: red under a day of storage, amber under a week.',
          'Souls, critters and bars can\'t be printed. Their rows show how long your storage chests last at the current rank instead.',
        ]}
      />
      <CycleTimes cycleTimes={needs.cycleTimes} />
      <div className="page-tabs refinery-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`page-tab-btn${activeTab === tab.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'ranks' && <RankPlannerTab snapshot={snapshot} />}
      {activeTab === 'materials' && (
        <>
          <PrintTodo salts={needs.salts} />
          <div className="refinery-salts">
            {needs.salts.map(salt => (
              <SaltCard
                key={salt.rawName}
                salt={salt}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
