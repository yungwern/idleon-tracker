import { getBell, getBellRingOrPing } from '../../utils/holeCavernUtils'
import { formatHoleNumber } from '../../utils/holeUtils'
import { formatWait } from '../../utils/farmingUtils'

// The Bell (cavern 5): Ring or Ping advice, the four bell actions with their rates, the ring bonuses and the
// improvement methods.

const BELL_TEXT = [
  'Ring the bell to get +1 LV of a random bonus!',
  'Ping the bell to find an opal instantly!',
  'Clean the bell for a chance to unlock a new improvement method!',
  'Renew the bell to reset all ring bonuses... you keep improvement methods & opals.',
]

export default function BellPanel({ snapshot, lead }) {
  const bell = getBell(snapshot)
  const choice = getBellRingOrPing(snapshot)
  const verdict = {
    Ring: 'Ring is faster right now.',
    Ping: 'Ping is faster right now: an opal comes sooner than the next ring bonus LV.',
    Either: 'Ring and Ping take about the same time right now.',
  }[choice.pick]

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Rings</span>
          <span className="hole-stat-card-value">{bell.rings.toLocaleString()}</span>
          <span className="hole-stat-card-hint">Every ring adds +1 LV to a random ring bonus.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Pings</span>
          <span className="hole-stat-card-value">{bell.pings.toLocaleString()}</span>
          <span className="hole-stat-card-hint">Every ping finds an opal.</span>
        </div>
      </div>
      <div className="hole-card hole-bell-choice">
        <h3 className="hole-card-title">
          Ring or Ping?
          <span className={`hole-chip hole-bell-choice-pick hole-bell-choice-pick--${choice.pick.toLowerCase()}`}>
            {choice.pick === 'Either' ? 'Either' : `${choice.pick} now`}
          </span>
          {choice.swapTo && <span className="notice-badge hole-bell-choice-swap">Swap to {choice.swapTo}</span>}
        </h3>
        <div className="hole-bell-choice-row">
          <div className={`hole-bell-choice-option${choice.pick === 'Ring' ? ' hole-bell-choice-option--best' : ''}`}>
            <img
              className="hole-bell-icon"
              src="images/hole/bell/bell0.png"
              alt=""
            />
            <div className="hole-bell-body">
              <span className="hole-bell-name">
                Next Ring
                {choice.charging === 0 && <span className="hole-bell-charging">Charging</span>}
              </span>
              <span className="hole-bell-choice-time">{formatWait(choice.ringHours * 3600)}</span>
              <span className="hole-text--note">Ring #{(choice.rings + 1).toLocaleString()} from an empty bar</span>
            </div>
          </div>
          <span className="hole-bell-choice-vs">vs</span>
          <div className={`hole-bell-choice-option${choice.pick === 'Ping' ? ' hole-bell-choice-option--best' : ''}`}>
            <img
              className="hole-bell-icon"
              src="images/hole/bell/bell1.png"
              alt=""
            />
            <div className="hole-bell-body">
              <span className="hole-bell-name">
                Next Ping (1 opal)
                {choice.charging === 1 && <span className="hole-bell-charging">Charging</span>}
              </span>
              <span className="hole-bell-choice-time">{formatWait(choice.pingHours * 3600)}</span>
              <span className="hole-text--note">
                Ping #{(choice.pings + 1).toLocaleString()} · the one after takes {formatWait(choice.nextPingHours * 3600)}
              </span>
            </div>
          </div>
        </div>
        <p className="hole-text">
          {verdict}
          {choice.swapTo && ` You're charging ${choice.swapTo === 'Ring' ? 'Ping' : 'Ring'}: swap to ${choice.swapTo}.`}
          {choice.charging >= 2 && ` You're charging ${bell.bells[choice.charging]?.name ?? 'another bell'} right now.`}
        </p>
        <p className="hole-text hole-text--note">
          Only the charging bell fills. Every ring makes the next one 5% slower and every ping makes the next one
          75% slower, but a Renew starts the ring count over.
          {choice.pick === 'Ping' && choice.pingsAhead > 1 && ` Ping stays faster than this Ring for the next ${choice.pingsAhead.toLocaleString()} pings.`}
          {' '}After a Renew, Ring beats today's ping time up to ring #{choice.crossover.toLocaleString()}: swap to Ping around there.
        </p>
      </div>

      <div className="hole-bell-actions">
        {bell.bells.map(action => (
          <div
            key={action.name}
            className={`hole-card hole-bell-action hole-bell-action--${action.index}`}
          >
            <img
              className="hole-bell-icon"
              src={`images/hole/bell/bell${action.index}.png`}
              alt=""
            />
            <div className="hole-bell-body">
              <span className="hole-bell-name">
                {action.name} Bell
                {choice.charging === action.index && <span className="hole-bell-charging">Charging</span>}
              </span>
              <span className="hole-bell-rate">{formatHoleNumber(action.rate)} / hr</span>
              <div
                className="hole-bar"
                style={{ '--hole-progress': `${Math.min(100, Math.round((action.exp / action.req) * 100))}%` }}
              >
                <div className="hole-bar-fill hole-bell-fill" />
              </div>
              <span className="hole-text--note">
                {formatHoleNumber(action.exp)} / {formatHoleNumber(action.req)}
                {action.readyUses > 0 && <span className="hole-good"> · {action.readyUses.toLocaleString()} ready</span>}
              </span>
              <span className="hole-bell-desc">
                {action.index === 2
                  ? `Clean the bell for a ${(bell.newMethodChance * 100).toFixed(1)}% chance to unlock a new improvement method!`
                  : BELL_TEXT[action.index]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">
          Ring bonuses
        </h3>
        <div className="hole-bell-bonuses">
          {bell.ringBonuses.map(bonus => (
            <div
              key={bonus.index}
              className={`hole-bell-bonus${bonus.dim ? ' hole-list-item--dim' : ''}`}
            >
              <span className="hole-list-level">LV {bonus.level.toLocaleString()}</span>
              <span className="hole-list-text">{bonus.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">
          Improvement methods
          <span className="hole-card-title-stat">{bell.methodsOwned} / {bell.methods.length} unlocked</span>
        </h3>
        <div className="hole-bell-methods">
          {bell.methods.map(method => (
            <div
              key={method.index}
              className={`hole-bell-method${method.owned ? '' : ' hole-bell-method--locked'}`}
            >
              <div className="hole-bell-method-head">
                <span className="hole-list-level">LV {method.level.toLocaleString()}</span>
                <span className="hole-list-text">{method.text}</span>
              </div>
              <span className={`hole-cost${method.have != null && method.have >= method.cost ? ' hole-cost--ok' : ''}`}>
                <img
                  className="hole-cost-icon"
                  src={method.costImage}
                  alt=""
                />
                {method.have != null && `${formatHoleNumber(method.have)} / `}
                {formatHoleNumber(method.cost)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
