import { useState } from 'react'
import { cookingMap, cookingBonusTypes } from '../../data'
import { ribbonMulti, ribbonData, ribbonTierClass, masteryNodeMulti, RIBBON_MAX_RANK } from '../../utils/cookingUtils'
import InfoPanel from '../InfoPanel/InfoPanel'
import './Cooking.css'

const TABS = [
  { id: 'meals', label: 'Meal Ribbons' },
  { id: 'shelf', label: 'Ribbon Shelf' },
]

const hideBrokenImg = e => {
  e.currentTarget.style.display = 'none'
}

const mealIndex = (pngKey) => Number(pngKey.replace('CookingMB', ''))
const ribbonPriority = (pngKey) => Number(cookingMap[pngKey].ribbonPriority) || 999

// Highest meal index wins ties (newest meal first)
const newestFirst = (a, b) => mealIndex(b.pngKey) - mealIndex(a.pngKey)

// ============================================================
// RIBBON TOOLTIP
// ============================================================

const pctGain = (from, to) => `+${Math.round((to / from - 1) * 100)}%`

function RibbonTooltip({ rank }) {
  if (rank === 0) {
    return (
      <span className="tooltip cooking-tooltip">
        <span className="cooking-tooltip-title cooking-tooltip-title--plain">No Ribbon</span>
        <span>Rank 1 gives {ribbonMulti(1).toFixed(2)}x</span>
      </span>
    )
  }

  const multi = ribbonMulti(rank)
  const isMax = rank >= RIBBON_MAX_RANK
  const nextMulti = ribbonMulti(rank + 1)
  const breakpoint = Math.min(RIBBON_MAX_RANK, (Math.floor(rank / 5) + 1) * 5)
  const breakpointMulti = ribbonMulti(breakpoint)

  return (
    <span className="tooltip cooking-tooltip">
      <span className="cooking-tooltip-header">
        <img
          src={`images/cooking/Ribbon${rank - 1}.png`}
          alt=""
          className="cooking-tooltip-ribbon"
        />
        <span className={`cooking-tooltip-title ${ribbonTierClass(rank)}`}>Rank {rank} Ribbon</span>
      </span>
      <span className="cooking-tooltip-total">Multi: {multi.toFixed(2)}x</span>
      {isMax ? (
        <span>Max rank</span>
      ) : (
        <>
          <span>
            Next rank: {nextMulti.toFixed(2)}x
            <span className="cooking-tooltip-gain"> ({pctGain(multi, nextMulti)})</span>
          </span>
          {breakpoint > rank + 1 && (
            <span>
              Rank {breakpoint}: {breakpointMulti.toFixed(2)}x
              <span className="cooking-tooltip-gain"> ({pctGain(multi, breakpointMulti)})</span>
            </span>
          )}
        </>
      )}
    </span>
  )
}

// ============================================================
// MEAL CARD
// ============================================================

function MealCard({ pngKey, level, ribbonRank, nodeLevel = 0 }) {
  const meal = cookingMap[pngKey]
  if (!meal) return null

  const ribbonX = ribbonMulti(ribbonRank)
  const nodeX = masteryNodeMulti(nodeLevel)

  return (
    <div className="meal-card">
      <div className="meal-card-top">
        {nodeLevel > 0 && (
          <div className="meal-node-badge tooltip-anchor">
            <img
              src="images/cooking/CookingMasteryGold.png"
              alt=""
              className="meal-node-icon"
            />
            {nodeLevel}
            <span className="tooltip cooking-tooltip">
              <span className="cooking-tooltip-title cooking-tooltip-title--node">Mastery Node Lv {nodeLevel}</span>
              <span>Node: {nodeX.toFixed(2)}x</span>
              <span>Ribbon: {ribbonX.toFixed(2)}x</span>
              <span className="cooking-tooltip-total">Total: {(nodeX * ribbonX).toFixed(2)}x</span>
            </span>
          </div>
        )}
        <img
          src={`images/cooking/${pngKey}.png`}
          alt={meal.name}
          className="meal-img"
          onError={hideBrokenImg}
        />
        <div className="meal-ribbon-overlay tooltip-anchor">
          <img
            src={`images/cooking/Ribbon${ribbonRank > 0 ? ribbonRank - 1 : 0}.png`}
            alt={`Ribbon ${ribbonRank}`}
            className={`meal-ribbon-img ${ribbonRank === 0 ? 'meal-ribbon-none' : ''}`}
            onError={hideBrokenImg}
          />
          {ribbonRank > 0 && (
            <span className={`meal-ribbon-rank ${ribbonTierClass(ribbonRank)}`}>{ribbonRank}</span>
          )}
          <RibbonTooltip rank={ribbonRank} />
        </div>
      </div>
      <div className="meal-card-body">
        <span className="meal-name">{meal.name}</span>
        <span className="meal-bonus">{meal.bonus}</span>
        <span className="meal-level">Lv. {level}</span>
      </div>
    </div>
  )
}

