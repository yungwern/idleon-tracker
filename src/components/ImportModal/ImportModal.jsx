import ImportPanel from './ImportPanel.jsx'
import './ImportModal.css'

// Import Save modal (sidebar Import button). The body is ImportPanel, which Home also shows inline
// when there's no save. Tome points moved to Home > Settings.
export default function ImportModal({
  onImport,
  onImportJson,
  onClose,
  cloud,
  importedAt,
  cloudSavedAt,
  isCloudSave,
}) {
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
        <ImportPanel
          onImport={onImport}
          onImportJson={onImportJson}
          cloud={cloud}
          importedAt={importedAt}
          cloudSavedAt={cloudSavedAt}
          isCloudSave={isCloudSave}
          onDone={onClose}
        />
      </div>
    </div>
  )
}
