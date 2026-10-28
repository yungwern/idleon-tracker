import { useState } from 'react'
import {
  DEFAULT_OBOL_CHECK_MODE,
  OBOL_CHECK_MODE_KEY,
  isObolCheckMode,
} from '../components/Obols/ObolUtils.js'

function loadObolCheckMode() {
  try {
    const saved = localStorage.getItem(OBOL_CHECK_MODE_KEY)
    return isObolCheckMode(saved) ? saved : DEFAULT_OBOL_CHECK_MODE
  } catch {
    return DEFAULT_OBOL_CHECK_MODE
  }
}

// Obol roll check mode (picked on the Obols page). Held in App so the Obols page, character
// notifications and sidebar badges all use the same mode. One value, so modes can't overlap.
export function useObolCheckMode() {
  const [obolCheckMode, setObolCheckModeState] = useState(loadObolCheckMode)

  function setObolCheckMode(mode) {
    const next = isObolCheckMode(mode) ? mode : DEFAULT_OBOL_CHECK_MODE
    setObolCheckModeState(next)
    try {
      localStorage.setItem(OBOL_CHECK_MODE_KEY, next)
    } catch {
      // Storage unavailable: the mode just won't persist
    }
  }

  return {
    obolCheckMode,
    setObolCheckMode,
  }
}
