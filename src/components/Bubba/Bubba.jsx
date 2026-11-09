import {
  BUBBA_UPGRADES,
  BUBBA_ATTRIBUTES,
  BUBBA_HAPPINESS,
  BUBBA_GIFT_HAPPINESS,
  BUBBA_CHARISMA_GOALS,
  BUBBA_PHASES,
  BUBBA_MEGAFLESH_GIFTS,
} from '../../data'
import { useState } from 'react'
import InfoPanel from '../InfoPanel/InfoPanel'
import MegafleshTab from './MegafleshTab'
import './Bubba.css'

// ============================================================
// HELPERS
// ============================================================

const upgradeIcon = name => `images/bubba/Bubbo_Upgrade_${BUBBA_UPGRADES.indexOf(name)}.png`

const attrSlug = name => name.toLowerCase()

const attrIcon = name => `images/bubba/BubbaCharisma${BUBBA_ATTRIBUTES.indexOf(name)}.png`

const TOKEN_PATTERN = /(\[[^\]]+\]|\{[^}]+\})/g

// ============================================================
// SHARED PIECES
// ============================================================

function UpgradeChip({ name }) {
  return (
    <span className="bubba-upgrade-chip">
      <img
        src={upgradeIcon(name)}
        alt=""
        className="bubba-upgrade-chip-img"
      />
      {name}
    </span>
  )
}

function AttrPill({ name, value }) {
  return (
    <span
      className="bubba-attr-pill"
      data-attr={attrSlug(name)}
    >
      <img
        src={attrIcon(name)}
        alt=""
        className="bubba-attr-pill-img"
      />
      {name}
      {value !== undefined && <strong>{value}</strong>}
    </span>
  )
}

// Turns "[Smoker]" into an upgrade chip and "{Joy}" into an attribute pill
function RichText({ text }) {
  return text.split(TOKEN_PATTERN).map((part, i) => {
    if (part.startsWith('[') && BUBBA_UPGRADES.includes(part.slice(1, -1))) {
      return <UpgradeChip key={i} name={part.slice(1, -1)} />
    }
    if (part.startsWith('{') && BUBBA_ATTRIBUTES.includes(part.slice(1, -1))) {
      return <AttrPill key={i} name={part.slice(1, -1)} />
    }
    return part
  })
}

// ============================================================
// HERO
// ============================================================

