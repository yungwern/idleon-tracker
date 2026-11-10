import './TierList.css'

// ============================================================
// TierList — generic reusable tier list component
//
// Props:
//   tiers        [{id, label, sublabel, items[]}]
//                Each entry in items[] is an item id (rawName by default).
//                Row colour comes from data-tier={id} (TIER LISTS block in global.css)
//   itemsKey     string — which property holds items in each tier
//   itemMap      object — keyed by id: { name, ...anyOtherFields }
//   upgradedIds  Set<string> — IDs of upgraded items
//   getOverlay   function(id) => string|null
//                  called per item, returns an overlay image src or null
//                  all logic for WHAT overlay to show lives in the caller
//   getImageSrc  function(id) => string — defaults to `${imagePath}/${id}.png`
//   getCaption   function(id) => string|null — small text under the image (e.g. a level)
//   getItemClass function(id) => string — extra class(es) for the item (caller-styled states)
//   onItemClick  function(id) — makes items buttons; selectedId gets .tl-item--selected
// ============================================================

export default function TierList({
  tiers = [],
  itemsKey = 'items',
  itemMap = {},
  upgradedIds = new Set(),
  getOverlay = () => null,
  imagePath = '/images',
  getImageSrc,
  getCaption = () => null,
  getItemClass = () => '',
  onItemClick,
  selectedId = null,
  variant = '',
}) {
  const ItemTag = onItemClick ? 'button' : 'div'
  return (
    <div className="tl-root" data-variant={variant}>
      {tiers.map(tier => {
        const items = tier[itemsKey] ?? []
        return (
          <div key={tier.id} className="tl-tier-row" data-tier={tier.id}>

            {/* Label column */}
            <div className="tl-tier-label-col">
              <span className="tl-tier-letter">{tier.label}</span>
              {tier.sublabel && (
                <span className="tl-tier-sublabel">{tier.sublabel}</span>
              )}
            </div>

            {/* Items */}
            <div className="tl-items-wrap">
              {items.map(id => {
                const entry = itemMap[id]
                if (!entry) return null
                const isUpgraded = upgradedIds.has(id)
                const overlaySrc = isUpgraded ? getOverlay(id) : null
                const caption = getCaption(id)
                const extraClass = getItemClass(id)
                return (
                  <ItemTag
                    key={id}
                    {...(onItemClick && {
                      type: 'button',
                      onClick: () => onItemClick(id),
                    })}
                    className={`tl-item tooltip-anchor${isUpgraded ? ' tl-item--upgraded' : ''}${onItemClick ? ' tl-item--clickable' : ''}${selectedId != null && id === selectedId ? ' tl-item--selected' : ''}${extraClass ? ` ${extraClass}` : ''}`}
                  >
                    <div className="tl-item-img-wrap">
                      <img
                        src={getImageSrc ? getImageSrc(id) : `${imagePath}/${id}.png`}
                        alt={entry.name}
                        className="tl-item-img"
                      />
                      {overlaySrc && (
                        <img
                          src={overlaySrc}
                          alt=""
                          className="tl-item-overlay"
                        />
                      )}
                    </div>
                    {caption != null && (
                      <span className="tl-item-caption">{caption}</span>
                    )}
                    <span className="tooltip">{entry.name}</span>
                  </ItemTag>
                )
              })}
            </div>

          </div>
        )
      })}
    </div>
  )
}
