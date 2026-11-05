import { CHIP_SLOT_LEVELS } from '../../data'
import { toClassSlug } from '../../utils/appUtils'
import { getChipByIndex, getChipEffect, getChipTarget, EMPTY_SLOT } from '../../utils/consoleOptimizer'

// One character's column of the in-game Console: head, Lab LV, 7 chip slots (art = ConsoleColumn).
// changedSlots = slot numbers to mark as "put on" (Chip Planner). tooltipSide = 'right' for columns on the
// left half of the row (tooltips open rightward) or 'left' for the right half, so none run off the page.
function ChipSlot({ snapshot, characterIndex, chipIndex, slot, locked, changed }) {
  if (locked) {
    return (
      <div className={`lab-console-slot lab-console-slot--${slot} lab-console-slot--locked`}>
        <span className="lab-console-slot-req">LV {CHIP_SLOT_LEVELS[slot]}</span>
      </div>
    )
  }
  const chip = chipIndex === EMPTY_SLOT ? null : getChipByIndex(chipIndex)
  if (!chip) {
    return <div className={`lab-console-slot lab-console-slot--${slot}`} />
  }
  const target = getChipTarget(snapshot, characterIndex, chip)
  return (
    <div className={`lab-console-slot lab-console-slot--${slot} tooltip-anchor${changed ? ' lab-console-slot--changed' : ''}`}>
      <img
        className="lab-chip-img"
        src={chip.img}
        alt={chip.name}
      />
      <span className="tooltip tooltip--wrap lab-tooltip">
        <span className="lab-tooltip-name">{chip.name}</span>
        <span className="lab-tooltip-line">{getChipEffect(chip, snapshot)}</span>
        {target && (
          <span className={`lab-tooltip-target${target.active ? '' : ' lab-tooltip-target--warn'}`}>{target.label}</span>
        )}
        {chip.onePerPlayer && <span className="lab-tooltip-note">One per character</span>}
        {changed && <span className="lab-tooltip-status">Put this on</span>}
      </span>
    </div>
  )
}

export default function ConsoleColumn({ snapshot, character, slots, changedSlots, tooltipSide = 'right' }) {
  return (
    <div
      className={`lab-console-column lab-console-column--tip-${tooltipSide}`}
      data-class={toClassSlug(character.className)}
    >
      <div
        className="lab-console-name"
        title={`${character.name} (${character.className})`}
      >
        {character.name}
      </div>
      <span
        className="lab-console-level"
        title="Lab LV"
      >
        LV {character.labLevel}
      </span>
      <div className="lab-console-art">
        <div
          className="lab-console-head"
          title={character.className}
        />
        {slots.map((chipIndex, slot) => (
          <ChipSlot
            key={slot}
            snapshot={snapshot}
            characterIndex={character.index}
            chipIndex={chipIndex}
            slot={slot}
            locked={slot >= character.unlocked}
            changed={changedSlots?.has(slot)}
          />
        ))}
      </div>
    </div>
  )
}
