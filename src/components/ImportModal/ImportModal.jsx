import { useState, useRef } from 'react'
import { TOME_POINTS_USES } from '../../utils/tomeUtils'
import './ImportModal.css'

export default function ImportModal({ onImport, hasSave, tomePoints, onTomePointsChange, onClose }) {
  const [text, setText] = useState('')
  const [tome, setTome] = useState(tomePoints ?? '')
  const [error, setError] = useState(null)
  const textareaRef = useRef(null)

  // With a save already loaded, the button can just update Tome points (no paste needed)
  const tomeOnly = hasSave && !text.trim()

  function handleImport() {
    setError(null)
    if (!text.trim() && !hasSave) {
      setError('Please paste your save data before importing.')
      return
    }
    try {
      if (text.trim()) onImport(text)
      onTomePointsChange(tome)
      onClose()
    } catch (err) {
      setError(err instanceof SyntaxError
        ? 'Invalid JSON — make sure you copied the full save data from the decoder.'
        : err.message)
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
        <p className="modal-description">
          Paste your decoded save JSON below. Your data will be saved locally and persist between sessions.
        </p>
        <textarea
          ref={textareaRef}
          className="modal-textarea"
          placeholder='Paste your decoded save JSON here...'
          value={text}
          onChange={e => { setText(e.target.value); setError(null) }}
          spellCheck={false}
        />

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
