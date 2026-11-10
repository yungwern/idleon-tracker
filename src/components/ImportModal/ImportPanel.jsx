import { useState } from 'react'
import CloudLogin from './CloudLogin.jsx'

// Dev server only: the save Eli keeps for testing (IdleOn Resources/ is gitignored and never deployed)
const DEV_SAVE_URL = '/IdleOn Resources/raw-save.json'

// The Log In / Paste Save body. Shown in the Import modal and inline on Home when there's no save,
// so both places are the same UI. onDone runs after a paste or dev load succeeds (the modal closes).
export default function ImportPanel({
  onImport,
  onImportJson,
  cloud,
  importedAt,
  cloudSavedAt,
  isCloudSave,
  onDone,
}) {
  const [tab, setTab] = useState('login')
  const [text, setText] = useState('')
  const [error, setError] = useState(null)

  function handleImport() {
    setError(null)
    if (!text.trim()) {
      setError('Please paste your save data before importing.')
      return
    }
    try {
      onImport(text)
      setText('')
      onDone?.()
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
      onDone?.()
    } catch (err) {
      setError(`Couldn't load ${DEV_SAVE_URL}: ${err.message}`)
    }
  }

  return (
    <div className="import-panel">
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
          {error && <div className="modal-error">{error}</div>}
          <div className="modal-actions">
            <button className="modal-import" onClick={handleImport}>Import</button>
          </div>
        </>
      )}
    </div>
  )
}
