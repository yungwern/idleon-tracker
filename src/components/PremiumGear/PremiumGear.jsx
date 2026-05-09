import { premiumGearNames, premiumGearMap } from '../../data'
import { getPremiumGear } from '../../utils/premiumGearUtils.js'
import './PremiumGear.css'

function PremiumGearSlot({ slot }) {
  const { src, label, equipped, id } = slot
  const equipment = premiumGearMap[id] ?? {}
  const formatStat = (val, txt) =>
    `${val}${txt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`

  const uq1 = equipment.uq1txt && equipment.uq1val != null
    ? formatStat(equipment.uq1val, equipment.uq1txt)
    : null
  const uq2 = equipment.uq2txt && equipment.uq2val != null
    ? formatStat(equipment.uq2val, equipment.uq2txt)
    : null

  return (
    <div className="pg-card">
      <div className="pg-card-top">
        {equipped ? (
          <img
            src={src}
            alt={id}
            className="pg-card-img"
            onError={e => { e.currentTarget.style.opacity = '0.3' }}
          />
        ) : (
          <span className="pg-card-empty-icon">
            {label === 'Hat'   && '🎩'}
            {label === 'Cape'  && '🧣'}
            {label === 'Armor' && '🛡️'}
            {label === 'Ring'  && '💍'}
          </span>
        )}
      </div>
      <div className="pg-card-body">
        <span className={`pg-card-name ${equipped ? '' : 'pg-card-name-empty'}`}>
          {equipped ? (premiumGearNames[id] ?? id) : `No ${label}`}
        </span>
        {equipped && uq1 && <span className="pg-card-stat">{uq1}</span>}
        {equipped && uq2 && <span className="pg-card-stat">{uq2}</span>}
      </div>
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
    <div className="pg-grid">
      <PremiumGearSlot slot={gear.hat}   />
      <PremiumGearSlot slot={gear.cape}  />
      <PremiumGearSlot slot={gear.armor} />
      <PremiumGearSlot slot={gear.ring}  />
    </div>
  )
}