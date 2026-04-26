import { premiumGearNames } from '../../data'
import { getPremiumGear } from '../../utils/premiumGearUtils.js'
import './PremiumGear.css'

function PremiumGearSlot({ slot }) {
  const { src, label, equipped, id } = slot

  return (
    <div className="premium-gear-item">
      <div className={`premium-gear-slot ${equipped ? 'equipped' : 'unequipped'}`}>
        {equipped ? (
          <img
            src={src}
            alt={id}
            className="premium-gear-image"
            title={id}
            onError={e => {
              e.currentTarget.alt = `Missing: ${id}`
            }}
          />
        ) : (
          <div className="premium-gear-empty" title={`No ${label} equipped`}>
            <span className="premium-gear-empty-icon">
              {label === 'Hat'   && '🎩'}
              {label === 'Cape'  && '🧣'}
              {label === 'Armor' && '🛡️'}
              {label === 'Ring'  && '💍'}
            </span>
          </div>
        )}
      </div>
      <span className={`premium-gear-label ${equipped ? '' : 'unequipped-label'}`}>
        {equipped ? (premiumGearNames[id] ?? id) : `No ${label}`}
      </span>
    </div>
  )
}

export default function PremiumGearTab({ charIndex, snapshot }) {
  const gear = getPremiumGear(snapshot, charIndex)

  if (!snapshot) {
    return (
      <div className="premium-gear-no-save">
        <span className="premium-gear-no-save-icon">📂</span>
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