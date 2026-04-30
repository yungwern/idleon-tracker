import './TierList.css'

// ============================================================
// TierList — generic reusable tier list component
//
// Props:
//   tiers        [{id, label, sublabel, color, items[]}]
//                Each entry in items[] is a rawName string
//   itemsKey     string — which property holds items in each tier
//   itemMap      object — keyed by rawName: { name, ...anyOtherFields }
//   upgradedIds  Set<string> — IDs of upgraded items
//   getOverlay   function(rawName) => string|null
//                  called per item, returns an overlay image src or null
//                  all logic for WHAT overlay to show lives in the caller
// ============================================================

export default function TierList({
  tiers = [],
  itemsKey = 'items',
  itemMap = {},
  upgradedIds = new Set(),
  getOverlay = () => null,
  imagePath = '/images',
  variant = '',
}) {
  return (
    <div className="tl-root" data-variant={variant}>
      {tiers.map(tier => {
        const items = tier[itemsKey] ?? []
        return (
          <div key={tier.id} className="tl-tier-row" data-tier={tier.id}>

            {/* Label column */}
            <div
              className="tl-tier-label-col"
            >
              <span className="tl-tier-letter">{tier.label}</span>
              {tier.sublabel && (
                <span className="tl-tier-sublabel">{tier.sublabel}</span>
              )}
            </div>

            {/* Items */}
            <div className="tl-items-wrap">
              {items.map(rawName => {
                const entry = itemMap[rawName]
                if (!entry) return null
                const isUpgraded = upgradedIds.has(rawName)
                const overlaySrc = isUpgraded ? getOverlay(rawName) : null
                return (
                  <div
                    key={rawName}
                    className={`tl-item${isUpgraded ? ' tl-item--upgraded' : ''}`}
                    title={entry.name}
                  >
                    <div className="tl-item-img-wrap">
                      <img
                        src={`${imagePath}/${rawName}.png`}
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
                  </div>
                )
              })}
            </div>

          </div>
        )
      })}
    </div>
  )
}