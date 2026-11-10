// Board tab: the in-game 10-wide grid, one colour per row, with the points header.

const GRID_WIDTH = 10

export default function LegendTalentBoard({ talents, points, selectedIndex, onSelect }) {
  const maxed = talents.filter(talent => talent.level >= talent.maxLevel.value).length
  const emptySlots = (GRID_WIDTH - talents.length % GRID_WIDTH) % GRID_WIDTH

  return (
    <>
      <h3 className="legend-card-title">
        Revelations of Whallamus
        <span className="legend-card-stat">{maxed} / {talents.length} maxed</span>
        <span className="legend-points tooltip-anchor">
          Available Points: <strong>{points.owned.value - points.spent}</strong>
          <span className="tooltip tooltip--wrap legend-points-tooltip">
            <span className="legend-points-line">
              <span>Earned</span>
              <span>{points.owned.value}</span>
            </span>
            {points.owned.breakdown.map(source => (
              <span
                key={source.label}
                className="legend-points-line legend-points-line--source"
              >
                <span>{source.label}</span>
                <span>{source.value}</span>
              </span>
            ))}
            <span className="legend-points-line">
              <span>Spent</span>
              <span>{points.spent}</span>
            </span>
          </span>
        </span>
      </h3>

      <div className="legend-grid">
        {talents.map(talent => {
          const isMaxed = talent.level >= talent.maxLevel.value
          return (
            <button
              key={talent.index}
              type="button"
              className={`legend-slot legend-slot--${talent.row.toLowerCase()}${talent.level > 0 ? '' : ' legend-slot--empty'}${isMaxed ? ' legend-slot--maxed' : ''}${talent.index === selectedIndex ? ' legend-slot--selected' : ''}`}
              aria-label={`${talent.name}, LV ${talent.level}`}
              onClick={() => onSelect(talent.index)}
            >
              <img
                className="legend-slot-img"
                src={talent.img}
                alt=""
              />
              <span className="legend-slot-level">LV {talent.level}</span>
            </button>
          )
        })}
        {Array.from({ length: emptySlots }, (_, i) => (
          <div
            key={`locked-${i}`}
            className="legend-slot legend-slot--locked"
            aria-hidden="true"
          >
            <span className="legend-slot-unknown">?</span>
          </div>
        ))}
      </div>
    </>
  )
}
