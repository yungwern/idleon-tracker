import { useState } from 'react'
import { extractSnapshot } from '../lib/extractSnapshot'

const STORAGE_KEY = 'idleon_save_snapshot'

function loadSavedSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    console.warn('Failed to load save snapshot from localStorage.')
    return null
  }
}

export function useSaveImport() {
  const [snapshot, setSnapshot] = useState(loadSavedSnapshot)

  function importFromText(text) {
    try {
      const json = JSON.parse(text.trim())
      const newSnapshot = extractSnapshot(json)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSnapshot))
      setSnapshot(newSnapshot)
    } catch (err) {
      console.error('Import failed:', err)
      throw err
    }
  }

  function clearSnapshot() {
    localStorage.removeItem(STORAGE_KEY)
    setSnapshot(null)
  }

  function formatImportedAt(iso) {
    if (!iso) return null
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return {
    snapshot,
    importFromText,
    clearSnapshot,
    importedAt: snapshot ? formatImportedAt(snapshot.importedAt) : null,
  }
}