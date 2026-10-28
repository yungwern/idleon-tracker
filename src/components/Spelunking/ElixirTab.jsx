import { useMemo, useState } from 'react'
import { spelunkingElixirSetups } from '../../data'
import { getElixirBelt, checkElixirSetup } from '../../utils/spelunkingUtils'

const hideBrokenImg = e => {
  e.currentTarget.style.display = 'none'
}

const formatPercent = value => `${Math.round((value ?? 0) * 100) / 100}%`

// "@" in the game's text starts a new line
const textLines = text => text.split('@').map(line => line.trim()).filter(Boolean)

function ElixirIcon({ elixir, size = 'md' }) {
  return (
    <img
      src={`images/spelunking/CaveElix${elixir.index}.png`}
      alt={elixir.name}
      className={`spelunk-elixir-icon spelunk-elixir-icon--${size}`}
      onError={hideBrokenImg}
    />
  )
}

// One belt slot with a hover tooltip naming the elixir
function ElixirSlot({ elixir, size = 'md', dimmed }) {
  return (
    <span className={`spelunk-elixir-slot spelunk-elixir-slot--${size}${dimmed ? ' spelunk-elixir-slot--locked' : ''} tooltip-anchor`}>
      <ElixirIcon
        elixir={elixir}
        size={size}
      />
      <span className="tooltip tooltip--wrap">
        <strong>{elixir.name}</strong> ({elixir.color})
        {dimmed && ' · not unlocked yet'}
      </span>
    </span>
  )
}

// ============================================================
// HEADER STRIP
// ============================================================

function BeltStat({ label, value, sub, done, tooltip }) {
  return (
    <div className={`spelunk-stat${done ? ' spelunk-stat--done' : ''}${tooltip ? ' tooltip-anchor' : ''}`}>
      <span className="spelunk-stat-label">{label}</span>
      <span className="spelunk-stat-value">{value}</span>
      {sub && <span className="spelunk-stat-sub">{sub}</span>}
      {tooltip && <span className="tooltip tooltip--wrap">{tooltip}</span>}
    </div>
  )
}

function BeltStats({ belt }) {
  return (
    <div className="spelunk-stats">
      <BeltStat
        label="Elixir Types"
        value={`${belt.types} / ${belt.maxTypes}`}
        sub="Unlocked to equip"
        done={belt.types >= belt.maxTypes}
        tooltip="New Brand of Elixir: each level unlocks the next elixir type."
      />
      <BeltStat
        label="Belt Slots"
        value={`${belt.slots} / ${belt.maxSlots}`}
        sub="Elixirs equipped at once"
        done={belt.slots >= belt.maxSlots}
        tooltip="Elixir Slot: you start with 1 slot and each level adds another."
      />
      <BeltStat
        label="Duplicates"
        value={`${belt.maxCopies} / ${belt.maxCopiesCap}`}
        sub="Copies of one elixir allowed"
        done={belt.maxCopies >= belt.maxCopiesCap}
        tooltip="Duplicate Elixirs: how many slots of your belt can hold the same elixir. At 1 every slot needs a different elixir; at 5 your whole belt can be one elixir."
      />
      <BeltStat
        label="Memorized"
        value={`${belt.memorizeSlots} / ${belt.maxMemorizeSlots}`}
        sub="Free use of each every run"
        done={belt.memorizeSlots >= belt.maxMemorizeSlots}
        tooltip="Elixir Memorization: every run starts with one use of each memorized elixir, on top of your belt."
      />
      <BeltStat
        label="Free Refill"
        value={formatPercent(belt.freeRefillChance)}
        sub="Chance a use is free"
        tooltip="Free Refills shop upgrade: chance to instantly refill an elixir after using it."
      />
      <BeltStat
        label="Not Used Up"
        value={formatPercent(belt.keepChance)}
        sub="Lore: No Escape"
        tooltip="Chapter 4 (No Escape) lore bonus: chance to not use up an elixir."
      />
      <BeltStat
        label="Doublethink"
        value={formatPercent(belt.doublethinkChance)}
        sub="2 uses from a memorized elixir"
        tooltip="Doublethink Memory: chance to start with two uses of a memorized elixir instead of one."
      />
      <BeltStat
        label="Nova on Use"
        value={formatPercent(belt.novaChance)}
        sub="Nova Blast when drinking"
        tooltip="Nova X Elixir Crossover Events: chance to trigger a Nova Blast whenever you use an elixir."
      />
    </div>
  )
}

