import { getFoodSlots } from '../../utils/foodUtils.js'
import { formatBigNumber } from '../../utils/cogBoardUtils.js'

// Food tab: the 6 food slots in game order (locked ones say how to unlock them). How big golden stacks
// could get under other prayers lives in the Prayers tab (Carry Capacity Trade).
export default function FoodTab({ charIndex, snapshot }) {
  const character = snapshot?.characters?.[charIndex]
  if (!character?.food) {
    return <div className="char-food-empty">No food data available — re-import your save to see food slots.</div>
  }
  const slots = getFoodSlots(snapshot, charIndex)
  const unlocked = slots.filter(slot => slot.unlocked).length

  return (
    <div className="char-food-tab">
      <section>
        <h3 className="char-overview-heading">
          Food Slots
          <span className="char-food-count">{unlocked} / {slots.length} unlocked</span>
        </h3>
        <div className="char-food-grid">
          {slots.map(slot => (
            <FoodSlotCard
              key={slot.slot}
              slot={slot}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function FoodSlotCard({ slot }) {
  if (!slot.unlocked) {
    return (
      <div className="char-food-card char-food-card--locked">
        <div className="char-food-card-top">
          <span className="char-food-lock" aria-hidden="true">🔒</span>
        </div>
        <div className="char-food-card-body">
          <span className="char-food-name">Locked</span>
          <span className="char-food-effect">{slot.unlockLabel}</span>
        </div>
      </div>
    )
  }
  if (!slot.item) {
    return (
      <div className="char-food-card char-food-card--empty">
        <div className="char-food-card-top" />
        <div className="char-food-card-body">
          <span className="char-food-name">Empty slot</span>
        </div>
      </div>
    )
  }
  const name = slot.food?.name ?? slot.item
  return (
    <div className={`char-food-card${slot.golden ? ' char-food-card--golden' : ''}`}>
      <div className="char-food-card-top">
        {slot.food?.img
          ? (
            <img
              src={slot.food.img}
              alt={name}
              className="char-food-img"
            />
          )
          : <span className="char-food-lock">?</span>}
        <span className="char-food-qty">×{formatBigNumber(slot.qty)}</span>
      </div>
      <div className="char-food-card-body">
        <span className="char-food-name">{name}</span>
        {slot.food?.effect && <span className="char-food-effect">{slot.food.effect}</span>}
      </div>
    </div>
  )
}
