import { holeVillagers } from '../../data'
import { getStudies, formatHoleNumber } from '../../utils/holeUtils'
import { getCavernDetails } from '../../utils/holeCavernUtils'
import WellPanel from './WellPanel'
import DenPanel from './DenPanel'
import BraveryPanel from './BraveryPanel'
import BellPanel from './BellPanel'
import HarpPanel from './HarpPanel'
import LampPanel from './LampPanel'
import JusticePanel from './JusticePanel'
import JarsPanel from './JarsPanel'
import WisdomPanel from './WisdomPanel'
import GambitPanel from './GambitPanel'
import TemplePanel from './TemplePanel'
import FountainPanel from './FountainPanel'
import LairPanel from './LairPanel'

// One cavern: what it is, how it gives opals, your progress, its list (bonuses, wishes, ...) and its study.
// Caverns with a full panel (CAVERN_PANELS) render it under the stat cards; the rest use getCavernDetails.

const CAVERN_PANELS = {
  0: WellPanel,
  2: DenPanel,
  3: BraveryPanel,
  4: BellPanel,
  5: HarpPanel,
  6: LampPanel,
  9: JusticePanel,
  10: JarsPanel,
  12: WisdomPanel,
  13: GambitPanel,
  14: TemplePanel,
  15: FountainPanel,
  17: LairPanel,
}

export default function CavernTab({ snapshot, cavern, unlocked, tomePoints }) {
  const opalsFound = snapshot?.caverns?.opalsPerCavern?.[cavern.id] ?? 0
  const details = getCavernDetails(snapshot, cavern.id)
  const study = getStudies(snapshot)[cavern.id]
  const unlocksVillager = holeVillagers.find(villager => villager.unlockCavern === cavern.id && cavern.id > 0)
  const Panel = CAVERN_PANELS[cavern.id]
  // Opals found here: first card of the stat row (panels put it in front of their own cards)
  const opalCard = (
    <div className="hole-card hole-stat-card">
      <span className="hole-stat-card-label">
        <img
          className="hole-inline-icon"
          src="images/hole/Opal.png"
          alt=""
        />
        Opals found here
      </span>
      <span className="hole-stat-card-value">{opalsFound.toLocaleString()}</span>
      <span className="hole-stat-card-hint">{cavern.opalSource ?? 'Opal source not written up yet.'}</span>
    </div>
  )

  return (
    <div className="hole-body">
      <div className="hole-card hole-cavern-head">
        <img
          className="hole-cavern-head-art"
          src={`images/hole/Cavern_${cavern.id}.png`}
          alt=""
        />
        <div className="hole-cavern-head-text">
          <h3 className="hole-card-title">
            Cavern {cavern.id + 1}: {cavern.name}
            <span className="hole-chip">{cavern.kind}</span>
            {!unlocked && <span className="hole-chip hole-chip--locked">Locked</span>}
          </h3>
          {cavern.guide.map(line => (
            <p
              key={line}
              className="hole-text"
            >
              {line}
            </p>
          ))}
          {cavern.link && (
            <p className="hole-text">
              {cavern.link.text}{' '}
              <a
                className="hole-link"
                href={cavern.link.url}
                target="_blank"
                rel="noreferrer"
              >
                {cavern.link.label} ↗
              </a>
            </p>
          )}
          {unlocksVillager && (
            <p className="hole-text hole-text--note">
              Reaching this cavern unlocks {unlocksVillager.name}, the {unlocksVillager.tabLabel} villager.
            </p>
          )}
        </div>
      </div>

      {!Panel && (
        <div className="hole-stats">
          {opalCard}
          {details.stats.map(stat => (
            <div
              key={stat.label}
              className="hole-card hole-stat-card"
            >
              <span className="hole-stat-card-label">{stat.label}</span>
              <span className="hole-stat-card-value">
                {stat.icon && (
                  <img
                    className="hole-stat-card-icon"
                    src={stat.icon}
                    alt=""
                  />
                )}
                {stat.value}
              </span>
              {stat.hint && <span className="hole-stat-card-hint">{stat.hint}</span>}
            </div>
          ))}
        </div>
      )}

      {details.progress != null && (
        <div
          className={`hole-bar hole-bar--cavern-${cavern.id}`}
          style={{ '--hole-progress': `${Math.round(details.progress * 100)}%` }}
        >
          <div className="hole-bar-fill" />
        </div>
      )}

      {Panel && (
        <Panel
          snapshot={snapshot}
          lead={opalCard}
          tomePoints={tomePoints}
        />
      )}

      {details.list && (
        <div className="hole-card">
          <h3 className="hole-card-title">{details.list.title}</h3>
          <div className="hole-list">
            {details.list.items.map(item => (
              <div
                key={item.name ?? item.index}
                className={`hole-list-item${item.dim ? ' hole-list-item--dim' : ''}`}
              >
                <span className="hole-list-name">{item.name}</span>
                {item.level != null && (
                  <span className="hole-list-level">
                    {item.levelLabel ? `${formatHoleNumber(item.level)} ${item.levelLabel}` : `LV ${formatHoleNumber(item.level)}`}
                  </span>
                )}
                <span className="hole-list-text">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {study && (
        <div className={`hole-card${study.active ? ' hole-card--active' : ''}`}>
          <h3 className="hole-card-title">
            Study (Bolaia)
            <span className="hole-card-title-stat">LV {study.level}</span>
            {study.active && <span className="hole-chip hole-chip--active">Studying now</span>}
            {study.peripheral && <span className="hole-chip hole-chip--active">Peripheral study</span>}
            {study.maxed && <span className="hole-chip">Maxed</span>}
          </h3>
          <p className="hole-text">{study.text}</p>
          <p className="hole-text hole-text--note">
            {study.maxLevel != null
              ? `This study caps at LV ${study.maxLevel}: higher LVs do nothing. `
              : ''}
            {!study.maxed && `Next LV: ${formatHoleNumber(study.progress)} / ${formatHoleNumber(study.req)} study progress`}
          </p>
        </div>
      )}
    </div>
  )
}
