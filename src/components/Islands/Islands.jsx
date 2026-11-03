import { useState } from 'react'
import { islandMap, ISLAND_PATH_NOTE, BOTTLES_BASE_PER_DAY } from '../../data'
import { getBottlePlan, getBottlesPerDay, getUnlockedIslandCount, isIslandUnlocked } from '../../utils/islandUtils'
import { getIslandNotices } from '../../utils/islandNotices'
import InfoPanel from '../InfoPanel/InfoPanel'
import TrashTab from './TrashTab'
import RandoTab from './RandoTab'
import CrystalTab from './CrystalTab'
import SeasaltTab from './SeasaltTab'
import ShimmerTab from './ShimmerTab'
import FractalTab from './FractalTab'

import './Islands.css'

// Islands (World 2): bottles + the unlock planner on top, then one tab per island (in-game order)

const TAB_COMPONENTS = {
  trash: TrashTab,
  rando: RandoTab,
  crystal: CrystalTab,
  seasalt: SeasaltTab,
  shimmer: ShimmerTab,
  fractal: FractalTab,
}

function formatDays(days) {
  if (days == null) return '—'
  if (days === 0) return 'now'
  return `≈ ${days.toLocaleString()} ${days === 1 ? 'day' : 'days'}`
}

export default function Islands({ snapshot }) {
  const [activeTab, setActiveTab] = useState(islandMap[0].id)
  const islands = snapshot?.islands
  if (!islands) {
    return (
      <div className="page">
        <h2 className="page-title">Islands</h2>
        <p className="page-empty">No island data. Import (or re-import) a save to see your islands.</p>
      </div>
    )
  }

  const notices = getIslandNotices(snapshot)
  const bottlesPerDay = getBottlesPerDay(snapshot)
  const plan = getBottlePlan(snapshot)
  const unlockedCount = getUnlockedIslandCount(islands)
  const ActiveTab = TAB_COMPONENTS[activeTab]
  const activeIsland = islandMap.find(island => island.id === activeTab)

  return (
    <div className="page">
      <h2 className="page-title">Islands</h2>
      <InfoPanel
        intro="Your World 2 islands: bottles from the docks unlock them, and each one has its own daily or weekly thing to do."
        items={[
          'Bottles: what you have, how many wash up per day (hover for where the % comes from) and, while islands are still locked, when you can afford each one on the guide\'s path.',
          'Each tab shows what the island does, your progress there and what to buy next. Locked islands also show a short guide. Tabs get a badge when something there wants a visit.',
        ]}
      />

      <div className="islands-summary">
        <div className="islands-stat tooltip-anchor">
          <img
            className="islands-stat-icon"
            src="images/islands/Island1.png"
            alt=""
          />
          <span className="islands-stat-value">{Math.floor(islands.bottles).toLocaleString()}</span>
          <span className="islands-stat-label">Bottles</span>
          <div className="tooltip tooltip--wrap islands-tooltip">
            <div className="islands-tooltip-title">{bottlesPerDay.value} bottles / day</div>
            <div className="islands-tooltip-line">Base {BOTTLES_BASE_PER_DAY} × (1 + {bottlesPerDay.percent}%)</div>
            {bottlesPerDay.parts.map(part => (
              <div
                key={part.label}
                className={`islands-tooltip-line${part.value ? '' : ' islands-tooltip-line--off'}`}
              >
                +{part.value}% {part.label}
              </div>
            ))}
          </div>
        </div>
        <div className="islands-stat">
          <span className="islands-stat-value">{bottlesPerDay.value}</span>
          <span className="islands-stat-label">Bottles / day</span>
        </div>
        <div className="islands-stat">
          <span className="islands-stat-value">{unlockedCount} / {islandMap.length}</span>
          <span className="islands-stat-label">Islands unlocked</span>
        </div>
      </div>

      {plan.length > 0 && (
        <details
          className="dropdown-panel islands-planner"
          open
        >
          <summary className="dropdown-panel-head">
            <span className="dropdown-panel-title">Bottle unlock planner</span>
            <span className="dropdown-panel-stat">
              Next: {plan[0].island.name} for {plan[0].cost} bottles ({formatDays(plan[0].days)})
            </span>
          </summary>
          <div className="dropdown-panel-body">
            <p className="islands-planner-note">{ISLAND_PATH_NOTE}</p>
            <div className="islands-planner-rows">
              {plan.map((step, i) => (
                <div
                  key={step.island.id}
                  className={`islands-planner-row${step.affordable ? ' islands-planner-row--ready' : ''}`}
                >
                  <span className="islands-planner-step">{i + 1}</span>
                  <img
                    className="islands-plate"
                    src={step.island.img}
                    alt={step.island.name}
                  />
                  <span className="islands-planner-cost">
                    {step.cost.toLocaleString()} bottles
                    {step.island.id === 'rando' && i < plan.length - 1 && (
                      <span className="islands-planner-warn">Don't spend bottles in its shop until the rest are unlocked</span>
                    )}
                  </span>
                  <span className="islands-planner-total">{step.cumulative.toLocaleString()} total</span>
                  <span className="islands-planner-days">{formatDays(step.days)}</span>
                </div>
              ))}
            </div>
            <p className="islands-planner-foot">
              Every unlock raises the price of the islands left, so the order matters. Days assume {bottlesPerDay.value} bottles a day.
            </p>
          </div>
        </details>
      )}

      <div className="page-tabs islands-tabs">
        {islandMap.map(island => {
          const count = notices.byIsland[island.id].length
          const unlocked = isIslandUnlocked(islands, island.id)
          return (
            <button
              key={island.id}
              type="button"
              className={`page-tab-btn islands-tab${activeTab === island.id ? ' page-tab-btn--active' : ''}${unlocked ? '' : ' islands-tab--locked'}`}
              title={`${island.name}${unlocked ? '' : ' (locked)'}`}
              onClick={() => setActiveTab(island.id)}
            >
              <img
                className="islands-plate"
                src={island.img}
                alt={island.shortName}
              />
              {count > 0 && <span className="notice-badge">{count}</span>}
            </button>
          )
        })}
      </div>

      <ActiveTab
        snapshot={snapshot}
        island={activeIsland}
        notices={notices.byIsland[activeTab]}
      />
    </div>
  )
}
