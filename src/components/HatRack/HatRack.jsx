import { getHatRack } from '../../utils/hatRackUtils'
import InfoPanel from '../InfoPanel/InfoPanel'
import PremiumCollection from '../PremiumCollection/PremiumCollection'

// Hat Rack (World 3 Gallery): every premium hat the rack accepts, its multi and the rack's total bonuses.
// Math in utils/hatRackUtils.js (matches Toolbox on Eli's save).

function getHatTag(hat) {
  return hat.owned ? null : {
    text: 'Missing',
    className: 'collection-item-tag--missing',
  }
}

export default function HatRack({ snapshot }) {
  if (!snapshot?.hatRack) {
    return (
      <div className="page">
        <h2 className="page-title">Hat Rack</h2>
        <p className="page-empty">No Hat Rack data. Import (or re-import) a save to see your hats.</p>
      </div>
    )
  }

  const { hats, ownedCount, multi, bonuses } = getHatRack(snapshot)

  const summary = (
    <>
      <div className="collection-chip">
        <span className="collection-chip-label">Hats on the rack</span>
        <span className="collection-chip-value">{ownedCount} / {hats.length}</span>
      </div>
      <div className="collection-chip tooltip-anchor">
        <span className="collection-chip-label">Hat Rack multi</span>
        <span className="collection-chip-value collection-chip-value--accent">{multi.value.toFixed(2)}x</span>
        <span className="tooltip">
          {multi.parts.map(part => (
            <span
              key={part.label}
              className="collection-tooltip-row"
            >
              <span>{part.label}</span>
              <span>+{part.value}%</span>
            </span>
          ))}
          <span className="collection-tooltip-row collection-tooltip-total">
            <span>Total</span>
            <span>{multi.value.toFixed(2)}x</span>
          </span>
        </span>
      </div>
    </>
  )

  return (
    <div className="page">
      <h2 className="page-title">Hat Rack</h2>
      <InfoPanel
        intro="Every premium hat on your World 3 Hat Rack gives its bonuses to all characters, whether or not anyone wears it."
        items={[
          'Each hat on the rack adds +1% to the Hat Rack multi, which boosts every hat\'s bonuses. Hover the multi to see where the rest comes from.',
          'Owned hats show what they give you now (multi included). Missing hats are listed last with their base bonuses: pick Missing to see only those.',
        ]}
      />
      <PremiumCollection
        summary={summary}
        bonuses={bonuses}
        bonusesNote="Rounded up, the same way the rack shows them."
        roundUp
        items={hats}
        itemLabel="hat"
        imgFolder="hats"
        getTag={getHatTag}
      />
    </div>
  )
}
