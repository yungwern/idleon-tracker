import { itemMap, equipmentMap } from '../../data'

import './Keychains.css'

// '%_ALL_AFK_GAIN' / '% ALL AFK GAIN' → 'ALLAFKGAIN%' style key, so save text and equipmentMap text compare equal
const statKey = txt => String(txt).replace(/[\s_]/g, '').toUpperCase()

// Shown like Premium Gear: value + game text with underscores as spaces
const formatStat = (val, txt) => `${val}${String(txt).replace(/_/g, ' ')}`

// The two stat lines on one keychain copy. Rolled chains keep UQ1/UQ2 text + value in the save;
// fixed-stat chains (Spiritlord Horn) save UQ1txt 0, so their stats come from equipmentMap.
// max = the top roll tier when the line is the chain's own stat (equipmentMap '2 / 3 / 5').
function getKeychainStats(rawName, stats) {
  const base = equipmentMap[rawName] ?? {}
  const tiers = String(base.uq1val ?? '').split('/').map(Number)
  const isRolled = tiers.length > 1
  const maxRoll = isRolled ? tiers[tiers.length - 1] : null

  return [1, 2]
    .map(n => {
      const savedTxt = stats[`UQ${n}txt`]
      if (typeof savedTxt === 'string' && savedTxt) {
        const val = Number(stats[`UQ${n}val`] ?? 0)
        const isBaseStat = isRolled && statKey(savedTxt) === statKey(base.uq1txt)
        return {
          text: formatStat(val, savedTxt),
          max: isBaseStat && val >= maxRoll,
        }
      }
      const fixedTxt = base[`uq${n}txt`]
      const fixedVal = base[`uq${n}val`]
      if (!isRolled && fixedTxt && fixedVal != null) {
        return {
          text: formatStat(fixedVal, fixedTxt),
          max: false,
        }
      }
      return null
    })
    .filter(Boolean)
}

function KeychainCard({ keychain, equipped }) {
  const { rawName, stats } = keychain
  const name = itemMap[rawName] ?? rawName
  const lines = getKeychainStats(rawName, stats)
  const tiers = equipmentMap[rawName]?.uq1val
  const showTiers = typeof tiers === 'string' && tiers.includes('/')
  // Both stat lines at the chain's top roll tier = gold border
  const allMax = lines.length === 2 && lines.every(line => line.max)

  return (
    <div className={`keychain-card${equipped ? ' keychain-card--equipped' : ''}${allMax ? ' keychain-card--maxed' : ''}`}>
      <div className="keychain-card-top">
        <img
          src={`images/items/${rawName}.png`}
          alt={name}
          className="keychain-card-img"
        />
        <span className="keychain-card-tag">{equipped ? 'Equipped' : 'Inventory'}</span>
      </div>
      <div className={`keychain-card-body${showTiers ? ' tooltip-anchor' : ''}`}>
        <span className="keychain-card-name">{name}</span>
        {lines.map((line, i) => (
          <span
            key={i}
            className={`keychain-card-stat${line.max ? ' keychain-card-stat--max' : ''}`}
          >
            {line.text}
          </span>
        ))}
        {lines.length === 0 && <span className="keychain-card-stat keychain-card-stat--none">No stats</span>}
        {showTiers && (
          <span className="tooltip">
            Rolls {tiers}{String(equipmentMap[rawName].uq1txt).replace(/_/g, ' ')}
          </span>
        )}
      </div>
    </div>
  )
}

export default function Keychains({ charIndex, snapshot }) {
  const keychains = snapshot?.characters?.[charIndex]?.keychains

  if (!snapshot) return null

  if (!keychains) {
    return <p className="keychain-empty">Re-import your save to see keychains.</p>
  }

  const { equipped, inventory } = keychains

  if (equipped.length === 0 && inventory.length === 0) {
    return <p className="keychain-empty">No keychains equipped or in the inventory.</p>
  }

  return (
    <div className="keychain-grid">
      {equipped.map((keychain, i) => (
        <KeychainCard
          key={`eq-${i}`}
          keychain={keychain}
          equipped
        />
      ))}
      {inventory.map((keychain, i) => (
        <KeychainCard
          key={`inv-${i}`}
          keychain={keychain}
        />
      ))}
    </div>
  )
}
