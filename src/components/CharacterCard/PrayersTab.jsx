import { prayerMap } from '../../data/prayerMap'
import {
  getPrayerValues,
  formatPrayerText,
  sortPrayers,
  getNoPrayerComparison,
} from '../../utils/prayerUtils.js'
import { getGoldenFoodStackPlan } from '../../utils/foodUtils.js'
import { formatBigNumber } from '../../utils/cogBoardUtils.js'

const ZERG_RUSHOGEN = 4
const RUCK_SACK = 12

// Prayers tab (equipped prayers are already in the card's prayer bar): the carry capacity trade (Zerg Rushogen / Ruck Sack,
// which set the golden food stack cap) and, with the no-prayer superbits, what an empty prayer bar gives.
export default function PrayersTab({ charIndex, snapshot }) {
  const equipped = sortPrayers(snapshot?.characters?.[charIndex]?.prayers ?? [])
  const levels = snapshot?.worship?.prayerLevels
  if (!levels) {
    return <div className="char-prayers-empty">Re-import your save to see prayer levels.</div>
  }

  return (
    <div className="char-prayers-tab">
      <CarryTrade
        charIndex={charIndex}
        snapshot={snapshot}
      />

      <NoPrayerSection
        snapshot={snapshot}
        equipped={equipped}
      />
    </div>
  )
}

// Golden food bonus change for one setup across the equipped golden foods: '+1.6%', '+1.6 – 14.5%' or null (no change)
function formatGainRange(foods, setupId) {
  const gains = foods.map(food => food.reach.find(reach => reach.id === setupId)?.gain ?? 0)
  const low = Math.min(...gains)
  const high = Math.max(...gains)
  if (high < 0.05) return null
  if (high - low < 0.05) return `+${high.toFixed(1)}%`
  return `+${low.toFixed(1)} – ${high.toFixed(1)}%`
}

