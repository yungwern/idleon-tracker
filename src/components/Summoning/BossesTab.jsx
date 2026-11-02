import { mobsMap } from '../../data'
import { getSummoningStoneBosses, formatStoneHp } from '../../utils/summoningUtils'

// Summoning > Bosses: the 7 summoning stone bosses (data/summoningMap.js summoningStoneBosses),
// with kills, next fight HP, the colour bonus and where each stone is

function getMobName(mobKey) {
  return mobsMap[mobKey] ?? mobKey.replaceAll('_', ' ')
}

function BossCard({ boss }) {
  const colourSlug = boss.colour.toLowerCase()
  const mapMobName = getMobName(boss.mapMob)
  return (
    <div className={`summoning-boss summoning-colour--${colourSlug}`}>
      <div className="summoning-boss-top">
        <img
          className="summoning-boss-stone"
          src={`images/summoning/SumStone_${boss.index}.png`}
          alt={`${boss.colour} summoning stone`}
        />
        <img
          className="summoning-boss-sprite"
          src={`images/mobs/${boss.boss}.png`}
          alt={getMobName(boss.boss)}
        />
        <div className="summoning-boss-info-col">
          <span className="summoning-boss-name">{boss.name}</span>
          <span className="summoning-boss-bonus tooltip-anchor">
            <span className="summoning-boss-colour">{boss.colour}</span>
            {boss.kills > 0 ? ` ${boss.bonusMulti}x higher bonuses` : ' bonuses not boosted yet'}
            <span className="tooltip tooltip--wrap buff-tooltip">
              <span className="buff-tooltip-line">
                Next kill: {boss.colour} upgrades {boss.nextBonusMulti}x
              </span>
            </span>
          </span>
        </div>
        <div className="summoning-boss-stats">
          <span className="summoning-boss-stat">
            Kills: <strong>{boss.kills}</strong>
          </span>
          <span className="summoning-boss-stat tooltip-anchor">
            HP: <strong>{formatStoneHp(boss.hp)}</strong>
            <span className="summoning-boss-info">ⓘ</span>
            <span className="tooltip tooltip--right buff-tooltip">
              <span className="buff-tooltip-name">Next fights</span>
              {boss.upcoming.map(fight => (
                <span
                  key={fight.kills}
                  className="buff-tooltip-line"
                >
                  Kills {fight.kills}: {formatStoneHp(fight.hp)}
                </span>
              ))}
            </span>
          </span>
        </div>
      </div>

      <div className="summoning-boss-location">
        <span className="summoning-boss-label">Found at:</span>
        <span className="summoning-boss-map-name">{boss.mapName}</span>
        <span className="summoning-boss-mob tooltip-anchor">
          <img
            className="summoning-boss-mob-img"
            src={`images/mobs/${boss.mapMob}.png`}
            alt={mapMobName}
          />
          <span className="tooltip">{mapMobName}</span>
        </span>
      </div>
    </div>
  )
}

export default function BossesTab({ snapshot }) {
  const bosses = getSummoningStoneBosses(snapshot?.summoning)
  if (!snapshot?.summoning?.stoneKills) {
    return <p className="page-empty">Re-import your save to see your summoning boss kills.</p>
  }
  const totalKills = bosses.reduce((sum, boss) => sum + boss.kills, 0)
  return (
    <>
      <p className="summoning-bosses-total">
        Total boss kills: <strong>{totalKills}</strong>
      </p>
      <div className="summoning-bosses">
        {bosses.map(boss => (
          <BossCard
            key={boss.index}
            boss={boss}
          />
        ))}
      </div>
    </>
  )
}
