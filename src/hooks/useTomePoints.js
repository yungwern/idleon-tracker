import { useState } from 'react'
import { TOME_POINTS_KEY } from '../utils/tomeUtils'

function loadTomePoints() {
  try {
    return localStorage.getItem(TOME_POINTS_KEY) ?? ''
  } catch {
    return ''
  }
}

// Tome points the player typed in (Import Save modal). Held in App so every page sees edits right away.
export function useTomePoints() {
  const [tomePoints, setTomePointsState] = useState(loadTomePoints)

  function setTomePoints(value) {
    const next = String(value ?? '').trim()
    setTomePointsState(next)
    try {
      if (next === '') localStorage.removeItem(TOME_POINTS_KEY)
      else localStorage.setItem(TOME_POINTS_KEY, next)
    } catch {
      // Storage unavailable: the value just won't persist
    }
  }

  return {
    tomePoints,
    setTomePoints,
  }
}
