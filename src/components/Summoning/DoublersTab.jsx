import { useState } from 'react'
import { summoningColourNames } from '../../data'
import { getDoublerPlans, DOUBLER_SETUPS, DOUBLER_TIERS } from '../../utils/summoningUtils'
import InfoPanel from '../InfoPanel/InfoPanel'

// Summoning > Doublers: where to put the account's Gambit summoning doublers for a Damage push or for
// Essence gain (utils/summoningUtils.js getDoublerPlans), and what to move from the current placement

const SETUPS = [
  { id: DOUBLER_SETUPS.damage, label: 'Damage' },
  { id: DOUBLER_SETUPS.essence, label: 'Essence Gain' },
]

// Header shown where each tier starts in the pick list
const TIER_HEADERS = {
  [DOUBLER_SETUPS.damage]: {
    [DOUBLER_TIERS.combat]: 'Damage, spikes & mana',
    [DOUBLER_TIERS.health]: 'Health: only once every damage, spike and mana upgrade has one',
    [DOUBLER_TIERS.essence]: 'Leftovers: essence gain',
  },
  [DOUBLER_SETUPS.essence]: {
    [DOUBLER_TIERS.essence]: 'Essence gain',
    [DOUBLER_TIERS.combat]: 'Leftovers: nothing else adds 1% essence, so damage, spikes & mana',
    [DOUBLER_TIERS.health]: 'Leftovers: health',
  },
}

const SETUP_STORAGE_KEY = 'idleon_summoning_doubler_setup'

function loadSetup() {
  try {
    const saved = localStorage.getItem(SETUP_STORAGE_KEY)
    return SETUPS.some(setup => setup.id === saved) ? saved : DOUBLER_SETUPS.damage
  } catch {
    return DOUBLER_SETUPS.damage
  }
}

function colourClass(colour) {
  return `summoning-colour--${summoningColourNames[colour].toLowerCase()}`
}

function formatChange(change) {
  return `${change.label} ${change.invert ? '÷' : '×'}${change.ratio.toFixed(2)}`
}

function UpgradeIcon({ index, className }) {
  return (
    <img
      className={className}
      src={`images/summoning/upgrades/SumUpgIc${index}.png`}
      alt=""
    />
  )
}

// Icon only, name on hover
function UpgradeChip({ upgrade }) {
  return (
    <span className={`summoning-doubler-chip tooltip-anchor ${colourClass(upgrade.colour)}`}>
      <UpgradeIcon
        index={upgrade.index}
        className="summoning-doubler-chip-icon"
      />
      <span className="tooltip">{upgrade.name}</span>
    </span>
  )
}

// Take off / Put on chips in essence colour order (white first, teal last), then upgrade index
function byColour(upgrades) {
  return [...upgrades].sort((a, b) => a.colour - b.colour || a.index - b.index)
}

function MoveList({ plan }) {
  if (plan.putOn.length === 0 && plan.takeOff.length === 0) {
    return <p className="summoning-doubler-done">✓ Your doublers already match this setup.</p>
  }
  return (
    <div className="summoning-doubler-moves">
      <div className="summoning-doubler-move">
        <span className="summoning-doubler-move-title summoning-doubler-move-title--off">
          Take off ({plan.takeOff.length})
        </span>
        <div className="summoning-doubler-chips">
          {byColour(plan.takeOff).map(upgrade => (
            <UpgradeChip
              key={upgrade.index}
              upgrade={upgrade}
            />
          ))}
        </div>
      </div>
      <div className="summoning-doubler-move">
        <span className="summoning-doubler-move-title summoning-doubler-move-title--on">
          Put on ({plan.putOn.length})
        </span>
        <div className="summoning-doubler-chips">
          {byColour(plan.putOn).map(upgrade => (
            <UpgradeChip
              key={upgrade.index}
              upgrade={upgrade}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PickList({ plan }) {
  const headers = TIER_HEADERS[plan.setup]
  return (
    <ol className="summoning-doubler-list">
      {plan.picks.map((pick, i) => (
        <li
          key={pick.index}
          className="summoning-doubler-item"
        >
          {pick.tier !== plan.picks[i - 1]?.tier && (
            <div className="summoning-doubler-divider">{headers[pick.tier]}</div>
          )}
          <div className={`summoning-doubler-row ${colourClass(pick.colour)}`}>
            <span className="summoning-doubler-rank">{i + 1}</span>
            <UpgradeIcon
              index={pick.index}
              className="summoning-doubler-icon"
            />
            <span className="summoning-doubler-name">{pick.name}</span>
            <span className="summoning-doubler-gain">
              {pick.changes.length > 0 ? pick.changes.map(formatChange).join(' · ') : 'Small gain on your account'}
              {pick.note && <span className="summoning-doubler-note">{pick.note}</span>}
            </span>
            <span className={`summoning-doubler-status${pick.placed ? ' summoning-doubler-status--placed' : ''}`}>
              {pick.placed ? '✓ Placed' : 'Move here'}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function DoublersTab({ snapshot }) {
  const [setup, setSetup] = useState(loadSetup)
  const plans = getDoublerPlans(snapshot)
  if (!plans) {
    return <p className="page-empty">Re-import your save to see your summoning doublers.</p>
  }
  if (plans.total === 0) {
    return <p className="page-empty">No summoning doublers yet. They come from the Gambit cavern in World 5.</p>
  }
  const plan = plans[setup]

  const chooseSetup = id => {
    setSetup(id)
    try {
      localStorage.setItem(SETUP_STORAGE_KEY, id)
    } catch {
      // storage blocked: the choice just isn't remembered
    }
  }

  return (
    <>
      <InfoPanel
        intro="Push in the Damage setup. When you stall, swap to Essence Gain for a while, then swap back."
        items={[
          'Doublers = the Gambit count from your save. Each doubler multiplies its upgrade by 2 + Absolute Stardom past 100%, plus Allstar.',
          'Damage fills in tiers: damage, spike and mana upgrades together (biggest gain first), then HP, then essence with whatever is left.',
          'Damage vs mana: more mana regen means more units summoned, so 2x mana regen counts the same as 2x unit damage. Unit and spike damage count half each, starting mana counts half (it only helps the opening).',
          'Essence Gain: essence per hour of every colour, and cheaper upgrades (which helps every colour). Once nothing adds at least 1% essence, the rest follow the Damage tiers.',
          'Seeing Red, Hundredaire and Final Card only work part of the fight (noted on their row) but are ranked as if always on. Jeweled Cards is an estimate: its chance isn\'t a sure thing even above 100%.',
          'Unit Obliteration and Glombolic Units are treated as their own multipliers (Toolbox doesn\'t have them yet).',
        ]}
      />
      <div className="summoning-doubler-summary">
        <span className="summoning-doubler-stat">
          Doublers: <strong>{plans.total}</strong>
          <span className="summoning-doubler-stat-note">({plans.placed} placed)</span>
        </span>
        <span className="summoning-doubler-stat">
          Each doubler: <strong>×{plans.multi.toFixed(2)}</strong>
          <span className="summoning-doubler-stat-note">(Absolute Stardom + Allstar)</span>
        </span>
      </div>

      <div className="page-tabs page-tabs--sub summoning-tabs">
        {SETUPS.map(option => (
          <button
            key={option.id}
            type="button"
            className={`page-tab-btn${setup === option.id ? ' page-tab-btn--active' : ''}`}
            onClick={() => chooseSetup(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <MoveList plan={plan} />
      <PickList plan={plan} />
    </>
  )
}
