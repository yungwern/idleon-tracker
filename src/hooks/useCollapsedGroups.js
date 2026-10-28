import { useState } from 'react'

const COLLAPSED_GROUPS_KEY = 'idleon_sidebar_collapsed'

function loadCollapsed() {
  try {
    const saved = JSON.parse(localStorage.getItem(COLLAPSED_GROUPS_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

// Sidebar groups the player folded shut (Characters, Global, World 1...). Remembered per browser.
export function useCollapsedGroups() {
  const [collapsed, setCollapsed] = useState(loadCollapsed)

  function toggleGroup(group) {
    setCollapsed(prev => {
      const next = prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
      try {
        localStorage.setItem(COLLAPSED_GROUPS_KEY, JSON.stringify(next))
      } catch {
        // Storage unavailable: the fold just won't persist
      }
      return next
    })
  }

  return {
    isCollapsed: group => collapsed.includes(group),
    toggleGroup,
  }
}
