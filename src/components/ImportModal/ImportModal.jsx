import { useState, useRef } from 'react'
import { TOME_POINTS_USES } from '../../utils/tomeUtils'
import CloudLogin from './CloudLogin.jsx'
import './ImportModal.css'

// Dev server only: the save Eli keeps for testing (IdleOn Resources/ is gitignored and never deployed)
const DEV_SAVE_URL = '/IdleOn Resources/raw-save.json'

export default function ImportModal({
  onImport,
  onImportJson,
  hasSave,
  tomePoints,
  onTomePointsChange,
  onClose,
  cloud,
  importedAt,
  cloudSavedAt,
  isCloudSave,
}) {
  const [tab, setTab] = useState('login')
  const [text, setText] = useState('')
  const [tome, setTome] = useState(tomePoints ?? '')
  const [error, setError] = useState(null)
  const textareaRef = useRef(null)

  // With a save already loaded (or on the Log In tab), the button just saves Tome points
  const pasting = tab === 'paste' && text.trim()
  const tomeOnly = !pasting && (hasSave || tab === 'login')

  function handleImport() {
    setError(null)
    if (tab === 'paste' && !text.trim() && !hasSave) {
      setError('Please paste your save data before importing.')
      return
    }
    try {
      if (pasting) onImport(text)
      onTomePointsChange(tome)
      onClose()
    } catch (err) {
      setError(err instanceof SyntaxError
        ? 'Invalid JSON — make sure you copied the full save data from the decoder.'
        : err.message)
    }
  }

  async function handleDevLoad() {
    setError(null)
    try {
      const res = await fetch(encodeURI(DEV_SAVE_URL), { cache: 'no-store' })
      onImportJson(await res.json(), 'dev')
      onTomePointsChange(tome)
      onClose()
    } catch (err) {
      setError(`Couldn't load ${DEV_SAVE_URL}: ${err.message}`)
    }
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h3>Import Save Data</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="page-tabs modal-tabs">
          <button
            className={`page-tab-btn${tab === 'login' ? ' page-tab-btn--active' : ''}`}
            onClick={() => setTab('login')}
          >
            Log In
          </button>
          <button
            className={`page-tab-btn${tab === 'paste' ? ' page-tab-btn--active' : ''}`}
            onClick={() => setTab('paste')}
          >
            Paste Save
          </button>
        </div>

        {tab === 'login' && (
          <CloudLogin
            cloud={cloud}
            importedAt={importedAt}
            cloudSavedAt={cloudSavedAt}
            isCloudSave={isCloudSave}
          />
        )}

        {tab === 'paste' && (
          <>
            <p className="modal-description">
              Paste your decoded save JSON below. Your data will be saved locally and persist between sessions.
              {cloud.account && ' While a pasted save is loaded, the hub stops syncing your cloud save until you click Sync.'}
            </p>
            <textarea
              ref={textareaRef}
              className="modal-textarea"
              placeholder='Paste your decoded save JSON here...'
              value={text}
              onChange={e => { setText(e.target.value); setError(null) }}
              spellCheck={false}
            />
            {import.meta.env.DEV && (
              <button className="modal-dev-load" onClick={handleDevLoad}>
                🧪 Load IdleOn Resources/raw-save.json (dev only)
              </button>
            )}
          </>
        )}

        <div className="modal-manual">
          <div className="modal-manual-head">
            <span className="modal-manual-title">Manual Inputs</span>
            <span className="modal-manual-sub">Not stored in the save file, so enter them yourself</span>
          </div>
          <label className="modal-manual-row">
            <span className="modal-manual-label">Tome Points</span>
            <input
              type="number"
              min="0"
              className="modal-manual-input"
              placeholder="e.g. 25000"
              value={tome}
              onChange={e => setTome(e.target.value)}
            />
            <span className="modal-manual-hint">Your total points from the in-game Tome.</span>
          </label>
          <ul className="modal-manual-uses">
            {TOME_POINTS_USES.map(u => (
              <li key={u.page}>
                <span className="modal-manual-page">{u.page}</span>
                {u.use}
              </li>
            ))}
          </ul>
          {!tome && (
            <div className="modal-manual-warning">
              Without Tome points, these values leave out the Tome's bonus and will read lower than in game.
            </div>
          )}
        </div>

        {error && <div className="modal-error">{error}</div>}
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-import" onClick={handleImport}>{tomeOnly ? 'Save' : 'Import'}</button>
        </div>
      </div>
    </div>
  )
}
