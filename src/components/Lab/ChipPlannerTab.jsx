import { useState } from 'react'
import { CONSOLE_ROLES } from '../../data'
import { getConsolePlan, resolveConsoleRoles, setConsoleRole, setAllConsoleRoles } from '../../utils/consoleOptimizer'
import ConsoleColumn from './ConsoleColumn'
import ChipStorage from './ChipStorage'

// Chip Planner tab: pick what each character does, get the best spread of every owned chip
// (utils/consoleOptimizer getConsolePlan). Green slots = chips to put on.
const ROLES_KEY = 'idleon_console_roles'

// Saved by character name so a re-ordered save keeps each character's role
function loadSavedRoles() {
  try {
    return JSON.parse(localStorage.getItem(ROLES_KEY) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

function saveRoles(roles) {
  try {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles))
  } catch {
    // Storage blocked: roles only last for this visit
  }
}

// Slots holding a chip to put on: for each chip the plan adds (added counts copies), mark that many of
// its slots, from the bottom up. Slots are re-ordered for display, so position alone can't tell.
function getChangedSlots(character) {
  const toMark = {}
  character.added.forEach(index => {
    toMark[index] = (toMark[index] ?? 0) + 1
  })
  const changed = new Set()
  for (let slot = character.slots.length - 1; slot >= 0; slot--) {
    const index = character.slots[slot]
    if (index >= 0 && toMark[index] > 0) {
      toMark[index] -= 1
      changed.add(slot)
    }
  }
  return changed
}

function PlanColumn({ snapshot, character, role, onRoleChange, tooltipSide }) {
  const roleInfo = CONSOLE_ROLES.find(entry => entry.id === role)
  return (
    <div className="lab-plan-column">
      <select
        className="styled-select lab-plan-role"
        value={role}
        title={roleInfo?.blurb}
        onChange={event => onRoleChange(character, event.target.value)}
      >
        {CONSOLE_ROLES.map(entry => (
          <option
            key={entry.id}
            value={entry.id}
          >
            {entry.label}
          </option>
        ))}
      </select>
      <ConsoleColumn
        snapshot={snapshot}
        character={character}
        slots={character.slots}
        changedSlots={getChangedSlots(character)}
        tooltipSide={tooltipSide}
      />
    </div>
  )
}

export default function ChipPlannerTab({ snapshot }) {
  const [savedRoles, setSavedRoles] = useState(loadSavedRoles)
  const characters = snapshot?.characters ?? []
  const roles = resolveConsoleRoles(characters, savedRoles)
  const plan = getConsolePlan(snapshot, roles)

  const storeRoles = next => {
    setSavedRoles(next)
    saveRoles(next)
  }

  const changeRole = (character, role) => {
    storeRoles(setConsoleRole(characters, savedRoles, character.name, role))
  }

  const setAll = role => {
    if (role) storeRoles(setAllConsoleRoles(characters, savedRoles, role))
  }

  const resetRoles = () => {
    storeRoles({})
  }

  const gain = plan.currentScore > 0 ? (plan.plannedScore / plan.currentScore - 1) * 100 : 0
  const hasSavedRoles = Object.keys(savedRoles).length > 0

  return (
    <div className="lab-planner-tab">
      <div className="lab-plan-summary">
        <span>
          {plan.moves === 0
            ? <strong>Your console already matches the plan ✓</strong>
            : (
              <>
                <strong>{plan.moves}</strong> {plan.moves === 1 ? 'chip' : 'chips'} to put on
              </>
            )}
        </span>
        {plan.moves > 0 && (
          <span
            className="lab-plan-score"
            title="Sum of every equipped chip's value for its character's role (estimate, see the info above)"
          >
            Chip score {Math.round(plan.currentScore)} → {Math.round(plan.plannedScore)}
            {gain > 0 && ` (+${Math.round(gain)}%)`}
          </span>
        )}
        <select
          className="styled-select"
          value=""
          title="Every character but your Active one gets this role"
          onChange={event => setAll(event.target.value)}
        >
          <option value="">Set all to…</option>
          {CONSOLE_ROLES.filter(entry => !entry.single).map(entry => (
            <option
              key={entry.id}
              value={entry.id}
            >
              {entry.label}
            </option>
          ))}
        </select>
        {hasSavedRoles && (
          <button
            type="button"
            className="lab-plan-reset"
            onClick={resetRoles}
          >
            Reset roles to AFK targets
          </button>
        )}
      </div>
      <div className="lab-console lab-console--plan">
        {plan.characters.map((character, i) => (
          <PlanColumn
            key={character.index}
            tooltipSide={i < plan.characters.length / 2 ? 'right' : 'left'}
            snapshot={snapshot}
            character={character}
            role={roles[character.index]}
            onRoleChange={changeRole}
          />
        ))}
      </div>
      <ChipStorage
        snapshot={snapshot}
        storage={plan.storage}
        title="Storage after the plan"
      />
    </div>
  )
}
