import { useState, useRef } from 'react'
import './ImportModal.css'

export default function ImportModal({ onImport, onClose }) {
  const [text, setText] = useState('')
  const [error, setError] = useState(null)
  const textareaRef = useRef(null)

  function handleImport() {
    setError(null)
    if (!text.trim()) {
      setError('Please paste your save data before importing.')
      return
    }
    try {
      onImport(text)
      onClose()
    } catch {
      setError('Invalid JSON — make sure you copied the full save data from the decoder.')
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
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-import" onClick={handleImport}>Import</button>
        </div>
      </div>
    </div>
  )
}