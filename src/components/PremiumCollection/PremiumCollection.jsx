import { useState } from 'react'
import { formatBonusValue, getBonusColumns, getItemBonusLines } from '../../utils/collectionUtils'

import './PremiumCollection.css'

// Shared body of the Hat Rack and Cape Vine pages: summary chips (passed in), the collection's total
// bonuses, then every item with an All / Owned / Missing filter.
// items: [{ rawName, name, stats, uq, owned, share, unknown?, golden? }] (utils/hatRackUtils, capeVineUtils)
// bonuses: grouped totals from collectionUtils sumCollectionBonuses.
// Owned items come first (in sortOwned order when given, e.g. vine slot), missing ones last.

const FILTERS = [
  {
    id: 'all',
    label: 'All',
  },
  {
    id: 'owned',
    label: 'Owned',
  },
  {
    id: 'missing',
    label: 'Missing',
  },
]

// Game text is all caps: 'DROP RATE MULTI' → 'Drop Rate Multi', keeping short stat words in caps
const KEEP_CAPS = new Set(['AFK', 'EXP', 'XP', 'STR', 'AGI', 'WIS', 'LUK', 'HP', 'MP', 'RNG'])
const toTitle = text => text
  .split(' ')
  .map(word => (KEEP_CAPS.has(word) ? word : word.charAt(0) + word.slice(1).toLowerCase()))
  .join(' ')

function formatTotal(bonus, roundUp) {
  // Small epsilon: float noise (136.00000000000003) must not round up to the next number
  const value = roundUp ? Math.ceil(bonus.value - 1e-9).toLocaleString() : formatBonusValue(bonus.value)
  return `+${value}${bonus.percent ? '%' : ''}`
}

function CollectionItem({ item, imgFolder, getTag, includeStats }) {
  // Items newer than our sprites (e.g. Lovely Balloon) show a ? until the PNG is added
  const [imgMissing, setImgMissing] = useState(false)
  const lines = getItemBonusLines(item, item.owned ? item.share : 1, includeStats)
  const tag = getTag?.(item)
  const stateClass = item.owned ? '' : ' collection-item--missing'
  const goldenClass = item.golden ? ' collection-item--golden' : ''

  return (
    <div className={`collection-item${stateClass}${goldenClass}`}>
      <div className="collection-item-top">
        {item.unknown || imgMissing ? (
          <span className="collection-item-unknown">?</span>
        ) : (
          <img
            src={`images/premium gear/${imgFolder}/${item.rawName}.png`}
            alt={item.name}
            className="collection-item-img"
            onError={() => setImgMissing(true)}
          />
        )}
        {tag && <span className={`collection-item-tag ${tag.className ?? ''}`}>{tag.text}</span>}
      </div>
      <div className="collection-item-body">
        <span className="collection-item-name" title={item.name}>{item.name}</span>
        {lines.map(line => (
          <span
            key={line.key}
            className="collection-item-stat"
          >
            {toTitle(line.text)}
          </span>
        ))}
        {lines.length === 0 && (
          <span className="collection-item-stat collection-item-stat--none">
            {item.unknown ? 'New item, stats unknown' : 'No bonuses'}
          </span>
        )}
      </div>
    </div>
  )
}

export default function PremiumCollection({
  summary,
  bonuses,
  bonusesNote,
  roundUp = false,
  items,
  itemLabel,
  imgFolder,
  getTag,
  sortOwned,
  includeStats = true,
}) {
  const [filter, setFilter] = useState('all')
  const counts = {
    all: items.length,
    owned: items.filter(item => item.owned).length,
    missing: items.filter(item => !item.owned).length,
  }

  const owned = items.filter(item => item.owned)
  if (sortOwned) owned.sort(sortOwned)
  const missing = items.filter(item => !item.owned)
  const shownByFilter = {
    all: [...owned, ...missing],
    owned,
    missing,
  }
  const shown = shownByFilter[filter]

  return (
    <>
      <div className="collection-summary">{summary}</div>

      <section className="collection-panel">
        <h3 className="collection-panel-title">Total Bonuses</h3>
        {bonusesNote && <p className="collection-panel-note">{bonusesNote}</p>}
        {bonuses.length === 0 ? (
          <p className="collection-panel-empty">No {itemLabel}s stored yet.</p>
        ) : (
          <div className="collection-bonus-columns">
            {getBonusColumns(bonuses).map((column, i) => (
              <div
                key={i}
                className="collection-bonus-column"
              >
                {column.map(group => (
                  <div
                    key={group.id}
                    className="collection-bonus-group"
                  >
                    <h4 className="collection-bonus-group-title">{group.label}</h4>
                    {group.bonuses.map(bonus => (
                      <div
                        key={bonus.key}
                        className="collection-bonus"
                      >
                        <span className="collection-bonus-value">{formatTotal(bonus, roundUp)}</span>
                        <span className="collection-bonus-label">{toTitle(bonus.label)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="collection-filter">
        <div className="segmented-control">
          {FILTERS.map(option => (
            <button
              key={option.id}
              type="button"
              className={`segmented-control-btn${filter === option.id ? ' segmented-control-btn--active' : ''}`}
              onClick={() => setFilter(option.id)}
            >
              {option.label} ({counts[option.id]})
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="collection-panel-empty">
          {filter === 'missing' ? `You have every ${itemLabel}!` : `No ${itemLabel}s here.`}
        </p>
      ) : (
        <div className="collection-grid">
          {shown.map(item => (
            <CollectionItem
              key={item.rawName}
              item={item}
              imgFolder={imgFolder}
              getTag={getTag}
              includeStats={includeStats}
            />
          ))}
        </div>
      )}
    </>
  )
}
