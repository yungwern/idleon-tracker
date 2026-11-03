import { getBravery } from '../../utils/holeCavernUtils'
import { formatHoleNumber } from '../../utils/holeUtils'
import MonumentHourList from './MonumentHourList'
import MonumentBonusList from './MonumentBonusList'

// Bravery (cavern 4): AFK-hour unlocks (sword damage scales with hours here), the story stats and the bonus list.

export default function BraveryPanel({ snapshot, lead }) {
  const bravery = getBravery(snapshot)

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">AFK hours</span>
          <span className="hole-stat-card-value">{Math.floor(bravery.hours).toLocaleString()}</span>
          <span className="hole-stat-card-hint">
            {bravery.nextUnlock
              ? `Next unlock at ${bravery.nextUnlock.hours.toLocaleString()} hours`
              : 'Every hour unlock reached. Max sword damage keeps growing with hours.'}
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">
            <img
              className="hole-inline-icon"
              src="images/hole/bravery/sword.png"
              alt=""
            />
            Sword damage
          </span>
          <span className="hole-stat-card-value">
            {formatHoleNumber(bravery.damage.min)} ~ {formatHoleNumber(bravery.damage.max)}
          </span>
          <span className="hole-stat-card-hint">
            {bravery.swords} swords · {bravery.rethrows} re-throws · {bravery.retellings} retelling per story
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Reward multi</span>
          <span className="hole-stat-card-value">{bravery.reward.value.toFixed(2)}x</span>
          <span className="hole-stat-card-hint">
            Grows the longer you wait between stories.
            {bravery.reward.missing.length > 0 && ` Not counted: ${bravery.reward.missing.join(', ')}.`}
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Opal chance</span>
          <span className="hole-stat-card-value">{(bravery.opalChance * 100).toFixed(1)}%</span>
          <span className="hole-stat-card-hint">Chance for a story to reward an opal (halves with every opal found here).</span>
        </div>
      </div>

      <MonumentHourList
        unlocks={bravery.unlocks}
        hours={bravery.hours}
      />

      <MonumentBonusList bonuses={bravery.bonuses} />
    </>
  )
}
