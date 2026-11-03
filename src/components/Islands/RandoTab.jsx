import { islandMap, TRASH_BRIBE_SET, ISLAND_BRIBES } from '../../data'
import { getRandoShop, isIslandUnlocked } from '../../utils/islandUtils'
import IslandOverview from './IslandOverview'

// Rando Island: the bottle shop (drop rate / double event upgrades and the star talent book)

export default function RandoTab({ snapshot, island, notices }) {
  const islands = snapshot.islands
  const { upgrades, talent } = getRandoShop(snapshot)
  const lockedIslands = islandMap.filter(entry => entry.id !== 'rando' && !isIslandUnlocked(islands, entry.id))
  // Other islands still locked: the guide says to keep bottles for them
  const allUnlocked = lockedIslands.length === 0
  const randomGarbage = islands.trashBribes[TRASH_BRIBE_SET.findIndex(bribe => bribe.index === ISLAND_BRIBES.randomGarbage)]

  return (
    <div className="islands-tab-body">
      <IslandOverview
        snapshot={snapshot}
        island={island}
        notices={notices}
      />

      <div className="islands-summary">
        <div className="islands-stat">
          <img
            className="islands-stat-icon"
            src="images/islands/Island1.png"
            alt=""
          />
          <span className="islands-stat-value">{Math.floor(islands.bottles).toLocaleString()}</span>
          <span className="islands-stat-label">Bottles</span>
        </div>
        <div className="islands-stat tooltip-anchor">
          <img
            className="islands-stat-icon islands-stat-icon--bribe"
            src="images/islands/Bribe.png"
            alt=""
          />
          <span className={`islands-stat-value${randomGarbage ? ' islands-good' : ''}`}>{randomGarbage ? 'Bought' : 'Not bought'}</span>
          <span className="islands-stat-label">Random Garbage bribe</span>
          <div className="tooltip tooltip--wrap islands-tooltip">
            A bribe from the Garbage Tuna's set (Trash Island): random event bosses drop Garbage Piles, which makes this island's weekly event worth more.
          </div>
        </div>
      </div>

      {!allUnlocked && (
        <p className="islands-card-note islands-warning">
          Don't buy anything here yet: save your bottles until every other island is unlocked
          ({lockedIslands.map(entry => entry.shortName).join(', ')} still locked). Each unlock gets pricier, so bottles spent here push them back.
        </p>
      )}

      <div className="islands-card">
        <h3 className="islands-card-title">Bottle shop</h3>
        <div className="islands-shop">
          {upgrades.map(item => (
            <div
              key={item.id}
              className={`islands-shop-row${allUnlocked && islands.bottles >= item.cost ? ' islands-shop-row--affordable' : ''}`}
            >
              <img
                className="islands-shop-icon"
                src="images/islands/Island1.png"
                alt=""
              />
              <span className="islands-shop-name">
                {item.name}
                <span className="islands-shop-sub">+{item.bonus}{item.unit} (+{item.per} per LV)</span>
              </span>
              <span className="islands-shop-status">LV {item.level}</span>
              <span className="islands-shop-cost">{item.cost.toLocaleString()}</span>
            </div>
          ))}
          <div className={`islands-shop-row${talent.owned ? ' islands-shop-row--owned' : ''}`}>
            <img
              className="islands-shop-icon"
              src="images/islands/TalentBook1.png"
              alt=""
            />
            <span className="islands-shop-name">
              {talent.name} Talent Book
              <span className="islands-shop-sub">{talent.desc}</span>
            </span>
            <span className="islands-shop-status">{talent.owned ? 'Owned' : 'Not bought'}</span>
            <span className="islands-shop-cost">{talent.owned ? '—' : talent.cost}</span>
          </div>
        </div>
        <p className="islands-card-note">Costs are in bottles and go up with each level.</p>
      </div>
    </div>
  )
}