// Zerg Rushogen trades carry capacity for AFK gains, Ruck Sack the other way round. Carry cap = how big a
// golden food stack can get, so each setup box shows the per-slot cap and how much the equipped golden
// foods would gain if topped up to it (stacks keep their size after the prayer comes off).
function CarryTrade({ charIndex, snapshot }) {
  const { setups, foods, best } = getGoldenFoodStackPlan(snapshot, charIndex)
  const missing = setups[0]?.cap.missing ?? []
  const now = setups.find(setup => setup.id === 'now')
  const equipped = now?.prayers ?? []
  const levels = snapshot?.worship?.prayerLevels ?? []
  const zerg = getPrayerValues(ZERG_RUSHOGEN, levels[ZERG_RUSHOGEN])
  const ruck = getPrayerValues(RUCK_SACK, levels[RUCK_SACK])
  const zergCapMulti = Math.max(1 - (zerg.curse ?? 0) / 100, 0.4)
  const hasZerg = equipped.includes(ZERG_RUSHOGEN)
  const hasRuck = equipped.includes(RUCK_SACK)

  return (
    <section>
      <h3 className="char-overview-heading">Carry Capacity Trade</h3>
      <div className="char-prayer-trade">
        <div className="char-prayer-trade-side">
          <img
            src={`images/prayers/Prayer${ZERG_RUSHOGEN}.png`}
            alt=""
            className="char-prayer-row-icon"
          />
          <span className="char-prayer-row-name">
            Zerg Rushogen {hasZerg ? <span className="char-prayer-tag">Equipped</span> : null}
          </span>
          <span className="char-prayer-row-bonus">+{zerg.bonus ?? 0}% AFK Gain Rate</span>
          <span className="char-prayer-row-curse">Food cap ×{zergCapMulti.toFixed(2)} (−{zerg.curse ?? 0}%)</span>
        </div>
        <div className="char-prayer-trade-side">
          <img
            src={`images/prayers/Prayer${RUCK_SACK}.png`}
            alt=""
            className="char-prayer-row-icon"
          />
          <span className="char-prayer-row-name">
            Ruck Sack {hasRuck ? <span className="char-prayer-tag">Equipped</span> : null}
          </span>
          <span className="char-prayer-row-bonus">Food cap +{ruck.bonus ?? 0}% (×{(1 + (ruck.bonus ?? 0) / 100).toFixed(2)})</span>
          <span className="char-prayer-row-curse">−{ruck.curse ?? 0}% AFK Gain Rate</span>
        </div>
      </div>
      <div className="char-food-setups">
        {setups.map(setup => (
          <div
            key={setup.id}
            className={`char-food-setup${setup.id === best.id && best.cap.value > setups[0].cap.value ? ' char-food-setup--best' : ''}`}
          >
            <span className="char-food-setup-label">{setup.label}</span>
            <span className="char-food-setup-cap">{formatBigNumber(setup.cap.value)}</span>
            <span className="char-food-setup-sub">food per slot</span>
            {foods.length > 0 && (
              <span className={`char-food-gain${formatGainRange(foods, setup.id) ? ' char-food-gain--up' : ''}`}>
                Golden food{formatGainRange(foods, setup.id) ? ` ${formatGainRange(foods, setup.id)}` : ': no change'}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="char-food-note">
        Golden food % = how much each equipped golden food's bonus goes up if you top its stack up to that cap
        (stacks are limited by what you own in storage, and keep their size after the prayer comes off).
        The AFK Gain Rate parts are added to the same AFK % total as every other AFK bonus (Golden Dumpling,
        cards, gear...), so they matter less the higher that total is. Characters doing Spelunking don't use AFK gains.
      </p>
      {missing.length > 0 && (
        <p className="char-food-note char-food-note--warning">Not counted: {missing.join(', ')}</p>
      )}
    </section>
  )
}

// Superbits 9/39/53: with no prayer equipped, 1/5 of every prayer's bonus per superbit and no curses.
// Hidden until 9 or 39 is unlocked. Left: each equipped prayer's trade (bonus drop vs its curse going away).
// Right: the other prayers' bonuses an empty bar adds for free.
function NoPrayerSection({ snapshot, equipped }) {
  const comparison = getNoPrayerComparison(snapshot, equipped)
  if (!comparison) return null
  const { fifths, superbits, gains, cleared, reduced, lost } = comparison
  const isEmpty = equipped.length === 0

  return (
    <section>
      <h3 className="char-overview-heading">{isEmpty ? 'No Prayers Equipped' : 'Switch To No Prayers?'}</h3>
      <p className="char-food-intro">
        With an empty prayer bar, a character gets {fifths}/5 of every levelled prayer's bonus at once and no
        curses (Tachion of the Titans only works equipped).
      </p>
      <div className="char-prayer-superbits">
        {superbits.map(bit => (
          <span
            key={bit.index}
            className={`char-prayer-superbit${bit.unlocked ? ' char-prayer-superbit--on' : ''}`}
          >
            {bit.unlocked ? '✓' : '✗'} {bit.name} (+1/5)
          </span>
        ))}
      </div>

      {isEmpty
        ? (
          <div className="char-prayer-compare char-prayer-compare--single">
            <PrayerEffectList
              title={`Getting now (${fifths}/5 of each)`}
              items={gains.map(({ id, bonus }) => ({ id, text: formatPrayerText(prayerMap[id].effect, bonus) }))}
            />
          </div>
        )
        : (
          <div className="char-prayer-compare">
            <div className="char-prayer-effects char-prayer-effects--trade">
              <span className="char-prayer-effects-title">Your equipped prayers</span>
              {equipped.map(id => {
                const prayer = prayerMap[id]
                const drop = reduced.find(entry => entry.id === id)
                const gone = lost.find(entry => entry.id === id)
                const curse = cleared.find(entry => entry.id === id)
                if (!prayer) return null
                return (
                  <div
                    key={id}
                    className="char-prayer-trade-row"
                  >
                    <img
                      src={`images/prayers/Prayer${id}.png`}
                      alt=""
                      className="char-prayer-effect-icon"
                    />
                    <div className="char-prayer-trade-text">
                      <span className="char-prayer-trade-name">{prayer.name}</span>
                      {drop && <span className="char-prayer-trade-loss">{formatPrayerLoss(prayer.effect, drop.from, drop.to)}</span>}
                      {gone && <span className="char-prayer-trade-loss">Stops working: {formatPrayerText(prayer.effect, gone.bonus)}</span>}
                      {curse && <span className="char-prayer-trade-gain">Curse gone: {formatPrayerText(prayer.curse, curse.curse)}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
            <PrayerEffectList
              title={`Added for free (${fifths}/5 of each)`}
              items={gains.map(({ id, bonus }) => ({ id, text: formatPrayerText(prayerMap[id].effect, bonus) }))}
            />
          </div>
        )}
    </section>
  )
}

// How much an equipped prayer's bonus drops: '+{% Skill Efficiency' 177 → 106 = '−71% Skill Efficiency'.
// Effects that aren't a plain +amount (Shiny Snitch's bundle size) show 'from → to' in place instead.
function formatPrayerLoss(effect, from, to) {
  if (effect.startsWith('+{')) return formatPrayerText(effect.replace('+{', '−{'), from - to)
  return formatPrayerText(effect, `${from} → ${to}`)
}

function PrayerEffectList({ title, items }) {
  return (
    <div className="char-prayer-effects char-prayer-effects--gain">
      <span className="char-prayer-effects-title">{title}</span>
      {items.length === 0 && <span className="char-prayer-effect char-prayer-effect--muted">Nothing</span>}
      {items.map(item => (
        <span
          key={item.id}
          className="char-prayer-effect"
        >
          <img
            src={`images/prayers/Prayer${item.id}.png`}
            alt=""
            className="char-prayer-effect-icon"
          />
          {item.text}
        </span>
      ))}
    </div>
  )
}
