import { getIslandUnlockCost, getUnlockedIslandCount, isIslandUnlocked } from '../../utils/islandUtils'

// Top of every island tab: name plate, what the island does, its notices, and while it's
// still locked the unlock cost and the guide's recommendation / notes

export default function IslandOverview({ snapshot, island, notices = [] }) {
  const islands = snapshot?.islands
  const unlocked = isIslandUnlocked(islands, island.id)
  const cost = unlocked ? null : getIslandUnlockCost(island.id, getUnlockedIslandCount(islands))

  return (
    <div className="islands-overview">
      <div className="islands-overview-cards">
        <div className="islands-card islands-about">
          <div className="islands-about-head">
            <img
              className="islands-plate"
              src={island.img}
              alt=""
            />
            <div className="islands-about-titles">
              <span className="islands-about-name">{island.name}</span>
              <span className="islands-about-subtitle">{island.subtitle}</span>
            </div>
            <span className={`islands-status${unlocked ? ' islands-status--unlocked' : ''}`}>
              {unlocked ? 'Unlocked' : `Locked: ${cost} bottles`}
            </span>
          </div>
          <ul className="islands-features">
            {island.features.map(feature => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>

        {!unlocked && (
          <div className="islands-card islands-guide">
            <div className="islands-guide-label islands-guide-label--rec">Recommendation</div>
            <p className="islands-guide-text">{island.guide.recommendation}</p>
            <div className="islands-guide-label">Notes</div>
            <p className="islands-guide-text">{island.guide.notes}</p>
          </div>
        )}
      </div>

      {notices.length > 0 && (
        <div className="char-notice">
          {notices.map(message => (
            <div
              key={message}
              className="char-notice-title"
            >
              {message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
