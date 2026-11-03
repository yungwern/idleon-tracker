import { getLamp, getLampOpalPlan } from '../../utils/holeCavernUtils'
import { formatHoleNumber } from '../../utils/holeUtils'

// The Lamp (cavern 7): wishes left / per day, then every wish with what it gives, times granted and the next cost.

function formatDays(days) {
  if (days < 1) return `${Math.ceil(days * 24)} hr`
  return `${days < 10 ? days.toFixed(1) : Math.ceil(days).toLocaleString()} days`
}

function dayText(day) {
  if (day == null) return '—'
  if (day === 0) return 'Now'
  if (day === 1) return 'Tomorrow'
  return `In ${day.toLocaleString()} days`
}

function WishCost({ wish }) {
  if (wish.hidden) return <span className="hole-lamp-cost hole-lamp-cost--off">Shows up after More Wishes rank {wish.index}</span>
  if (wish.unavailable) return <span className="hole-lamp-cost hole-lamp-cost--off">Not in the game yet</span>
  if (wish.maxed) return <span className="hole-lamp-cost hole-lamp-cost--ok">Maxed</span>
  return (
    <span className={`hole-lamp-cost${wish.affordable ? ' hole-lamp-cost--ok' : ''}`}>
      Next: {wish.cost.toLocaleString()} {wish.cost === 1 ? 'wish' : 'wishes'}
      {wish.daysToAfford != null && <span className="hole-lamp-wait"> · in {formatDays(wish.daysToAfford)}</span>}
    </span>
  )
}

export default function LampPanel({ snapshot, lead, tomePoints }) {
  const lamp = getLamp(snapshot, tomePoints)
  const opals = getLampOpalPlan(snapshot, tomePoints)
  const opalsNow = opals.filter(opal => opal.day === 0).length

  return (
    <>
      <div className="hole-stats">
        {lead}
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Wishes left</span>
          <span className="hole-stat-card-value">{lamp.wishes.toLocaleString()}</span>
          <span className="hole-stat-card-hint">Green costs below are affordable now.</span>
        </div>
        <div className="hole-card hole-stat-card">
          <span className="hole-stat-card-label">Wishes per day</span>
          <span className="hole-stat-card-value">{formatHoleNumber(lamp.perDay)}</span>
          <span className="hole-stat-card-hint">Average per day, same as the Lamp screen in game.</span>
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">
          <img
            className="hole-inline-icon hole-lamp-opal-icon"
            src="images/hole/Opal.png"
            alt=""
          />
          Opal calculator
          <span className="hole-card-title-stat">
            {opalsNow > 0 ? `${opalsNow} affordable now` : `Next one ${dayText(opals[0]?.day).toLowerCase()}`}
          </span>
        </h3>
        <p className="hole-text hole-text--note">
          The next opals from the 1000000 Opals wish if every wish goes to opals: each one costs more than the last.
          Days count the average {formatHoleNumber(lamp.perDay)} wishes per day.
        </p>
        <div className="hole-lamp-opals">
          <span className="hole-lamp-opals-head">Opal</span>
          <span className="hole-lamp-opals-head">Cost</span>
          <span className="hole-lamp-opals-head">Wishes needed</span>
          <span className="hole-lamp-opals-head">When</span>
          {opals.map(opal => (
            <div
              key={opal.number}
              className={`hole-lamp-opals-row${opal.day === 0 ? ' hole-lamp-opals-row--now' : ''}`}
            >
              <span>#{opal.number}</span>
              <span>{opal.cost.toLocaleString()}</span>
              <span>{opal.total.toLocaleString()} / {lamp.wishes.toLocaleString()}</span>
              <span className="hole-lamp-opals-when">{dayText(opal.day)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hole-card">
        <h3 className="hole-card-title">Wishes</h3>
        <div className="hole-lamp-wishes">
          {lamp.list.map(wish => (
            <div
              key={wish.index}
              className={`hole-lamp-wish${wish.unavailable || wish.hidden ? ' hole-lamp-wish--off' : ''}`}
            >
              <img
                className="hole-lamp-icon"
                src={wish.image}
                alt=""
              />
              <div className="hole-lamp-body">
                <div className="hole-lamp-head">
                  <span className="hole-lamp-name">{wish.name}</span>
                  <span className="hole-chip">Granted {wish.uses.toLocaleString()}x</span>
                </div>
                <span className="hole-bell-desc">{wish.text}</span>
                {wish.choice && <span className="hole-lamp-choice">{wish.choice}</span>}
                <WishCost wish={wish} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
