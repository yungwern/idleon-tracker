import { Fragment } from 'react'
import { TRASH_BRIBE_SET } from '../../data'
import { formatBigNumber } from '../../utils/cogBoardUtils'
import {
  getGarbagePerDay,
  getGarbageWaiting,
  getTrashBuyOrder,
  getTrashShop,
  isTrashBribeSetOwned,
} from '../../utils/islandUtils'
import IslandOverview from './IslandOverview'

// Trash Island: garbage, the Garbage Tuna's shop, what to buy next, and his bribe set

function formatWait(days) {
  if (days === 0) return 'now'
  return `≈ ${days.toLocaleString()} ${days === 1 ? 'day' : 'days'}`
}

function getStatusLabel(item) {
  if (item.owned === null) return `LV ${item.level}`
  return item.owned ? 'Owned' : 'Not bought'
}

export default function TrashTab({ snapshot, island, notices }) {
  const islands = snapshot.islands
  const garbage = islands.garbage
  const perDay = getGarbagePerDay(islands.garbageGainLevel)
  const waiting = getGarbageWaiting(islands.trashDays, islands.garbageGainLevel)
  const shop = getTrashShop(snapshot)
  const { order, allItemsDay, itemsLeft, gainFirst } = getTrashBuyOrder(snapshot)
  const garbagePow = garbage >= 1 ? Math.floor(Math.log10(garbage)) : 0
  const setOwned = isTrashBribeSetOwned(islands)

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
            className="islands-stat-icon islands-stat-icon--small"
            src="images/islands/Trash_Currency.png"
            alt=""
          />
          <span className="islands-stat-value">{formatBigNumber(garbage)}</span>
          <span className="islands-stat-label">Garbage</span>
        </div>
        <div className="islands-stat tooltip-anchor">
          <span className="islands-stat-value">≈ {perDay}</span>
          <span className="islands-stat-label">Garbage / day</span>
          <div className="tooltip tooltip--wrap islands-tooltip">
            From your Garbage Gain level ({islands.garbageGainLevel}). An estimate: the game adds a random amount on top.
          </div>
        </div>
        <div className="islands-stat tooltip-anchor">
          <span className="islands-stat-value">{waiting}</span>
          <span className="islands-stat-label">Waiting ({islands.trashDays} {islands.trashDays === 1 ? 'day' : 'days'})</span>
          <div className="tooltip tooltip--wrap islands-tooltip">
            Garbage on the beach from unclaimed days (estimate). One pickup is capped at 100.
          </div>
        </div>
        <div className="islands-stat tooltip-anchor">
          <span className="islands-stat-value">POW {garbagePow}</span>
          <span className="islands-stat-label">Filthy Damage</span>
          <div className="tooltip tooltip--wrap islands-tooltip">
            The Filthy Damage star talent gives % damage per power of 10 garbage you hold, so a big buy can cost you a power.
          </div>
        </div>
      </div>

      <div className="islands-columns">
        <div className="islands-card">
          <h3 className="islands-card-title">Garbage Tuna shop</h3>
          <div className="islands-shop">
            {shop.map(item => {
              const affordable = item.owned !== true && garbage >= item.cost
              return (
                <div
                  key={item.id}
                  className={`islands-shop-row${item.owned === true ? ' islands-shop-row--owned' : ''}${affordable ? ' islands-shop-row--affordable' : ''}`}
                >
                  <img
                    className="islands-shop-icon"
                    src={item.img}
                    alt=""
                  />
                  <span className="islands-shop-name">{item.name}</span>
                  <span className="islands-shop-status">{getStatusLabel(item)}</span>
                  <span className="islands-shop-cost">
                    {item.owned === true ? '—' : formatBigNumber(item.cost)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="islands-card">
          <h3 className="islands-card-title">
            Buy order
            {itemsLeft > 0 && (
              <span className="islands-card-title-stat">All items {formatWait(allItemsDay)}</span>
            )}
          </h3>
          <p className="islands-card-note">
            Every one-time item as fast as possible (the bribe set first), then always the cheapest upgrade.
            {gainFirst > 0 && ` Buying ${gainFirst} Garbage Gain ${gainFirst === 1 ? 'level' : 'levels'} first gets the items sooner.`}
            {' '}Waits count the garbage you have now and grow with each Garbage Gain level.
          </p>
          <ol className="islands-order">
            {order.map((step, i) => (
              <Fragment key={`${step.item.id}-${i}`}>
                {step.phase === 'upgrades' && order[i - 1]?.phase === 'items' && (
                  <li className="islands-order-divider">Then the cheapest upgrade</li>
                )}
                <li className={`islands-order-row${step.affordable ? ' islands-order-row--ready' : ''}`}>
                  <img
                    className="islands-shop-icon"
                    src={step.item.img}
                    alt=""
                  />
                  <span className="islands-shop-name">
                    {step.item.name}
                    {step.item.level != null && ` (LV ${step.item.level + 1})`}
                  </span>
                  <span className="islands-shop-cost">{formatBigNumber(step.cost)}</span>
                  <span className="islands-order-when">{formatWait(step.days)}</span>
                </li>
              </Fragment>
            ))}
          </ol>
        </div>
      </div>

      <div className="islands-card">
        <h3 className="islands-card-title">
          Garbage Tuna bribe set
          <span className="islands-card-title-stat">
            {islands.trashBribes.filter(Boolean).length} / {TRASH_BRIBE_SET.length} bought
          </span>
        </h3>
        {!setOwned && (
          <p className="islands-card-note">
            {islands.artOfTheBail
              ? 'The Art of the Bail is bought: buy the bribe set from the Garbage Tuna to unlock these.'
              : 'Buy The Art of the Bail bribe first, then the bribe set from the Garbage Tuna.'}
          </p>
        )}
        <div className="islands-bribes">
          {TRASH_BRIBE_SET.map((bribe, i) => (
            <div
              key={bribe.index}
              className={`islands-bribe${islands.trashBribes[i] ? ' islands-bribe--owned' : ''}`}
            >
              <span className="islands-bribe-check">{islands.trashBribes[i] ? '✓' : '·'}</span>
              <span className="islands-bribe-name">{bribe.name}</span>
              <span className="islands-bribe-desc">{bribe.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
