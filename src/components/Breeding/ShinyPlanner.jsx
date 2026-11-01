import { useMemo } from 'react'
import { BASE_MAX_SHINY_LEVEL } from '../../data/breedingMap'
import { getShinyPlan, getShinyOverLevelMulti, SHINY_COPIES_PER_SPECIES } from '../../utils/shinyPlanner'
import { formatShinyNumber, formatShinyDays } from '../../utils/breedingUtils'

const percent = value => `+${Math.round(value).toLocaleString()}%`
const multi = value => `${value.toFixed(2)}x`

// Breeding > Shiny Planner: which shiny pets to keep in the fence, which to swap in,
// and what that's worth over the next 30 days (math in utils/shinyPlanner.js)

function PetImage({ petKey, pet }) {
  return (
    <img
      src={`images/breeding/${pet.name.replace(/ /g, '_')}.png`}
      alt={pet.name}
      className="shiny-plan-pet-img"
      onError={e => {
        if (!e.currentTarget.dataset.fallback) {
          e.currentTarget.dataset.fallback = 'true'
          e.currentTarget.src = `images/breeding/${petKey}.png`
        } else {
          e.currentTarget.style.opacity = '0.3'
        }
      }}
    />
  )
}

function PlanPet({ entry, note, variant }) {
  const { key, pet, level } = entry
  return (
    <div className={`shiny-plan-pet shiny-plan-pet--${variant}`}>
      <PetImage petKey={key} pet={pet} />
      <div className="shiny-plan-pet-text">
        <span className="shiny-plan-pet-name">{pet.name}</span>
        <span className="shiny-plan-pet-level">Lv {level}</span>
        <span className="shiny-plan-pet-note">{note}</span>
      </div>
    </div>
  )
}

function RateTooltip({ rate }) {
  const { parts } = rate
  const lines = [
    ['Crop Depot (Science Crayon)', percent(parts.cropDepot)],
    ['Pet upgrade', percent(parts.upgrade)],
    ['Shiny pets', percent(parts.shinyPets)],
    ['Star signs', percent(parts.starSign)],
    ['Emerald Ulthurite', percent(parts.jewel)],
    ['Summoning', multi(1 + parts.summoning / 100)],
    ['The Lamp', multi(1 + parts.lamp / 100)],
    [`OverLV ${parts.overLevels}`, multi(getShinyOverLevelMulti(parts.overLevels))],
  ]
  return (
    <span className="tooltip buff-tooltip">
      <span className="buff-tooltip-name">Shiny progress per day, per shiny pet</span>
      {lines.map(([label, value]) => (
        <span key={label} className="buff-tooltip-line">
          {label}: {value}
        </span>
      ))}
      <span className="buff-tooltip-line">The first five add together, then each x multiplies.</span>
      {rate.missing.length > 0 && (
        <span className="buff-tooltip-warning">Not exact: {rate.missing.join(', ')}</span>
      )}
    </span>
  )
}

export default function ShinyPlanner({ snapshot, rate }) {
  const plan = useMemo(() => getShinyPlan(snapshot, rate.value), [snapshot, rate.value])

  if (plan.missingFence) {
    return <p className="page-empty">Re-import your save to use the Shiny Planner.</p>
  }
  if (plan.slots === 0) {
    return <p className="page-empty">No shiny pets in your fence yard right now.</p>
  }

  const keep = plan.fence.filter(p => p.keep > 0)
  const remove = plan.fence.filter(p => p.remove > 0)
  const removeCount = remove.reduce((sum, p) => sum + p.remove, 0)
  const addCount = plan.swapIn.reduce((sum, p) => sum + p.add, 0)
  const gainNow = plan.current.levels
  const gainPlan = plan.planned.levels

  return (
    <div className="shiny-plan">
      <div className="shiny-plan-summary">
        <div className="shiny-plan-stat tooltip-anchor">
          <span className="shiny-plan-stat-label">Shiny rate</span>
          <span className="shiny-plan-stat-value">{formatShinyNumber(rate.value)}/day</span>
          <span className="shiny-plan-stat-note">per shiny pet</span>
          <RateTooltip rate={rate} />
        </div>
        <div className="shiny-plan-stat">
          <span className="shiny-plan-stat-label">Plan's first batch</span>
          <span className="shiny-plan-stat-value">{formatShinyDays(plan.batchDays)}</span>
          <span className="shiny-plan-stat-note">
            {plan.speciesCount} levels · OverLV {plan.overLevels} → {plan.batchOverLevels}
          </span>
        </div>
        <div className="shiny-plan-stat">
          <span className="shiny-plan-stat-label">Next {plan.outlookDays} days</span>
          <span className="shiny-plan-stat-value">+{gainPlan} levels</span>
          <span className="shiny-plan-stat-note">
            Current fence: +{gainNow}
          </span>
        </div>
      </div>

      <p className="shiny-plan-note">
        Every shiny pet in the fence adds the same progress, so the fence earns the same total however you split it.
        Each level costs about 1.7x the one before, and every level past {BASE_MAX_SHINY_LEVEL} on any pet is +10% shiny rate, so the
        fastest plan is the lowest-level species, swapped out once they level. It uses
        {` ${SHINY_COPIES_PER_SPECIES}`} copies of each species: just as fast as 1 each, with fewer species to swap.
        Species at the same level go in the bonus order of the Shiny Levels tab.
      </p>

      {plan.swapCount === 0 ? (
        <p className="shiny-plan-done">Your fence already matches the plan.</p>
      ) : (
        <div className="shiny-plan-columns">
          <div className="shiny-plan-column">
            <h3 className="shiny-plan-heading shiny-plan-heading--out">
              Take out · {removeCount}
            </h3>
            {remove.map(entry => (
              <PlanPet
                key={entry.key}
                entry={entry}
                variant="out"
                note={entry.maxed
                  ? `Maxed, take out all ${entry.copies}`
                  : entry.keep
                    ? `Keep ${entry.keep} of ${entry.copies}, take out ${entry.remove}`
                    : `Take out ${entry.remove} · Lv ${entry.level + 1} would take ${formatShinyDays(entry.days)}`}
              />
            ))}
          </div>
          <div className="shiny-plan-column">
            <h3 className="shiny-plan-heading shiny-plan-heading--in">
              Put in · {addCount}
            </h3>
            {plan.swapIn.map(entry => (
              <PlanPet
                key={entry.key}
                entry={entry}
                variant="in"
                note={`${entry.add} ${entry.add === 1 ? 'shiny' : 'shinies'} · Lv ${entry.level + 1} in ${formatShinyDays(entry.days)}`}
              />
            ))}
          </div>
        </div>
      )}

      {keep.length > 0 && (
        <>
          <h3 className="shiny-plan-heading">Keep</h3>
          <div className="shiny-plan-keep">
            {keep.map(entry => (
              <PlanPet
                key={entry.key}
                entry={entry}
                variant="keep"
                note={`Lv ${entry.level + 1} in ${formatShinyDays(entry.days)}`}
              />
            ))}
          </div>
        </>
      )}

      <p className="shiny-plan-note">
        The save can't show which shinies you own outside the fence, so a species to put in may need a new shiny bred
        first. Fewer than {SHINY_COPIES_PER_SPECIES} copies still works, it just levels slower: an empty slot is the
        only real loss.
      </p>
    </div>
  )
}