// ============================================================
// YOUR BELT
// ============================================================

// One belt or memorize row: filled slots, then empty unlocked slots, then locked ones up to the max
function BeltPanel({ title, ids, unlocked, max, belt, chip }) {
  const empty = Math.max(0, unlocked - ids.length)
  const locked = Math.max(0, max - Math.max(unlocked, ids.length))
  return (
    <div className="spelunk-elixir-panel">
      <div className="spelunk-elixir-panel-head">
        <span className="spelunk-elixir-panel-title">{title}</span>
        <span className="spelunk-elixir-panel-count">{ids.length} / {unlocked}</span>
        {chip && <span className={`spelunk-elixir-chip spelunk-elixir-panel-chip${chip.active ? ' spelunk-elixir-chip--active' : ''}`}>{chip.text}</span>}
      </div>
      <div className="spelunk-elixir-panel-slots">
        {ids.map((id, i) => (
          <div
            key={`${id}-${i}`}
            className="spelunk-elixir-setup-slot"
          >
            <ElixirSlot elixir={belt.elixirs[id]} />
            <span className="spelunk-elixir-setup-slot-name">{belt.elixirs[id].name}</span>
          </div>
        ))}
        {Array.from({ length: empty }, (_, i) => (
          <div
            key={`empty-${i}`}
            className="spelunk-elixir-setup-slot"
          >
            <span className="spelunk-elixir-slot spelunk-elixir-slot--md spelunk-elixir-slot--empty" />
            <span className="spelunk-elixir-setup-slot-name">Empty</span>
          </div>
        ))}
        {Array.from({ length: locked }, (_, i) => (
          <div
            key={`locked-${i}`}
            className="spelunk-elixir-setup-slot"
          >
            <span className="spelunk-elixir-slot spelunk-elixir-slot--md spelunk-elixir-slot--empty spelunk-elixir-slot--unbought" />
            <span className="spelunk-elixir-setup-slot-name">Locked</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CurrentBelt({ belt, checks }) {
  if (!belt.equipped) {
    return <p className="page-empty spelunk-empty">Re-import your save to see the elixirs on your belt.</p>
  }
  const matchBelt = spelunkingElixirSetups.find(setup => !setup.memorized && checks[setup.id].active)
  const matchMemo = spelunkingElixirSetups.some(setup => setup.memorized && checks[setup.id].active)
  return (
    <div className="spelunk-elixir-section spelunk-elixir-section--first">
      <h3 className="spelunk-elixir-heading">Your Elixirs</h3>
      <div className="spelunk-elixir-panels">
        <BeltPanel
          title="Belt"
          ids={belt.equipped}
          unlocked={belt.slots}
          max={belt.maxSlots}
          belt={belt}
          chip={matchBelt ? { text: `${matchBelt.name} setup`, active: true } : { text: 'Custom' }}
        />
        {belt.memorized && (
          <BeltPanel
            title="Memorized"
            ids={belt.memorized}
            unlocked={belt.memorizeSlots}
            max={belt.maxMemorizeSlots}
            belt={belt}
            chip={matchMemo ? { text: 'Recommended', active: true } : null}
          />
        )}
      </div>
    </div>
  )
}

// ============================================================
// SETUPS
// ============================================================

function SetupCard({ setup, belt, check }) {
  const ownedEverything = check.fits
  return (
    <div className="spelunk-elixir-setup">
      <div className="spelunk-elixir-setup-head">
        <span className="spelunk-elixir-setup-name">{setup.name}</span>
        <div className="spelunk-elixir-setup-chips">
          {check.active && (
            <span className="spelunk-elixir-chip spelunk-elixir-chip--active">
              {setup.memorized ? 'Memorized now' : 'Equipped now'}
            </span>
          )}
          {ownedEverything && !check.active && (
            <span className="spelunk-elixir-chip">
              {setup.memorized ? 'Fits your memorize slots' : 'Fits your belt'}
            </span>
          )}
          {check.issues.map(issue => (
            <span
              key={issue}
              className="spelunk-elixir-chip spelunk-elixir-chip--warn"
            >
              {issue}
            </span>
          ))}
        </div>
      </div>
      <p className="spelunk-elixir-setup-summary">{setup.summary}</p>
      <div className="spelunk-elixir-setup-belt">
        {setup.elixirs.map((id, i) => (
          <div
            key={`${id}-${i}`}
            className="spelunk-elixir-setup-slot"
          >
            <ElixirSlot
              elixir={belt.elixirs[id]}
              size="lg"
              dimmed={!belt.elixirs[id].owned}
            />
            <span className="spelunk-elixir-setup-slot-name">{belt.elixirs[id].name}</span>
          </div>
        ))}
      </div>
      <ul className="spelunk-elixir-setup-why">
        {setup.why.map(line => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  )
}

function Setups({ belt, checks }) {
  const [activeId, setActiveId] = useState('depth')
  const setup = spelunkingElixirSetups.find(item => item.id === activeId) ?? spelunkingElixirSetups[0]
  return (
    <div className="spelunk-elixir-section">
      <h3 className="spelunk-elixir-heading">Setups by Delve</h3>
      <div className="page-tabs page-tabs--sub spelunk-tabs">
        {spelunkingElixirSetups.map(item => (
          <button
            key={item.id}
            type="button"
            className={`page-tab-btn${item.id === setup.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setActiveId(item.id)}
          >
            {item.name}
            {checks[item.id].active && <span className="spelunk-elixir-tab-dot" />}
          </button>
        ))}
      </div>
      <SetupCard
        setup={setup}
        belt={belt}
        check={checks[setup.id]}
      />
    </div>
  )
}

// ============================================================
// ALL ELIXIRS
// ============================================================

function ElixirCard({ elixir, usedIn }) {
  const stateClass = !elixir.owned
    ? ' spelunk-elixir-card--locked'
    : elixir.equippedCount > 0
      ? ' spelunk-elixir-card--equipped'
      : ''
  return (
    <div className={`spelunk-elixir-card${stateClass}`}>
      <span className="spelunk-elixir-slot spelunk-elixir-slot--md">
        <ElixirIcon elixir={elixir} />
        {elixir.equippedCount > 1 && <span className="notice-badge spelunk-elixir-count">{elixir.equippedCount}</span>}
      </span>
      <div className="spelunk-elixir-card-body">
        <div className="spelunk-elixir-card-head">
          <span className="spelunk-elixir-card-name">{elixir.name}</span>
          <span className="spelunk-elixir-card-color">{elixir.color}</span>
        </div>
        {textLines(elixir.text).map(line => (
          <p
            key={line}
            className="spelunk-elixir-card-line"
          >
            {line}
          </p>
        ))}
        {elixir.tip && <p className="spelunk-elixir-card-tip">{elixir.tip}</p>}
        <div className="spelunk-elixir-card-tags">
          {!elixir.owned && <span className="spelunk-elixir-chip spelunk-elixir-chip--warn">Locked</span>}
          {elixir.equippedCount > 0 && <span className="spelunk-elixir-chip spelunk-elixir-chip--active">On belt{elixir.equippedCount > 1 ? ` ×${elixir.equippedCount}` : ''}</span>}
          {elixir.memorized && <span className="spelunk-elixir-chip spelunk-elixir-chip--active">Memorized</span>}
          {usedIn.length > 0 && <span className="spelunk-elixir-card-used">Used in: {usedIn.join(', ')}</span>}
        </div>
      </div>
    </div>
  )
}

function AllElixirs({ belt }) {
  return (
    <div className="spelunk-elixir-section">
      <h3 className="spelunk-elixir-heading">All Elixirs</h3>
      <div className="spelunk-elixir-grid">
        {belt.elixirs.map(elixir => (
          <ElixirCard
            key={elixir.index}
            elixir={elixir}
            usedIn={spelunkingElixirSetups
              .filter(setup => !setup.memorized && setup.elixirs.includes(elixir.index))
              .map(setup => setup.name)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// TAB
// ============================================================

export default function ElixirTab({ snapshot }) {
  const belt = useMemo(() => getElixirBelt(snapshot), [snapshot])
  const checks = useMemo(
    () => Object.fromEntries(spelunkingElixirSetups.map(setup => [setup.id, checkElixirSetup(belt, setup)])),
    [belt],
  )
  return (
    <>
      <BeltStats belt={belt} />
      <CurrentBelt
        belt={belt}
        checks={checks}
      />
      <Setups
        belt={belt}
        checks={checks}
      />
      <AllElixirs belt={belt} />
    </>
  )
}
