import { getPoppyShinies } from '../../utils/poppyUtils'
import { formatClickerNumber, formatClickerBonus } from '../../utils/clickerUtils'
import '../Clicker/Clicker.css'

// Shiny fish caught this run and the multi each gives (Overview tab)
export default function PoppyShinyMulti({ snapshot }) {
  const shinies = getPoppyShinies(snapshot)
  if (!shinies) return null
  return (
    <div className="clicker-panel">
      <div className="clicker-panel-head">
        <span className="clicker-panel-title">Shiny multi</span>
        <span className="clicker-panel-count">{formatClickerBonus(shinies.total)}x total</span>
      </div>
      <p className="clicker-panel-note">
        Each shiny fish: 1 + its base × ln(caught) / 100. All six multiply into your fish gain and reset every run.
      </p>
      <div className="poppy-shinies">
        {shinies.kinds.map(kind => (
          <div
            key={kind.base}
            className="poppy-shiny"
          >
            <img
              src={kind.icon}
              alt=""
              className="poppy-shiny-icon"
            />
            <span className="poppy-shiny-text">
              <span className="poppy-shiny-caught">{formatClickerNumber(kind.caught)}</span>
              <span className="poppy-shiny-base">base {kind.base}</span>
            </span>
            <span className="poppy-shiny-multi">{formatClickerBonus(kind.multi)}x</span>
          </div>
        ))}
      </div>
    </div>
  )
}
