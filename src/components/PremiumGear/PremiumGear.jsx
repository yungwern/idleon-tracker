import { premiumGearNames, premiumGearMap } from '../../data'
import { getPremiumGear } from '../../utils/premiumGearUtils.js'
import './PremiumGear.css'

function PremiumGearSlot({ slot }) {
  const { src, label, equipped, id } = slot
  const equipment = premiumGearMap[id] ?? {}
  const uq1 = equipment.uq1txt && equipment.uq1val != null ? `${equipment.uq1val}${equipment.uq1txt.replace(/_/g, ' ')}` : null
  const uq2 = equipment.uq2txt && equipment.uq2val != null ? `${equipment.uq2val}${equipment.uq2txt.replace(/_/g, ' ')}` : null

  return (
    <div className="premium-gear-item tooltip-anchor" style={{ position: 'relative' }}>
      <div className="tooltip">{equipped ? (premiumGearNames[id] ?? id) : `No ${label} Equipped`}</div>
      <div className={`premium-gear-slot ${equipped ? 'equipped' : 'unequipped'}`}>
        {equipped ? (
          <img
            src={src}
            alt={id}
            className="premium-gear-image"
            onError={e => { e.currentTarget.alt = `Missing: ${id}` }}
          />
        ) : (
          <div className="premium-gear-empty">
            <span className="premium-gear-empty-icon">
              {label === 'Hat'   && '🎩'}
              {label === 'Cape'  && '🧣'}
              {label === 'Armor' && '🛡️'}
              {label === 'Ring'  && '💍'}
            </span>
          </div>
        )}
      </div>
      {equipped && uq1 && <span className="premium-gear-stat">{uq1}</span>}
      {equipped && uq2 && <span className="premium-gear-stat">{uq2}</span>}
    </div>
  )
}

export default function PremiumGearTab({ charIndex, snapshot }) {
  const gear = getPremiumGear(snapshot, charIndex)

  if (!snapshot) {
    return (
      <div className="no-save">
        <span className="no-save-icon">📂</span>
        <p>Import your save to see equipped premium gear.</p>
      </div>
    )
  }

  return (
    <div className="premium-gear-tab">
      <div className="premium-gear-slots">
        <PremiumGearSlot slot={gear.hat}   />
        <PremiumGearSlot slot={gear.cape}  />
        <PremiumGearSlot slot={gear.armor} />
        <PremiumGearSlot slot={gear.ring}  />
      </div>
    </div>
  )
}