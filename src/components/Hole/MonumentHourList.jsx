// A monument's AFK-hour unlocks (Bravery / Justice / Wisdom): hours, reward, reached or hours to go.

export default function MonumentHourList({ unlocks, hours }) {
  return (
    <div className="hole-card">
      <h3 className="hole-card-title">Monument hour unlocks</h3>
      <div className="hole-hour-list">
        {unlocks.map(unlock => (
          <div
            key={unlock.hours}
            className={`hole-hour-row${unlock.reached ? ' hole-hour-row--reached' : ''}`}
          >
            <span className="hole-hour-hours">{unlock.hours.toLocaleString()} hr</span>
            <span className="hole-list-text">{unlock.text}</span>
            <span className="hole-hour-state">
              {unlock.reached ? '✓' : `${Math.ceil(unlock.hours - hours).toLocaleString()} hr to go`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
