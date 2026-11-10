import { useState } from 'react'
import { sectionIcons } from '../../data'
import {
  NOTICE_SECTIONS,
  isSectionNoticeOn,
  isNoticeTypeHidden,
} from '../../utils/noticeSettings'
import { OBOL_CHECK_MODES } from '../Obols/ObolUtils'
import { TOME_POINTS_USES } from '../../utils/tomeUtils'

const SETTINGS_TABS = [
  { id: 'notifications', label: 'Notifications' },
  { id: 'inputs', label: 'Inputs' },
]

// On/off switch. In a <summary> it stops the click so the row doesn't open or close too.
function Switch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`toggle-switch${on ? ' toggle-switch--on' : ''}`}
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        onChange(!on)
      }}
    />
  )
}

function NoticeSection({ section, settings, onSectionChange, onTypeChange }) {
  const sectionOn = isSectionNoticeOn(section.id, settings)
  const shownCount = section.types.filter(type => !isNoticeTypeHidden(section.id, type.id, settings)).length
  const icon = section.icon ?? sectionIcons[section.id]
  const head = (
    <>
      {icon && (
        <img
          className="home-settings-section-icon"
          src={icon}
          alt=""
        />
      )}
      <span className="home-settings-section-name">{section.id}</span>
      {section.types.length > 1 && (
        <span className="home-settings-section-count">
          {sectionOn ? `${shownCount} of ${section.types.length} on` : 'Off'}
        </span>
      )}
      <Switch
        on={sectionOn}
        onChange={on => onSectionChange(section.id, on)}
        label={`${section.id} notifications`}
      />
    </>
  )

  // One kind of notice: the section switch is the whole setting
  if (section.types.length === 1) {
    return (
      <div className="home-settings-section home-settings-section--single">
        <div className="home-settings-section-head">{head}</div>
        <p className="home-settings-section-desc">{section.types[0].label}</p>
      </div>
    )
  }

  return (
    <details className="home-settings-section">
      <summary className="home-settings-section-head home-settings-section-head--open">{head}</summary>
      <ul className={`home-settings-types${sectionOn ? '' : ' home-settings-types--off'}`}>
        {section.types.map(type => (
          <li
            key={type.id}
            className="home-settings-type"
          >
            <span className="home-settings-type-label">{type.label}</span>
            <Switch
              on={!isNoticeTypeHidden(section.id, type.id, settings)}
              onChange={on => onTypeChange(section.id, type.id, on)}
              label={type.label}
            />
          </li>
        ))}
      </ul>
    </details>
  )
}

// Site settings, opened from Home's gear button. A popup over Home, so the page never changes.
export default function SettingsModal({
  noticeSettings,
  onSectionChange,
  onTypeChange,
  onResetNotices,
  obolCheckMode,
  onObolCheckModeChange,
  tomePoints,
  onTomePointsChange,
  onClose,
}) {
  const [tab, setTab] = useState('notifications')
  const [tome, setTome] = useState(tomePoints ?? '')
  const activeMode = OBOL_CHECK_MODES.find(mode => mode.id === obolCheckMode) ?? OBOL_CHECK_MODES[0]

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleTomeChange(value) {
    setTome(value)
    onTomePointsChange(value)
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal home-settings">
        <div className="modal-header">
          <h3>Settings</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="page-tabs modal-tabs home-settings-tabs">
          {SETTINGS_TABS.map(t => (
            <button
              key={t.id}
              className={`page-tab-btn${tab === t.id ? ' page-tab-btn--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'notifications' && (
          <div className="home-settings-notices">
            <p className="modal-description">
              Turn off notifications you'd rather ignore. A section switch hides every notification on that page;
              open a section to pick single kinds. Character notifications apply to every character.
            </p>
            {NOTICE_SECTIONS.map(section => (
              <NoticeSection
                key={section.id}
                section={section}
                settings={noticeSettings}
                onSectionChange={onSectionChange}
                onTypeChange={onTypeChange}
              />
            ))}
            <button
              type="button"
              className="home-settings-reset"
              onClick={onResetNotices}
            >
              Turn every notification back on
            </button>
          </div>
        )}

        {tab === 'inputs' && (
          <div className="home-settings-inputs">
            <div className="home-settings-block">
              <div className="home-settings-block-head">
                <span className="home-settings-block-title">Obol roll check</span>
                <span className="home-settings-block-sub">Also on the Obols page</span>
              </div>
              <div className="segmented-control" role="radiogroup" aria-label="Obol roll check">
                {OBOL_CHECK_MODES.map(mode => (
                  <button
                    key={mode.id}
                    type="button"
                    role="radio"
                    aria-checked={mode.id === activeMode.id}
                    className={`segmented-control-btn${mode.id === activeMode.id ? ' segmented-control-btn--active' : ''}`}
                    onClick={() => onObolCheckModeChange(mode.id)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <p className="home-settings-hint">{activeMode.description}</p>
            </div>

            <div className="home-settings-block">
              <div className="home-settings-block-head">
                <span className="home-settings-block-title">Tome points</span>
                <span className="home-settings-block-sub">Not stored in the save file, so enter them yourself</span>
              </div>
              <label className="home-settings-row">
                <input
                  type="number"
                  min="0"
                  className="home-settings-input"
                  placeholder="e.g. 25000"
                  value={tome}
                  onChange={e => handleTomeChange(e.target.value)}
                />
                <span className="home-settings-hint">Your total points from the in-game Tome.</span>
              </label>
              <ul className="home-settings-uses">
                {TOME_POINTS_USES.map(u => (
                  <li key={u.page}>
                    <span className="home-settings-use-page">{u.page}</span>
                    {u.use}
                  </li>
                ))}
              </ul>
              {!tome && (
                <div className="home-settings-warning">
                  Without Tome points, these values leave out the Tome's bonus and will read lower than in game.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
