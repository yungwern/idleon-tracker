import { fillSneakingText, formatSneakingNumber } from '../../utils/sneakingUtils'

// Item stat line for the tooltip: gloves = search rate, nunchaku/kunai = base damage, charms = their text
function statLine(slot) {
  const { item, value } = slot
  if (item.type === 1) {
    return item.subType === 0
      ? `Search rate: ${formatSneakingNumber(value)}%`
      : `Base damage: ${formatSneakingNumber(value)}`
  }
  if (item.type === 2) return fillSneakingText(item.desc, value)
  return null
}

// One inventory slot as the game draws it: symbol-level background (NjBorderS<LV>), the item, its LV top-left.
// Slots that can't take a symbol (hat, gloves/weapon) and LV 0 slots use the plain frame.
export default function NinjaSlot({ slot }) {
  const symbolClass = slot.symbolLevel > 0 ? ` sneaking-slot--sym${Math.min(slot.symbolLevel, 9)}` : ''
  const stat = slot.item ? statLine(slot) : null
  return (
    <div className={`sneaking-slot tooltip-anchor${symbolClass}${slot.empty ? ' sneaking-slot--empty' : ''}`}>
      {slot.item && (
        <img
          className="sneaking-slot-img"
          src={`images/sneaking/${slot.raw}.png`}
          alt={slot.item.name}
        />
      )}
      {slot.item && slot.level > 0 && (
        <span className="sneaking-slot-level">+{slot.level.toLocaleString('en-US')}</span>
      )}
      {(slot.item || slot.symbolSlot >= 0) && (
        <span className="tooltip tooltip--wrap buff-tooltip">
          {slot.item && <span className="buff-tooltip-name">{slot.item.name}</span>}
          {slot.item && slot.level > 0 && <span className="buff-tooltip-line">LV {slot.level.toLocaleString('en-US')}</span>}
          {stat && <span className="buff-tooltip-line">{stat}</span>}
          {slot.item?.type === 0 && <span className="buff-tooltip-source">{slot.item.desc}</span>}
          {slot.item?.type === 3 && <span className="buff-tooltip-source">Pristine Charm, not added to the collection yet</span>}
          {slot.symbolSlot >= 0 && (
            <span className="buff-tooltip-line sneaking-slot-tip-symbol">
              {slot.symbolLevel > 0
                ? `Symbol LV ${slot.symbolLevel}: charms here give +${slot.symbolBonus}%`
                : 'No symbol on this slot yet'}
            </span>
          )}
        </span>
      )}
    </div>
  )
}
