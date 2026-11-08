import './Clicker.css'

// Megafeathers / Megafish / Megaflesh: one tile per Mega (hover for its text), owned ones lit, the stacking last one
// shows its copies. The next one to get is spelled out underneath.
// megas = [{ text, owned, copies }], iconFor(i) = image path, name = 'Megafeather' etc.
export default function ClickerMegas({ title, name, megas, iconFor }) {
  const owned = megas.filter(mega => mega.owned).length
  const nextIndex = megas.findIndex(mega => !mega.owned)
  const tipSide = i => (i >= megas.length - 3 ? ' tooltip--right' : '')

  return (
    <div className="clicker-panel">
      <div className="clicker-panel-head">
        <span className="clicker-panel-title">{title}</span>
        <span className="clicker-panel-count">{owned} / {megas.length}</span>
      </div>
      <div className="clicker-megas">
        {megas.map((mega, i) => (
          <div
            key={i}
            className={`clicker-mega tooltip-anchor${mega.owned ? '' : ' clicker-mega--missing'}`}
          >
            <img
              src={iconFor(i)}
              alt={`${name} ${i + 1}`}
              className="clicker-mega-img"
            />
            <span className="clicker-mega-num">{i + 1}</span>
            {mega.copies > 0 && <span className="clicker-mega-copies">×{mega.copies}</span>}
            <span className={`tooltip tooltip--wrap${tipSide(i)}`}>
              <strong>{name} {i + 1}</strong>
              {mega.owned ? '' : ' (not owned)'}
              <br />
              {mega.text}
            </span>
          </div>
        ))}
      </div>
      {nextIndex >= 0 && (
        <div className="clicker-mega-next">
          <img
            src={iconFor(nextIndex)}
            alt=""
            className="clicker-mega-next-img"
          />
          <span>
            <strong>Next {name}:</strong> {megas[nextIndex].text}
          </span>
        </div>
      )}
    </div>
  )
}
