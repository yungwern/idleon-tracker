import { getWisdom } from '../../utils/holeCavernUtils'
import MonumentHourList from './MonumentHourList'
import MonumentBonusList from './MonumentBonusList'
import StatIconRow from './StatIconRow'

// Wisdom (cavern 13): AFK-hour unlocks (starting attempts scale with hours here), the story stats and the bonus list.

export default function WisdomPanel({ snapshot, lead }) {
  const wisdom = getWisdom(snapshot)

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">AFK hours</span>
          <span className="hole-stat-card-value">{Math.floor(wisdom.hours).toLocaleString()}</span>
          <span className="hole-stat-card-hint">
            {wisdom.nextUnlock
              ? `Next unlock at ${wisdom.nextUnlock.hours.toLocaleString()} hours`
              : 'Every hour unlock reached. Starting attempts keep growing with hours.'}
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">
            <img
              className="hole-inline-icon"
              src="images/hole/wisdom/attempts.png"
              alt=""
            />
            Starting attempts
          </span>
          <span className="hole-stat-card-value">{wisdom.attempts.toLocaleString()}</span>
          <StatIconRow
            items={[
              { icon: 'images/hole/wisdom/attempts.png', value: `+${wisdom.attemptsPerClear}`, label: 'per Board Clear' },
              { icon: 'images/hole/wisdom/match.png', value: `${wisdom.secondsPerMatch}s`, label: 'per match' },
              { icon: 'images/hole/wisdom/instamatch.png', value: wisdom.instaMatches, label: 'Insta Matches' },
            ]}
          />
          <span className="hole-stat-card-hint">Per story. Attempts include the Wisdom study and the hours you've banked.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Reward multi</span>
          <span className="hole-stat-card-value">{wisdom.reward.value.toFixed(2)}x</span>
          <span className="hole-stat-card-hint">
            Grows the longer you wait between stories.
            {wisdom.reward.missing.length > 0 && ` Not counted: ${wisdom.reward.missing.join(', ')}.`}
          </span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Opal chance</span>
          <span className="hole-stat-card-value">{(wisdom.opalChance * 100).toFixed(1)}%</span>
          <span className="hole-stat-card-hint">Chance for a story to reward an opal (halves with every opal found here).</span>
        </div>
      </div>

      <MonumentHourList
        unlocks={wisdom.unlocks}
        hours={wisdom.hours}
      />

      <MonumentBonusList bonuses={wisdom.bonuses} />
    </>
  )
}
