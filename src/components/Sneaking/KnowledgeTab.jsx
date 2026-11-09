import { getKnowledgeUpgrades, fillSneakingText } from '../../utils/sneakingUtils'

// Sneaking > Upgrades: the Ninja Knowledge tree (Ninja[103]) split into the 17 knowledge upgrades and the
// mini Ninja Knowledge upgrades the Coral Reef unlocks. Omnijade levels count toward the level (gold, like the game).
function UpgradeCard({ upgrade }) {
  const hasOmnijade = upgrade.omnijadePlaced || upgrade.omnijadeLevels > 0
  const shownLevel = upgrade.level + (hasOmnijade ? upgrade.omnijadeLevels : 0)
  return (
    <div className={`sneaking-card${upgrade.unlocked ? '' : ' sneaking-card--locked'}`}>
      <div className="sneaking-card-top">
        <span className="sneaking-card-icon-box">
          <img
            className="sneaking-card-icon"
            src={`images/sneaking/NjUpgI${upgrade.index}.png`}
            alt=""
          />
        </span>
        <span className="sneaking-card-name">{upgrade.name}</span>
        <span className={`sneaking-card-level${hasOmnijade ? ' sneaking-card-level--omnijade' : ''}`}>
          LV {shownLevel.toLocaleString('en-US')}
        </span>
      </div>
      <p className="sneaking-card-desc">{fillSneakingText(upgrade.desc, upgrade.value)}</p>
      {hasOmnijade && (
        <span className="sneaking-card-note">
          <img
            className="sneaking-card-note-icon"
            src="images/sneaking/Omnijade.png"
            alt=""
          />
          Omnijade +{upgrade.omnijadeLevels} LV
        </span>
      )}
      {upgrade.lockReason && <span className="sneaking-card-lock">🔒 {upgrade.lockReason}</span>}
    </div>
  )
}

export default function KnowledgeTab({ snapshot }) {
  const upgrades = getKnowledgeUpgrades(snapshot?.sneaking).filter(upgrade => !upgrade.placeholder)
  const groups = [
    {
      title: 'Ninja Knowledge',
      list: upgrades.filter(upgrade => !upgrade.isSpecial),
    },
    {
      title: 'Mini Ninja Knowledge (Coral Reef)',
      list: upgrades.filter(upgrade => upgrade.isSpecial),
    },
  ]
  return groups.map(group => (
    <div key={group.title}>
      <div className="sneaking-section-title">{group.title}</div>
      <div className="sneaking-cards">
        {group.list.map(upgrade => (
          <UpgradeCard
            key={upgrade.index}
            upgrade={upgrade}
          />
        ))}
      </div>
    </div>
  ))
}
