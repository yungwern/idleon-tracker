import { getJustice } from '../../utils/holeCavernUtils'
import MonumentHourList from './MonumentHourList'
import MonumentBonusList from './MonumentBonusList'

// Justice (cavern 10): AFK-hour unlocks (starting coins scale with hours here), the story stats and the bonus list.

export default function JusticePanel({ snapshot, lead }) {
  const justice = getJustice(snapshot)

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">AFK hours</span>
          <span className="hole-stat-card-value">{Math.floor(justice.hours).toLocaleString()}</span>
          <span className="hole-stat-card-hint">
            {justice.nextUnlock
              ? `Next unlock at ${justice.nextUnlock.hours.toLocaleString()} hours`
              : 'Every hour unlock reached. Starting coins keep growing with hours.'}
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Starting coins</span>
          <span className="hole-stat-card-value">{justice.coins.toLocaleString()}</span>
          <span className="hole-stat-card-hint">
            {justice.health} Mental Health · {justice.dismissals} Dismissals · {justice.popularity} popularity per story
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Reward multi</span>
          <span className="hole-stat-card-value">{justice.reward.value.toFixed(2)}x</span>
          <span className="hole-stat-card-hint">
            Grows the longer you wait between stories.
            {justice.reward.missing.length > 0 && ` Not counted: ${justice.reward.missing.join(', ')}.`}
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Opal chance</span>
          <span className="hole-stat-card-value">{(justice.opalChance * 100).toFixed(1)}%</span>
          <span className="hole-stat-card-hint">Chance for a story to reward an opal (halves with every opal found here).</span>
        </div>
      </div>

      <MonumentHourList
        unlocks={justice.unlocks}
        hours={justice.hours}
      />

      <MonumentBonusList bonuses={justice.bonuses} />
    </>
  )
}
