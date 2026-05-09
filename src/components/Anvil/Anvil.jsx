import { classColor } from '../../utils/appUtils'
import InfoPanel from '../InfoPanel/InfoPanel'

import './Anvil.css'

// ============================================================
// ANVIL CARD
// ============================================================

function AnvilCard({ row }) {
  const { item, hammers } = row

  return (
    <div className="anvil-card">
      <img
        src={`/images/anvil/${item.rawName}.png`}
        alt={item.displayName}
        className="anvil-item-img"
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
      <span className="anvil-item-name">{item.displayName}</span>
      {hammers > 1 && <span className="anvil-slots-badge">×{hammers}</span>}
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Anvil({ snapshot }) {
  const { rows = [] } = snapshot?.anvil ?? {}

  const byChar = {}
  rows.forEach(row => {
    if (!byChar[row.charIndex]) byChar[row.charIndex] = []
    byChar[row.charIndex].push(row)
  })

  const hasData = rows.length > 0

  return (
    <div className="page anvil-page">
      <h2 className="page-title">Anvil</h2>
      <InfoPanel
        intro="This section currently only shows what each character is producing. Full production stats and optimizations coming in a future update."
      />

      {!hasData ? (
        <p className="anvil-empty">No active anvil production found.</p>
      ) : (
        <div className="anvil-list">
          {Object.entries(byChar).map(([charIndex, charRows]) => (
            <div key={charIndex} className="anvil-char-group">
              <div className="anvil-char-header">
                <span className="anvil-char-label" style={{ color: classColor(charRows[0].charClass) }}>
                  {charRows[0].charName}
                </span>
              </div>
              <div className="anvil-cards">
                {charRows.map((row, i) => (
                  <AnvilCard key={i} row={row} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}