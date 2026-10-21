// Read-only anvil summary for the character Overview tab.
// Data comes from snapshot.anvil (parseAnvil in lib/extractSnapshot.js).

import './AnvilProduction.css'

export default function AnvilProduction({ charIndex, snapshot }) {
  const rows = (snapshot?.anvil?.rows ?? []).filter(row => row.charIndex === charIndex)

  if (!rows.length) {
    return <p className="anvil-prod-empty">Nothing is being produced.</p>
  }

  return (
    <div className="anvil-prod-grid">
      {rows.map(({ itemId, item, hammers }) => (
        <div
          key={itemId}
          className="anvil-prod-card"
        >
          <div className="anvil-prod-card-top">
            <img
              src={`images/anvil/${item.rawName}.png`}
              alt={item.displayName}
              className="anvil-prod-img"
            />
            {hammers > 1 && <span className="anvil-prod-badge">×{hammers}</span>}
          </div>
          <div className="anvil-prod-card-body">
            <span className="anvil-prod-name">{item.displayName}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