// ============================================================
// RIBBON SHELF TAB
// ============================================================

function RibbonShelfTab({ slots }) {
  return (
    <>
      <div className="ribbon-shelf-row">
        <div className="ribbon-shelf-col">
          <div className="cooking-group-label">Ribbon Shelf</div>
          <div className="ribbon-shelf-grid">
            {slots.map((rank, i) => (
              <div
                key={i}
                className={`ribbon-shelf-slot ${rank > 0 ? 'tooltip-anchor' : 'ribbon-shelf-slot--empty'}`}
              >
                {rank > 0 ? (
                  <>
                    <img
                      src={`images/cooking/Ribbon${rank - 1}.png`}
                      alt={`Ribbon ${rank}`}
                      className="ribbon-shelf-img"
                      onError={hideBrokenImg}
                    />
                    <span className={`ribbon-shelf-rank ${ribbonTierClass(rank)}`}>
                      {rank}
                    </span>
                    <RibbonTooltip rank={rank} />
                  </>
                ) : (
                  <div className="ribbon-shelf-empty" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="ribbon-table-col">
          <div className="cooking-group-label">Ribbon Multiplier Table</div>
          <table className="ribbon-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Multi</th>
                <th>vs Previous</th>
                <th>Rank 1s Required</th>
              </tr>
            </thead>
            <tbody>
              {ribbonData.map(({ rank, multi, vsLast, rank1sRequired }) => (
                <tr key={rank} className={rank % 5 === 0 ? 'ribbon-table-row--milestone' : ''}>
                  <td className={ribbonTierClass(rank)}>
                    {rank}
                  </td>
                  <td>{multi.toFixed(2)}x</td>
                  <td>{vsLast ? `${vsLast.toFixed(2)}x` : '—'}</td>
                  <td>{rank1sRequired.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Cooking({ snapshot }) {
  const [activeTab, setActiveTab] = useState('meals')
  const { mealLevels = [], mealRibbons = [], cabinetSlots = [], masteryNodes = [] } = snapshot?.cooking ?? {}

  const allMeals = Object.keys(cookingMap).map((pngKey) => {
    const index = mealIndex(pngKey)
    return {
      pngKey,
      level: mealLevels[index] ?? 0,
      ribbonRank: mealRibbons[index] ?? 0,
      nodeLevel: masteryNodes[index] ?? 0,
      bonus: cookingMap[pngKey].bonus,
    }
  })

  const grouped = {}
  const categorized = new Set()

  Object.entries(cookingBonusTypes).forEach(([groupName, bonuses]) => {
    if (!bonuses.length) return
    const meals = allMeals
      .filter(m => bonuses.includes(m.bonus))
      .sort((a, b) => ribbonPriority(a.pngKey) - ribbonPriority(b.pngKey))
    if (meals.length) {
      grouped[groupName] = meals
      meals.forEach(m => categorized.add(m.pngKey))
    }
  })

  const uncategorized = allMeals.filter(m => !categorized.has(m.pngKey))

  const categorizedMeals = allMeals.filter(m => categorized.has(m.pngKey))
  const overallLowest = Math.min(...categorizedMeals.map(m => m.ribbonRank))
  const lowestRibbonMeal = categorizedMeals
    .filter(m => m.ribbonRank === overallLowest)
    .sort(newestFirst)[0]

  const lowestLevel = Math.min(...allMeals.map(m => m.level))
  const nmlbMeal = allMeals
    .filter(m => m.level === lowestLevel)
    .sort(newestFirst)[0]

  return (
    <div className="page cooking-page">
      <h2 className="page-title">Cooking</h2>

      <InfoPanel
        intro="This page is used to track ribbon levels on each meal. A few things to keep in mind when using this page:"
        items={[
          'Meals are sorted into categories by bonus types and each category is sorted in priority of which meal to ribbon first.',
          'Categories are not ordered in priority — use your best judgement to prioritize categories based on account needs.',
          'The category "NRLB / NMLB" is used to easily identify which tier ribbons are no longer needed. For example, if a meal is shown in this category with a level 5 ribbon, then you know that any ribbons below level 5 can be instantly upgraded in your ribbon shelf. This section is NOT intended to be used as a "which ribbon to upgrade next section," although it can be used that way if you want to evenly upgrade ribbon tiers across all your meals.',
          'In general it\'s best to reach ribbon breakpoints of 5, 10, 15, 20, and 25. Reaching these breakpoints provides the highest multi increases.',
          'The gold ladle badge is the meal\'s Cooking Mastery level. Hover it to see the combined multiplier. Each mastery point is worth less than the last (the 1st point is +17%, the 10th only about +1.5%).',
          'Remember that you can upgrade ribbons on existing meals by dragging a ribbon of the same tier on top of it, the same way you upgrade in the ribbon shelf.',
        ]}
      />

      <div className="page-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`page-tab-btn${activeTab === tab.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Ribbon Shelf Tab ── */}
      {activeTab === 'shelf' && <RibbonShelfTab slots={cabinetSlots} />}

      {/* ── Meal Ribbons Tab ── */}
      {activeTab === 'meals' && (
        <>
          {/* NRLB / NMLB */}
          <div className="cooking-tracker-row">
            <div className="cooking-tracker-col">
              <div className="cooking-group-label">No Ribbon Left Behind (NRLB)</div>
              <div className="meal-grid meal-grid--centered">
                {lowestRibbonMeal && (
                  <MealCard
                    pngKey={lowestRibbonMeal.pngKey}
                    level={lowestRibbonMeal.level}
                    ribbonRank={lowestRibbonMeal.ribbonRank}
                    nodeLevel={lowestRibbonMeal.nodeLevel}
                  />
                )}
              </div>
            </div>
            <div className="cooking-tracker-divider" />
            <div className="cooking-tracker-col">
              <div className="cooking-group-label">No Meal Left Behind (NMLB)</div>
              <div className="meal-grid meal-grid--centered">
                {nmlbMeal && (
                  <MealCard
                    pngKey={nmlbMeal.pngKey}
                    level={nmlbMeal.level}
                    ribbonRank={nmlbMeal.ribbonRank}
                    nodeLevel={nmlbMeal.nodeLevel}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bonus type groups */}
          {Object.entries(grouped).map(([title, meals]) => (
            <div key={title} className="cooking-meal-group">
              <div className="cooking-group-label">{title}</div>
              <div className="meal-grid">
                {meals.map(({ pngKey, level, ribbonRank, nodeLevel }) => (
                  <MealCard
                    key={pngKey}
                    pngKey={pngKey}
                    level={level}
                    ribbonRank={ribbonRank}
                    nodeLevel={nodeLevel}
                  />
                ))}
              </div>
            </div>
          ))}

          {uncategorized.length > 0 && (
            <div className="cooking-meal-group">
              <div className="cooking-group-label">Uncategorized</div>
              <div className="meal-grid">
                {uncategorized.map(({ pngKey, level, ribbonRank, nodeLevel }) => (
                  <MealCard
                    key={pngKey}
                    pngKey={pngKey}
                    level={level}
                    ribbonRank={ribbonRank}
                    nodeLevel={nodeLevel}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}