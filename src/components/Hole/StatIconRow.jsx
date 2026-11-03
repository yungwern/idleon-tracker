// A row of small icon + value stats under a stat card's main number (monument story stats: swords, mental health,
// insta matches...). items = [{ icon, value, label }]; the label shows next to the value and in a tooltip.

export default function StatIconRow({ items }) {
  return (
    <span className="hole-icon-stats">
      {items.map(item => (
        <span
          key={item.label}
          className="hole-icon-stat tooltip-anchor"
        >
          <img
            className="hole-icon-stat-img"
            src={item.icon}
            alt=""
          />
          <strong className="hole-icon-stat-value">{item.value}</strong>
          <span className="hole-icon-stat-label">{item.label}</span>
          {item.tooltip && <span className="tooltip">{item.tooltip}</span>}
        </span>
      ))}
    </span>
  )
}
