// Centered strip of account-wide buffs with an unlocked / missing / unknown badge.
// Styles live in global.css (BUFFS PANEL). Each buff:
//   { key, name, img, effect, source?, warning?, active: true | false | null }
// active null = no save data yet. warning = caveat shown in amber (e.g. the save can't fully confirm it)

const STATUS = {
  active: 'Unlocked',
  missing: 'Not unlocked yet',
  unknown: 'Import (or re-import) your save to check',
}

const CHECK = {
  active: '✓',
  missing: '✗',
  unknown: '?',
}

export default function BuffsPanel({ title, buffs }) {
  return (
    <div className="buffs-panel">
      <span className="buffs-panel-title">{title}</span>
      <div className="buffs-panel-slots">
        {buffs.map(buff => {
          const state = buff.active === null ? 'unknown' : buff.active ? 'active' : 'missing'
          return (
            <div
              key={buff.key}
              className={`buff-slot buff-slot--${state} tooltip-anchor`}
            >
              <img
                src={buff.img}
                alt={buff.name}
                className="buff-slot-img"
              />
              <span className="buff-slot-check">{CHECK[state]}</span>
              <span className="tooltip buff-tooltip">
                <span className="buff-tooltip-name">{buff.name}</span>
                {buff.source && <span className="buff-tooltip-source">{buff.source}</span>}
                <span className="buff-tooltip-line">{buff.effect}</span>
                <span className={`buff-tooltip-status buff-tooltip-status--${state}`}>
                  {STATUS[state]}
                </span>
                {buff.warning && <span className="buff-tooltip-warning">⚠ {buff.warning}</span>}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
