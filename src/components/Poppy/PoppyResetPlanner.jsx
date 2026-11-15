import { useState } from 'react'
import { getPoppyResetPlan } from '../../utils/poppyUtils'
import { getPoppyNoticeCount } from '../../utils/poppyNotices'
import { formatClickerBonus, formatClickerNumber } from '../../utils/clickerUtils'
import { formatCountdown } from '../../utils/resetUtils'
import PoppySplitCards from './PoppySplitCards'
import '../Clicker/Clicker.css'

// Reset Planner tab: best split of Fisheroo Reset points for fish (Megafish), the all-in green split for buying
// Greatest Catch / Fisheroo Reset, and the all-in shiny split for early in a run. Math = poppyUtils getPoppyResetPlan (notes/clickers.md).
const MINUTE = 60 * 1000

const SUB_TABS = [
  { id: 'best', label: 'Best split' },
  { id: 'buy', label: 'Big purchase' },
  { id: 'shiny', label: 'Shiny stack' },
]

// Fish on hand vs one cost: affordable, or how long at the best split's fish rate
function PurchaseStatus({ fish, cost, minutes }) {
  if (minutes === 0) return <span className="poppy-buy-status poppy-buy-status--ok">Affordable</span>
  return (
    <span className="poppy-buy-status">
      {formatClickerBonus(Math.min(99.99, (100 * fish) / cost))}% · ~{formatCountdown(minutes * MINUTE)}
    </span>
  )
}

export default function PoppyResetPlanner({ snapshot }) {
  const plan = getPoppyResetPlan(snapshot)
  const buyNotices = getPoppyNoticeCount(snapshot)
  // Opens on Big purchase while something there is ready to buy
  const [subTab, setSubTab] = useState(buyNotices > 0 ? 'buy' : 'best')
  if (!plan || plan.total === 0) {
    return <p className="page-empty">No reset points yet. Fisheroo Reset once to get points to spend.</p>
  }
  const fishPct = (plan.fishGain - 1) * 100
  const readyNow = plan.purchases.filter(purchase => purchase.unlocked && purchase.buyMinutes === 0)

  return (
    <>
      <div className="page-tabs page-tabs--sub clicker-tabs">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`page-tab-btn${subTab === tab.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => setSubTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'buy' && buyNotices > 0 && <span className="notice-badge">{buyNotices}</span>}
          </button>
        ))}
      </div>

      {subTab === 'best' && (
        <div className="clicker-panel">
          <div className="clicker-panel-head">
            <span className="clicker-panel-title">Best split</span>
            <span className="clicker-panel-count">
              {plan.total.toLocaleString('en-US')} pts
              {plan.unspent > 0 && ` (${plan.unspent.toLocaleString('en-US')} unspent)`}
            </span>
          </div>
          <p className="clicker-panel-note">
            The split that catches the most fish, to reach your next Megafish sooner. Points refund for free, so set
            them like this for most of a run.
          </p>
          <PoppySplitCards
            cards={plan.rows.map(row => ({
              ...row,
              points: row.best,
              compare: row.current,
              compareLabel: 'Now',
              multi: row.bestMulti,
            }))}
          />
          <p className="poppy-split-summary">
            {plan.unspent > 0 ? (
              `You have ${plan.unspent.toLocaleString('en-US')} unspent points. Place them as above.`
            ) : Math.abs(fishPct) < 0.5 ? (
              'Your split is already about as good as it gets.'
            ) : (
              <>
                Fish gain vs your split:{' '}
                <strong className={fishPct > 0 ? 'poppy-split-up' : 'poppy-split-down'}>
                  {fishPct > 0 ? '+' : ''}
                  {formatClickerBonus(fishPct)}%
                </strong>
              </>
            )}
          </p>
        </div>
      )}

      {subTab === 'buy' && (
        <div className="clicker-panel">
          <div className="clicker-panel-head">
            <span className="clicker-panel-title">Big purchase</span>
            <span className="clicker-panel-count">{formatClickerBonus(plan.buyDiscount)}x cheaper than best split</span>
          </div>
          <p className="clicker-panel-note">
            Only for Greatest Catch or Fisheroo Reset: when one is affordable with this split but not your best split,
            swap to it, buy, and swap back. Times are at the best split&apos;s fish rate today, so they run long.
          </p>
          {readyNow.length > 0 && (
            <p className="poppy-buy-ready">
              {readyNow.map(purchase => purchase.name).join(' and ')}
              {readyNow.length === 1 ? ' is' : ' are'} affordable now: swap your points to this split, buy it, then swap
              back to the best split.
            </p>
          )}
          <PoppySplitCards
            cards={plan.rows.map(row => ({
              ...row,
              points: row.buy,
              compare: row.best,
              compareLabel: 'Best split',
              multi: row.buyMulti,
            }))}
          />
          <div className="poppy-buy-table">
            <span className="poppy-buy-th poppy-buy-th--name">Fish on hand: {formatClickerNumber(plan.purchases[0].fish)}</span>
            <span className="poppy-buy-th">Best split</span>
            <span className="poppy-buy-th">Big purchase split</span>
            {plan.purchases.map(purchase => (
              <div
                key={purchase.name}
                className={`poppy-buy-row${purchase.unlocked ? '' : ' poppy-buy-row--locked'}`}
              >
                <span className="poppy-buy-name">
                  <img
                    src={purchase.icon}
                    alt=""
                    className="poppy-buy-icon"
                  />
                  {purchase.name}
                </span>
                {purchase.unlocked ? (
                  <>
                    <span className="poppy-buy-cell">
                      <span className="poppy-buy-cost">{formatClickerNumber(purchase.bestCost)}</span>
                      <PurchaseStatus
                        fish={purchase.fish}
                        cost={purchase.bestCost}
                        minutes={purchase.bestMinutes}
                      />
                    </span>
                    <span className="poppy-buy-cell">
                      <span className="poppy-buy-cost">{formatClickerNumber(purchase.buyCost)}</span>
                      <PurchaseStatus
                        fish={purchase.fish}
                        cost={purchase.buyCost}
                        minutes={purchase.buyMinutes}
                      />
                    </span>
                  </>
                ) : (
                  <span className="poppy-buy-cell poppy-buy-cell--wide">Not unlocked yet</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'shiny' && (
        <div className="clicker-panel">
          <div className="clicker-panel-head">
            <span className="clicker-panel-title">Shiny stack</span>
            <span className="clicker-panel-count">{formatClickerBonus(plan.shinySpeedUp)}x shiny speed vs best split</span>
          </div>
          <p className="clicker-panel-note">
            Shiny fish build up over a run and only reset with it. Early in a run, after Shiny Lure has a few levels,
            use this split to pile up shinies fast, then swap to the best split once your shiny multi (Overview tab)
            is close to where your runs usually end.
          </p>
          <PoppySplitCards
            cards={plan.rows.map(row => ({
              ...row,
              points: row.shiny,
              compare: row.best,
              compareLabel: 'Best split',
              multi: row.shinyMulti,
            }))}
          />
        </div>
      )}
    </>
  )
}
