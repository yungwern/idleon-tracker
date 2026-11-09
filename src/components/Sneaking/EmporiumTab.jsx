import { getJadeEmporium, formatSneakingNumber } from '../../utils/sneakingUtils'

// Sneaking > Jade Emporium: every upgrade in game order, bought or its Jade Coin cost
export default function EmporiumTab({ snapshot }) {
  const upgrades = getJadeEmporium(snapshot?.sneaking)
  const jade = snapshot?.sneaking?.jadeCoins ?? 0
  return (
    <div className="sneaking-cards">
      {upgrades.map(upgrade => (
        <div
          key={upgrade.id}
          className={`sneaking-card${upgrade.unlocked ? ' sneaking-card--done' : ''}`}
        >
          <div className="sneaking-card-top">
            <img
              className="sneaking-card-icon sneaking-card-icon--wide"
              src={`images/sneaking/NjJupg${upgrade.img}.png`}
              alt=""
            />
            <span className="sneaking-card-name">{upgrade.name}</span>
            {upgrade.unlocked && <span className="sneaking-card-check">✓</span>}
          </div>
          <p className="sneaking-card-desc">{upgrade.desc}</p>
          {!upgrade.unlocked && (
            <span className={`sneaking-card-cost${jade >= upgrade.cost ? ' sneaking-card-cost--ok' : ''}`}>
              <img
                className="sneaking-card-cost-icon"
                src="images/sneaking/jade_coin.png"
                alt="Jade Coins"
              />
              {formatSneakingNumber(upgrade.cost)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
