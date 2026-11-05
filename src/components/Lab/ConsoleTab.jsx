import { getConsoleState } from '../../utils/consoleOptimizer'
import ConsoleColumn from './ConsoleColumn'
import ChipStorage from './ChipStorage'

// Console tab: every character's chip slots like the in-game Console, then chip storage
export default function ConsoleTab({ snapshot }) {
  const state = getConsoleState(snapshot)
  const equipped = state.storage.reduce((sum, entry) => sum + entry.equipped, 0)
  const stored = state.storage.reduce((sum, entry) => sum + entry.stored, 0)
  const openSlots = state.characters.reduce((sum, character) => (
    sum + character.slots.filter((chip, slot) => slot < character.unlocked && chip < 0).length
  ), 0)

  return (
    <div className="lab-console-tab">
      <p className="lab-summary">
        <strong>{equipped}</strong> chips equipped · <strong>{stored}</strong> in storage
        {openSlots > 0 && (
          <>
            {' · '}
            <strong className="lab-summary-warn">{openSlots}</strong> empty slots
          </>
        )}
      </p>
      <div className="lab-console">
        {state.characters.map((character, i) => (
          <ConsoleColumn
            key={character.index}
            tooltipSide={i < state.characters.length / 2 ? 'right' : 'left'}
            snapshot={snapshot}
            character={character}
            slots={character.slots}
          />
        ))}
      </div>
      <ChipStorage
        snapshot={snapshot}
        storage={state.storage}
        title="Chip Storage"
      />
    </div>
  )
}
