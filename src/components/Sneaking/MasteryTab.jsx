import { ninjaMasteryMap } from '../../data'
import { getSneakingSummary, toRoman } from '../../utils/sneakingUtils'

// Sneaking > Mastery: one panel like the game's Sneak Mastery window, a line per tier (unlock & bonus).
// OptLacc[232] = highest tier. Tiers past the game's list (none yet) show as "no bonus here yet".
export default function MasteryTab({ snapshot }) {
  const summary = getSneakingSummary(snapshot)
  const tier = summary.mastery
  const tiers = Array.from({ length: Math.max(ninjaMasteryMap.length, tier) }, (_, i) => ninjaMasteryMap[i] ?? { placeholder: true })
  return (
    <div className="sneaking-mastery-panel">
      <div className="sneaking-mastery-panel-head">
        <span className="sneaking-mastery-panel-title">Sneak Mastery</span>
        <span className="sneaking-mastery-panel-tier">{tier > 0 ? toRoman(tier) : '—'}</span>
      </div>
      <ul className="sneaking-mastery-lines">
        {tiers.map((mastery, i) => (
          <li
            key={i}
            className={`sneaking-mastery-line${tier >= i + 1 ? ' sneaking-mastery-line--reached' : ''}`}
          >
            <span className="sneaking-mastery-line-tier">{toRoman(i + 1)}</span>
            {mastery.placeholder ? (
              <span className="sneaking-mastery-line-empty">No bonus here yet</span>
            ) : (
              <span className="sneaking-mastery-line-text">
                {mastery.unlock}
                <span className="sneaking-mastery-line-amp"> & </span>
                <span className="sneaking-mastery-line-bonus">{mastery.bonus}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="sneaking-mastery-panel-foot">
        Reach floor {summary.nextMasteryFloor} to unlock Mastery {toRoman(tier + 1)}
        <span className="sneaking-mastery-panel-progress">Currently on floor {summary.openFloors}</span>
      </div>
    </div>
  )
}
