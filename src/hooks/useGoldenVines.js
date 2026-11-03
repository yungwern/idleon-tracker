import { useState } from 'react'

// Golden Vine slots the player typed in on the Cape Vine page (the save has no clear count yet).
// Per browser, like Tome points. Starts at 1: every account begins with one Golden Vine.
const GOLDEN_VINES_KEY = 'idleon_golden_vines'
const DEFAULT_GOLDEN_VINES = 1

function loadGoldenVines() {
  try {
    const saved = Number(localStorage.getItem(GOLDEN_VINES_KEY))
    return Number.isInteger(saved) && saved >= 0 ? saved : DEFAULT_GOLDEN_VINES
  } catch {
    return DEFAULT_GOLDEN_VINES
  }
}

export function useGoldenVines() {
  const [goldenVines, setGoldenVinesState] = useState(loadGoldenVines)

  function setGoldenVines(value) {
    const next = Math.max(0, Math.floor(Number(value) || 0))
    setGoldenVinesState(next)
    try {
      localStorage.setItem(GOLDEN_VINES_KEY, String(next))
    } catch {
      // Storage unavailable: the value just won't persist
    }
  }

  return {
    goldenVines,
    setGoldenVines,
  }
}
