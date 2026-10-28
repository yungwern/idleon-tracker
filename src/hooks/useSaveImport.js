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

function formatDateTime(iso) {
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

// source: 'paste' (Import Save box), 'cloud' (logged-in account) or 'dev' (raw-save.json loader).
// Only 'cloud' saves are refreshed automatically, so a pasted or test save is never overwritten.
export function useSaveImport() {
  const [snapshot, setSnapshot] = useState(loadSavedSnapshot)

  function importFromJson(json, source = 'paste') {
    try {
      const newSnapshot = {
        ...extractSnapshot(json),
        source,
        cloudSavedAt: json?.cloudSavedAt ?? null,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSnapshot))
      setSnapshot(newSnapshot)
    } catch (err) {
      console.error('Import failed:', err)
      throw err
    }
  }

  function importFromText(text) {
    importFromJson(JSON.parse(text.trim()), 'paste')
  }

  function clearSnapshot() {
    localStorage.removeItem(STORAGE_KEY)
    setSnapshot(null)
  }

  return {
    snapshot,
    importFromJson,
    importFromText,
    clearSnapshot,
    importedAt: snapshot ? formatDateTime(snapshot.importedAt) : null,
    cloudSavedAt: snapshot?.cloudSavedAt ? formatDateTime(snapshot.cloudSavedAt) : null,
  }
}
