import {
  BUBBA_ATTRIBUTES,
  BUBBA_EMULSIFY_RULES,
  BUBBA_CHARISMA_GOALS,
  BUBBA_STEPS,
} from '../../data'
import InfoPanel from '../InfoPanel/InfoPanel'
import './Bubba.css'

// ============================================================
// EMULSIFY RULES
// ============================================================

function EmulsifyRules() {
  return (
    <div className="bubba-card">
      <div className="bubba-card-title">What to emulsify</div>
      <div className="bubba-rules">
        {BUBBA_EMULSIFY_RULES.map(rule => (
          <div
            key={rule.attribute}
            className="bubba-rule"
          >
            <span className="bubba-attr-pill">{rule.attribute}</span>
            <span className="bubba-rule-when">{rule.when}</span>
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
              <th key={attr}>{attr}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BUBBA_CHARISMA_GOALS.map(goal => (
            <tr key={goal.label}>
              <td className="bubba-goals-label">
                {goal.label}
                <span className="bubba-goals-note">{goal.note}</span>
              </td>
              {goal.values.map((value, i) => (
                <td
                  key={BUBBA_ATTRIBUTES[i]}
                  className={value === 0 ? 'bubba-goals-zero' : ''}
                >
                  {value}
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
// STEP CARD
// ============================================================

function GoalLine({ goal }) {
  return (
    <div className="bubba-step-goal">
      <span className="bubba-step-goal-label">Charisma goal</span>
      {BUBBA_ATTRIBUTES.map((attr, i) => (
        <span
          key={attr}
          className="bubba-step-goal-chip"
        >
          {attr} <strong>{goal.values[i]}</strong>
        </span>
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
          {step.gift && <span className="bubba-step-gift">🎁 {step.gift}</span>}
        </div>
        <ul className="bubba-step-points">
          {step.points.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
        {step.tips?.map((tip, i) => (
          <div
            key={i}
            className="bubba-step-tip"
          >
            {tip}
          </div>
        ))}
        {goal && <GoalLine goal={goal} />}
      </div>
    </div>
  )
}

// ============================================================
// PAGE
// ============================================================

export default function Bubba() {
  return (
    <div className="page bubba-page">
      <h2 className="page-title">Bubba</h2>

      <InfoPanel
        intro="A step-by-step route for a Bubba run, from the first candies to the hourly coin loop."
        items={[
          'Grey happiness is the target before every gift: pat with Joy emulsified to get there, then emulsify Hustle and open.',
          'Each gift should unlock the next upgrade. If one doesn\'t, you need more Smoker levels or a better dice roll.',
          'The Charisma goals are rough targets, not requirements.',
        ]}
      />

      <div className="bubba-top-row">
        <EmulsifyRules />
        <CharismaGoals />
      </div>

      <div className="bubba-steps">
        {BUBBA_STEPS.map((step, i) => (
          <StepCard
            key={step.title}
            step={step}
            number={i + 1}
          />
        ))}
      </div>
    </div>
  )
}
