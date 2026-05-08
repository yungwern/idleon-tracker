import './InfoPanel.css'

export default function InfoPanel({ intro, items }) {
  return (
    <div className="info-panel">
      {intro && <p className="info-panel-intro">{intro}</p>}
      {items && items.length > 0 && (
        <ul className="info-panel-list">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}