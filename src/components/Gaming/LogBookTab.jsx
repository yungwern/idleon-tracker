import { plantSpecies } from '../../data'
import { getLogBook } from '../../utils/gamingUtils'

// Log Book tab: all 100 plants as one compact 10 x 10 grid, one row per species (name, plants found,
// King Rat crowns found), so the whole book fits on screen at half width.
export default function LogBookTab({ snapshot }) {
  const rows = getLogBook(snapshot.gaming)
  const plants = rows.flat()
  const found = plants.filter(plant => plant.found).length
  const crowned = plants.filter(plant => plant.crowned).length

  return (
    <div className="gaming-body">
      <div className="gaming-summary gaming-summary--left">
        <div className="gaming-stat">
          <span className="gaming-stat-value">{found} / {plants.length}</span>
          <span className="gaming-stat-label">Plants found</span>
        </div>
        <div className="gaming-stat">
          <img
            className="gaming-stat-icon"
            src="images/gaming/GamingRatCrown.png"
            alt=""
          />
          <span className="gaming-stat-value">{crowned} / {plants.length}</span>
          <span className="gaming-stat-label">Crowns</span>
        </div>
      </div>

      <div className="gaming-logbook">
        {rows.map((row, r) => (
          <div
            key={r}
            className="gaming-logbook-row"
          >
            <span className="gaming-logbook-label">
              <span className="gaming-logbook-name">{plantSpecies[r]}</span>
              <span className="gaming-logbook-counts">
                {row.filter(plant => plant.found).length}/10
                <img
                  className="gaming-logbook-crown"
                  src="images/gaming/GamingRatCrown.png"
                  alt="crowns"
                />
                {row.filter(plant => plant.crowned).length}/10
              </span>
            </span>
            {row.map(plant => (
              <div
                key={plant.slot}
                className={`gaming-plant tooltip-anchor${plant.found ? '' : ' gaming-plant--missing'}`}
              >
                <img
                  src={plant.image}
                  alt=""
                />
                {plant.crowned && (
                  <img
                    className="gaming-plant-crown"
                    src="images/gaming/GamingRatCrown.png"
                    alt="crowned"
                  />
                )}
                <span className="tooltip">
                  {plantSpecies[r]} {plant.slot + 1}: {plant.found ? 'found' : 'not found yet'}
                  {plant.crowned ? ', crown found' : ''}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
