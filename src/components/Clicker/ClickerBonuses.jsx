import { formatClickerBonus } from '../../utils/clickerUtils'
import './Clicker.css'

// A clicker's bonuses to the rest of the game: [{ name, icon, value, percent }]
export default function ClickerBonuses({ title, bonuses, note }) {
  return (
    <div className="clicker-panel">
      <div className="clicker-panel-head">
        <span className="clicker-panel-title">{title}</span>
      </div>
      {note && <p className="clicker-panel-note">{note}</p>}
      <div className="clicker-bonuses">
        {bonuses.map(bonus => (
          <div
            key={bonus.name}
            className={`clicker-bonus${bonus.value === 0 ? ' clicker-bonus--zero' : ''}`}
          >
            <span className="clicker-bonus-icon-box">
              <img
                src={bonus.icon}
                alt=""
                className="clicker-bonus-icon"
              />
            </span>
            <span className="clicker-bonus-name">{bonus.name}</span>
            <span className="clicker-bonus-value">
              {bonus.value > 0 ? '+' : ''}
              {formatClickerBonus(bonus.value)}
              {bonus.percent ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