function Hero() {
  const giftTier = BUBBA_HAPPINESS[BUBBA_GIFT_HAPPINESS]

  return (
    <div className="bubba-hero">
      <img
        src="images/bubba/Bubba.png"
        alt="Bubba"
        className="bubba-hero-img"
      />
      <div className="bubba-hero-loop">
        <div className="bubba-card-title">The core loop</div>
        <div className="bubba-hero-steps">
          <div className="bubba-hero-step">
            <span className="bubba-hero-step-label">Pat with</span>
            <AttrPill name="Joy" />
          </div>
          <span className="bubba-arrow">›</span>
          <div className="bubba-hero-step tooltip-anchor">
            <img
              src={`images/bubba/BubbaHappyIcon${BUBBA_GIFT_HAPPINESS}.png`}
              alt={giftTier}
              className="bubba-hero-happy"
            />
            <span className="bubba-hero-step-label">Grey happiness</span>
            <span className="tooltip">{giftTier}</span>
          </div>
          <span className="bubba-arrow">›</span>
          <div className="bubba-hero-step">
            <span className="bubba-hero-step-label">Swap to</span>
            <AttrPill name="Hustle" />
          </div>
          <span className="bubba-arrow">›</span>
          <div className="bubba-hero-step">
            <img
              src="images/bubba/BubbaGift5.png"
              alt="Gift"
              className="bubba-hero-gift"
            />
            <span className="bubba-hero-step-label">Open a gift</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MEGAFLESH GIFTS
// ============================================================

function MegafleshGifts() {
  return (
    <div className="bubba-card bubba-gifts-card">
      <div className="bubba-card-title">Megaflesh gifts</div>
      <p className="bubba-gifts-note">The only two worth picking each run.</p>
      <div className="bubba-gifts">
        {BUBBA_MEGAFLESH_GIFTS.map(gift => (
          <div
            key={gift.name}
            className="bubba-gift"
          >
            <img
              src={gift.img}
              alt=""
              className="bubba-gift-img"
            />
            <div className="bubba-gift-text">
              <span className="bubba-gift-name">{gift.name}</span>
              <span className="bubba-gift-line">{gift.passive}</span>
              <span className="bubba-gift-line bubba-gift-line--trigger">When opened: {gift.trigger}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// CHARISMA GOALS
// ============================================================

function CharismaGoals() {
  return (
    <div className="bubba-card">
      <div className="bubba-card-title">Charisma goals</div>
      <table className="bubba-goals">
        <thead>
          <tr>
            <th />
            {BUBBA_ATTRIBUTES.map(attr => (
              <th
                key={attr}
                data-attr={attrSlug(attr)}
              >
                <img
                  src={attrIcon(attr)}
                  alt=""
                  className="bubba-goals-head-img"
                />
                {attr}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BUBBA_CHARISMA_GOALS.map(goal => (
            <tr key={goal.label}>
              <td className="bubba-goals-label">{goal.label}</td>
              {goal.values.map((value, i) => (
                <td
                  key={BUBBA_ATTRIBUTES[i]}
                  className={value === 0 ? 'bubba-goals-zero' : ''}
                >
                  {value === 0 ? '–' : value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================
// STEPS
// ============================================================

function GoalLine({ goal }) {
  return (
    <div className="bubba-step-goal">
      <span className="bubba-step-goal-label">{goal.label}</span>
      {BUBBA_ATTRIBUTES.map((attr, i) => goal.values[i] > 0 && (
        <AttrPill
          key={attr}
          name={attr}
          value={goal.values[i]}
        />
      ))}
    </div>
  )
}

function StepCard({ step, number }) {
  const goal = step.goal !== undefined ? BUBBA_CHARISMA_GOALS[step.goal] : null

  return (
    <div className="bubba-step">
      <div className="bubba-step-num">{number}</div>
      <div className="bubba-step-body">
        <div className="bubba-step-head">
          <span className="bubba-step-title">{step.title}</span>
          {step.unlocks && (
            <span className="bubba-step-unlock">
              Unlocks
              <UpgradeChip name={step.unlocks} />
            </span>
          )}
        </div>
        <ul className="bubba-step-points">
          {step.points.map((point, i) => (
            <li key={i}>
              <RichText text={point} />
            </li>
          ))}
        </ul>
        {step.tips?.map((tip, i) => (
          <div
            key={i}
            className="bubba-step-tip"
          >
            <RichText text={tip} />
          </div>
        ))}
        {goal && <GoalLine goal={goal} />}
      </div>
    </div>
  )
}

// Steps are numbered across every phase: the number each phase starts counting from
const PHASE_STEP_STARTS = BUBBA_PHASES.reduce(
  (starts, phase, i) => [...starts, i === 0 ? 0 : starts[i - 1] + BUBBA_PHASES[i - 1].steps.length],
  []
)

function Phases() {
  return (
    <div className="bubba-phases">
      {BUBBA_PHASES.map((phase, phaseIndex) => (
        <section
          key={phase.title}
          className="bubba-phase"
        >
          <div className="bubba-phase-head">
            <span className="bubba-phase-title">{phase.title}</span>
            <span className="bubba-phase-subtitle">{phase.subtitle}</span>
          </div>
          <div className="bubba-steps">
            {phase.steps.map((step, stepIndex) => (
              <StepCard
                key={step.title}
                step={step}
                number={PHASE_STEP_STARTS[phaseIndex] + stepIndex + 1}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// ============================================================
// PAGE
// ============================================================

const TABS = [
  { id: 'guide', label: 'Run Guide' },
  { id: 'megaflesh', label: 'Megaflesh & Bonuses' },
]

export default function Bubba({ snapshot }) {
  const [activeTab, setActiveTab] = useState('guide')

  return (
    <div className="page bubba-page">
      <h2 className="page-title">Bubba</h2>

      <InfoPanel
        intro="A step-by-step route for a Bubba run, plus your Megaflesh and the bonuses Bubba gives the rest of the game."
        items={[
          'This mechanic used to be very easy to mess up leaving your account bricked for up to months at a time. It\'s much more forgiving now, but it\'s still easy to get stuck if you make too many mistakes.',
          'Each gift should unlock the next upgrade. If one doesn\'t, you need more Smoker levels or a better dice roll.',
          'The Charisma goals are rough targets, not requirements.',
          'Megaflesh & Bonuses: hover a Megaflesh to read what it does. Bubba\'s bonuses grow every 7 Bubba Boon levels.',
        ]}
      />

      <div className="page-tabs bubba-tabs">
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

      {activeTab === 'guide' && (
        <>
          <Hero />

          <div className="bubba-goals-row">
            <CharismaGoals />
            <MegafleshGifts />
          </div>

          <Phases />
        </>
      )}
      {activeTab === 'megaflesh' && <MegafleshTab snapshot={snapshot} />}
    </div>
  )
}
