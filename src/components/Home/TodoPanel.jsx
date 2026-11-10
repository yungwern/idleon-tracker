import { getTodoGroups } from '../../utils/homeTodo'
import { sectionIcons } from '../../data'
import { toClassSlug } from '../../utils/appUtils'

// Every active notification on one card (utils/homeTodo.js), grouped by page. A group's name opens
// that page. Notifications turned off in Settings never show here.
export default function TodoPanel({ snapshot, obolCheckMode, sectionNotices, onOpenPage }) {
  const groups = getTodoGroups(snapshot, obolCheckMode, sectionNotices)
  return (
    <div className="home-todo">
      {groups.length === 0 && (
        <p className="char-notice-clear">✓ Nothing needs attention</p>
      )}
      {groups.map(group => (
        <div
          key={group.page}
          className="home-todo-group"
        >
          <button
            type="button"
            className="home-todo-head"
            onClick={() => onOpenPage(group.page)}
            data-class={group.className ? toClassSlug(group.className) : undefined}
          >
            {!group.className && sectionIcons[group.page] && (
              <img
                className="home-todo-icon"
                src={sectionIcons[group.page]}
                alt=""
              />
            )}
            <span className="home-todo-name">{group.label}</span>
            <span className="notice-badge">{group.count}</span>
            <span className="home-todo-open">Open →</span>
          </button>
          <ul className="home-todo-lines">
            {group.lines.map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
