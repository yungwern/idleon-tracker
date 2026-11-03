import { useState } from 'react'
import { holeCaverns } from '../../data'
import {
  getSchematics,
  getMajiks,
  getMeasurements,
  getStudies,
  getUnlockedCaverns,
  getHoleResourceImage,
  getStudyRate,
  formatHoleNumber,
} from '../../utils/holeUtils'
import { formatWait } from '../../utils/farmingUtils'

// One villager: LV / EXP / opals header, then what that villager runs (caverns, schematics, majiks,
// measurements or studies)

// Hole resource cost: sprite + owned / cost (or just the cost when compact), green once affordable
function CostRow({ resource, owned, cost, compact = false }) {
  return (
    <span className={`hole-cost${owned >= cost ? ' hole-cost--ok' : ''}`}>
      <img
        className="hole-cost-icon"
        src={getHoleResourceImage(resource)}
        alt=""
      />
      {compact ? formatHoleNumber(cost) : `${formatHoleNumber(owned)} / ${formatHoleNumber(cost)}`}
    </span>
  )
}

function ExploreBody({ snapshot }) {
  const unlocked = getUnlockedCaverns(snapshot)
  return (
    <div className="hole-card">
      <h3 className="hole-card-title">
        Caverns
        <span className="hole-card-title-stat">{unlocked} / {holeCaverns.length} unlocked</span>
      </h3>
      <div className="hole-grid">
        {holeCaverns.map(cavern => (
          <div
            key={cavern.id}
            className={`hole-grid-item${cavern.id >= unlocked ? ' hole-grid-item--dim' : ''}`}
          >
            <img
              className="hole-cavern-art-2x"
              src={`images/hole/Cavern_${cavern.id}.png`}
              alt=""
            />
            <span className="hole-grid-name">{cavern.name}</span>
            <span className="hole-grid-value">
              <img
                className="hole-inline-icon"
                src="images/hole/Opal.png"
                alt=""
              />
              {(snapshot?.caverns?.opalsPerCavern?.[cavern.id] ?? 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const SCHEMATIC_FILTERS = [
  { id: 'todo', label: 'To create', test: s => s.available && !s.built },
  { id: 'locked', label: 'Locked', test: s => !s.available },
  { id: 'built', label: 'Created', test: s => s.built },
  { id: 'all', label: 'All', test: () => true },
]

function EngineerBody({ snapshot }) {
  const schematics = getSchematics(snapshot)
  const counts = Object.fromEntries(SCHEMATIC_FILTERS.map(f => [f.id, schematics.list.filter(f.test).length]))
  // Open on what's left to create; once everything's done, show the whole board
  const [filterId, setFilterId] = useState(counts.todo > 0 ? 'todo' : 'all')
  const filter = SCHEMATIC_FILTERS.find(f => f.id === filterId)
  const shown = schematics.list.filter(filter.test)

  return (
    <div className="hole-card">
      <h3 className="hole-card-title">
        Schematics
        <span className="hole-card-title-stat">
          {schematics.built} created · {schematics.unlocked} / {schematics.total} unlocked
        </span>
      </h3>
      <div className="hole-filter-row">
        <div className="segmented-control">
          {SCHEMATIC_FILTERS.map(f => (
            <button
              key={f.id}
              type="button"
              className={`segmented-control-btn${filterId === f.id ? ' segmented-control-btn--active' : ''}`}
              onClick={() => setFilterId(f.id)}
            >
              {f.label} ({counts[f.id]})
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="hole-text hole-text--note hole-empty">Nothing here.</p>
      ) : (
        <div className="hole-schematics">
          {shown.map(schematic => (
            <div
              key={schematic.index}
              className={`hole-schematic tooltip-anchor${schematic.built ? ' hole-schematic--built' : ''}${schematic.available ? '' : ' hole-schematic--locked'}`}
            >
              <img
                className="hole-schematic-img"
                src={`images/hole/schematics/${schematic.index}.png`}
                alt={schematic.name}
              />
              <span className="hole-schematic-label">
                {schematic.built && 'Created ✓'}
                {!schematic.built && schematic.available && (
                  <CostRow
                    resource={schematic.resource}
                    owned={schematic.owned}
                    cost={schematic.costValue}
                    compact
                  />
                )}
                {!schematic.available && `Engineer LV ${Math.max(1, schematic.unlockLevel)}`}
              </span>
              <div className="tooltip tooltip--wrap hole-tooltip">
                <div className="hole-tooltip-title">{schematic.name}</div>
                <div className="hole-tooltip-text">{schematic.description.replace(/[{}$#~]/g, '?')}</div>
                <div className="hole-tooltip-status">
                  {schematic.built
                    ? 'Created ✓'
                    : schematic.available
                      ? `Costs ${formatHoleNumber(schematic.costValue)} (you have ${formatHoleNumber(schematic.owned)})`
                      : `Unlocks at Engineer LV ${Math.max(1, schematic.unlockLevel)}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const MAJIK_ICONS = ['A', 'B', 'C'] // HoleUIcosmoUpg<A|B|C>1: Hole / Villager / IdleOn majik shapes

function BonusesBody({ snapshot }) {
  const majiks = getMajiks(snapshot)
  return (
    <>
      <p className="hole-text hole-text--note">
        {majiks.spent} majik LVs bought (Conjuror LV {majiks.conjurorLevel}; gem shop Conjuror Points add more).
      </p>
      {majiks.groups.map((group, g) => (
        <div
          key={group.label}
          className="hole-card"
        >
          <h3 className="hole-card-title">
            <img
              className="hole-majik-icon"
              src={`images/hole/Majik${MAJIK_ICONS[g]}.png`}
              alt=""
            />
            {group.label}
          </h3>
          <div className="hole-list">
            {group.majiks.map(majik => (
              <div
                key={majik.name}
                className={`hole-list-item${majik.level === 0 ? ' hole-list-item--dim' : ''}`}
              >
                <span className="hole-list-name">{majik.name}</span>
                <span className={`hole-list-level${majik.level >= majik.maxLevel ? ' hole-list-level--max' : ''}`}>
                  LV {majik.level} / {majik.maxLevel}
                </span>
                <span className="hole-list-text">{majik.text}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

function MeasureStat({ measure }) {
  const { stat } = measure
  if (stat.value == null) {
    return (
      <span className="hole-measure-by">
        {stat.label}: {stat.label === 'Tome Score' ? 'add it in Import Save' : 'not tracked yet'}
      </span>
    )
  }
  return (
    <span className="hole-measure-by">
      {stat.label} <strong>{formatHoleNumber(stat.value)}</strong> · ×{formatHoleNumber(stat.multi)}
    </span>
  )
}

function MeasureBody({ snapshot, tomePoints }) {
  const measurements = getMeasurements(snapshot, tomePoints)
  return (
    <div className="hole-card">
      <h3 className="hole-card-title">Measurements</h3>
      <p className="hole-text hole-text--note">
        Each bonus is its base (from LV) times a multi from the IdleOn stat underneath it. Hover the bonus for the split.
      </p>
      <div className="hole-measures">
        {measurements.map(measure => (
          <div
            key={measure.index}
            className={`hole-measure${measure.unlocked ? '' : ' hole-measure--locked'}`}
          >
            <img
              className="hole-measure-icon"
              src={`images/hole/measure/${measure.index}.png`}
              alt=""
            />
            <div className="hole-measure-body">
              <div className="hole-measure-head">
                <span className="hole-measure-title tooltip-anchor">
                  <span className="hole-measure-value">{measure.valueText}</span>
                  <span className="hole-measure-sep">–</span>
                  <span className="hole-measure-name">{measure.name}</span>
                  <span className="tooltip tooltip--wrap hole-tooltip">
                    {measure.stat.multi == null
                      ? `Base ${measure.baseText} (the ${measure.stat.label} multi isn't known yet, so this is the base only)`
                      : `Base ${measure.baseText} × ${formatHoleNumber(measure.stat.multi)} from ${measure.stat.label}`}
                  </span>
                </span>
                <span className="hole-list-level">LV {measure.level}</span>
              </div>
              <div className="hole-measure-foot">
                <MeasureStat measure={measure} />
                {measure.unlocked
                  ? (
                    <CostRow
                      resource={measure.resource}
                      owned={measure.owned}
                      cost={measure.cost}
                    />
                  )
                  : <span className="hole-measure-by">Locked</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudiesBody({ snapshot }) {
  const studies = getStudies(snapshot)
  const rate = getStudyRate(snapshot)
  return (
    <div className="hole-card">
      <h3 className="hole-card-title">
        Studies
        <span className="hole-card-title-stat">
          <img
            className="hole-inline-icon"
            src="images/hole/StudyRate.png"
            alt=""
          />
          {Math.round(rate).toLocaleString()} study / hr
        </span>
      </h3>
      <p className="hole-text hole-text--note">
        Time to the next LV at your study rate, for the cavern you're studying (and its Peripheral Vision neighbours). The rest show how long it would take if you studied them.
      </p>
      <div className="hole-list">
        {studies.map(study => (
          <div
            key={study.index}
            className={`hole-list-item hole-list-item--study${study.active || study.peripheral ? ' hole-list-item--active' : ''}${study.level === 0 ? ' hole-list-item--dim' : ''}`}
          >
            <img
              className="hole-cavern-art-1x"
              src={`images/hole/Cavern_${study.index}.png`}
              alt=""
            />
            <span className="hole-list-name">{study.cavern?.name}</span>
            <span className="hole-list-level">LV {study.level}</span>
            <span className="hole-list-text">
              {study.text}
              {study.active && <span className="hole-chip hole-chip--active">Studying now</span>}
              {study.maxed && (
                <span
                  className="hole-chip"
                  title={`Capped at LV ${study.maxLevel}: higher LVs do nothing`}
                >
                  Maxed at LV {study.maxLevel}
                </span>
              )}
              {study.peripheral && (
                <span
                  className="hole-chip hole-chip--active"
                  title="Peripheral Vision superbit: the caverns next to the one you study are studied too"
                >
                  Peripheral study
                </span>
              )}
            </span>
            <span className={`hole-study-time${study.active || study.peripheral ? ' hole-study-time--active' : ''}`}>
              {study.maxed ? 'Maxed' : study.hoursToLevel === 0 ? 'Ready' : formatWait(study.hoursToLevel * 3600)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const PARALLEL_TIP = 'Parallel Villager: a gem shop purchase (one per villager) that doubles this villager\'s EXP gain.'

const BODIES = {
  explore: ExploreBody,
  engineer: EngineerBody,
  bonuses: BonusesBody,
  measure: MeasureBody,
  studies: StudiesBody,
}

export default function VillagerTab({ snapshot, tomePoints, villager }) {
  if (!villager) return null
  const Body = BODIES[villager.tab]
  return (
    <div className="hole-body">
      <div className="hole-card hole-villager-head">
        <img
          className="hole-villager-art"
          src={`images/hole/Villager_${villager.id}.png`}
          alt=""
        />
        <div className="hole-villager-head-text">
          <h3 className="hole-card-title">
            {villager.name}, {villager.role}
            <span className="hole-card-title-stat">LV {villager.level}</span>
            {villager.parallel && (
              <span className="hole-chip tooltip-anchor hole-chip--tip">
                Parallel Villager · 2x EXP
                <span className="tooltip tooltip--wrap tooltip--right">{PARALLEL_TIP}</span>
              </span>
            )}
          </h3>
          <p className="hole-text">{villager.info}</p>
          <div
            className="hole-bar"
            style={{ '--hole-progress': `${Math.round(villager.progress * 100)}%` }}
          >
            <div className="hole-bar-fill" />
          </div>
          <p className="hole-text hole-text--note">
            EXP {formatHoleNumber(villager.exp)} / {formatHoleNumber(villager.expReq)}
            {villager.readyToLevel && <span className="hole-good"> · ready to level up</span>}
            {' · '}
            <img
              className="hole-inline-icon"
              src="images/hole/Opal.png"
              alt=""
            />
            {villager.opals.toLocaleString()} opals invested
            {villager.opalRate && ` · guide: ${villager.opalRate} of your opals`}
          </p>
        </div>
      </div>
      {Body && (
        <Body
          key={villager.tab}
          snapshot={snapshot}
          tomePoints={tomePoints}
        />
      )}
    </div>
  )
}
