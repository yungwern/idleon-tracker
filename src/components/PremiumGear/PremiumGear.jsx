import { premiumGearNames } from '../../data'
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

export function getPremiumGear(snapshot, charIndex) {
  const equipOrder = snapshot?.characters?.[charIndex]?.equipOrder ?? {}
  const slots = {
    hat:     { slot: '8',  folder: 'hats',     label: 'Hat',     base: 'premium gear' },
    cape:    { slot: '12', folder: 'capes',    label: 'Cape',    base: 'premium gear' },
    armor:   { slot: '15', folder: 'armor',    label: 'Armor',   base: 'premium gear' },
    ring:    { slot: '13', folder: 'rings',    label: 'Ring',    base: 'premium gear' },
    trophy:  { slot: '10', folder: 'trophies', label: 'Trophy',  base: 'cosmetics'    },
    nametag: { slot: '14', folder: 'nametags', label: 'Nametag', base: 'cosmetics'    },
  }
  return Object.fromEntries(
    Object.entries(slots).map(([key, { slot, folder, label, base }]) => {
      const id = equipOrder[slot] ?? 'Blank'
      const equipped = id !== 'Blank'
      return [key, {
        id,
        src: equipped ? `/images/${base}/${folder}/${id}.png` : null,
        label,
        equipped,
      }]
    })
  )
}