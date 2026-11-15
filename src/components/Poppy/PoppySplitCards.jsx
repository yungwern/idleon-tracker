import { formatClickerBonus } from '../../utils/clickerUtils'
import '../Clicker/Clicker.css'

// One card per reset bonus: points to put in, how that compares to another split, and the bonus multi.
// cards: [{ name, color, icon, text, points, compare, compareLabel, multi }]
export default function PoppySplitCards({ cards }) {
  return (
    <div className="poppy-split">
      {cards.map(card => {
        const diff = card.points - card.compare
        return (
          <div
            key={card.color}
            className={`poppy-split-card poppy-split-card--${card.color}${card.points === 0 ? ' poppy-split-card--zero' : ''}`}
          >
            <img
              src={card.icon}
              alt=""
              className="poppy-split-icon"
            />
            <span className="poppy-split-name">{card.name}</span>
            <span className="poppy-split-text">{card.text}</span>
            <span className="poppy-split-points">{card.points.toLocaleString('en-US')}</span>
            <span className="poppy-split-compare">
              {card.compareLabel} {card.compare.toLocaleString('en-US')}
              {diff !== 0 && (
                <span className={diff > 0 ? 'poppy-split-up' : 'poppy-split-down'}>
                  {' '}
                  ({diff > 0 ? '+' : ''}
                  {diff.toLocaleString('en-US')})
                </span>
              )}
            </span>
            <span className="poppy-split-multi">{formatClickerBonus(card.multi)}x</span>
          </div>
        )
      })}
    </div>
  )
}
