import { useState } from 'react'
import { holeBiomes, holeCaverns, holeVillagers } from '../../data'
import { getVillagers, getUnlockedCaverns, getOpalSources, formatHoleNumber, CAVERN_COUNT } from '../../utils/holeUtils'
import InfoPanel from '../InfoPanel/InfoPanel'
import VillagerTab from './VillagerTab'
import CavernTab from './CavernTab'
import { getHoleNotices } from '../../utils/holeNotices'

import './Hole.css'

// The Hole (World 5 caverns): top tabs = Villagers + one per biome; inside, one sub tab per villager / cavern

const TOP_TABS = [
  { id: 'villagers', label: 'Villagers' },
  ...holeBiomes.map((biome, i) => ({ id: biome.id, label: biome.shortName, title: `Biome ${i + 1}: ${biome.name}` })),
]

export default function Hole({ snapshot, tomePoints }) {
  const [activeTop, setActiveTop] = useState('villagers')
  const [activeVillager, setActiveVillager] = useState(holeVillagers[0].tab)
  // Last opened cavern per biome, so switching biomes and back keeps your place
  const [activeCaverns, setActiveCaverns] = useState({})

  if (!snapshot?.caverns?.villagerLevels) {
    return (
      <div className="page">
        <h2 className="page-title">The Hole</h2>
        <p className="page-empty">No Hole data. Import (or re-import) a save to see your caverns.</p>
      </div>
    )
  }

  const villagers = getVillagers(snapshot)
  const unlockedCaverns = getUnlockedCaverns(snapshot)
  const opals = getOpalSources(snapshot)
  const biomeCaverns = holeCaverns.filter(cavern => cavern.biome === activeTop)
  const notices = getHoleNotices(snapshot).byCavern
  const cavernNoticeCount = id => notices[id]?.length ?? 0
  const biomeNoticeCount = biomeId => holeCaverns
    .filter(cavern => cavern.biome === biomeId)
    .reduce((sum, cavern) => sum + cavernNoticeCount(cavern.id), 0)
  const activeCavernId = activeCaverns[activeTop] ?? biomeCaverns[0]?.id
  const activeCavern = holeCaverns.find(cavern => cavern.id === activeCavernId)

  return (
    <div className="page">
      <h2 className="page-title">The Hole</h2>
      <InfoPanel
        intro="Your World 5 caverns: five villagers run the Hole, and 18 caverns across four biomes give opals and bonuses."
        items={[
          'Villagers: level, EXP and opals invested for each villager, plus what they unlock. Villager EXP comes before everything else.',
          'Each biome tab has one tab per cavern: what it does, how it gives opals, and your progress there.',
        ]}
      />

      <div className="hole-summary">
        <div className="hole-stat">
          <span className="hole-stat-value">{unlockedCaverns} / {CAVERN_COUNT}</span>
          <span className="hole-stat-label">Caverns</span>
        </div>
        <div className="hole-stat">
          <img
            className="hole-stat-icon"
            src="images/hole/Opal.png"
            alt=""
          />
          <span className="hole-stat-value">{formatHoleNumber(opals.found)}</span>
          <span className="hole-stat-label">Opals found</span>
        </div>
        <div className="hole-stat tooltip-anchor">
          <img
            className="hole-stat-icon"
            src="images/hole/Opal.png"
            alt=""
          />
          <span className="hole-stat-value">{formatHoleNumber(opals.invested)}</span>
          <span className="hole-stat-label">Opals invested ⓘ</span>
          <div className="tooltip tooltip--wrap hole-tooltip">
            <div className="hole-tooltip-title">{opals.total.toLocaleString()} opals earned</div>
            <div className="hole-tooltip-line">
              <span>Found in caverns</span>
              <span>{opals.found.toLocaleString()}</span>
            </div>
            {opals.sources.map(source => (
              <div
                key={source.label}
                className={`hole-tooltip-line${source.value ? '' : ' hole-tooltip-line--off'}`}
              >
                <span>{source.label}</span>
                <span>+{formatHoleNumber(source.value)}</span>
              </div>
            ))}
            {opals.unspent > 0 && (
              <div className="hole-tooltip-line hole-tooltip-line--total">
                <span>Not invested yet</span>
                <span>{opals.unspent.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-tabs hole-tabs">
        {TOP_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`page-tab-btn hole-top-tab${activeTop === tab.id ? ' page-tab-btn--active' : ''}`}
            title={tab.title}
            onClick={() => setActiveTop(tab.id)}
          >
            {tab.label}
            {biomeNoticeCount(tab.id) > 0 && <span className="notice-badge hole-tab-badge hole-tab-badge--text">{biomeNoticeCount(tab.id)}</span>}
          </button>
        ))}
      </div>

      {activeTop === 'villagers' ? (
        <>
          <div className="page-tabs page-tabs--sub hole-tabs">
            {villagers.map(villager => (
              <button
                key={villager.tab}
                type="button"
                className={`page-tab-btn hole-icon-tab${activeVillager === villager.tab ? ' page-tab-btn--active' : ''}`}
                onClick={() => setActiveVillager(villager.tab)}
              >
                <img
                  className="hole-villager-icon"
                  src={`images/hole/Villager_${villager.id}.png`}
                  alt=""
                />
                {villager.tabLabel}
              </button>
            ))}
          </div>
          <VillagerTab
            snapshot={snapshot}
            tomePoints={tomePoints}
            villager={villagers.find(villager => villager.tab === activeVillager)}
          />
        </>
      ) : (
        <>
          <div className="page-tabs page-tabs--sub hole-tabs">
            {biomeCaverns.map(cavern => (
              <button
                key={cavern.id}
                type="button"
                title={cavern.name}
                className={`page-tab-btn hole-icon-tab hole-cavern-tab${cavern.id === activeCavernId ? ' page-tab-btn--active' : ''}${cavern.id >= unlockedCaverns ? ' hole-icon-tab--locked' : ''}`}
                onClick={() => setActiveCaverns(prev => ({ ...prev, [activeTop]: cavern.id }))}
              >
                <img
                  className="hole-cavern-icon"
                  src={`images/hole/Cavern_${cavern.id}.png`}
                  alt={cavern.name}
                />
                {cavernNoticeCount(cavern.id) > 0 && (
                  <span
                    className="notice-badge hole-tab-badge"
                    title={notices[cavern.id].join('\n')}
                  >
                    {cavernNoticeCount(cavern.id)}
                  </span>
                )}
              </button>
            ))}
          </div>
          {activeCavern && (
            <CavernTab
              snapshot={snapshot}
              cavern={activeCavern}
              unlocked={activeCavern.id < unlockedCaverns}
              tomePoints={tomePoints}
            />
          )}
        </>
      )}
    </div>
  )
}
