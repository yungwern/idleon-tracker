import { useState } from 'react'
import { cookingMap, cookingBonusTypes, ribbonData } from '../../data'
import InfoPanel from '../InfoPanel/InfoPanel'

import './Cooking.css'



// ============================================================
// MEAL CARD (unchanged)
// ============================================================

function MealCard({ pngKey, level, ribbonRank }) {
  const meal = cookingMap[pngKey]
  if (!meal) return null

  return (
    <div className="meal-card">
      <div className="meal-card-top">
        <img
          src={`/images/cooking/${pngKey}.png`}
          alt={meal.name}
          className="meal-img"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <div className="meal-ribbon-overlay tooltip-anchor">
          <img
            src={`/images/cooking/Ribbon${ribbonRank > 0 ? ribbonRank - 1 : 0}.png`}
            alt={`Ribbon ${ribbonRank}`}
            className={`meal-ribbon-img ${ribbonRank === 0 ? 'meal-ribbon-none' : ''}`}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
          {ribbonRank > 0 && (
            <>
              <span className={`meal-ribbon-rank ${ribbonRank <= 4 ? 'ribbon-white' : ribbonRank <= 9 ? 'ribbon-bronze' : ribbonRank <= 14 ? 'ribbon-silver' : ribbonRank <= 19 ? 'ribbon-gold' : 'ribbon-diamond'}`}>{ribbonRank}</span>
              <span className="tooltip">Rank {ribbonRank} — {ribbonData[ribbonRank - 1]?.multi ?? '?'}x</span>
            </>
          )}
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
              <div key={i} className={`ribbon-shelf-slot ${rank === 0 ? 'ribbon-shelf-slot--empty' : ''}`}>
                {rank > 0 ? (
                  <>
                    <img
                      src={`/images/cooking/Ribbon${rank - 1}.png`}
                      alt={`Ribbon ${rank}`}
                      className="ribbon-shelf-img"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                    <span className={`ribbon-shelf-rank ${rank <= 4 ? 'ribbon-white' : rank <= 9 ? 'ribbon-bronze' : rank <= 14 ? 'ribbon-silver' : rank <= 19 ? 'ribbon-gold' : 'ribbon-diamond'}`}>
                      {rank}
                    </span>
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
              {ribbonData.map(({ rank, multi, vsLast }) => (
                <tr key={rank} className={rank % 5 === 0 ? 'ribbon-table-row--milestone' : ''}>
                  <td className={rank <= 4 ? 'ribbon-white' : rank <= 9 ? 'ribbon-bronze' : rank <= 14 ? 'ribbon-silver' : rank <= 19 ? 'ribbon-gold' : 'ribbon-diamond'}>
                    {rank}
                  </td>
                  <td>{multi}x</td>
                  <td>{vsLast ? `${vsLast}x` : '—'}</td>
                  <td>{rank === 1 ? 1 : Math.pow(2, rank - 1).toLocaleString()}</td>
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
  const { mealLevels = [], mealRibbons = [], cabinetSlots = [] } = snapshot?.cooking ?? {}

  const allMeals = Object.keys(cookingMap).map((pngKey) => {
    const index = parseInt(pngKey.replace('CookingMB', ''))
    return {
      pngKey,
      level: mealLevels[index] ?? 0,
      ribbonRank: mealRibbons[index] ?? 0,
      bonus: cookingMap[pngKey].bonus,
    }
  })

  const grouped = {}
  const categorized = new Set()

  Object.entries(cookingBonusTypes).forEach(([groupName, bonuses]) => {
    if (!bonuses.length) return
    const meals = allMeals
      .filter(m => bonuses.includes(m.bonus))
      .sort((a, b) => {
        const pa = cookingMap[a.pngKey].ribbonPriority || 999
        const pb = cookingMap[b.pngKey].ribbonPriority || 999
        return pa - pb
      })
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
    .sort((a, b) => parseInt(b.pngKey.replace('CookingMB', '')) - parseInt(a.pngKey.replace('CookingMB', '')))[0]

  const lowestLevel = Math.min(...allMeals.map(m => m.level))
  const nmlbMeal = allMeals
    .filter(m => m.level === lowestLevel)
    .sort((a, b) => parseInt(b.pngKey.replace('CookingMB', '')) - parseInt(a.pngKey.replace('CookingMB', '')))[0]

  return (
    <div className="page cooking-page">
      <h2 className="page-title">Cooking</h2>

      <InfoPanel
        intro="This page is used to track ribbon levels on each meal. A few things to keep in mind when using this page:"
        items={[
          'Meals are sorted into categories by bonus types.',
          'Each category is sorted in priority of which meal to ribbon first.',
          'Categories are not ordered in priority — use your best judgement to prioritize categories based on account needs.',
          'The category "NRLB / NMLB" is used to easily identify which tier ribbons are no longer needed. For example, if a meal is shown in this category with a level 5 ribbon, then you know that any ribbons below level 5 can be instantly upgraded in your ribbon shelf. This section is NOT intended to be used as a "which ribbon to upgrade next section," although it can be used that way if you want to evenly upgrade ribbon tiers across all your meals.',
          'In general it\'s best to reach ribbon breakpoints of 5, 10, 15, and 20. Reaching these breakpoints provides the highest multi increases.',
          'Remember that you can upgrade ribbons on existing meals by dragging a ribbon of the same tier on top of it, the same way you upgrade in the ribbon shelf.',
        ]}
      />

      {/* ── Nav Bar ── */}
      <div className="cooking-nav">
        <button
          className={`cooking-nav-btn${activeTab === 'meals' ? ' cooking-nav-btn--active' : ''}`}
          onClick={() => setActiveTab('meals')}
        >
          Meal Ribbons
        </button>
        <button
          className={`cooking-nav-btn${activeTab === 'shelf' ? ' cooking-nav-btn--active' : ''}`}
          onClick={() => setActiveTab('shelf')}
        >
          Ribbon Shelf
        </button>
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
                  <MealCard pngKey={lowestRibbonMeal.pngKey} level={lowestRibbonMeal.level} ribbonRank={lowestRibbonMeal.ribbonRank} />
                )}
              </div>
            </div>
            <div className="cooking-tracker-divider" />
            <div className="cooking-tracker-col">
              <div className="cooking-group-label">No Meal Left Behind (NMLB)</div>
              <div className="meal-grid meal-grid--centered">
                {nmlbMeal && (
                  <MealCard pngKey={nmlbMeal.pngKey} level={nmlbMeal.level} ribbonRank={nmlbMeal.ribbonRank} />
                )}
              </div>
            </div>
          </div>

          {/* Bonus type groups */}
          {Object.entries(grouped).map(([title, meals]) => (
            <div key={title} className="cooking-meal-group">
              <div className="cooking-group-label">{title}</div>
              <div className="meal-grid">
                {meals.map(({ pngKey, level, ribbonRank }) => (
                  <MealCard key={pngKey} pngKey={pngKey} level={level} ribbonRank={ribbonRank} />
                ))}
              </div>
            </div>
          ))}

          {uncategorized.length > 0 && (
            <div className="cooking-meal-group">
              <div className="cooking-group-label">Uncategorized</div>
              <div className="meal-grid">
                {uncategorized.map(({ pngKey, level, ribbonRank }) => (
                  <MealCard key={pngKey} pngKey={pngKey} level={level} ribbonRank={ribbonRank} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}