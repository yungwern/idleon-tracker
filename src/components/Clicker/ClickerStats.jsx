import './Clicker.css'

// Summary chips across the top of a clicker page: [{ label, value, icon?, sub? }]
export default function ClickerStats({ stats }) {
  return (
    <div className="clicker-stats">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="clicker-stat"
        >
          <span className="clicker-stat-label">{stat.label}</span>
          <span className="clicker-stat-value">
            {stat.icon && (
              <img
                src={stat.icon}
                alt=""
                className="clicker-stat-icon"
              />
            )}
            {stat.value}
          </span>
          {stat.sub && <span className="clicker-stat-sub">{stat.sub}</span>}
        </div>
      ))}
    </div>
  )
}
