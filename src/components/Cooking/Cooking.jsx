import { useState } from 'react'
import { cookingMap, cookingBonusTypes, ribbonData } from '../../data'
import './Cooking.css'



// ============================================================
// MEAL CARD
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
// RIBBON SHELF
// ============================================================

function RibbonShelf({ slots }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="cooking-section">
      <div className="cooking-section-label cooking-section-label--clickable" onClick={() => setOpen(v => !v)}>
        <span>Ribbon Shelf</span>
        <span className="cooking-section-chevron">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="ribbon-shelf-content">
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
      )}
    </div>
  )
}

// ============================================================
// COMBINED TRACKER SECTION (Lowest Ribbon + NMLB)
// ============================================================

function CombinedTrackerSection({ lowestMeals, nmlbMeal }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="cooking-section">
      <div className="cooking-section-label cooking-section-label--clickable" onClick={() => setOpen(v => !v)}>
        <span>NRLB / NMLB</span>
        <span className="cooking-section-chevron">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="cooking-tracker-content">
          <div className="cooking-tracker-group">
            <span className="cooking-tracker-label">No Ribbon Left Behind (NRLB)</span>
            <div className="meal-grid">
              {lowestMeals.map(({ pngKey, level, ribbonRank }) => (
                <MealCard key={pngKey} pngKey={pngKey} level={level} ribbonRank={ribbonRank} />
              ))}
            </div>
          </div>
          <div className="cooking-tracker-divider" />
          <div className="cooking-tracker-group">
            <span className="cooking-tracker-label">No Meal Left Behind (NMLB)</span>
            {nmlbMeal && (
              <div className="meal-grid">
                <MealCard pngKey={nmlbMeal.pngKey} level={nmlbMeal.level} ribbonRank={nmlbMeal.ribbonRank} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// BONUS TYPE SECTION
// ============================================================

function BonusSection({ title, meals, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  if (!meals.length) return null

  return (
    <div className="cooking-section">
      <div className="cooking-section-label cooking-section-label--clickable" onClick={() => setOpen(v => !v)}>
        <span>{title}</span>
        <span className="cooking-section-chevron">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="meal-grid">
          {meals.map(({ pngKey, level, ribbonRank }) => (
            <MealCard
              key={pngKey}
              pngKey={pngKey}
              level={level}
              ribbonRank={ribbonRank}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Cooking({ snapshot }) {
  const { mealLevels = [], mealRibbons = [], cabinetSlots = [] } = snapshot?.cooking ?? {}

  // Build enriched meal list from cookingMap
  // Extract index from key name (e.g. CookingMB6 -> 6) to correctly
  // reference save data arrays regardless of order in cookingMap
  const allMeals = Object.keys(cookingMap).map((pngKey) => {
    const index = parseInt(pngKey.replace('CookingMB', ''))
    return {
      pngKey,
      level: mealLevels[index] ?? 0,
      ribbonRank: mealRibbons[index] ?? 0,
      bonus: cookingMap[pngKey].bonus,
    }
  })

  // Group meals by bonus type
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

  // Find the single meal with the lowest ribbon rank across all categorized meals,
  // tie-broken by highest MB number
  const categorizedMeals = allMeals.filter(m => categorized.has(m.pngKey))
  const overallLowest = Math.min(...categorizedMeals.map(m => m.ribbonRank))
  const lowestRibbonMeal = categorizedMeals
    .filter(m => m.ribbonRank === overallLowest)
    .sort((a, b) => {
      const ia = parseInt(a.pngKey.replace('CookingMB', ''))
      const ib = parseInt(b.pngKey.replace('CookingMB', ''))
      return ib - ia
    })[0]

  // NMLB — find the meal with the lowest level across all meals (including uncategorized)
  // Tie-break by MB number (earliest unlocked meal)
  const lowestLevel = Math.min(...allMeals.map(m => m.level))
  const nmlbMeal = allMeals
    .filter(m => m.level === lowestLevel)
    .sort((a, b) => {
      const ia = parseInt(a.pngKey.replace('CookingMB', ''))
      const ib = parseInt(b.pngKey.replace('CookingMB', ''))
      return ib - ia
    })[0]

  return (
    <div className="page cooking-page">
      <h2 className="page-title">Cooking</h2>

      <div className="cooking-info-panel">
        <p className="cooking-info-intro">
          This page is used to track ribbon levels on each meal. A few things to keep in mind when using this page:
        </p>
        <ul className="cooking-info-list">
          <li>Meals are sorted into categories by bonus types.</li>
          <li>Each category is sorted in priority of which meal to ribbon first.</li>
          <li>Categories are not ordered in priority — use your best judgement to prioritize categories based on account needs.</li>
          <li>The category "NRLB / NMLB" is used to easily identify which tier ribbons are no longer needed. For example, if a meal is shown in this category with a level 5 ribbon, then you know that any ribbons below level 5 can be instantly upgraded in your ribbon shelf. This section is NOT intended to be used as a "which ribbon to upgrade next section," although it can be used that way if you want to evenly upgrade ribbon tiers across all your meals.</li>
          <li>In general it's best to reach ribbon breakpoints of 5, 10, 15, and 20. Reaching these breakpoints provides the highest multi increases.</li>
          <li>Remember that you can upgrade ribbons on existing meals by dragging a ribbon of the same tier on top of it, the same way you upgrade in the ribbon shelf.</li>
        </ul>
      </div>

      <RibbonShelf slots={cabinetSlots} />

      <CombinedTrackerSection
        lowestMeals={lowestRibbonMeal ? [lowestRibbonMeal] : []}
        nmlbMeal={nmlbMeal}
      />

      {Object.entries(grouped).map(([title, meals]) => (
        <BonusSection key={title} title={title} meals={meals} />
      ))}

      {uncategorized.length > 0 && (
        <BonusSection title="Uncategorized" meals={uncategorized} />
      )}
    </div>
  )
}