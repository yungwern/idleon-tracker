import { cardMap, fishMap, OMAR_QUESTS, SEASALT_FISH } from '../../data'
import { formatCardEffect, getCardStars, isCardOwned } from '../../utils/cardUtils'
import IslandOverview from './IslandOverview'

// Seasalt Island: its 4 fish and their cards, and Omar's quests (his last one needs this island)

export default function SeasaltTab({ snapshot, island, notices }) {
  const islands = snapshot.islands

  return (
    <div className="islands-tab-body">
      <IslandOverview
        snapshot={snapshot}
        island={island}
        notices={notices}
      />

      <div className="islands-card">
        <h3 className="islands-card-title">Seasalt fish</h3>
        <p className="islands-card-note">Card bonus at your stars (base × (stars + 1)), while the card is equipped.</p>
        <div className="islands-fish">
          {SEASALT_FISH.map(rawName => {
            const fish = fishMap[rawName]
            const card = cardMap[rawName]
            const owned = isCardOwned(rawName, snapshot.cards)
            const stars = owned ? getCardStars(rawName, snapshot.cards) : -1
            return (
              <div
                key={rawName}
                className="islands-fish-row"
              >
                <img
                  className="islands-fish-icon"
                  src={fish.img}
                  alt=""
                />
                <span className="islands-fish-name">{fish.name}</span>
                {card && (
                  <>
                    <img
                      className="islands-fish-card"
                      src={card.img}
                      alt=""
                    />
                    <span className="islands-fish-effect">
                      {owned ? formatCardEffect(card.effect, card.bonus * (stars + 1)) : formatCardEffect(card.effect, card.bonus)}
                    </span>
                    <span className={`islands-fish-stars${owned ? '' : ' islands-fish-stars--missing'}`}>
                      {owned ? `${stars} ★` : 'No card'}
                    </span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="islands-card">
        <h3 className="islands-card-title">
          Omar Da Ogar quests
          <span className="islands-card-title-stat">{islands.omarQuests} / {OMAR_QUESTS.length} done</span>
        </h3>
        <p className="islands-card-note">
          Each quest adds +10% bottles. His last quest needs Seasalt Island.
        </p>
      </div>
    </div>
  )
}
